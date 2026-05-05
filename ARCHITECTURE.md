# 🏗️ 项目架构说明

> FakaShop 发卡商城系统的完整架构设计

---

## 📐 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                              │
│                   (PC / Mobile / Tablet)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Netlify CDN (前端)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  index.html  │  │ payment.html │  │  admin/      │       │
│  │  (商城首页)   │  │  (支付页面)   │  │  index.html  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │           JavaScript 库 (web/js/)                 │       │
│  │  • supabase.js    - Supabase 客户端              │       │
│  │  • mode-manager.js - 模式管理                    │       │
│  └──────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Supabase Edge Functions (后端 API)                   │
│  ┌──────────────────────────────────────────────────┐       │
│  │  公开 API (用户端)                                │       │
│  │  • get-products    - 获取商品列表                 │       │
│  │  • create-order    - 创建订单                     │       │
│  │  • get-order       - 查询订单                     │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │  管理 API (需要 JWT 鉴权)                         │       │
│  │  • admin-login     - 管理员登录                   │       │
│  │  • admin-products  - 商品管理                     │       │
│  │  • admin-orders    - 订单管理                     │       │
│  │  • admin-cards     - 卡密管理                     │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Webhook                                          │       │
│  │  • webhook-nexapay - 支付回调处理                 │       │
│  └──────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Supabase PostgreSQL (数据库)                       │
│  ┌──────────────────────────────────────────────────┐       │
│  │  业务表                                           │       │
│  │  • categories        - 商品分类 (5条)             │       │
│  │  • products          - 商品信息 (3条)             │       │
│  │  • cards             - 卡密库存                   │       │
│  │  • orders            - 订单信息                   │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │  配置表                                           │       │
│  │  • payment_config    - 支付配置 (6条)             │       │
│  │  • system_config     - 系统配置 (7条)             │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │  安全表                                           │       │
│  │  • admins              - 管理员账号 (3条)         │       │
│  │  • admin_login_logs    - 登录日志                 │       │
│  │  • two_factor_config   - 2FA 配置                │       │
│  │  • two_factor_codes    - 2FA 验证码              │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 服务分工

### Frontend (Netlify)
- **职责**: 静态网站托管、客户端渲染
- **技术栈**: HTML5 + Bootstrap 5 + Vanilla JS
- **部署方式**: Git 推送自动触发
- **环境变量**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### Backend (Supabase Edge Functions)
- **职责**: 业务逻辑、数据库操作、权限验证
- **运行时**: Deno (TypeScript)
- **部署方式**: MCP 工具 / Supabase CLI
- **环境变量**: 
  - `SUPABASE_URL` - 项目 URL
  - `SUPABASE_SERVICE_ROLE_KEY` - 服务角色密钥
  - `ADMIN_JWT_SECRET` - JWT 签名密钥
  - `NEXAPAY_CRYPTO_ADDRESS` - USDT 地址
  - `NEXAPAY_WEBHOOK_SECRET` - Webhook 密钥

### Database (Supabase PostgreSQL)
- **版本**: PostgreSQL 15+
- **特性**: 行级安全 (RLS)、JSONB 支持、全文搜索
- **安全**: RLS 策略控制访问权限

---

## 🔗 数据流向

### 用户购买流程

```
1. 用户浏览商品
   浏览器 → GET /functions/v1/get-products → 数据库 (products 表)
   
2. 用户提交订单
   浏览器 → POST /functions/v1/create-order → 数据库 (orders 表)
   
3. 支付处理
   浏览器 → 显示支付地址
   支付平台 → POST /functions/v1/webhook-nexapay → 更新订单状态
   
4. 查看卡密
   浏览器 → POST /functions/v1/get-order → 数据库 (返回 card_content)
```

### 管理员操作流程

```
1. 管理员登录
   浏览器 → POST /functions/v1/admin-login → 验证并返回 JWT Token
   
2. 管理商品
   浏览器 + JWT → POST /functions/v1/admin-products → 数据库 (CRUD)
   
3. 管理订单
   浏览器 + JWT → POST /functions/v1/admin-orders → 数据库 (查询/更新)
   
4. 导入卡密
   浏览器 + JWT → POST /functions/v1/admin-cards → 数据库 (批量插入)
```

---

## 🔐 安全架构

### 鉴权机制

**用户端**:
- 使用 Supabase anon key (只读权限)
- 通过 Edge Functions 代理数据库操作
- 订单创建由 RLS 策略控制

**管理端**:
- JWT Token 鉴权 (HMAC-SHA256)
- Token 有效期 12 小时
- 所有管理 API 验证 Token 签名

```typescript
// JWT Token 结构
{
  adminId: number,
  username: string,
  role: string,
  exp: number  // 过期时间戳
}
```

### RLS 策略

| 表名 | 公开访问 | 管理员访问 | 说明 |
|------|---------|-----------|------|
| `products` | SELECT (status='active') | ALL | 用户只能看活跃商品 |
| `categories` | SELECT | ALL | 分类只读 |
| `payment_config` | SELECT (enabled=true) | ALL | 只看启用的支付 |
| `system_config` | SELECT | ALL | 系统配置只读 |
| `orders` | INSERT, SELECT | ALL | 用户可创建和查看订单 |
| `cards` | - | ALL | 仅管理员可管理 |
| `admins` | SELECT (登录验证) | - | 仅用于登录验证 |

### Webhook 签名校验

支持多种签名格式:
- Hex 格式
- Base64 格式
- Base64URL 格式
- Key=Value 格式

使用时间常数比较防止时序攻击。

---

## 📊 数据库设计

### 核心表结构

#### 1. 商品表 (products)
```sql
products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,              -- 商品名称
  price DECIMAL(10,2),             -- 售价
  original_price DECIMAL(10,2),    -- 原价
  description TEXT,                -- 描述
  category_id INTEGER,             -- 分类 ID
  image TEXT,                      -- 图片 URL
  stock INTEGER,                   -- 库存
  auto_deliver BOOLEAN,            -- 是否自动发货
  delivery_card_count INTEGER,     -- 每次发货卡密数量
  sales INTEGER,                   -- 销量
  hot BOOLEAN,                     -- 是否热销
  status TEXT,                     -- 状态: active/inactive
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

#### 2. 订单表 (orders)
```sql
orders (
  id SERIAL PRIMARY KEY,
  order_no TEXT UNIQUE,            -- 订单号
  product_id INTEGER,              -- 商品 ID
  product_name TEXT,               -- 商品名称 (冗余)
  price DECIMAL(10,2),             -- 单价
  quantity INTEGER,                -- 数量
  total_price DECIMAL(10,2),       -- 总价
  contact TEXT,                    -- 联系方式
  payment_method TEXT,             -- 支付方式
  payment_status TEXT,             -- pending/paid/failed
  status TEXT,                     -- pending/completed/cancelled
  card_content TEXT,               -- 卡密内容 (支付后填充)
  trade_no TEXT,                   -- 支付平台交易号
  crypto_address TEXT,             -- 加密货币地址
  created_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)
```

#### 3. 卡密表 (cards)
```sql
cards (
  id SERIAL PRIMARY KEY,
  product_id INTEGER,              -- 商品 ID
  card_content TEXT NOT NULL,      -- 卡密内容
  card_type TEXT,                  -- 类型: text/url/code
  status TEXT,                     -- available/used
  order_id INTEGER,                -- 使用的订单 ID
  used_at TIMESTAMPTZ,             -- 使用时间
  expires_at TIMESTAMPTZ,          -- 过期时间
  created_at TIMESTAMPTZ
)
```

---

## 🚀 部署架构

### 开发环境
```
本地开发 → npx serve web → 浏览器访问 localhost:3000
```

### 测试环境
```
GitLab → Netlify (自动部署) → 测试域名
```

### 生产环境
```
GitLab (main 分支)
    ↓
Netlify (生产部署)
    ↓
用户访问 → CDN 加速 → Edge Functions → 数据库
```

---

## 📁 项目结构

```
faka3-main/
├── web/                          # 前端应用
│   ├── index.html               # 商城首页
│   ├── payment.html             # 支付页面
│   ├── admin/
│   │   └── index.html          # 管理后台
│   └── js/
│       ├── supabase.js         # Supabase 客户端
│       ├── mode-manager.js     # 模式管理
│       └── mode-switcher.js    # 模式切换
├── supabase/
│   ├── database/
│   │   └── schema.sql          # 数据库表结构定义
│   └── functions/              # Edge Functions
│       ├── get-products/
│       ├── create-order/
│       ├── get-order/
│       ├── admin-login/
│       ├── admin-products/
│       ├── admin-orders/
│       ├── admin-cards/
│       └── webhook-nexapay/
├── docs/                        # 文档目录
├── README.md                    # 项目说明
├── DEPLOYMENT-GUIDE.md         # 部署指南
├── ARCHITECTURE.md             # 架构说明 (本文件)
├── API.md                       # API 文档
└── .env                        # 环境变量 (不提交)
```

---

## 🔄 技术栈对比

| 层级 | 技术 | 替代方案 | 选择理由 |
|------|------|---------|---------|
| 前端 | Vanilla JS | React/Vue | 简单直接,无需构建工具 |
| UI | Bootstrap 5 | Tailwind | 快速开发,组件丰富 |
| 后端 | Edge Functions | Node.js/Express | Serverless,零运维 |
| 数据库 | Supabase (PostgreSQL) | MySQL/MongoDB | 内置 RLS,类型安全 |
| 部署 | Netlify | Vercel | Git 集成,免费额度高 |
| 支付 | NexaPay | Stripe | 加密货币支持 |

---

## 📈 性能优化

### 前端优化
- CDN 加载资源 (Bootstrap, Supabase JS)
- CSS 内联关键样式
- 懒加载商品图片
- LocalStorage 缓存配置

### 后端优化
- Edge Functions 就近执行
- 数据库连接池复用
- 查询结果缓存
- 索引优化查询

### 数据库优化
- 12个性能索引
- 外键约束
- 查询优化
- RLS 策略过滤

---

## 🛡️ 容错设计

### 降级策略
1. **数据库未连接**: 前端可浏览但不能购买
2. **Edge Functions 失败**: 回退到直接 SQL 查询
3. **支付回调延迟**: 前端轮询订单状态
4. **卡密库存不足**: 明确提示用户

### 错误处理
- 统一错误响应格式
- 友好的错误提示
- 完整的错误日志
- 优雅降级

---

<p align="center">📖 最后更新: 2026-04-13</p>
