# 🚀 完整部署指南

> 本指南详细说明如何部署 FakaShop 发卡商城系统

---

## 📊 部署状态

### ✅ 已完成部分

| 组件 | 状态 | 详情 |
|------|------|------|
| **数据库** | ✅ 已部署 | Supabase PostgreSQL (`jmtvlbwyugnabgloeocy`) |
| **表结构** | ✅ 已完成 | 10个核心表已创建 |
| **初始数据** | ✅ 已填充 | 分类、支付配置、系统配置、管理员账号 |
| **RLS策略** | ✅ 已配置 | 完整的安全策略 |
| **Edge Functions** | ✅ 已部署 | 8个函数全部 ACTIVE |

### ⏳ 待完成部分

| 组件 | 状态 | 操作 |
|------|------|------|
| **前端** | ⏳ 待部署 | 推送到 GitLab，Netlify 自动部署 |
| **环境变量** | ⚠️ 需配置 | Netlify 需设置 SUPABASE_URL 和 SUPABASE_ANON_KEY |

---

## 🏗️ 架构概览

```
用户浏览器 → Netlify CDN → Supabase Edge Functions → Supabase Database
                ↑                                        ↓
           环境变量配置                              返回数据
```

---

## 📋 部署清单

### 1. 数据库部署 (✅ 已完成)

**项目信息**:
- Project ID: `jmtvlbwyugnabgloeocy`
- 数据库 URL: `db.jmtvlbwyugnabgloeocy.supabase.co`
- 端口: `5432`

**已创建的表**:
1. ✅ `categories` - 商品分类 (5条记录)
2. ✅ `products` - 商品信息 (3条记录)
3. ✅ `cards` - 卡密库存
4. ✅ `orders` - 订单信息
5. ✅ `payment_config` - 支付配置 (6条记录)
6. ✅ `admins` - 管理员账号 (3条记录)
7. ✅ `admin_login_logs` - 登录日志
8. ✅ `two_factor_config` - 2FA配置
9. ✅ `two_factor_codes` - 2FA验证码
10. ✅ `system_config` - 系统配置 (7条记录)

**安全策略**:
- ✅ RLS 已启用所有表
- ✅ 公开只读策略 (products, categories, payment_config, system_config)
- ✅ 管理员完全控制策略 (所有管理表)
- ✅ 订单插入策略 (用户可插入，管理员可管理)

### 2. Edge Functions 部署 (✅ 已完成)

**访问地址**: `https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/`

| 函数名 | 路径 | 状态 | 版本 | 说明 |
|--------|------|------|------|------|
| `get-products` | `/functions/v1/get-products` | ✅ ACTIVE | v6 | 获取商品列表 |
| `create-order` | `/functions/v1/create-order` | ✅ ACTIVE | v6 | 创建订单 |
| `get-order` | `/functions/v1/get-order` | ✅ ACTIVE | v5 | 查询订单 |
| `admin-login` | `/functions/v1/admin-login` | ✅ ACTIVE | v8 | 管理员登录 |
| `admin-products` | `/functions/v1/admin-products` | ✅ ACTIVE | v6 | 商品管理 |
| `admin-orders` | `/functions/v1/admin-orders` | ✅ ACTIVE | v7 | 订单管理 |
| `admin-cards` | `/functions/v1/admin-cards` | ✅ ACTIVE | v8 | 卡密管理 |
| `webhook-nexapay` | `/functions/v1/webhook-nexapay` | ✅ ACTIVE | v5 | 支付回调 |

**已配置的环境变量** (Supabase Secrets):
- ✅ `SUPABASE_URL` - 项目 URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - 服务角色密钥
- ✅ `ADMIN_JWT_SECRET` - 管理后台 JWT 签名密钥
- ✅ `NEXAPAY_CRYPTO_ADDRESS` - USDT 收款地址
- ✅ `NEXAPAY_WEBHOOK_SECRET` - Webhook 签名密钥

### 3. 前端部署 (⏳ 待执行)

**步骤**:

```bash
# 1. 推送到 GitLab
git add .
git commit -m "feat: 初始化发卡商城前端"
git push origin main

# 2. 在 Netlify 配置
# - 连接 GitLab 仓库
# - 设置构建配置:
#   - Publish directory: web
#   - Build command: echo 'No build needed'
#   - Node version: 18 (默认)

# 3. 添加环境变量 (Netlify Dashboard)
# - SUPABASE_URL: https://jmtvlbwyugnabgloeocy.supabase.co
# - SUPABASE_ANON_KEY: (从 Supabase 控制台获取)
```

**Netlify 环境变量配置**:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SUPABASE_URL` | `https://jmtvlbwyugnabgloeocy.supabase.co` | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | *(从控制台获取)* | anon public key |

获取 SUPABASE_ANON_KEY:
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 `jmtvlbwyugnabgloeocy`
3. 进入 Settings → API
4. 复制 "anon public" key

---

## 🔐 账号信息

### 管理员账号

**演示环境**:
- 用户名: `demo`
- 密码: `Demo@123456`
- 访问: `/admin/?demo=true`

**正式环境**:
- 用户名: `admin`
- 密码: `Admin@123456`
- 访问: `/admin/`

> ⚠️ **安全提醒**: 首次登录后请立即修改密码！

---

## 🧪 验证部署

### 测试 Edge Functions

```bash
# 1. 测试商品列表 API
curl https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/get-products

# 预期返回:
# {"success":true,"products":[...]}

# 2. 测试管理员登录
curl -X POST https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123456"}'

# 预期返回:
# {"success":true,"admin":{...},"token":"..."}
```

### 测试前端

访问 Netlify 部署的 URL，检查:
- [ ] 页面正常加载
- [ ] 商品列表显示
- [ ] 分类筛选正常
- [ ] 搜索功能正常
- [ ] 购买流程可执行
- [ ] 管理后台可登录

---

## 🔄 更新流程

### 更新前端代码

```bash
git add .
git commit -m "更新前端代码"
git push
# Netlify 会自动部署
```

### 更新 Edge Functions

通过 MCP 工具或 Supabase CLI 部署:

```bash
# 使用 Supabase CLI
npx supabase functions deploy <function-name> --no-verify-jwt

# 或使用 MCP 工具 (推荐)
# mcp__supabase__deploy_edge_function
```

### 更新数据库

1. 在 Supabase SQL Editor 执行变更
2. 更新 `supabase/database/schema.sql`
3. 创建新的迁移文件

---

## 🛠️ 故障排除

### 常见问题

**1. 前端无法连接 Supabase**
- 检查 Netlify 环境变量是否正确
- 确认 SUPABASE_URL 和 SUPABASE_ANON_KEY 正确
- 查看浏览器控制台错误信息

**2. Edge Functions 500 错误**
- 检查 Supabase Function Logs
- 确认环境变量已正确配置
- 验证数据库连接

**3. 管理员登录失败**
- 确认用户名和密码正确
- 检查 ADMIN_JWT_SECRET 是否配置
- 查看 Function Logs 获取详细错误

**4. 支付回调不生效**
- 确认 NEXAPAY_WEBHOOK_SECRET 已配置
- 检查 webhook-nexapay 函数日志
- 验证支付平台签名配置

---

## 📊 监控和日志

### Supabase 日志
- 访问: Supabase Dashboard → Logs
- 查看: Function Logs, Database Logs

### Netlify 日志
- 访问: Netlify Dashboard → Deploys
- 查看: Build Logs, Function Logs

---

## 🔒 安全检查清单

- [x] Service Role Key 未暴露给前端
- [x] .env 文件未提交到 Git
- [x] Netlify 环境变量已配置
- [x] 数据库 RLS 策略已启用
- [x] JWT 签名密钥已配置
- [x] Webhook 签名校验已启用
- [x] 密码加盐哈希存储
- [x] CORS 头正确配置

---

## 📞 技术支持

- 项目文档: `/docs/`
- 架构说明: `ARCHITECTURE.md`
- 数据库设计: `DATABASE-SETUP-GUIDE.md`
- API 文档: `API.md` (待创建)

---

<p align="center">🚀 部署完成后，您就可以开始使用发卡商城系统了！</p>
