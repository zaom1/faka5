# Netlify 部署指南（GitLab 临时账号）

## ✅ 已完成步骤

- [x] Git 仓库初始化
- [x] 创建 .gitignore 文件
- [x] 首次代码提交

---

## 📋 剩余步骤（手动操作）

### 步骤 1：在 GitLab 创建临时仓库

1. 访问：https://gitlab.com/projects/new
2. 使用临时 GitLab 账号登录
3. 填写项目信息：
   - **Project name**: `ls3-card-shop`（或自定义）
   - **Visibility**: Private（推荐）或 Public
   - **Initialize with README**: ❌ 不勾选
4. 点击 **Create project**

---

### 步骤 2：创建 GitLab Personal Access Token

1. 访问：https://gitlab.com/-/profile/personal_access_tokens
2. 点击 **Add new token**
3. 配置：
   - **Token name**: `netlify-deploy-temp`
   - **Expiration date**: 建议 7-30 天
   - **Select scopes**: 勾选 `api` 和 `write_repository`
4. 点击 **Create personal access token**
5. **立即复制 Token**（只显示一次！）

---

### 步骤 3：推送代码到 GitLab

在终端执行（替换占位符）：

```bash
# 设置远程仓库（使用 Token）
git remote add origin https://oauth2:YOUR_TOKEN_HERE@gitlab.com/YOUR_USERNAME/ls3-card-shop.git

# 推送代码
git push -u origin main
```

**示例**（替换以下内容）：
- `YOUR_TOKEN_HERE` → 步骤 2 创建的 Token
- `YOUR_USERNAME` → 你的 GitLab 用户名
- `ls3-card-shop` → 你的项目名

```bash
git remote add origin https://oauth2:glpat-xxxxxxxxxxxxxxx@gitlab.com/username/ls3-card-shop.git
git push -u origin main
```

---

### 步骤 4：在 Netlify 部署

1. 访问：https://app.netlify.com
2. **使用同一个 GitLab 账号登录**
3. 点击 **Add new site** → **Import an existing project**
4. 选择 **Deploy with GitLab**
5. 授权 Netlify 访问 GitLab
6. 选择你的仓库 `ls3-card-shop`
7. 配置部署设置：
   ```
   Base directory: （留空）
   Publish directory: web
   Build command: （留空）
   ```
8. 点击 **Deploy site**

---

### 步骤 5：等待部署完成

- Netlify 会自动检测并部署
- 大约 1-2 分钟
- 部署完成后会生成一个随机域名，如：`https://ls3-card-shop-xxxx.netlify.app`

---

## 🔄 后续更新代码

### 修改代码后推送：

```bash
git add .
git commit -m "修改说明"
git push
```

Netlify 会自动检测并重新部署（约 1-2 分钟）。

### 如果修改了 Edge Functions：

```bash
# 1. 先部署到 Supabase
npm run supabase -- functions deploy 函数名

# 2. 提交代码
git add supabase/functions/
git commit -m "更新 Edge Functions"
git push

# 3. Netlify 会自动部署前端
```

---

## ⚠️ 注意事项

### 安全性：

1. **Token 安全**：
   - Token 只在推送时暴露在命令行历史中
   - 建议使用短期 Token（7-30 天）
   - 不要在公共场合分享 Terminal 截图

2. **GitLab 账号**：
   - 临时账号建议启用两步验证
   - 部署完成后可删除 Token

3. **Netlify 配置**：
   - 如果是敏感项目，使用 Private 仓库
   - 可以在 Netlify 设置密码保护

### 环境变量：

如果需要在 Netlify 配置环境变量：

1. Netlify Dashboard → Site settings → Environment variables
2. 添加：
   - `SUPABASE_URL`: `https://jmtvlbwyugnabgloeocy.supabase.co`
   - `SUPABASE_ANON_KEY`: `你的 anon key`

---

## 🎯 快速命令参考

```bash
# 查看当前 Git 状态
git status

# 查看远程仓库
git remote -v

# 修改远程仓库（如果需要）
git remote set-url origin https://oauth2:NEW_TOKEN@gitlab.com/username/repo.git

# 强制推送（谨慎使用）
git push -f origin main
```

---

## ❓ 常见问题

### Q1: 推送失败怎么办？
A: 检查 Token 是否过期，权限是否正确（需要 `api` 和 `write_repository`）

### Q2: Netlify 部署失败？
A: 检查 Publish directory 是否设置为 `web`

### Q3: 如何删除临时 Token？
A: 访问 https://gitlab.com/-/profile/personal_access_tokens 找到并撤销

### Q4: 可以不用 Token 吗？
A: 可以，但需要 SSH 密钥配置，更复杂。Token 方式最简单快捷。

---

## 📞 需要帮助？

如果遇到任何问题，请提供：
1. 错误信息截图
2. GitLab 用户名（可选）
3. 项目名（可选）

祝部署顺利！🚀
