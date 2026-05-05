import { getCorsHeaders, corsOptions, createSupabaseClient, safeErrorResponse, verifyAdminToken } from '../shared/mod.ts';

// JWT 签名辅助函数
// 将字节数组转换为 Base64URL 编码（URL 安全的 Base64 变体）
function toBase64UrlFromBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

// 将 UTF-8 字符串编码为 Base64URL
function encodeUtf8ToBase64Url(input: string): string {
  return toBase64UrlFromBytes(new TextEncoder().encode(input));
}

// 使用 HMAC-SHA256 对 payload 进行签名
// 返回 Base64URL 编码的签名结果
async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return toBase64UrlFromBytes(new Uint8Array(signature));
}

// 生成管理员会话 token
// token 格式: {base64url_payload}.{base64url_signature}
// 有效期 12 小时，包含管理员 ID、用户名和角色信息
async function generateSessionToken(admin: { id: number; username: string; role: string }, secret: string): Promise<string> {
  const payload = {
    adminId: admin.id,
    username: admin.username,
    role: admin.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12, // 12 小时后过期
  };

  const encodedPayload = encodeUtf8ToBase64Url(JSON.stringify(payload));
  const signature = await signPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

// 密码加盐哈希（SHA-256）
// 注意：生产环境建议使用 bcrypt，此处使用 SHA-256 是因为 Deno Edge Functions 环境限制
// 密码与 salt 拼接后进行 SHA-256 哈希，返回十六进制字符串
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsOptions(req);
  }

  try {
    // 获取签名密钥和数据库客户端
    // 优先使用 ADMIN_JWT_SECRET，回退到 SUPABASE_SERVICE_ROLE_KEY
    const tokenSecret = Deno.env.get('ADMIN_JWT_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createSupabaseClient(true);
    const corsHeaders = getCorsHeaders(req);

    const { username, password, code } = await req.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, message: '请输入用户名和密码' }), { headers: corsHeaders });
    }

    // ===== 暴力破解防护 =====
    // 最大失败次数: 5 次
    // 锁定时间: 15 分钟，锁定期间禁止登录
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 分钟

    let { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (!admin) {
      return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), { headers: corsHeaders });
    }

    // 检查是否被锁定：如果 locked_until 未过期则拒绝登录
    if (admin.locked_until) {
      const lockedUntil = new Date(admin.locked_until).getTime();
      if (Date.now() < lockedUntil) {
        const minutesLeft = Math.ceil((lockedUntil - Date.now()) / 60000);
        return new Response(JSON.stringify({
          success: false,
          message: `账号已被锁定，请 ${minutesLeft} 分钟后再试`
        }), { headers: corsHeaders });
      }
      // 锁定已过期，自动解锁并重置失败次数
      await supabase.from('admins').update({ locked_until: null, login_attempts: 0 }).eq('id', admin.id);
    }

    // 密码验证：使用加盐 SHA-256 比对
    if (admin.password_hash) {
      const passwordHash = await hashPassword(password, admin.salt);
      if (passwordHash !== admin.password_hash) {
        // 密码错误，记录失败次数
        const newAttempts = (admin.login_attempts || 0) + 1;
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          // 达到最大失败次数，锁定账号 15 分钟
          const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
          await supabase.from('admins').update({
            login_attempts: newAttempts,
            locked_until: lockedUntil,
          }).eq('id', admin.id);
          return new Response(JSON.stringify({
            success: false,
            message: `密码错误次数过多，账号已被锁定 15 分钟`
          }), { headers: corsHeaders });
        }
        // 更新失败次数
        await supabase.from('admins').update({ login_attempts: newAttempts }).eq('id', admin.id);
        return new Response(JSON.stringify({ success: false, message: `用户名或密码错误 (剩余 ${MAX_LOGIN_ATTEMPTS - newAttempts} 次机会)` }), { headers: corsHeaders });
      }
    } else {
      // 首次登录（无 password_hash），自动生成盐值并存储哈希
      // 注意：这仅用于初始化，正常流程应该在创建管理员时就设置密码
      const salt = Math.random().toString(36).substring(2);
      const passwordHash = await hashPassword(password, salt);
      await supabase.from('admins').update({ password_hash: passwordHash, salt }).eq('id', admin.id);
    }

    // 登录成功，重置失败次数和锁定状态
    await supabase.from('admins').update({
      last_login: new Date().toISOString(),
      login_attempts: 0,
      locked_until: null,
    }).eq('id', admin.id);

    // 2FA 验证
    const { data: twoFactorConfig } = await supabase
      .from('two_factor_config')
      .select('*')
      .eq('admin_id', admin.id)
      .eq('enabled', true)
      .single();

    if (twoFactorConfig && twoFactorConfig.type !== 'none') {
      if (!code) {
        return new Response(JSON.stringify({
          success: true,
          require2fa: true,
          adminId: admin.id,
          twoFactorType: twoFactorConfig.type,
          message: '请输入验证码'
        }), { headers: corsHeaders });
      }

      const { data: validCode } = await supabase
        .from('two_factor_codes')
        .select('*')
        .eq('admin_id', admin.id)
        .eq('code', code)
        .eq('purpose', 'login')
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!validCode) {
        return new Response(JSON.stringify({ success: false, message: '验证码错误或已过期' }), { headers: corsHeaders });
      }

      await supabase.from('two_factor_codes').update({ used_at: new Date().toISOString() }).eq('id', validCode.id);
    }

    const sessionToken = await generateSessionToken(
      { id: admin.id, username: admin.username, role: admin.role },
      tokenSecret,
    );

    return new Response(
      JSON.stringify({
        success: true,
        admin: { id: admin.id, username: admin.username, role: admin.role },
        token: sessionToken,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return safeErrorResponse(error, getCorsHeaders(req));
  }
});
