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

Compared to the original project, NodeWarden Enhanced adds the following features:

- 🏥 **Health Check Endpoint** (`/health`) - Real-time monitoring of D1 database and R2 storage status
- 🔒 **Account Security Logs** - Records all login activities (success/failure), IP addresses, device information
  - `GET /api/security/logs` - View login history
  - `GET /api/security/stats` - View security statistics (failed attempts, unique IPs, etc.)
- 📊 **Vault Statistics** (`GET /api/vault/stats`) - View cipher counts, type distribution, storage usage

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

## FAQ

**Q: How do I back up my data?**
A: Use **Export vault** in your client and save the JSON file.

**Q: What if I forget the master password?**
A: It can't be recovered (end-to-end encryption). Keep it safe.

**Q: Can multiple people use it?**
A: Not recommended. This project is designed for single-user usage. For multi-user usage, choose Vaultwarden.

---

## License

LGPL-3.0 License

---

## Credits

- [shuaiplus/NodeWarden](https://github.com/shuaiplus/NodeWarden) - original project
- [Bitwarden](https://bitwarden.com/) - original design and clients
- [Vaultwarden](https://github.com/dani-garcia/vaultwarden) - server implementation reference
- [Cloudflare Workers](https://workers.cloudflare.com/) - serverless platform
