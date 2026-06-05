# 环境变量配置指南

## 📋 必需的环境变量

### Supabase 相关
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ADMIN_JWT_SECRET=your-strong-random-secret
NEXAPAY_WEBHOOK_SECRET=your-webhook-secret
NEXAPAY_CRYPTO_ADDRESS=your-usdt-trc20-address
```

## 🎯 配置位置

### 1. 本地开发 (.env)
```bash
# .env 文件（已存在）
SUPABASE_URL=https://jmtvlbwyugnabgloeocy.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Netlify 环境变量
在 Netlify Dashboard → Site settings → Environment variables 中添加：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

⚠️ **注意**：不要在 Netlify 中添加 `SUPABASE_SERVICE_ROLE_KEY`，这是后端专用！

### 3. Supabase Edge Functions
在 Supabase 项目中为 Edge Functions 配置以下 Secrets：
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_JWT_SECRET`
- `NEXAPAY_WEBHOOK_SECRET`
- `NEXAPAY_CRYPTO_ADDRESS`

## 🔧 配置脚本

### 检查环境变量脚本
```javascript
// web/js/env-check.js
function checkEnvironment() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = [];
  
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing.join(', '));
    return false;
  }
  
  console.log('✅ All environment variables are set');
  return true;
}
```

## 🛡️ 安全最佳实践

1. **永远不要**将 Service Role Key 暴露给前端
2. **永远不要**将 `ADMIN_JWT_SECRET` 暴露给前端
3. **永远不要**将 `NEXAPAY_WEBHOOK_SECRET` 暴露给前端
4. **永远不要**将 .env 文件提交到 Git
5. **定期轮换**密钥
6. **使用不同的密钥**用于不同环境

## 🔄 更新流程

当需要更新环境变量时：

1. **本地**：修改 `.env` 文件
2. **Netlify**：在 Dashboard 中更新
3. **Supabase**：在项目设置中更新
4. **重新部署**相关服务
