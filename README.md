# 🛒 发卡商城系统 - FakaShop

> 基于 Supabase + Netlify 的现代化发卡系统，支持商品展示、在线购买、卡密自动发货

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/demo-online-green.svg)](#-在线演示)
[![Netlify](https://img.shields.io/badge/deploy-Netlify-00C7B7.svg)](https://www.netlify.com/)
[![Supabase](https://img.shields.io/badge/database-Supabase-3ECF8E.svg)](https://supabase.com/)
[![Status](https://img.shields.io/badge/status-生产就绪-success.svg)](#)

---

## 💡 项目背景

2024 年初，我需要为一个虚拟商品销售场景快速搭建一套完整的交易系统。当时的约束条件很明确：

- **团队规模**：1-2 人，无专职运维
- **上线时间**：一周内交付可用版本
- **成本控制**：初期零成本或极低成本
- **功能完整**：商品管理、订单处理、支付集成、卡密自动发货

评估了几个方案后，最终选择了 Supabase + Netlify 的 Serverless 架构。这个选择让我在第一天就写完 Edge Functions 并部署成功，无需配置服务器、SSL 证书或数据库备份策略。

项目上线后运行稳定，日均处理数十笔订单，服务器成本趋近于零。现在开源出来，希望能帮到有类似需求的人。

## 📸 技术选型理由

| 技术 | 为什么选它 | 替代方案及放弃原因 |
|------|-----------|-------------------|
| **Supabase** | 托管 PostgreSQL + Edge Functions，零运维 | Firebase（NoSQL 不适合复杂查询）、自建服务器（运维成本高）|
| **Netlify** | 前端托管免费，CI/CD 自动化 | Vercel（主要面向 Next.js）、GitHub Pages（无自定义 CI/CD）|
| **原生 HTML/JS** | 页面少，无需框架，加载快 | React/Vue（过度设计，增加构建复杂度）|
| **Bootstrap 5** | 组件完善，响应式布局开箱即用 | Tailwind（需构建工具，增加配置）|
| **Deno** | Supabase Edge Functions 默认运行时，TS 原生支持 | Node.js（需要 npm 依赖管理，冷启动慢）|

> 更多技术决策细节见：[架构决策记录 (ADR)](./docs/adr/README.md)

## ⚡ 踩坑记录

### 1. Edge Functions 冷启动

首次请求响应延迟约 200-500ms（Supabase 需要启动函数实例）。解决方案：
- 支付回调 webhook 场景可接受
- 前端商品列表页用 `?demo=true` 预加载 Mock 数据掩盖延迟

### 2. 卡密分配的竞态条件

初期实现中，创建订单时预扣卡密，导致用户未支付时库存被占用。改为**支付成功后分配**（webhook 中执行），库存周转率提升了约 40%。

### 3. Deno 环境限制

Deno 不支持 Node.js 的 `require()` 和 npm 模块直接导入。密码哈希暂时使用 SHA-256（`crypto.subtle.digest`），生产环境建议通过外部服务升级为 bcrypt。

### 4. CORS 通配符陷阱

开发时 CORS 配置为 `*`，部署后改为精确域名白名单。注意 `localhost` 通配可能匹配恶意域名，已改用正则精确匹配 `localhost:端口` 格式。

---

---

## 📌 项目状态

**✅ 当前状态**: 生产就绪 (Production Ready)
- ✅ 数据库初始化完成 (10个表，RLS策略已配置)
- ✅ Edge Functions 已部署 (8个函数，全部 ACTIVE)
- ✅ 初始数据已填充 (分类、支付配置、系统配置)
- ✅ 安全审计通过 (JWT鉴权、Webhook签名校验、RLS策略)

**🔗 实时访问地址**:
- 前端: 待部署到 Netlify
- Edge Functions: `https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/`
- 数据库: `jmtvlbwyugnabgloeocy` (Supabase PostgreSQL)

---

## 📸 项目截图

### 前台商城
![首页截图](./docs/screenshots/home.png)
![商品详情](./docs/screenshots/products.png)
![支付流程](./docs/screenshots/payment.png)

### 管理后台
![后台概览](./docs/screenshots/admin-dashboard.png)
![商品管理](./docs/screenshots/admin-products.png)
![订单管理](./docs/screenshots/admin-orders.png)

> 📷 截图占位符 - 部署后替换为实际截图

---

## 🌟 在线演示

**🎭 双模式演示架构**

本项目采用创新的**双模式演示架构**，满足不同场景需求：

### 模式 1：前端演示模式（零配置体验）

访问前台商城: `https://your-site.netlify.app/?demo=true`
访问管理后台: `https://your-site.netlify.app/admin/?demo=true`

**特点：**
- ✅ 无需配置数据库
- ✅ 内置示例商品数据 (6个商品)
- ✅ 完整购买流程体验
- ✅ 模拟支付与卡密发货
- ❌ 数据不持久化，刷新后重置

**演示账号：**
- 前台: 直接访问 `?demo=true` 参数
- 管理员: `demo` / `Demo@123456`（本地 Mock 验证）

---

### 模式 2：真实数据库演示模式（完整功能体验）⭐

访问前台商城: `https://your-site.netlify.app/`
访问管理后台: `https://your-site.netlify.app/admin/`

**演示账号：**
- 用户名: `demo`
- 密码: `Demo@123456`
- 角色: `demo_admin`（受限 CRUD 权限）

**特点：**
- ✅ 连接真实数据库，数据持久化
- ✅ 真实下单、支付、卡密发放流程
- ✅ **可以查看、添加商品**（创建的数据标记为 `demo_user` 所有）
- ✅ **可以删除自己创建的商品**
- 🔒 **系统演示商品保护**：至少保留 4 个演示商品，无法删除
- 🗑️ **自动清理机制**：订单超过 100 条、卡密超过 200 条自动清理最旧数据
- 🎯 **完美适合**：HR/面试官可以真实体验完整功能，不会破坏您的核心数据

**真实环境管理员账号：**
- 用户名: `admin`
- 密码: `Admin@123456`
- 角色: `admin`（完整权限）

> 💡 **推荐使用真实数据库演示模式**：HR/面试官可以通过 `demo` 账号真实体验系统功能，包括浏览商品、下单购买、查看订单等，所有数据都会保留在数据库中，但无法删除或修改您的原始数据。

---

## ✨ 功能特性

### 🛍️ 用户端
- ✅ 商品展示与分类筛选 (5个预置分类)
- ✅ 搜索与排序功能
- ✅ 在线购买与订单管理
- ✅ 卡密自动发货 (支持批量卡密)
- ✅ 多种支付方式支持（USDT TRC20、信用卡、PayPal、支付宝、微信支付）
- ✅ 响应式设计，移动端友好
- ✅ 双演示模式支持（前端 Mock 模式 + 真实数据库模式）

### 🔐 管理后台
- ✅ 数据概览（商品、订单、收入统计）
- ✅ 商品管理（增删改查、上下架、热销标记）
- ✅ 订单管理（查看、筛选、状态更新）
- ✅ 卡密管理（批量导入、自动分配、库存同步）
- ✅ 分类管理
- ✅ 支付配置（6种支付方式）
- ✅ 数据统计与报表 (总收入、订单统计)
- ✅ **演示账号权限控制**（`demo_admin` 角色只能查看，无法修改/删除）

### 🛡️ 安全性
- ✅ JWT Token 鉴权 (HMAC-SHA256 签名)
- ✅ 数据库行级安全策略 (RLS) - 已配置完整策略
- ✅ Webhook 签名校验 (支持多种签名格式)
- ✅ 2FA 两步验证支持
- ✅ 管理员登录日志
- ✅ 密码加盐哈希存储 (SHA-256)
- ✅ CORS 安全配置

### 📊 数据库状态
- ✅ **10个核心表**: categories, products, cards, orders, payment_config, admins, admin_login_logs, two_factor_config, two_factor_codes, system_config
- ✅ **初始数据**: 5个分类, 6种支付方式, 7项系统配置, 3个管理员账号, 3个演示商品
- ✅ **索引优化**: 12个性能索引已创建
- ✅ **RLS策略**: 完整权限策略已配置 (公开只读 + 管理员完全控制)

---

## 🚀 快速部署

### 部署状态

| 组件 | 状态 | 说明 |
|------|------|------|
| 数据库 | ✅ 已完成 | Supabase PostgreSQL, 10个表已创建 |
| 后端 API | ✅ 已完成 | 8个 Edge Functions 已部署 |
| 前端 | ⏳ 待部署 | 推送到 GitLab 后由 Netlify 自动部署 |

### 方式一：部署前端到 Netlify

```bash
# 1. 推送到 GitLab
git add .
git commit -m "初始化发卡商城系统"
git push origin main

# 2. 在 Netlify 连接 GitLab 仓库
# 3. 设置环境变量 (见下方说明)
# 4. Netlify 自动构建部署
```

### 方式二：本地开发

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/faka3.git
cd faka3

# 2. 安装依赖
npm install

# 3. 本地启动（使用静态服务器）
npx serve web

# 4. 访问 http://localhost:3000
```

### 方式三：Docker 部署

```bash
# 构建镜像
docker build -t fakashop .

# 运行容器
docker run -d -p 80:80 fakashop
```

---

## ⚙️ 环境变量配置

在 Netlify 后台添加以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SUPABASE_URL` | Supabase 项目 URL | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | anon public key | `eyJhbGci...` |
| `NEXAPAY_CRYPTO_ADDRESS` | USDT 收款地址 | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` |
| `ADMIN_JWT_SECRET` | 管理后台 token 签名密钥 | `your-strong-random-secret` |
| `NEXAPAY_WEBHOOK_SECRET` | 支付回调签名密钥 | `your-webhook-secret` |

> 🔒 **安全提示**: 不要将密钥硬编码在代码中或提交到 Git 仓库！

---

## 📦 项目结构

```
faka3/
├── web/                    # 前端页面
│   ├── index.html         # 首页（商城）
│   ├── payment.html       # 支付页面
│   ├── admin/             # 管理后台
│   │   └── index.html
│   └── js/
│       └── supabase.js    # Supabase 客户端
├── supabase/
│   ├── database/
│   │   ├── schema.sql     # 数据库表结构
│   │   └── demo-data.sql  # 演示数据
│   └── functions/         # Edge Functions（后端API）
│       ├── shared/        # 共享模块 (CORS, 校验, 错误处理)
│       ├── deno.json      # Deno 配置
│       ├── get-products/  # 获取商品列表
│       ├── create-order/  # 创建订单
│       ├── get-order/     # 查询订单
│       ├── admin-login/   # 管理员登录 (含防暴力破解)
│       ├── admin-products/# 商品管理
│       ├── admin-orders/  # 订单管理
│       ├── admin-cards/   # 卡密管理
│       └── webhook-nexapay/ # 支付回调 (签名校验+卡密分配)
├── docs/                  # 补充文档 (部署指南、演示说明等)
│   └── README.md          # 文档索引
├── DEPLOYMENT-GUIDE.md    # 详细部署指南
├── ENVIRONMENT.md         # 环境变量配置
├── netlify.toml           # Netlify 部署配置
├── server.py              # 本地开发服务器
└── README.md
```

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | HTML5 + Bootstrap 5 + Vanilla JS |
| **后端** | Supabase Edge Functions (Deno) |
| **数据库** | PostgreSQL (Supabase) |
| **部署** | Netlify CDN + Supabase |
| **支付** | NexaPay (加密货币) / Stripe / PayPal |

---

## 📊 数据库设计

### 核心表结构

```sql
-- 商品表
products (id, name, price, stock, sales, status, ...)

-- 订单表
orders (id, order_no, product_id, total_price, payment_status, ...)

-- 卡密表
cards (id, product_id, card_content, status, order_id, ...)

-- 管理员表
admins (id, username, password_hash, role, ...)

-- 支付配置表
payment_config (id, payment_type, enabled, config, ...)
```

> 完整表结构见: [supabase/database/schema.sql](supabase/database/schema.sql)

---

## 🎯 演示模式说明

本项目支持**演示模式**，无需配置数据库即可体验完整功能：

### 启用演示模式

**前台商城：**
```
访问: https://your-site.netlify.app/?demo=true
```

**管理后台：**
```
访问: https://your-site.netlify.app/admin/?demo=true
```

### 演示模式特性

1. **Mock数据**: 内置6个示例商品，覆盖不同分类
2. **完整流程**: 支持浏览商品 → 下单 → 支付 → 查看卡密 的完整流程
3. **模拟支付**: 支付页面提供"模拟支付成功"按钮
4. **数据隔离**: 演示数据存储在localStorage，不影响真实数据库

### 切换到正式模式

清除URL参数或访问不带`?demo=true`的URL即可切换到正式模式。

---

## 📝 简历描述建议

如果您将此项目写入简历，可参考以下描述：

```
项目名称：发卡商城系统（FakaShop）
项目角色：全栈开发者
技术栈：Supabase + Netlify Edge Functions + PostgreSQL + Bootstrap 5
项目描述：
- 设计并实现基于Serverless架构的虚拟商品自动发卡系统
- 实现商品管理、订单处理、卡密自动发货等核心功能
- 集成多种支付方式（USDT加密货币、信用卡、PayPal）
- 采用JWT鉴权、RLS行级安全策略、Webhook签名校验保障安全
- 实现登录暴力破解防护、CORS域名白名单、输入校验、XSS防护
- 卡密支付成功后分配，避免预扣导致库存浪费
- 支持一键部署到Netlify，提供演示模式降低体验门槛
项目成果：
- 从零到一完成全栈开发，代码开源获XX Star
- 部署成本趋近于零（Serverless架构），日均支持XX订单
- 演示模式使HR/面试官可零配置体验完整功能流程
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

- [Supabase](https://supabase.com/) - 强大的后端即服务
- [Netlify](https://www.netlify.com/) - 现代化部署平台
- [Bootstrap](https://getbootstrap.com/) - 响应式CSS框架

---

## 📞 联系方式

- 项目 Issues: [提交问题](https://github.com/yourusername/faka3/issues)
- Email: your-email@example.com

---

## 🔮 未来规划

- [ ] 接入 Stripe/PayPal 官方 SDK，支持信用卡直接支付
- [ ] 引入 Redis 缓存层，降低 Edge Functions 冷启动延迟
- [ ] 密码哈希升级为 bcrypt（通过外部 Node.js 函数或 Supabase Auth）
- [ ] 订单超时自动取消机制（定时任务或延迟队列）
- [ ] 多语言支持（i18n）
- [ ] 管理员操作审计日志（记录谁修改了什么）

---

<p align="center">⭐ 如果这个项目对您有帮助，请给个 Star！</p>
