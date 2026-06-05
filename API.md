# 📡 API 接口文档

> FakaShop 发卡商城系统 Edge Functions API 完整文档

**Base URL**: `https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1`

---

## 📋 目录

- [公开 API (用户端)](#公开-api用户端)
  - [获取商品列表](#获取商品列表)
  - [创建订单](#创建订单)
  - [查询订单](#查询订单)
- [管理 API (需要鉴权)](#管理-api需要鉴权)
  - [管理员登录](#管理员登录)
  - [商品管理](#商品管理)
  - [订单管理](#订单管理)
  - [卡密管理](#卡密管理)
- [Webhook](#webhook)
  - [支付回调](#支付回调)

---

## 公开 API（用户端）

### 获取商品列表

获取所有在售商品，支持分类筛选和搜索。

**Endpoint**: `GET /functions/v1/get-products`

**认证**: 无需

**查询参数**:

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `category_id` | string | 否 | 分类 ID，`all` 表示全部 | `1` |
| `keyword` | string | 否 | 搜索关键词 | `VIP` |
| `limit` | number | 否 | 返回数量限制，默认 100，最大 200 | `50` |

**请求示例**:

```bash
curl "https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/get-products?category_id=1&keyword=VIP&limit=20"
```

**响应示例**:

```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Netflix VIP会员（1个月）",
      "price": 29.99,
      "original_price": 49.99,
      "description": "Netflix 高级会员账号...",
      "category_id": 1,
      "stock": 100,
      "auto_deliver": true,
      "sales": 156,
      "hot": true,
      "status": "active",
      "categories": {
        "id": 1,
        "name": "VIP会员",
        "slug": "vip",
        "icon": "🎬"
      }
    }
  ]
}
```

**错误响应**:

```json
{
  "success": false,
  "message": "错误描述"
}
```

---

### 创建订单

创建新的购买订单。

**Endpoint**: `POST /functions/v1/create-order`

**认证**: 无需

**请求体**:

```json
{
  "productId": 1,
  "quantity": 1,
  "contact": "user@example.com",
  "paymentMethod": "nexapay"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `productId` | number | 是 | 商品 ID |
| `quantity` | number | 否 | 购买数量，默认 1 |
| `contact` | string | 是 | 联系方式（邮箱/QQ等） |
| `paymentMethod` | string | 是 | 支付方式: `nexapay`/`stripe`/`paypal` |

**请求示例**:

```bash
curl -X POST "https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 1,
    "contact": "user@example.com",
    "paymentMethod": "nexapay"
  }'
```

**成功响应**:

```json
{
  "success": true,
  "order": {
    "id": 1,
    "order_no": "ORD1712995200000ABC123",
    "product_id": 1,
    "product_name": "Netflix VIP会员（1个月）",
    "price": 29.99,
    "quantity": 1,
    "total_price": 29.99,
    "contact": "user@example.com",
    "payment_method": "nexapay",
    "payment_status": "pending",
    "status": "pending",
    "crypto_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    "created_at": "2026-04-13T10:00:00Z"
  },
  "payment": {
    "success": true,
    "paymentMethod": "nexapay",
    "cryptoAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    "cryptoAmount": "29.99",
    "message": "请向以上地址转账USDT"
  }
}
```

**错误响应**:

```json
{
  "success": false,
  "message": "商品不存在或已下架"
}
```

可能的错误信息:
- `商品不存在或已下架` - 商品 ID 无效
- `商品库存不足` - stock <= 0
- `卡密库存不足` - 自动发货商品卡密不够
- `缺少必要参数` - 请求体不完整

---

### 查询订单

查询订单详情和支付状态。

**Endpoint**: `POST /functions/v1/get-order`

**认证**: 无需

**请求体**:

```json
{
  "order_no": "ORD1712995200000ABC123"
}
```

**请求示例**:

```bash
curl -X POST "https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/get-order" \
  -H "Content-Type: application/json" \
  -d '{"order_no": "ORD1712995200000ABC123"}'
```

**成功响应**:

```json
{
  "success": true,
  "order": {
    "id": 1,
    "order_no": "ORD1712995200000ABC123",
    "product_name": "Netflix VIP会员（1个月）",
    "quantity": 1,
    "total_price": 29.99,
    "contact": "user@example.com",
    "payment_method": "nexapay",
    "payment_status": "paid",
    "status": "completed",
    "card_content": "账号: vip123@netflix.com\n密码: Pass123",
    "trade_no": "TX123456789",
    "paid_at": "2026-04-13T10:05:00Z",
    "completed_at": "2026-04-13T10:05:00Z"
  }
}
```

**安全说明**:
- `card_content` 仅在 `payment_status === 'paid'` 时返回
- 未支付订单的 `card_content` 为 `null`

---

## 管理 API（需要鉴权）

### 认证方式

所有管理 API 需要在请求头中携带 JWT Token:

```
Authorization: Bearer <token>
```

**获取 Token**: 通过 [管理员登录](#管理员登录) 接口获取

---

### 管理员登录

验证管理员身份并返回 JWT Token。

**Endpoint**: `POST /functions/v1/admin-login`

**认证**: 无需

**请求体**:

```json
{
  "username": "admin",
  "password": "Admin@123456",
  "code": ""
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | string | 是 | 用户名 |
| `password` | string | 是 | 密码 |
| `code` | string | 否 | 2FA 验证码（如启用） |

**请求示例**:

```bash
curl -X POST "https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/admin-login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123456"
  }'
```

**成功响应**:

```json
{
  "success": true,
  "admin": {
    "id": 1,
    "username": "admin",
    "role": "super_admin"
  },
  "token": "eyJhZG1pbklkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzEzMDM4NDAwfQ.abc123..."
}
```

**2FA 响应** (如启用了两步验证):

```json
{
  "success": true,
  "require2fa": true,
  "adminId": 1,
  "twoFactorType": "email",
  "message": "请输入验证码"
}
```

**错误响应**:

```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

---

### 商品管理

商品的增删改查操作。

**Endpoint**: `POST /functions/v1/admin-products`

**认证**: 需要 JWT

**操作类型**:

#### 1. 列出所有商品

```json
{
  "action": "list"
}
```

**响应**:

```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Netflix VIP会员",
      "price": 29.99,
      "stock": 100,
      "sales": 156,
      "status": "active",
      "categories": {
        "id": 1,
        "name": "VIP会员",
        "slug": "vip",
        "icon": "🎬"
      }
    }
  ]
}
```

#### 2. 添加商品

```json
{
  "action": "add",
  "data": {
    "name": "新商品",
    "price": 99.99,
    "original_price": 149.99,
    "description": "商品描述",
    "category_id": 1,
    "image": "https://example.com/image.jpg",
    "stock": 100,
    "auto_deliver": true,
    "hot": false,
    "status": "active"
  }
}
```

**响应**:

```json
{
  "success": true,
  "product": { /* 新创建的商品信息 */ }
}
```

#### 3. 更新商品

```json
{
  "action": "update",
  "data": {
    "id": 1,
    "price": 39.99,
    "stock": 200,
    "status": "active"
  }
}
```

**响应**:

```json
{
  "success": true,
  "product": { /* 更新后的商品信息 */ }
}
```

#### 4. 删除商品

```json
{
  "action": "delete",
  "data": {
    "id": 1
  }
}
```

**响应**:

```json
{
  "success": true
}
```

**注意**: 删除商品会同时删除该商品的所有卡密。

---

### 订单管理

订单查询、状态更新和统计。

**Endpoint**: `POST /functions/v1/admin-orders`

**认证**: 需要 JWT

**操作类型**:

#### 1. 列出订单

```json
{
  "action": "list",
  "data": {
    "status": "all"
  }
}
```

`status` 可选值: `all`, `pending`, `paid`, `completed`, `cancelled`

**响应**:

```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "order_no": "ORD1712995200000ABC123",
      "product_name": "Netflix VIP会员",
      "total_price": 29.99,
      "contact": "user@example.com",
      "payment_status": "paid",
      "status": "completed",
      "created_at": "2026-04-13T10:00:00Z"
    }
  ]
}
```

#### 2. 更新订单状态

```json
{
  "action": "update_status",
  "data": {
    "id": 1,
    "status": "completed",
    "remark": "订单已完成"
  }
}
```

**响应**:

```json
{
  "success": true
}
```

#### 3. 删除订单

```json
{
  "action": "delete",
  "data": {
    "id": 1
  }
}
```

**响应**:

```json
{
  "success": true
}
```

#### 4. 获取统计数据

```json
{
  "action": "stats"
}
```

**响应**:

```json
{
  "success": true,
  "stats": {
    "totalOrders": 150,
    "pendingOrders": 5,
    "totalRevenue": 4500.00
  }
}
```

---

### 卡密管理

卡密的导入、查询和删除。

**Endpoint**: `POST /functions/v1/admin-cards`

**认证**: 需要 JWT

**操作类型**:

#### 1. 列出卡密

```json
{
  "action": "list",
  "data": {
    "product_id": 1,
    "status": "available"
  }
}
```

**响应**:

```json
{
  "success": true,
  "cards": [
    {
      "id": 1,
      "product_id": 1,
      "card_content": "账号: vip123@netflix.com\n密码: Pass123",
      "status": "available",
      "created_at": "2026-04-13T10:00:00Z",
      "products": {
        "name": "Netflix VIP会员"
      }
    }
  ]
}
```

#### 2. 批量导入卡密

```json
{
  "action": "add",
  "data": {
    "product_id": 1,
    "cards": [
      "账号: vip001@demo.com | 密码: Pass001",
      "账号: vip002@demo.com | 密码: Pass002",
      "账号: vip003@demo.com | 密码: Pass003"
    ],
    "card_type": "text"
  }
}
```

**响应**:

```json
{
  "success": true,
  "count": 3
}
```

**注意**: 
- 卡密按行分割，每行一个卡密
- 导入后自动更新商品库存

#### 3. 删除卡密

```json
{
  "action": "delete",
  "data": {
    "id": 1
  }
}
```

**响应**:

```json
{
  "success": true
}
```

---

## Webhook

### 支付回调

接收支付平台的回调通知，更新订单状态。

**Endpoint**: `POST /functions/v1/webhook-nexapay`

**认证**: Webhook 签名验证

**请求头**:

```
Content-Type: application/json
x-nexapay-signature: <签名>
```

或

```
x-signature: <签名>
```

**请求体**:

```json
{
  "order_id": "ORD1712995200000ABC123",
  "status": "completed",
  "payment_id": "PAY123456789",
  "transaction_hash": "0xabc123..."
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `order_id` | string | 是 | 订单号 |
| `status` | string | 是 | 支付状态: `confirmed`/`completed`/`failed` |
| `payment_id` | string | 否 | 支付平台交易 ID |
| `transaction_hash` | string | 否 | 区块链交易哈希 |

**响应**:

```json
{
  "success": true
}
```

**错误响应**:

```json
{
  "success": false,
  "message": "invalid signature"
}
```

**状态映射**:

| 支付平台状态 | 系统 payment_status | 系统 status |
|------------|-------------------|------------|
| `confirmed` | `paid` | `completed` |
| `completed` | `paid` | `completed` |
| `success` | `paid` | `completed` |
| `failed` | `failed` | `cancelled` |
| `expired` | `failed` | `cancelled` |

---

## 错误码说明

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或过期） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 测试示例

### 完整购买流程测试

```bash
# 1. 获取商品列表
curl "https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/get-products"

# 2. 创建订单
curl -X POST "https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "contact": "test@example.com",
    "paymentMethod": "nexapay"
  }'

# 3. 查询订单（支付前）
curl -X POST "https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/get-order" \
  -H "Content-Type: application/json" \
  -d '{"order_no": "ORD..."}'

# 4. 模拟支付回调
curl -X POST "https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/webhook-nexapay" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD...",
    "status": "completed"
  }'

# 5. 查询订单（支付后，获取卡密）
curl -X POST "https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1/get-order" \
  -H "Content-Type: application/json" \
  -d '{"order_no": "ORD..."}'
```

---

## SDK 示例

### JavaScript/TypeScript

```typescript
const BASE_URL = 'https://jmtvlbwyugnabgloeocy.supabase.co/functions/v1';

// 获取商品列表
async function getProducts(categoryId?: string) {
  const params = new URLSearchParams();
  if (categoryId) params.set('category_id', categoryId);
  
  const res = await fetch(`${BASE_URL}/get-products?${params}`);
  return res.json();
}

// 创建订单
async function createOrder(productId: number, contact: string) {
  const res = await fetch(`${BASE_URL}/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId,
      contact,
      paymentMethod: 'nexapay'
    })
  });
  return res.json();
}

// 管理员登录
async function adminLogin(username: string, password: string) {
  const res = await fetch(`${BASE_URL}/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  
  if (data.success) {
    localStorage.setItem('admin_token', data.token);
  }
  return data;
}

// 获取商品列表（管理端）
async function getAdminProducts() {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${BASE_URL}/admin-products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ action: 'list' })
  });
  return res.json();
}
```

---

<p align="center">📖 API 版本: v1 | 最后更新: 2026-04-13</p>
