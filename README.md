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

相比原项目，NodeWarden Enhanced 新增了以下企业级功能：

#### 🏥 监控与诊断
- **健康检查端点** (`GET /health`)
  - 实时监控 D1 数据库连接状态和响应时间
  - 实时监控 R2 存储可用性
  - 返回整体系统健康状态（healthy/degraded）
  - 适用于外部监控系统集成（如 UptimeRobot、Pingdom）

- **系统诊断** (`GET /setup/diagnostics`)
  - JWT Secret 配置验证
  - D1 数据库连接测试
  - R2 存储连接测试
  - 用户注册状态检查
  - TOTP 2FA 配置状态检查
  - 可集成到 Setup 页面，方便排查部署问题

#### 🔒 安全增强
- **账户安全日志** - 完整的登录活动审计
  - 自动记录所有登录尝试（成功/失败）
  - 记录 IP 地址、User-Agent、设备名称和类型
  - 支持安全事件追溯和异常检测

- **安全日志查询** (`GET /api/security/logs`)
  - 分页查询登录历史（默认 50 条，最多 100 条）
  - 支持 offset 参数实现翻页
  - 返回详细的设备和位置信息

- **安全统计** (`GET /api/security/stats`)
  - 总登录次数和失败次数
  - 唯一 IP 地址数量
  - 唯一设备数量
  - 最近登录时间和设备信息
  - 帮助识别异常登录行为

#### 📊 数据管理与分析
- **密码库统计** (`GET /api/vault/stats`)
  - 密码项总数和类型分布（登录/笔记/卡片/身份）
  - 文件夹数量统计
  - 附件数量和存储空间使用
  - 收藏项数量
  - 最近 7 天活动统计
  - 帮助了解密码库使用情况

- **批量操作** - 高效管理大量密码项
  - `POST /api/ciphers/batch/delete` - 批量软删除（最多 100 项）
    - 请求体：`{"ids": ["uuid1", "uuid2", ...]}`
    - 返回删除成功的数量
  - `POST /api/ciphers/batch/restore` - 批量恢复已删除项（最多 100 项）
    - 请求体：`{"ids": ["uuid1", "uuid2", ...]}`
    - 返回恢复成功的数量
  - `POST /api/ciphers/batch/purge` - 批量永久删除（最多 100 项）
    - 请求体：`{"ids": ["uuid1", "uuid2", ...]}`
    - 返回永久删除的数量
    - ⚠️ 此操作不可逆，请谨慎使用

- **增强导出** - 完整的加密备份功能
  - `GET /api/vault/export/summary` - 查看导出摘要（不含敏感数据）
    - 返回密码项数量、文件夹数量、附件数量
    - 返回总存储空间使用情况
    - 返回最后修改时间
  - `POST /api/vault/export` - 导出完整密码库数据
    - 导出所有密码项（包含加密数据）
    - 导出所有文件夹结构
    - 导出设备信息和附件元数据
    - 返回 JSON 格式，可用于备份或迁移
    - 支持 Bitwarden 官方客户端导入

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
## API 文档

### 公开端点（无需认证）

#### 健康检查
```http
GET /health
```
返回系统健康状态，包括数据库和存储的响应时间。

#### 系统诊断
```http
GET /setup/diagnostics
```
返回完整的系统配置和连接状态，用于排查部署问题。

### 认证端点（需要 Access Token）

所有以下端点需要在请求头中包含：
```
Authorization: Bearer <access_token>
```

#### 安全日志
```http
GET /api/security/logs?limit=50&offset=0
```
查询参数：
- `limit`: 返回数量（默认 50，最大 100）
- `offset`: 偏移量（用于分页）

#### 安全统计
```http
GET /api/security/stats
```
返回登录统计、唯一 IP/设备数量、最近活动等。

#### 密码库统计
```http
GET /api/vault/stats
```
返回密码项数量、类型分布、存储使用情况等。

#### 批量删除
```http
POST /api/ciphers/batch/delete
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```
软删除指定的密码项（最多 100 项）。

#### 批量恢复
```http
POST /api/ciphers/batch/restore
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```
恢复已删除的密码项（最多 100 项）。

#### 批量永久删除
```http
POST /api/ciphers/batch/purge
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```
⚠️ 永久删除密码项，此操作不可逆（最多 100 项）。

#### 导出摘要
```http
GET /api/vault/export/summary
```
返回密码库摘要信息（不含敏感数据）。

#### 导出密码库
```http
POST /api/vault/export
```
导出完整的密码库数据（JSON 格式），包含所有加密数据。

---

## 常见问题

**Q: 如何备份数据？**
A: 有三种方式：
1. 在 Bitwarden 客户端中选择「导出密码库」
2. 使用 `GET /api/vault/export/summary` 查看摘要
3. 使用 `POST /api/vault/export` 导出完整数据（需要 Access Token）

**Q: 忘记主密码怎么办？**
A: 无法恢复，这是端到端加密的特性。建议妥善保管主密码。

**Q: 可以多人使用吗？**
A: 不建议。本项目为单用户设计，多人使用请选择 Vaultwarden。

**Q: 如何监控服务状态？**
A: 使用 `GET /health` 端点，可以集成到 UptimeRobot、Pingdom 等监控服务。

**Q: 如何查看登录历史？**
A: 使用 `GET /api/security/logs` 端点查看所有登录记录，包括 IP 地址和设备信息。

**Q: 批量操作有什么限制？**
A: 每次批量操作最多处理 100 个项目，超过限制需要分批处理。

---

## 开源协议

LGPL-3.0 License

---

## 致谢

- [shuaiplus/NodeWarden](https://github.com/shuaiplus/NodeWarden) - 原始项目
- [Bitwarden](https://bitwarden.com/) - 原始设计和客户端
- [Vaultwarden](https://github.com/dani-garcia/vaultwarden) - 服务器实现参考
- [Cloudflare Workers](https://workers.cloudflare.com/) - 无服务器平台
