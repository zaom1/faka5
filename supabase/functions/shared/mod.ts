// 共享模块: CORS、Supabase 客户端、JWT 验证、输入校验、错误处理

// ========================================
// CORS 配置 - 限制为可信域名
// ========================================
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://fakashop.netlify.app',
  // 可在此处添加更多生产域名
];

// 匹配 localhost:端口 格式，限制端口范围防止意外匹配
const LOCALHOST_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  // 精确匹配白名单，或符合 localhost:端口 格式
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || LOCALHOST_REGEX.test(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
  };
}

export function corsOptions(req: Request): Response {
  return new Response('ok', { headers: getCorsHeaders(req) });
}

// ========================================
// Supabase 客户端创建
// ========================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function createSupabaseClient(useServiceRole = true) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = useServiceRole
    ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    : Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// ========================================
// JWT 验证
// ========================================
// ========================================
// JWT 验证 - 本地实现（供 admin 函数复用）
// ========================================
function fromBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const normalized = pad ? base64 + '='.repeat(4 - pad) : base64;
  return atob(normalized);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function signPayloadLocal(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export async function requireAdminAuth(req: Request): Promise<{ adminId: number; role?: string } | Response> {
  const secret = Deno.env.get('ADMIN_JWT_SECRET');
  if (!secret) {
    return new Response(JSON.stringify({ success: false, message: '服务器配置错误：ADMIN_JWT_SECRET 未设置' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  // 统一鉴权：检查 Bearer token 签名和过期时间
  const auth = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ success: false, message: '未授权' }), {
      status: 401,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  const token = auth.slice(7).trim();
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) {
    return new Response(JSON.stringify({ success: false, message: '未授权' }), {
      status: 401,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  const expected = await signPayloadLocal(payloadPart, secret);
  if (!timingSafeEqual(expected, signaturePart)) {
    return new Response(JSON.stringify({ success: false, message: '未授权' }), {
      status: 401,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadPart));
    if (!payload?.adminId || typeof payload.adminId !== 'number') {
      return new Response(JSON.stringify({ success: false, message: '未授权' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }
    if (!payload?.exp || typeof payload.exp !== 'number') {
      return new Response(JSON.stringify({ success: false, message: '未授权' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }
    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return new Response(JSON.stringify({ success: false, message: '令牌已过期' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }
    return { adminId: payload.adminId, role: payload.role };
  } catch {
    return new Response(JSON.stringify({ success: false, message: '未授权' }), {
      status: 401,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
}

function toBase64UrlFromBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  // Decode base64url signature
  const padded = signature.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '=='.slice((padded.length % 4) || 4));
  const sigBytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)));
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payload));
}

export async function verifyAdminToken(token: string): Promise<{ valid: boolean; payload?: any }> {
  // ADMIN_JWT_SECRET 必须配置，不回退到 service role key
  const secret = Deno.env.get('ADMIN_JWT_SECRET');
  if (!secret) return { valid: false };

  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };

  const [encodedPayload, signature] = parts;
  const isValid = await verifySignature(encodedPayload, signature, secret);
  if (!isValid) return { valid: false };

  try {
    const padded = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded + '=='.slice((padded.length % 4) || 4));
    const payload = JSON.parse(json);

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// ========================================
// 输入校验辅助函数
// ========================================
export function validateString(value: unknown, fieldName: string, maxLength = 500): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} 不能为空`);
  }
  if (value.length > maxLength) {
    throw new Error(`${fieldName} 长度不能超过 ${maxLength} 个字符`);
  }
  return value.trim();
}

export function validateNumber(value: unknown, fieldName: string, min?: number, max?: number): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error(`${fieldName} 必须是有效数字`);
  }
  if (min !== undefined && num < min) {
    throw new Error(`${fieldName} 不能小于 ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new Error(`${fieldName} 不能大于 ${max}`);
  }
  return num;
}

// ========================================
// 错误响应辅助函数
// ========================================
export function errorResponse(message: string, status = 400, headers?: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ success: false, message }),
    { status, headers: { 'Content-Type': 'application/json', ...headers } }
  );
}

export function successResponse(data: any, headers?: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    { headers: { 'Content-Type': 'application/json', ...headers } }
  );
}

// ========================================
// 安全错误处理 (不暴露内部细节)
// ========================================
export function safeErrorResponse(error: unknown, corsHeaders: Record<string, string>): Response {
  console.error('[Edge Function Error]', error);
  const message = error instanceof Error ? error.message : '服务器内部错误';
  // 生产环境应只返回通用错误信息
  const safeMessage = Deno.env.get('DENO_ENV') === 'production'
    ? '服务器内部错误'
    : message;
  return new Response(
    JSON.stringify({ success: false, message: safeMessage }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
