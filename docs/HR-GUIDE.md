# 🗺️ 项目导航 - HR/面试官快速上手指南

> 不知道从哪开始看？这份文档帮你快速定位重点！

---

## 🎯 你是哪种类型的访客？

### 📋 类型一：HR - 想看项目演示

**你的目标**: 快速体验项目功能，不需要技术细节

**推荐路线**:
1. 🚀 先看 [QUICKSTART.md](QUICKSTART.md) - 5分钟启动指南
2. 🎭 再看 [DEMO.md](DEMO.md) - 演示模式使用说明
3. 💻 运行项目: 双击 `scripts/deploy.bat` (Windows) 或运行 `npm run demo`
4. 🌐 访问: `http://localhost:3000/index.html?demo=true`

**体验重点**:
- ✅ 首页商品展示（6个示例商品）
- ✅ 分类筛选功能
- ✅ 购买流程（点击"购买"按钮）
- ✅ 支付页面（模拟支付成功按钮）
- ✅ 卡密展示（支付成功后）

**预计时间**: 10-15分钟

---

### 👨‍💻 类型二：技术面试官 - 想看代码质量

**你的目标**: 评估技术能力和代码规范

**推荐路线**:
1. 📖 先看 [README.md](README.md) - 了解项目概况
2. 🏗️ 再看 [ARCHITECTURE.md](ARCHITECTURE.md) - 项目架构
3. 💾 数据库设计: `supabase/database/schema.sql`
4. 🔧 后端API: `supabase/functions/` 目录
5. 🎨 前端代码: `web/index.html` 和 `web/admin/index.html`
6. 🛡️ 安全机制: 搜索 JWT、RLS、Webhook 关键词

**代码亮点**:
- ✅ 前后端分离架构
- ✅ RESTful API 设计
- ✅ 数据库行级安全（RLS）
- ✅ Edge Functions 边缘计算
- ✅ Webhook 签名校验

**预计时间**: 30-60分钟

---

### 🎓 类型三：面试官 - 想看技术深度

**你的目标**: 了解项目技术难点和解决方案

**重点文件**:

#### 后端（Supabase Edge Functions）
```
supabase/functions/
├── create-order/index.ts      # 订单创建逻辑
├── webhook-nexapay/index.ts   # 支付回调处理（签名校验）
├── admin-login/index.ts       # 管理员登录（JWT鉴权）
├── admin-products/index.ts    # 商品管理API
└── admin-orders/index.ts      # 订单管理API
```

#### 前端
```
web/
├── index.html                 # 前台商城（含演示模式）
├── payment.html               # 支付页面（含模拟支付）
├── admin/index.html           # 管理后台
└── js/supabase.js            # Supabase客户端封装
```

#### 数据库
```
supabase/database/
├── schema.sql                 # 完整表结构（10张表）
└── demo-data.sql             # 演示数据
```

**技术难点**:
1. **数据库安全**: RLS策略实现细粒度权限控制
2. **支付安全**: Webhook签名校验防止伪造回调
3. **身份验证**: JWT Token 鉴权管理后台访问
4. **性能优化**: Edge Functions 降低延迟

**预计时间**: 1-2小时

---

### 📝 类型四：HR/猎头 - 想快速了解项目

**你的目标**: 3分钟了解项目是什么

**只需看这些**:
1. [README.md](README.md) 的前3屏
2. 在线演示链接（如果有的话）
3. 项目截图（在 `docs/screenshots/` 目录）

**项目一句话介绍**:
> FakaShop 是一个基于 Supabase + Netlify 的开源发卡商城系统，支持虚拟商品自动发货

**核心技术**:
- 前端: HTML + Bootstrap 5 + JavaScript
- 后端: Supabase Edge Functions (Deno)
- 数据库: PostgreSQL
- 部署: Netlify CDN

**预计时间**: 3-5分钟

---

## 📂 重要文件索引

### 📖 文档类

| 文件 | 用途 | 推荐阅读对象 |
|------|------|-------------|
| [README.md](README.md) | 项目总览 | 所有人 |
| [QUICKSTART.md](QUICKSTART.md) | 快速启动 | HR、面试官 |
| [DEMO.md](DEMO.md) | 演示模式说明 | HR、面试官 |
| [OPTIMIZATION-SUMMARY.md](OPTIMIZATION-SUMMARY.md) | 优化总结 | 面试官 |
| [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) | 部署指南 | 技术面试官 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 架构说明 | 技术面试官 |

### 💻 核心代码

| 文件 | 说明 | 技术栈 |
|------|------|--------|
| `web/index.html` | 前台商城 | HTML + JS + Bootstrap |
| `web/payment.html` | 支付页面 | HTML + JS + Bootstrap |
| `web/admin/index.html` | 管理后台 | HTML + JS + Bootstrap |
| `web/js/supabase.js` | 数据库客户端 | JavaScript |

### 🔧 后端API

| 文件 | 功能 | 技术 |
|------|------|------|
| `supabase/functions/create-order/` | 创建订单 | TypeScript (Deno) |
| `supabase/functions/webhook-nexapay/` | 支付回调 | TypeScript (Deno) |
| `supabase/functions/admin-login/` | 管理员登录 | TypeScript (Deno) |
| `supabase/functions/admin-products/` | 商品管理 | TypeScript (Deno) |

### 💾 数据库

| 文件 | 说明 |
|------|------|
| `supabase/database/schema.sql` | 完整表结构（10张表） |
| `supabase/database/demo-data.sql` | 演示数据（10商品+20卡密） |

### 🚀 部署脚本

| 文件 | 用途 |
|------|------|
| `scripts/deploy.sh` | Linux/Mac 一键部署脚本 |
| `scripts/deploy.bat` | Windows 一键部署脚本 |
| `package.json` | npm 脚本命令 |

---

## 🎭 演示模式快速入口

### 在线演示（如果已部署）
```
https://your-site.netlify.app/?demo=true
```

### 本地演示
```bash
# 方法1: npm命令
npm run demo

# 方法2: 双击脚本（Windows）
scripts/deploy.bat

# 方法3: bash命令（Linux/Mac）
bash scripts/deploy.sh demo
```

**访问地址**:
- 前台: `http://localhost:3000/index.html?demo=true`
- 后台: `http://localhost:3000/admin/index.html?demo=true`

---

## 💡 使用建议

### 给HR的建议
1. ⏰ **时间紧张**: 只看 README.md + 在线演示（5分钟）
2. ⏰ **时间充裕**: 完整体验演示模式（15分钟）
3. 📱 **手机体验**: 项目支持移动端，可用手机访问演示站

### 给技术面试官的建议
1. 🔍 **看架构**: 重点看 `supabase/functions/` 和 `schema.sql`
2. 🔒 **看安全**: 搜索 JWT、RLS、Webhook 关键词
3. 📊 **看设计**: 数据库设计体现了业务理解深度
4. 🎨 **看前端**: 代码注释清晰，结构规范

### 给候选人的建议（如果你是帮别人优化）
1. 📝 **部署演示站**: 务必部署到Netlify并提供在线链接
2. 📸 **截取GIF**: 录制核心功能操作GIF
3. 🎯 **准备话术**: 面试时主动介绍技术难点和解决方案
4. 📊 **准备数据**: 如"日均XX订单"、"响应时间XXms"

---

## 📞 需要更多帮助？

- 📝 查看完整文档: 各个 `.md` 文件
- 🐛 提交 Issue: [GitHub Issues](https://github.com/yourusername/faka3/issues)
- 📧 联系作者: your-email@example.com

---

<p align="center">🎯 祝你快速了解 FakaShop 项目！</p>
