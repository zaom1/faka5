# Netlify 部署配置指南

## 当前问题诊断

1. **数据库连接正常**：Supabase远程数据库连接成功
2. **Schema.sql已修复**：解决了RLS策略重复创建的问题
3. **Netlify环境变量缺失**：这是导致前端无法连接数据库的主要原因

## Netlify 环境变量配置

在Netlify控制台中，进入你的站点 → Settings → Environment variables，添加以下变量：

### 必需的环境变量：

```
SUPABASE_URL = https://jmtvlbwyugnabgloeocy.supabase.co
SUPABASE_ANON_KEY = sb_publishable_sfUHIK9yAFBRSVmQI0nMuQ_GpX3pxZW
```

⚠️ **重要安全提醒**：
- **不要添加** `SUPABASE_SERVICE_ROLE_KEY` 到Netlify环境变量
- Service Role Key只能在Supabase Edge Functions中使用
- 这样做是为了防止敏感密钥泄露

## 验证连接的方法

部署完成后，在浏览器控制台中运行：

```javascript
// 测试数据库连接
const { data, error } = await supabaseClient.getClient().from('categories').select('*');
console.log('连接测试结果:', { data, error });
```

## 故障排除

如果仍然无法连接，请检查：

1. **环境变量是否正确设置**（区分大小写）
2. **Netlify构建是否成功完成**
3. **浏览器控制台是否有CORS错误**
4. **网络请求是否被防火墙阻止**

## 本地开发替代方案

由于你本地缺少Docker，建议：
1. 直接在Netlify上进行前端部署测试
2. 使用Supabase Dashboard进行数据库管理
3. 通过Supabase CLI管理Edge Functions

## 下一步操作

1. 在Netlify添加上述环境变量
2. 重新部署网站
3. 测试前端功能
4. 如有问题，查看Netlify部署日志