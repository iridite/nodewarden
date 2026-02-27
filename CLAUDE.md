# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NodeWarden Enhanced is a minimal Bitwarden-compatible password manager server running on Cloudflare Workers. It's designed for single-user deployments and leverages Cloudflare's edge infrastructure (Workers, D1, R2) for zero-cost operation.

**This is an enhanced version based on [shuaiplus/NodeWarden](https://github.com/shuaiplus/NodeWarden), maintained by [Iridite @ Iridyne](https://github.com/Iridyne).**

**Enhanced features:**
- Health check endpoint (`/health`) for monitoring D1 and R2 status
- System diagnostics endpoint (`/setup/diagnostics`) for setup page
- Security audit logs tracking login attempts, IPs, and devices
- Vault statistics API for cipher counts and storage usage
- Batch operations for efficient bulk management (delete/restore/purge)
- Enhanced export functionality for complete vault backups

**Key characteristics:**
- Single-user only (no organizations/collections)
- Bitwarden API compatible (works with official clients)
- Serverless architecture (no traditional server management)
- End-to-end encrypted (server stores encrypted data only)

## Development Commands

```bash
# Local development with hot reload
npm run dev

# Deploy to Cloudflare (uses wrangler.toml)
npm run deploy

# Deploy with custom config
npm run deploymy  # uses wrangler.my.toml

# Create D1 database
npx wrangler d1 create nodewarden-db

# Create R2 bucket
npx wrangler r2 bucket create nodewarden-attachments

# Run D1 migrations
npx wrangler d1 execute nodewarden-db --file=./migrations/0001_init.sql

# Login to Cloudflare
npx wrangler login
```

## Architecture

### Request Flow
1. **Entry point**: `src/index.ts` - Handles Worker fetch events, initializes database on first request per isolate
2. **Router**: `src/router.ts` - Routes requests to appropriate handlers, enforces authentication and rate limiting
3. **Handlers**: `src/handlers/*` - Process specific API endpoints (identity, accounts, ciphers, folders, sync, attachments)
4. **Services**: Core business logic
   - `storage.ts` - D1 database operations (single source of truth for schema)
   - `auth.ts` - JWT token generation/verification, password validation
   - `ratelimit.ts` - Request throttling (login attempts, API writes, sync reads)

### Data Storage Strategy

**D1 Database (SQL)**: Stores all metadata and encrypted vault data
- Schema is defined in TWO places that MUST stay in sync:
  - `src/services/storage.ts` (SCHEMA_STATEMENTS array)
  - `migrations/0001_init.sql`
- Ciphers store full JSON in `data` column for forward compatibility with unknown Bitwarden fields
- Uses foreign keys and cascading deletes for referential integrity
- Revision dates track sync state per user

**R2 Bucket**: Stores encrypted file attachments
- Metadata in D1, binary content in R2
- One-time download tokens prevent replay attacks

### Authentication Flow

1. **Prelogin** (`/identity/accounts/prelogin`) - Returns KDF parameters for client-side key derivation
2. **Token** (`/identity/connect/token`) - Validates credentials, returns access + refresh tokens
   - Supports 2FA via TOTP (optional `TOTP_SECRET` env var)
   - Tracks devices for "remember this device" functionality
   - Rate limits login attempts by IP
3. **Access token** - JWT with security stamp, verified on every authenticated request
4. **Refresh token** - SHA-256 hashed in database, rotates on use with grace period

### Bitwarden Compatibility

**Version reporting**: Reports as `2026.1.0` (see `LIMITS.compatibility.bitwardenServerVersion`)
- Clients use this for feature gating (e.g., cipher key encryption requires >= 2024.2.0)
- Keep aligned with Vaultwarden's reported version

**Client quirks handled**:
- Mobile clients require `UserDecryptionOptions` in both PascalCase and camelCase
- Android expects `MasterPasswordUnlock` even when vault is empty
- Desktop/browser use different casing conventions

**Unsupported features** (return empty arrays/stubs):
- Organizations, collections, policies
- Send (temporary sharing)
- Passwordless auth requests
- Push notifications (notifications hub returns 200 but does nothing)

## Configuration

**Required environment variables** (set in Cloudflare Workers dashboard or `.dev.vars` for local):
- `JWT_SECRET` - Must be 32+ characters, used for signing access tokens
- `DB` - D1 database binding (configured in wrangler.toml)
- `ATTACHMENTS` - R2 bucket binding (configured in wrangler.toml)

**Optional**:
- `TOTP_SECRET` - Enables 2FA for login (shared secret for TOTP generation)

**Rate limits and quotas** are configured in `src/config/limits.ts`:
- Login attempts: 10 per IP before 2-minute lockout
- API writes: 120 requests/minute per user
- Sync reads: 1000 requests/minute per user
- Attachment size: 100MB max

## Important Patterns

### Database Schema Changes
When modifying schema, update BOTH locations:
1. `src/services/storage.ts` - SCHEMA_STATEMENTS array (runtime initialization)
2. `migrations/0001_init.sql` - SQL file (manual migrations)

Use idempotent DDL (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`) so schema can be safely re-run.

### Cipher Data Handling
Ciphers use opaque passthrough for unknown fields:
- Full cipher object stored as JSON in `data` column
- Indexed columns (type, folder_id, name, etc.) extracted for queries
- Unknown fields from clients are preserved and returned unchanged
- This ensures forward compatibility with new Bitwarden client features

### Error Responses
Use helpers from `src/utils/response.ts`:
- `errorResponse(message, status)` - Standard error format
- `jsonResponse(data, status)` - JSON with CORS headers
- `applyCors(request, response)` - Add CORS headers to any response

### Security Considerations
- All vault data is encrypted client-side (server never sees plaintext)
- JWT tokens include security stamp - invalidated when user changes password
- Refresh tokens are SHA-256 hashed before storage
- Attachment download tokens are single-use (tracked in `used_attachment_download_tokens`)
- Rate limiting prevents brute force attacks
- CORS allows all origins (required for browser extensions)

## Testing Notes

This project has no automated tests. When making changes:
1. Test with official Bitwarden clients (Windows, Android, browser extension)
2. Verify sync works after modifications
3. Check that attachments upload/download correctly
4. Ensure login flow works with and without 2FA

## Common Gotchas

- **Cloudflare Workers isolates**: Database initialization runs once per isolate, not per request. Use static flags to track initialization state.
- **D1 binding errors**: `.bind()` throws on `undefined` values. Use `safeBind()` helper in StorageService to convert undefined → null.
- **Sync performance**: `/api/sync` can be slow with many ciphers. Pagination and caching help but D1 query performance is the bottleneck.
- **CORS**: All responses need CORS headers for browser extensions to work. Use `applyCors()` wrapper.
- **Case sensitivity**: Bitwarden API uses inconsistent casing (PascalCase for some fields, camelCase for others). Match official server responses exactly.
