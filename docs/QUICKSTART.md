# 🚀 快速启动指南

> 5分钟让你的 FakaShop 发卡商城运行起来！

---

## 📋 前置要求

- ✅ Node.js 14+ (运行 `node -v` 检查)
- ✅ npm (通常随 Node.js 一起安装)
- ✅ 现代浏览器 (Chrome/Firefox/Edge)

**无需数据库！无需配置！**

---

## 🎯 方式一：本地演示模式（推荐用于面试展示）

### Windows 用户

```
双击运行: scripts/deploy.bat
```

### Mac/Linux 用户

```bash
bash scripts/deploy.sh demo
```

### 或使用 npm 命令（所有平台）

```bash
npm install
npm run demo
```

### 访问地址

启动成功后访问：

- 🛒 **前台商城**: http://localhost:3000/index.html?demo=true
- 🔐 **管理后台**: http://localhost:3000/admin/index.html?demo=true

### 演示模式特点

✅ 无需数据库  
✅ 内置示例商品  
✅ 完整购买流程  
✅ 模拟支付功能  

---

## 🌐 方式二：部署到 Netlify（在线演示）

### 步骤

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录 Netlify**
   ```bash
   netlify login
   ```

3. **部署**
   ```bash
   npm run deploy
   ```

4. **获取在线地址**
   ```
   部署完成后会生成类似 https://your-site.netlify.app 的URL
   ```

5. **分享演示链接**
   ```
   https://your-site.netlify.app/?demo=true
   ```

---

## 🗄️ 方式三：完整部署（含数据库）

如果需要真实交易功能，需要配置 Supabase 数据库：

### 1. 创建 Supabase 项目

- 访问 [supabase.com](https://supabase.com)
- 创建新项目
- 获取 Project URL 和 anon key

### 2. 初始化数据库

```bash
# 登录 Supabase
npx supabase login

# 链接项目
npx supabase link --project-ref your-project-ref

# 执行数据库迁移
# 在 Supabase SQL Editor 中运行:
# supabase/database/schema.sql
# supabase/database/demo-data.sql (可选，插入测试数据)
```

### 3. 配置环境变量

在 Netlify 后台添加：

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_JWT_SECRET=your-strong-secret-secret
```

### 4. 部署后端函数

```bash
npm run deploy:functions
```

---

## 🎭 演示模式使用指南

### 前台商城

1. **浏览商品** - 首页显示6个示例商品
2. **分类筛选** - 点击左侧分类名筛选商品
3. **购买商品** - 点击"购买"按钮
4. **填写信息** - 联系方式可填任意测试值
5. **模拟支付** - 支付页面点击"模拟支付成功"
6. **查看卡密** - 支付成功后显示卡密

### 管理后台

**演示登录账号：**
- 用户名: `demo`
- 密码: `Demo@123456`

**后台功能：**
- 📊 数据概览
- 📦 商品管理
- 📋 订单管理
- 🔑 卡密管理
- 🏷️ 分类管理
- 💳 支付配置

---

## ❓ 常见问题

### Q: 启动后浏览器显示空白页？

**A:** 确保访问URL包含 `?demo=true` 参数：
```
http://localhost:3000/index.html?demo=true
```

### Q: 提示"未连接数据库"？

**A:** 演示模式不需要数据库，这是正常提示。点击"演示模式"按钮可切换模式。

### Q: 如何修改演示商品？

**A:** 编辑 `web/index.html` 文件中的 `DEMO_PRODUCTS` 数组。

### Q: 可以部署到自己的服务器吗？

**A:** 可以，将 `web` 目录部署到任何静态网站托管服务即可。

### Q: 如何在简历中描述此项目？

**A:** 参考 README.md 中的"简历描述建议"部分。

---

## 📚 更多文档

- [README.md](README.md) - 项目介绍
- [DEMO.md](DEMO.md) - 演示模式详细说明
- [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) - 完整部署指南
- [ARCHITECTURE.md](ARCHITECTURE.md) - 项目架构说明

---

## 🆘 需要帮助？

- 📝 提交 [Issue](https://github.com/yourusername/faka3/issues)
- 📧 发送邮件: your-email@example.com

---

<p align="center">🎉 祝你使用愉快！</p>
