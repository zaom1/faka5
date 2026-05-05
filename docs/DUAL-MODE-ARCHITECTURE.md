# 🔄 双模式架构设计文档

> FakaShop v3.0 - 支持本地开发模式 + Supabase演示模式

---

## 📋 架构总览

本项目采用**双模式数据库架构**,一套代码支持两种数据存储方式:

```
┌─────────────────────────────────────────────────────┐
│                  FakaShop 应用层                      │
│  (前端页面 + 管理后台)                                │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │    ModeManager        │ ← 模式管理器
        │  (智能路由层)          │
        └───────┬───────┬───────┘
                │       │
        ┌───────▼──┐ ┌──▼────────┐
        │ 本地模式  │ │Supabase模式│
        │ LocalDB  │ │ Supabase  │
        └───────┬──┘ └──┬────────┘
                │       │
        ┌───────▼──┐ ┌──▼────────┐
        │localStorage│ │ 云端数据库  │
        │ (浏览器)   │ │ PostgreSQL│
        └──────────┘ └───────────┘
```

---

## 🎯 两种模式对比

### 模式一：本地开发模式 (`?mode=local`)

**定位**: 开发者本地学习、开发、测试

| 维度 | 说明 |
|------|------|
| **数据存储** | 浏览器 localStorage |
| **网络依赖** | ❌ 无需网络 |
| **数据持久化** | ⚠️ 仅本地浏览器，清除缓存后丢失 |
| **支付流程** | 模拟支付（无真实交易） |
| **管理功能** | ✅ 完整CRUD（本地操作） |
| **账号体系** | 本地模拟账号（admin/admin123） |
| **适用场景** | 本地开发、功能学习、代码调试 |
| **启动命令** | `http://localhost:3000/?mode=local` |

**核心特点**:
- ✅ 零配置，开箱即用
- ✅ 无需Supabase账号
- ✅ 无需网络连接
- ✅ 适合快速迭代开发
- ⚠️ 数据不跨设备同步
- ⚠️ 不适合生产环境

---

### 模式二：Supabase演示模式 (`?mode=supabase`)

**定位**: HR面试体验、真实演示、生产环境

| 维度 | 说明 |
|------|------|
| **数据存储** | Supabase PostgreSQL（云端） |
| **网络依赖** | ✅ 需要网络连接 |
| **数据持久化** | ✅ 云端持久化，跨设备同步 |
| **支付流程** | ✅ 真实支付流程（USDT TRC20） |
| **管理功能** | ✅ 完整后台管理（Edge Functions） |
| **账号体系** | Supabase演示账号 |
| **适用场景** | 面试展示、在线演示、生产部署 |
| **启动命令** | `http://localhost:3000/?mode=supabase` 或默认 |

**核心特点**:
- ✅ 完整功能演示
- ✅ 真实支付流程
- ✅ 数据云端持久化
- ✅ 支持多用户协作
- ✅ 适合生产环境
- ⚠️ 需要Supabase配置
- ⚠️ 需要网络连接

---

## 🚀 使用指南

### 方式一：URL参数切换

```bash
# 本地开发模式
http://localhost:3000/?mode=local
http://localhost:3000/admin/index.html?mode=local

# Supabase演示模式
http://localhost:3000/?mode=supabase
http://localhost:3000/admin/index.html?mode=supabase
```

### 方式二：界面切换按钮

页面右下角会显示**模式切换按钮**，点击可选择：

```
┌─────────────────────────────┐
│  ⚙️ 切换数据模式             │
│                             │
│  💻 本地开发模式             │
│  • 无需网络连接             │
│  • 本地CRUD操作             │
│  • 模拟支付流程             │
│  • 数据不持久化             │
│                             │
│  ☁️ Supabase演示模式         │
│  • 真实支付流程             │
│  • 完整后台管理             │
│  • 数据云端持久化           │
│  • 支持多用户协作           │
│                             │
│  [取消]  [恢复默认]          │
└─────────────────────────────┘
```

### 方式三：localStorage设置

```javascript
// 设置为本地模式
localStorage.setItem('app_mode', 'local');
location.reload();

// 设置为Supabase模式
localStorage.setItem('app_mode', 'supabase');
location.reload();
```

---

## 🔧 配置Supabase

### 使用默认演示Supabase

如果您想使用我的Supabase演示环境（真实支付流程），无需配置，默认即可使用。

**演示账号**:
- 前台用户：直接访问即可
- 管理后台：`demo` / `Demo@123456`

### 使用自己的Supabase

如需使用自己的Supabase项目：

1. **创建Supabase项目**
   - 访问 [supabase.com](https://supabase.com)
   - 创建新项目
   - 获取 Project URL 和 anon key

2. **初始化数据库**
   ```sql
   -- 在 Supabase SQL Editor 中执行
   -- supabase/database/schema.sql
   -- supabase/database/demo-data.sql
   ```

3. **配置Supabase连接**
   
   **方法A**: 界面配置
   - 点击右下角模式切换按钮
   - 在Supabase配置区域填写
   - 点击"保存配置"

   **方法B**: 代码配置
   ```javascript
   window.modeManager.saveSupabaseConfig(
     'https://your-project.supabase.co',
     'your-anon-key-here'
   );
   ```

4. **切换到Supabase模式**
   ```
   http://localhost:3000/?mode=supabase
   ```

---

## 📊 数据流对比

### 本地开发模式数据流

```
用户操作
  ↓
前端页面 (index.html)
  ↓
ModeManager (检测模式=local)
  ↓
LocalDB (localStorage操作)
  ↓
浏览器本地存储
  ↓
返回数据
  ↓
渲染页面

✅ 特点:
- 无网络请求
- 毫秒级响应
- 数据仅本地
```

### Supabase演示模式数据流

```
用户操作
  ↓
前端页面 (index.html)
  ↓
ModeManager (检测模式=supabase)
  ↓
Supabase Client
  ↓
Supabase Edge Functions
  ↓
PostgreSQL 数据库
  ↓
返回数据
  ↓
渲染页面

✅ 特点:
- 真实网络请求
- 云端持久化
- 支持并发
```

---

## 🎨 代码架构

### 核心文件

```
web/js/
├── mode-manager.js      # 模式管理器（核心）
│   ├── ModeManager类    # 模式检测、切换、路由
│   └── LocalDB类        # 本地数据库实现
│
└── mode-switcher.js     # 模式切换UI组件
    └── ModeSwitcher类   # 可视化界面
```

### ModeManager API

```javascript
// 获取当前模式
modeManager.currentMode  // 'local' 或 'supabase'

// 切换模式
await modeManager.switchMode('local');
await modeManager.switchMode('supabase');

// 查询数据
const products = await modeManager.query('products', {
  where: { status: 'active' },
  order: { field: 'created_at', ascending: false },
  limit: 10
});

// 插入数据
await modeManager.insert('products', {
  name: '新商品',
  price: 99.99,
  // ...
});

// 更新数据
await modeManager.update('products', 1, {
  price: 89.99
});

// 删除数据
await modeManager.delete('products', 1);

// 用户登录
const result = await modeManager.login('admin', 'admin123');

// 创建订单
const order = await modeManager.createOrder({
  product_id: 1,
  quantity: 1,
  contact: 'QQ:123456',
  payment_method: 'nexapay'
});

// 获取模式信息
const info = modeManager.getModeInfo();
// {
//   mode: 'local',
//   modeName: '本地开发模式',
//   description: '...',
//   features: ['...', '...']
// }
```

### LocalDB 实现细节

```javascript
class LocalDB {
  // 数据存储结构
  tables = {
    products: [],    // 商品表
    orders: [],      // 订单表
    cards: [],       // 卡密表
    categories: [],  // 分类表
    admins: []       // 管理员表
  }

  // 核心方法
  query(table, options)    // 查询
  insert(table, data)      // 插入
  update(table, id, data)  // 更新
  delete(table, id)        // 删除
  login(username, password)// 登录
  createOrder(data)        // 创建订单
}
```

---

## 💡 使用场景

### 场景一：开发者本地开发

**推荐模式**: 本地开发模式 (`?mode=local`)

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/faka3.git
cd faka3

# 2. 启动服务
npm run demo

# 3. 访问本地模式
http://localhost:3000/?mode=local
http://localhost:3000/admin/index.html?mode=local

# 4. 开始开发
# - 修改前端代码
# - 测试CRUD功能
# - 无需配置数据库
```

**优势**:
- ✅ 零配置，克隆即运行
- ✅ 快速迭代，无需网络
- ✅ 专注前端逻辑开发
- ✅ 方便调试和测试

---

### 场景二：HR面试展示

**推荐模式**: Supabase演示模式 (`?mode=supabase`)

```
面试官访问:
https://your-demo.netlify.app/?mode=supabase

体验流程:
1. 浏览商品（真实数据）
2. 下单购买（真实流程）
3. 模拟支付（或真实支付）
4. 查看卡密（自动发货）
5. 登录后台（demo/Demo@123456）
6. 查看订单管理
```

**优势**:
- ✅ 完整功能展示
- ✅ 真实业务流程
- ✅ 数据云端持久化
- ✅ 零配置体验

---

### 场景三：生产环境部署

**推荐模式**: Supabase演示模式 + 自有Supabase

```bash
# 1. 部署到Netlify
npm run deploy

# 2. 配置Supabase
# - 创建Supabase项目
# - 执行schema.sql
# - 配置环境变量

# 3. 用户访问
https://your-production.netlify.app

# 管理员登录
https://your-production.netlify.app/admin
```

**优势**:
- ✅ 生产级稳定性
- ✅ 完整安全机制
- ✅ 真实支付集成
- ✅ 多用户支持

---

## 🔒 安全考虑

### 本地开发模式

- ⚠️ **不应用於生产**: 仅用于开发测试
- ⚠️ **无权限控制**: 本地存储无加密
- ⚠️ **数据不持久**: 清除缓存后丢失

### Supabase演示模式

- ✅ **RLS策略**: 行级安全控制
- ✅ **JWT鉴权**: 管理员Token验证
- ✅ **Webhook签名**: 支付回调校验
- ✅ **数据加密**: Supabase自动加密

---

## 📝 最佳实践

### 开发阶段

```javascript
// 推荐使用本地模式快速开发
http://localhost:3000/?mode=local

// 开发前端功能
// 测试CRUD操作
// 验证UI交互
```

### 测试阶段

```javascript
// 切换到Supabase测试
http://localhost:3000/?mode=supabase

// 测试真实支付流程
// 验证Edge Functions
// 检查数据一致性
```

### 演示阶段

```javascript
// 使用Supabase演示模式
https://your-demo.netlify.app/?mode=supabase

// 提供HR面试链接
// 展示完整功能
```

### 生产阶段

```javascript
// 部署并配置自有Supabase
https://your-production.netlify.app

// 移除模式切换按钮（可选）
// 固定使用Supabase模式
```

---

## 🎯 模式选择建议

| 你的角色 | 推荐模式 | 原因 |
|---------|---------|------|
| **前端开发者** | 本地模式 | 专注UI开发，无需数据库 |
| **全栈开发者** | 两种都用 | 本地开发 + Supabase测试 |
| **HR/面试官** | Supabase模式 | 完整功能展示 |
| **学习者** | 本地模式 | 零配置快速上手 |
| **生产部署** | Supabase模式 | 生产级稳定性 |

---

## ❓ 常见问题

### Q1: 两种模式的数据能同步吗？

**不能**。两种模式使用完全不同的数据存储：
- 本地模式: 浏览器localStorage
- Supabase模式: 云端PostgreSQL

如需同步，需要手动导出数据并导入。

### Q2: 如何从本地模式迁移到Supabase模式？

目前不支持自动迁移。建议：
1. 在本地模式完成开发
2. 切换到Supabase模式
3. 使用 `demo-data.sql` 初始化数据

### Q3: 默认使用哪种模式？

**默认**: Supabase演示模式（如果配置了Supabase）
- 有Supabase配置 → Supabase模式
- 无Supabase配置 → 自动降级为本地模式

### Q4: 能否固定使用一种模式？

可以，移除模式切换按钮：

```javascript
// 固定本地模式
localStorage.setItem('app_mode', 'local');
// 删除 mode-switcher.js 的引用

// 固定Supabase模式
localStorage.setItem('app_mode', 'supabase');
// 删除 mode-switcher.js 的引用
```

### Q5: Supabase演示模式的演示账号是什么？

- **管理后台**: `demo` / `Demo@123456`
- **前台用户**: 无需登录，直接浏览购买

---

## 📚 相关文档

- [README.md](README.md) - 项目总览
- [QUICKSTART.md](QUICKSTART.md) - 快速启动
- [DEMO.md](DEMO.md) - 演示模式说明
- [ADMIN-DEMO-GUIDE.md](ADMIN-DEMO-GUIDE.md) - 管理后台演示
- [DUAL-MODE-ARCHITECTURE.md](DUAL-MODE-ARCHITECTURE.md) - 本文档

---

## 🚀 未来规划

- [ ] 数据导入导出功能
- [ ] 本地模式↔Supabase模式数据迁移工具
- [ ] 模式切换时数据自动同步
- [ ] IndexedDB支持（更大的本地存储）
- [ ] 离线模式（Supabase数据本地缓存）

---

<p align="center">🔄 双模式架构 - 一套代码，多种场景！</p>
