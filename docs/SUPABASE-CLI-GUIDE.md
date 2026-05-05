# Supabase CLI 本地使用指南

## ✅ 已完成安装

Supabase CLI 已安装在项目目录：`./node_modules\.bin\supabase`

**不会占用 C 盘系统空间，所有依赖都在项目内。**

---

## 🚀 快速开始

### 1️⃣ 登录 Supabase

```bash
npx supabase login
```

这会打开浏览器让你登录 GitHub/Supabase 账号。

---

### 2️⃣ 链接到你的项目

```bash
npx supabase link --project-ref your-project-ref
```

**如何获取 Project Ref：**
1. 登录 https://supabase.com
2. 进入你的项目
3. 点击 `Settings` → `General`
4. 复制 `Project Reference ID`（类似：`abcdefghijk`）

示例：
```bash
npx supabase link --project-ref abcdefghijk
```

---

### 3️⃣ 初始化 Supabase 配置（可选）

如果需要生成配置文件：
```bash
npx supabase init
```

这会在项目根目录创建 `.supabase/config.toml`

---

### 4️⃣ 部署 Edge Functions

**单个部署：**
```bash
npx supabase functions deploy admin-login --no-verify-jwt
npx supabase functions deploy admin-products --no-verify-jwt
npx supabase functions deploy admin-orders --no-verify-jwt
npx supabase functions deploy admin-cards --no-verify-jwt
```

**或者一次性部署所有函数：**
```bash
npm run deploy:functions
```

---

## 📁 项目结构

```
./
├── node_modules/          ← Supabase CLI 在这里
│   └── .bin/
│       └── supabase       ← 可执行文件
├── package.json           ← 包含 npm 脚本
├── supabase/              ← Edge Functions 代码
│   ├── functions/
│   │   ├── admin-login/
│   │   ├── admin-products/
│   │   ├── admin-orders/
│   │   └── admin-cards/
│   └── database/
│       └── schema.sql
├── web/                   ← 前端页面
└── .supabase/             ← 配置文件（链接后自动生成）
    └── config.toml
```

---

## 🔧 常用命令

| 命令 | 说明 |
|------|------|
| `npx supabase --help` | 查看所有可用命令 |
| `npx supabase login` | 登录 Supabase |
| `npx supabase link --project-ref xxx` | 链接项目 |
| `npx supabase functions deploy xxx --no-verify-jwt` | 部署 Edge Function |
| `npx supabase db push` | 推送数据库变更 |
| `npx supabase status` | 查看本地服务状态 |

---

## 💡 注意事项

1. **首次使用需要登录**：运行 `npx supabase login`
2. **必须链接项目**：运行 `npx supabase link --project-ref your-ref`
3. **数据库初始化**：手动在 Supabase SQL Editor 执行 `schema.sql`
4. **Edge Functions 部署**：每次修改后需要重新部署

---

## 🎯 完整部署流程

```bash
# 1. 登录（只需一次）
npx supabase login

# 2. 链接项目（只需一次）
npx supabase link --project-ref abcdefghijk

# 3. 初始化数据库（在 Supabase 控制台执行 schema.sql）

# 4. 部署 Edge Functions
npm run deploy:functions

# 5. 完成！访问 https://your-project.supabase.co/functions/v1/admin-login 测试
```

---

## ❓ 常见问题

**Q: 为什么选择本地安装而不是全局安装？**
A: 本地安装将所有依赖保留在项目内，不污染系统环境，方便团队协作和版本管理。

**Q: 可以删除 node_modules 吗？**
A: 可以，但需要重新运行 `npm install` 才能使用 Supabase CLI。

**Q: 如何检查是否已链接项目？**
A: 查看是否有 `.supabase/config.toml` 文件，或运行 `npx supabase status`
