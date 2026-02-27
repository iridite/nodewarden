# NodeWarden Enhanced: A Bitwarden-compatible server for Cloudflare Workers

[![Powered by Cloudflare](https://img.shields.io/badge/Powered%20by-Cloudflare-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License: LGPL-3.0](https://img.shields.io/badge/License-LGPL--3.0-2ea44f)](./LICENSE)

中文文档：[`README.md`](./README.md)

> **Disclaimer**
> - This project is for learning and communication only.
> - We are not responsible for any data loss. Regular vault backups are strongly recommended.
> - This project is not affiliated with Bitwarden. Please do not report issues to the official Bitwarden team.

---

## About This Project

**NodeWarden Enhanced** is an enhanced version based on [shuaiplus/NodeWarden](https://github.com/shuaiplus/NodeWarden), maintained by [Iridite @ Iridyne](https://github.com/Iridyne).

### Credits to Original Project
Thanks to [shuaiplus](https://github.com/shuaiplus) for creating the excellent NodeWarden project, providing a clean and efficient solution for single-user Bitwarden deployments.

### Enhanced Features

Compared to the original project, NodeWarden Enhanced adds the following enterprise-grade features:

#### 🏥 Monitoring & Diagnostics
- **Health Check Endpoint** (`GET /health`)
  - Real-time monitoring of D1 database connection status and response time
  - Real-time monitoring of R2 storage availability
  - Returns overall system health status (healthy/degraded)
  - Suitable for integration with external monitoring systems (e.g., UptimeRobot, Pingdom)

- **System Diagnostics** (`GET /setup/diagnostics`)
  - JWT Secret configuration validation
  - D1 database connection test
  - R2 storage connection test
  - User registration status check
  - TOTP 2FA configuration status check
  - Can be integrated into setup page for troubleshooting deployment issues

#### 🔒 Security Enhancements
- **Account Security Logs** - Complete login activity audit
  - Automatically records all login attempts (success/failure)
  - Records IP address, User-Agent, device name and type
  - Supports security event tracing and anomaly detection

- **Security Log Query** (`GET /api/security/logs`)
  - Paginated query of login history (default 50, max 100)
  - Supports offset parameter for pagination
  - Returns detailed device and location information

- **Security Statistics** (`GET /api/security/stats`)
  - Total login count and failure count
  - Unique IP address count
  - Unique device count
  - Recent login time and device information
  - Helps identify abnormal login behavior

#### 📊 Data Management & Analytics
- **Vault Statistics** (`GET /api/vault/stats`)
  - Total cipher count and type distribution (login/note/card/identity)
  - Folder count statistics
  - Attachment count and storage space usage
  - Favorite item count
  - Recent 7-day activity statistics
  - Helps understand vault usage patterns

- **Batch Operations** - Efficiently manage large numbers of items
  - `POST /api/ciphers/batch/delete` - Batch soft delete (up to 100 items)
    - Request body: `{"ids": ["uuid1", "uuid2", ...]}`
    - Returns count of successfully deleted items
  - `POST /api/ciphers/batch/restore` - Batch restore deleted items (up to 100 items)
    - Request body: `{"ids": ["uuid1", "uuid2", ...]}`
    - Returns count of successfully restored items
  - `POST /api/ciphers/batch/purge` - Batch permanent delete (up to 100 items)
    - Request body: `{"ids": ["uuid1", "uuid2", ...]}`
    - Returns count of permanently deleted items
    - ⚠️ This operation is irreversible, use with caution

- **Enhanced Export** - Complete encrypted backup functionality
  - `GET /api/vault/export/summary` - View export summary (no sensitive data)
    - Returns cipher count, folder count, attachment count
    - Returns total storage space usage
    - Returns last modified time
  - `POST /api/vault/export` - Export complete vault data
    - Exports all ciphers (including encrypted data)
    - Exports all folder structures
    - Exports device information and attachment metadata
    - Returns JSON format, can be used for backup or migration
    - Compatible with official Bitwarden client import

---

## Feature Comparison Table (vs Official Bitwarden Server)

| Capability | Bitwarden  | NodeWarden Enhanced | Notes |
|---|---|---|---|
| Single-user vault (logins/notes/cards/identities) | ✅ | ✅ | Core vault model supported |
| Folders / Favorites | ✅ | ✅ | Common vault organization supported |
| Full sync `/api/sync` | ✅ | ✅ | Compatibility-focused implementation |
| Attachment upload/download | ✅ | ✅ | Backed by Cloudflare R2 |
| Import flow (common clients) | ✅ | ✅ | Common import paths covered |
| Website icon proxy | ✅ | ✅ | Via `/icons/{hostname}/icon.png` |
| passkey、TOTP | ❌ | ✅ | Official service requires premium; NodeWarden Enhanced does not |
| Multi-user | ✅ | ❌ | NodeWarden Enhanced is single-user by design |
| Organizations / Collections / Member roles | ✅ | ❌ | Not necessary to implement |
| Login 2FA (TOTP/WebAuthn/Duo/Email) | ✅ | ⚠️ Partial | TOTP-only  via `TOTP_SECRET` |
| SSO / SCIM / Enterprise directory | ✅ | ❌ | Not necessary to implement |
| Send | ✅ | ❌ | Not necessary to implement |
| Emergency access | ✅ | ❌ | Not necessary to implement |
| Admin console / Billing & subscription | ✅ | ❌ | Free only |
| Full push notification pipeline | ✅ | ❌ | Not necessary to implement |


## Tested clients / platforms

- ✅ Windows desktop client (v2026.1.0)
- ✅ Android app (v2026.1.0)
- ✅ Browser extension (v2026.1.0)
- ⬜ macOS desktop client (not tested)
- ⬜ Linux desktop client (not tested)

---

# Quick start

### One-click deploy

**Deploy steps:**

1. Fork this project (you don't need to fork it if you don't need to update it later).
2. [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/iridite/nodewarden-enhanced)
3. Open the generated service URL and follow the on-page instructions.

### CLI deploy

```bash
# Clone repository
git clone https://github.com/iridite/nodewarden-enhanced.git
cd nodewarden-enhanced

# Install dependencies
npm install

# Cloudflare CLI login
npx wrangler login

# Create cloud resources (D1 + R2)
npx wrangler d1 create nodewarden-db
npx wrangler r2 bucket create nodewarden-attachments

# Deploy
npx wrangler deploy
```


## Local development

This repo is a Cloudflare Workers TypeScript project (Wrangler).

```bash
npm install
npm run dev
```
---

## API Documentation

### Public Endpoints (No Authentication Required)

#### Health Check
```http
GET /health
```
Returns system health status, including database and storage response times.

#### System Diagnostics
```http
GET /setup/diagnostics
```
Returns complete system configuration and connection status for troubleshooting deployment issues.

### Authenticated Endpoints (Access Token Required)

All following endpoints require an Authorization header:
```
Authorization: Bearer <access_token>
```

#### Security Logs
```http
GET /api/security/logs?limit=50&offset=0
```
Query parameters:
- `limit`: Number of records to return (default 50, max 100)
- `offset`: Offset for pagination

#### Security Statistics
```http
GET /api/security/stats
```
Returns login statistics, unique IP/device counts, recent activity, etc.

#### Vault Statistics
```http
GET /api/vault/stats
```
Returns cipher counts, type distribution, storage usage, etc.

#### Batch Delete
```http
POST /api/ciphers/batch/delete
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```
Soft delete specified ciphers (up to 100 items).

#### Batch Restore
```http
POST /api/ciphers/batch/restore
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```
Restore deleted ciphers (up to 100 items).

#### Batch Permanent Delete
```http
POST /api/ciphers/batch/purge
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```
⚠️ Permanently delete ciphers, this operation is irreversible (up to 100 items).

#### Export Summary
```http
GET /api/vault/export/summary
```
Returns vault summary information (no sensitive data).

#### Export Vault
```http
POST /api/vault/export
```
Export complete vault data (JSON format), including all encrypted data.

---

## FAQ

**Q: How do I back up my data?**
A: There are three ways:
1. Use **Export vault** in your Bitwarden client
2. Use `GET /api/vault/export/summary` to view summary
3. Use `POST /api/vault/export` to export complete data (requires Access Token)

**Q: What if I forget the master password?**
A: It can't be recovered (end-to-end encryption). Keep it safe.

**Q: Can multiple people use it?**
A: Not recommended. This project is designed for single-user usage. For multi-user usage, choose Vaultwarden.

**Q: How do I monitor service status?**
A: Use the `GET /health` endpoint, which can be integrated with monitoring services like UptimeRobot or Pingdom.

**Q: How do I view login history?**
A: Use the `GET /api/security/logs` endpoint to view all login records, including IP addresses and device information.

**Q: What are the limits for batch operations?**
A: Each batch operation can process up to 100 items. For larger batches, you need to split them into multiple requests.

---

## License

LGPL-3.0 License

---

## Credits

- [shuaiplus/NodeWarden](https://github.com/shuaiplus/NodeWarden) - original project
- [Bitwarden](https://bitwarden.com/) - original design and clients
- [Vaultwarden](https://github.com/dani-garcia/vaultwarden) - server implementation reference
- [Cloudflare Workers](https://workers.cloudflare.com/) - serverless platform
