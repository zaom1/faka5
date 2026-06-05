# 🚀 数据库初始化指南

> 按照本指南在 Supabase 控制台初始化您的数据库

---

## 📋 前置条件

- [x] 已创建 Supabase 项目（项目 ID: `jmtvlbwyugnabgloeocy`）
- [x] 已配置数据库连接信息（`.env` 文件）
- [ ] 需要执行数据库初始化脚本

---

## 🔧 初始化步骤

### 步骤 1：获取 API Key

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 点击左侧菜单 **Settings** → **API**
4. 复制以下两个值：
   - **Project URL**: `https://jmtvlbwyugnabgloeocy.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（以 eyJ 开头的长字符串）

### 步骤 2：更新 .env 文件

打开项目根目录的 `.env` 文件，将刚才获取的 anon key 填入：

```env
SUPABASE_URL=https://jmtvlbwyugnabgloeocy.supabase.co
SUPABASE_ANON_KEY=粘贴刚才获取的 anon public key
```

### 步骤 3：执行数据库初始化脚本

1. 打开 [Supabase SQL Editor](https://supabase.com/dashboard/project/jmtvlbwyugnabgloeocy/sql)
2. 点击 **+ New query**
3. 打开 `INIT-DATABASE.sql` 文件，复制全部内容
4. 粘贴到 SQL Editor 中
5. 点击 **Run** 执行
6. 等待执行完成（约 10-30 秒）

### 步骤 4：验证结果

执行成功后，您应该看到类似以下输出：

```
========================================
✅ 数据库初始化完成！
========================================

📊 数据统计:
  - 分类数: 5
  - 商品数: 10
  - 可用卡密数: 25
  - 订单数: 5
  - 管理员数: 2

🔐 演示管理员账号:
  用户名: admin 或 demo
  密码: Admin@123456

⚠️  注意: 生产环境请修改默认密码！
========================================
```

### 步骤 5：验证表结构

在 SQL Editor 中执行以下查询验证：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 查看管理员账号
SELECT id, username, email, role FROM admins;

-- 查看商品列表
SELECT id, name, price, status FROM products;
```

---

## 🎯 下一步

数据库初始化完成后，您可以：

### 选项 A：本地开发测试

```bash
# 启动本地服务器
cd /mnt/project/26-4-11/faka3-main/faka3-main
npx serve web
# 访问 http://localhost:3000
```

### 选项 B：部署到 Netlify（简历演示版本）

1. 登录 [Netlify](https://app.netlify.com)
2. 点击 **Add new site** → **Import an existing project**
3. 连接您的 GitHub 仓库
4. 配置环境变量（从 `.env` 文件复制）：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `ADMIN_JWT_SECRET`
5. 点击 **Deploy**
6. 获取演示网址

### 选项 C：开源到 GitHub

1. 创建 GitHub 仓库
2. 确保 `.env` 文件**未**被提交（已在 `.gitignore` 中）
3. 推送代码（只包含 `.env.example`）
4. 更新 README.md 中的部署说明

---

## 🔐 安全提醒

### ✅ 可以公开的信息
- 项目结构
- 源代码（不含 `.env`）
- `.env.example`（占位符版本）
- SQL schema 定义

### ❌ 严禁公开的信息
- `.env` 文件（包含真实密码）
- Supabase `service_role` key
- 数据库密码
- Webhook secrets

### 检查清单
在提交到 GitHub 之前，请确认：

```bash
# 1. 检查 .env 是否在 .gitignore 中
grep "^.env$" .gitignore

# 2. 检查是否有敏感信息被暂存
git status

# 3. 预览将要提交的内容
git diff --cached

# 4. 确认无误后提交
git add -A
git commit -m "Initial commit: FakaShop 发卡商城系统"
git push -u origin main
```

---

## 📊 数据库结构说明

### 核心表

| 表名 | 用途 | 记录数 |
|------|------|--------|
| `categories` | 商品分类 | 5 |
| `products` | 商品信息 | 10 |
| `cards` | 卡密数据 | 25 |
| `orders` | 订单记录 | 5 |
| `admins` | 管理员账号 | 2 |
| `payment_config` | 支付配置 | 5 |
| `system_config` | 系统配置 | 9 |

### 演示数据

- **10 个示例商品**：覆盖 VIP 会员、账号类、卡密类、下载类等
- **25 个卡密**：对应各个商品
- **5 个示例订单**：包含已完成、待支付、已取消等状态
- **2 个管理员账号**：admin 和 demo

---

## ❓ 常见问题

### Q1：SQL 执行报错怎么办？

**A：** 常见错误及解决方法：

1. **错误：relation "xxx" already exists**
   - 原因：表已存在
   - 解决：忽略此错误，继续执行

2. **错误：permission denied**
   - 原因：权限不足
   - 解决：使用项目所有者账号执行

3. **错误：syntax error**
   - 原因：SQL 复制不完整
   - 解决：重新完整复制 `INIT-DATABASE.sql` 内容

### Q2：如何修改默认密码？

**A：** 在 SQL Editor 中执行：

```sql
-- 修改 admin 密码为新密码（例如: NewPassword@123）
UPDATE admins 
SET password_hash = '新密码的哈希值'
WHERE username = 'admin';
```

⚠️ 注意：密码需要经过 bcrypt 或 SHA256 哈希处理，不能直接存明文。

### Q3：如何查看数据库是否连接成功？

**A：** 在 SQL Editor 中执行：

```sql
SELECT COUNT(*) FROM products;
```

如果返回 `10`，说明数据已正确插入。

---

## 📞 需要帮助？

如果遇到问题，请检查：

1. Supabase 项目是否创建成功
2. 是否有权限执行 SQL 脚本
3. `.env` 文件配置是否正确
4. 网络连接是否正常

---

<p align="center">🚀 祝您部署顺利！</p>
