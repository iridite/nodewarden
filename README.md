# NodeWarden Enhanced：运行在 Cloudflare Workers 的 Bitwarden 第三方服务端

[![Powered by Cloudflare](https://img.shields.io/badge/Powered%20by-Cloudflare-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License: LGPL-3.0](https://img.shields.io/badge/License-LGPL--3.0-2ea44f)](./LICENSE)

English：[`README_EN.md`](./README_EN.md)

> **免责声明**
> 本项目仅供学习交流使用。我们不对任何数据丢失负责，强烈建议定期备份您的密码库。
> 本项目与 Bitwarden 官方无关，请勿向 Bitwarden 官方反馈问题。

---

## 关于本项目

**NodeWarden Enhanced** 是基于 [shuaiplus/NodeWarden](https://github.com/shuaiplus/NodeWarden) 的增强版本，由 [Iridite @ Iridyne](https://github.com/Iridyne) 维护。

### 原项目致谢
感谢 [shuaiplus](https://github.com/shuaiplus) 创建了优秀的 NodeWarden 项目，为单用户 Bitwarden 部署提供了简洁高效的解决方案。

### 增强功能

相比原项目，NodeWarden Enhanced 新增了以下功能：

#### 🏥 监控与诊断
- **健康检查端点** (`GET /health`) - 实时监控 D1 数据库和 R2 存储状态
- **系统诊断** (`GET /setup/diagnostics`) - Setup 页面集成的完整系统检查

#### 🔒 安全增强
- **账户安全日志** - 记录所有登录活动（成功/失败）、IP 地址、设备信息
  - `GET /api/security/logs` - 查看登录历史（支持分页）
  - `GET /api/security/stats` - 查看安全统计（失败次数、唯一 IP、最近活动等）

#### 📊 数据管理
- **密码库统计** (`GET /api/vault/stats`) - 查看密码项数量、类型分布、存储使用情况
- **批量操作** - 高效管理大量密码项
  - `POST /api/ciphers/batch/delete` - 批量软删除（最多 100 项）
  - `POST /api/ciphers/batch/restore` - 批量恢复（最多 100 项）
  - `POST /api/ciphers/batch/purge` - 批量永久删除（最多 100 项）
- **增强导出** - 完整的加密备份功能
  - `GET /api/vault/export/summary` - 查看导出摘要
  - `POST /api/vault/export` - 导出完整密码库数据（JSON 格式）

---

## 与 Bitwarden 官方服务端能力对比

| 能力项 | Bitwarden | NodeWarden Enhanced | 说明 |
|---|---|---|---|
| 单用户保管库（登录/笔记/卡片/身份） | ✅ | ✅ | 基于Cloudflare D1 |
| 文件夹 / 收藏 | ✅ | ✅ | 常用管理能力可用 |
| 全量同步 `/api/sync` | ✅ | ✅ | 已做兼容与性能优化 |
| 附件上传/下载 | ✅ | ✅ | 基于 Cloudflare R2 |
| 导入功能 | ✅ | ✅ | 覆盖常见导入路径 |
| 网站图标代理 | ✅ | ✅ | 通过 `/icons/{hostname}/icon.png` |
| passkey、TOTP | ❌ | ✅ |官方需要会员，我们的不需要 |
| 多用户 | ✅ | ❌ | NodeWarden Enhanced 定位单用户 |
| 组织/集合/成员权限 | ✅ | ❌ | 没必要实现 |
| 登录 2FA（TOTP/WebAuthn/Duo/Email） | ✅ | ⚠️ 部分支持 | 仅支持 TOTP（通过 `TOTP_SECRET`） |
| SSO / SCIM / 企业目录 | ✅ | ❌ | 没必要实现 |
| Send | ✅ | ❌ | 基本没人用 |
| 紧急访问 | ✅ | ❌ | 没必要实现 |
| 管理后台 / 计费订阅 | ✅ | ❌ | 纯免费 |
| 推送通知完整链路 | ✅ | ❌ | 没必要实现 |

## 测试情况：

- ✅ Windows 客户端（v2026.1.0）
- ✅ 手机 App（v2026.1.0）
- ✅ 浏览器扩展（v2026.1.0）
- ⬜ macOS 客户端（未测试）
- ⬜ Linux 客户端（未测试）
---

# 快速开始

### 一键部署

**部署步骤：**

1. 先在右上角 fork 此项目（若后续不需要更新，可不 fork）
2. [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/iridite/nodewarden-enhanced)
3. 打开部署后生成的链接，并根据网页提示完成后续操作。

### CLI 部署

```bash
# 先把仓库拉到本地
git clone https://github.com/iridite/nodewarden-enhanced.git
cd nodewarden-enhanced

# 安装依赖
npm install

# Cloudflare CLI 登录
npx wrangler login

# 创建云资源（D1 + R2）
npx wrangler d1 create nodewarden-db
npx wrangler r2 bucket create nodewarden-attachments

# 部署
npx wrangler deploy
```

---

## 本地开发

这是一个 Cloudflare Workers 的 TypeScript 项目（Wrangler）。

```bash
npm install
npm run dev
```
---
## 常见问题

**Q: 如何备份数据？**
A: 在客户端中选择「导出密码库」，保存 JSON 文件。

**Q: 忘记主密码怎么办？**
A: 无法恢复，这是端到端加密的特性。建议妥善保管主密码。

**Q: 可以多人使用吗？**
A: 不建议。本项目为单用户设计，多人使用请选择 Vaultwarden。

---

## 开源协议

LGPL-3.0 License

---

## 致谢

- [shuaiplus/NodeWarden](https://github.com/shuaiplus/NodeWarden) - 原始项目
- [Bitwarden](https://bitwarden.com/) - 原始设计和客户端
- [Vaultwarden](https://github.com/dani-garcia/vaultwarden) - 服务器实现参考
- [Cloudflare Workers](https://workers.cloudflare.com/) - 无服务器平台
