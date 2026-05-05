# 🎭 演示模式使用指南

> 本项目采用创新的**双模式演示架构**，让 HR/面试官/客户可以零配置体验完整功能，同时保护您的真实数据。

---

## 📋 目录

- [演示模式架构](#演示模式架构)
- [模式 1：前端 Mock 演示](#模式-1前端-mock-演示)
- [模式 2：真实数据库演示](#模式-2真实数据库演示)⭐
- [权限控制机制](#权限控制机制)
- [常见问题](#常见问题)

---

## 🎯 演示模式架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户访问                              │
└─────────────┬───────────────────┬───────────────────────┘
              │                   │
     前端 Mock 模式          真实数据库模式
     (?demo=true)           (正常访问)
              │                   │
    ┌─────────┴─────────┐    ┌────┴────────────────┐
    │  本地 localStorage │    │  Supabase 数据库     │
    │  Mock 数据         │    │  真实数据持久化      │
    │  刷新重置          │    │  权限控制           │
    └───────────────────┘    │  demo_admin = 只读  │
                             └─────────────────────┘
```

---

## 模式 1：前端 Mock 演示

### 访问方式

```
前台商城:    https://your-site.netlify.app/?demo=true
管理后台:    https://your-site.netlify.app/admin/?demo=true
```

### 特点

| 特性 | 说明 |
|------|------|
| **配置要求** | ❌ 无需任何配置 |
| **数据来源** | 前端 JavaScript Mock 数据 |
| **数据持久** | ❌ 刷新页面后重置 |
| **适合场景** | 快速体验 UI/UX，了解功能布局 |

### 演示账号

- **前台**: 直接访问，无需登录
- **管理后台**: `demo` / `Demo@123456`（本地验证）

### 内置数据

- 6 个示例商品（不同分类）
- 模拟订单流程
- 模拟卡密发放

---

## 模式 2：真实数据库演示 ⭐

### 访问方式

```
前台商城:    https://your-site.netlify.app/
管理后台:    https://your-site.netlify.app/admin/
```

### 演示账号

| 字段 | 值 |
|------|-----|
| **用户名** | `demo` |
| **密码** | `Demo@123456` |
| **角色** | `demo_admin` |
| **权限** | 只读（查看所有数据） |

### 特点

| 特性 | 说明 |
|------|------|
| **配置要求** | ✅ 需要部署到 Netlify + 配置 Supabase |
| **数据来源** | Supabase PostgreSQL 真实数据库 |
| **数据持久** | ✅ 永久保存 |
| **权限控制** | 🔒 只能查看，无法添加/修改/删除 |
| **适合场景** | 完整功能体验，真实业务操作 |

### 演示账号权限

#### ✅ 可以做的操作

- 查看所有商品列表
- 查看商品详情
- 查看订单列表和详情
- 查看卡密列表
- 查看数据统计
- 浏览系统配置

#### ❌ 无法做的操作

- ❌ 添加新商品
- ❌ 修改商品信息
- ❌ 删除商品
- ❌ 添加/删除卡密
- ❌ 修改订单
- ❌ 删除订单
- ❌ 修改系统配置
- ❌ 管理分类

### 演示商品

系统预置了 3 个演示专用商品（标记为 `[免费体验]`）：

1. 🎮 Steam 充值卡 $50 [免费体验] - ¥0.01
2. 🎵 Spotify 3个月会员 [免费体验] - ¥0.01
3. 📺 YouTube Premium 1年 [免费体验] - ¥0.01

> 这些商品价格极低（¥0.01），专为演示设计，HR/面试官可以真实下单体验完整购买流程。

### 用户体验流程

#### 前台购买流程

```
1. 访问前台商城
   ↓
2. 浏览商品列表
   ↓
3. 点击商品详情
   ↓
4. 填写联系方式
   ↓
5. 选择支付方式（USDT/支付宝/微信等）
   ↓
6. 点击"确认支付"
   ↓
7. 跳转到支付页面
   ↓
8. 点击"模拟支付成功"
   ↓
9. 查看卡密（自动发货）
   ↓
10. 查看订单状态
```

#### 管理后台体验流程

```
1. 访问管理后台
   ↓
2. 使用 demo 账号登录
   ↓
3. 看到顶部演示模式横幅提示
   ↓
4. 浏览数据概览（统计信息）
   ↓
5. 查看商品列表
   ↓
6. 尝试点击"编辑"或"删除"按钮
   → 提示：🎭 演示模式：此功能已被禁用
   ↓
7. 查看订单列表（包括刚才下的订单）
   ↓
8. 查看卡密管理
   ↓
9. 了解完整功能和权限控制机制
```

---

## 🔒 权限控制机制

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│              演示系统完整架构                            │
└─────────────────────────────────────────────────────────┘

1. 数据隔离层
   ├─ owner 字段标识（system_demo / demo_user / NULL）
   ├─ 演示商品保护（至少保留 4 个）
   └─ 自动清理机制（订单 100 条，卡密 200 条）

2. 权限控制层
   ├─ Edge Function 鉴权（JWT Token）
   ├─ 数据库触发器（保护 + 清理）
   └─ 前端 UI 控制（禁用按钮 + 提示）

3. 数据流向
   用户操作 → Edge Function 检查 → 数据库操作 → 触发器验证 → 返回结果
```

### 1. 数据隔离机制

#### owner 字段设计

| 值 | 含义 | 示例 |
|---|------|------|
| `system_demo` | 系统预置演示商品（受保护） | Netflix [DEMO]、Steam [DEMO] |
| `demo_user` | 演示用户创建的商品 | demo 账号添加的商品 |
| `NULL` | 正式数据（管理员创建） | 正式商品、真实订单 |

#### 数据库字段

```sql
-- 为关键表添加 owner 字段
ALTER TABLE products ADD COLUMN owner TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN owner TEXT DEFAULT NULL;
ALTER TABLE cards ADD COLUMN owner TEXT DEFAULT NULL;
```

### 2. 数据保护机制

#### 🛡️ 演示商品保护

**规则**: 系统演示商品（`owner='system_demo'`）删除时至少保留 4 个

```sql
-- 触发器函数
CREATE FUNCTION protect_demo_products()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.owner = 'system_demo' THEN
    -- 计算剩余数量
    SELECT COUNT(*) INTO remaining_count 
    FROM products 
    WHERE owner = 'system_demo' AND id != OLD.id;
    
    -- 如果少于 4 个，阻止删除
    IF remaining_count < 4 THEN
      RAISE EXCEPTION '🎭 演示保护：系统演示商品必须保留至少 4 个';
    END IF;
  END IF;
  
  -- 同时删除关联卡密
  DELETE FROM cards WHERE product_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
```

**测试示例**:
```
当前有 8 个演示商品
→ 删除 1 个，剩余 7 个 ✅ 成功
→ 删除 2 个，剩余 6 个 ✅ 成功
→ 删除 3 个，剩余 5 个 ✅ 成功
→ 删除 4 个，剩余 4 个 ✅ 成功
→ 删除 5 个，剩余 3 个 ❌ 失败（触发器阻止）
```

#### 🗑️ 自动清理机制

**订单清理**: 超过 100 条自动清理最旧的 20 条
```sql
CREATE FUNCTION cleanup_demo_orders()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COUNT(*) INTO demo_order_count 
  FROM orders WHERE owner IS NOT NULL;
  
  IF demo_order_count > 100 THEN
    DELETE FROM orders 
    WHERE owner IS NOT NULL 
    ORDER BY created_at ASC 
    LIMIT 20;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**卡密清理**: 超过 200 条自动清理最旧的 50 条

| 数据类型 | 阈值 | 清理数量 | 清理策略 |
|---------|------|---------|---------|
| 订单 | 100 条 | 20 条 | 按 created_at 升序（最旧的优先） |
| 卡密 | 200 条 | 50 条 | 按 created_at 升序（最旧的优先） |

### 3. Edge Function 权限控制

所有管理员操作都经过 Edge Function 鉴权：

```typescript
// 检查是否是 demo_admin 角色
const isDemoAdmin = auth.role === 'demo_admin';

// 如果是 demo_admin，拒绝修改操作
if (isDemoAdmin) {
  return new Response(JSON.stringify({ 
    success: false, 
    message: '🎭 演示模式：您正在使用演示账号，无法修改数据。' 
  }), { status: 403 });
}
```

**已更新的 Edge Functions**:
- `admin-login` - 登录时返回 `isDemo` 标识
- `admin-products` - 禁止 demo_admin 增删改商品
- `admin-orders` - 禁止 demo_admin 修改/删除订单
- `admin-cards` - 禁止 demo_admin 管理卡密

### 2. 数据库 RLS 层

行级安全策略（Row Level Security）：

```sql
-- 所有管理员都可以查看所有数据（通过 Edge Function 控制权限）
CREATE POLICY "products_all_admins_manage" ON products
FOR ALL TO public
USING (true)
WITH CHECK (true);
```

> **注意**: 数据库层保持宽松，权限控制主要在 Edge Function 层实现。

### 3. 前端 UI 层

自动禁用所有操作按钮：

```javascript
// 登录成功后检测 demo 角色
if (data.admin && data.admin.isDemo) {
    showDemoBanner();        // 显示演示模式横幅
    disableAdminActions();   // 禁用所有操作按钮
}

// 监听 DOM 变化，自动禁用新增按钮
function disableAdminActions() {
    const observer = new MutationObserver((mutations) => {
        // 自动禁用 .btn-danger, .btn-warning 等按钮
    });
}
```

### 演示模式横幅

当 demo 账号登录时，顶部显示橙色横幅：

```
┌─────────────────────────────────────────────────────────┐
│ 🔒 🎭 演示模式：您正在使用演示账号，只能查看数据，       │
│    无法添加、修改或删除任何内容。                        │
│    [🐙 部署自己的实例]                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 常见问题

### Q1: HR/面试官应该使用哪种模式？

**推荐：模式 2（真实数据库演示）**

理由：
1. ✅ 可以真实体验完整功能
2. ✅ 可以真实下单、支付、查看订单
3. ✅ 数据持久化，不会丢失
4. ✅ 了解权限控制机制
5. 🔒 不会破坏您的数据

### Q2: demo 账号能看到我的真实数据吗？

**是的，可以看到所有数据**，包括：
- 所有商品
- 所有订单
- 所有卡密
- 系统配置

**但无法修改或删除**任何数据。

### Q3: 如何添加更多演示商品？

使用您的正式管理员账号（`admin`）登录，然后：
1. 进入"商品管理"
2. 点击"添加商品"
3. 填写商品信息
4. 确保商品状态为 `active`

demo 账号登录后可以看到所有商品（包括您添加的演示商品）。

### Q4: 演示数据会影响我的正式运营吗？

**不会**。演示商品标记为 `[免费体验]`，您可以：
1. 随时删除这些演示商品（使用正式管理员账号）
2. 或者保留它们作为展示
3. 它们的价格极低（¥0.01），不会产生真实交易价值

### Q5: 如何关闭演示模式？

**无法关闭，也不应该关闭**。演示模式是项目的核心特性：
- 让 HR/面试官可以零配置体验
- 展示您的权限控制设计
- 证明项目的专业性

如果您不想公开演示链接，只需不分享即可。

### Q6: 开发者如何部署自己的实例？

开发者可以：
1. Fork 本项目
2. 创建自己的 Supabase 项目
3. 配置环境变量
4. 部署到 Netlify
5. 初始化数据库

详见 [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

---

## 📝 演示账号管理

### 查看演示账号

```sql
SELECT id, username, role, email, created_at 
FROM admins 
WHERE role = 'demo_admin';
```

### 重置演示账号密码

```sql
-- 使用 pgcrypto 扩展
CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE admins 
SET password_hash = encode(digest('Demo@123456' || 'demo2024', 'sha256'), 'hex')
WHERE username = 'demo';
```

### 删除演示账号（不推荐）

```sql
DELETE FROM admins WHERE username = 'demo';
```

> ⚠️ 删除后 HR/面试官将无法体验演示模式，强烈建议保留。

---

## 🎓 面试时如何使用

### 简历描述示例

```markdown
## 发卡商城系统 FakaShop
**技术栈**: Supabase + Netlify Edge Functions + PostgreSQL + Bootstrap 5

**项目亮点**:
- 设计双模式演示架构，HR/面试官可零配置体验完整功能
- 实现 `demo_admin` 角色权限控制，演示账号只能查看，无法修改数据
- Edge Function + 数据库 RLS + 前端 UI 三层权限控制
- 支持真实下单、支付、卡密发放完整流程

**在线演示**:
- 前台: https://your-site.netlify.app/
- 管理后台: https://your-site.netlify.app/admin/ (demo/Demo@123456)
```

### 面试话术

> "这个项目的亮点是我设计了**三层权限控制**：
> 
> 1. **Edge Function 层**: 在业务逻辑层拦截 demo_admin 的修改操作
> 2. **数据库 RLS 层**: 行级安全策略
> 3. **前端 UI 层**: 自动禁用所有操作按钮，显示演示模式横幅
> 
> 同时我设计了**双模式演示架构**：
> - 前端 Mock 模式：零配置，打开即用
> - 真实数据库模式：可以真实体验完整功能，但无法破坏数据
> 
> 这样 HR 和面试官可以通过我提供的链接直接体验产品，无需配置环境。"

---

## 📚 相关文档

- [README.md](./README.md) - 项目总览
- [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) - 部署指南
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 架构设计
- [API.md](./API.md) - API 文档

---

**🎭 让每个人都能零配置体验您的项目！**
