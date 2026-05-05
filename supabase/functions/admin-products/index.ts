import { getCorsHeaders, corsOptions, createSupabaseClient, safeErrorResponse, verifyAdminToken } from '../shared/mod.ts';

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
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function verifyAdminTokenLocal(req: Request, secret: string): Promise<{ adminId: number; role?: string } | null> {
  const auth = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;

  const token = auth.slice(7).trim();
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) return null;

  const expected = await signPayload(payloadPart, secret);
  if (!timingSafeEqual(expected, signaturePart)) return null;

  try {
    const payload = JSON.parse(fromBase64Url(payloadPart));
    if (!payload?.adminId || typeof payload.adminId !== 'number') return null;
    if (!payload?.exp || typeof payload.exp !== 'number') return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return { adminId: payload.adminId, role: payload.role };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsOptions(req);
  }

  try {
    const tokenSecret = Deno.env.get('ADMIN_JWT_SECRET') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createSupabaseClient(true);

    const auth = await verifyAdminTokenLocal(req, tokenSecret);
    if (!auth) {
      return new Response(JSON.stringify({ success: false, message: '未授权' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('id', auth.adminId)
      .single();

    if (!admin) {
      return new Response(JSON.stringify({ success: false, message: '未授权' }), {
        status: 401,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const { action, data } = await req.json();

    // demo 角色只读，禁止修改/删除操作
    if (auth.role === 'demo' && ['add', 'update', 'delete'].includes(action)) {
      return new Response(JSON.stringify({ success: false, message: '演示账号无权限执行此操作' }), {
        status: 403,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    switch (action) {
      case 'list': {
        const { data: products } = await supabase
          .from('products')
          .select('*, categories:category_id(id, name, slug, icon)')
          .order('created_at', { ascending: false });

        return new Response(JSON.stringify({ success: true, products: products || [] }), { headers: getCorsHeaders(req) });
      }

      case 'add': {
        const { name, price, original_price, description, category_id, image, stock, auto_deliver, hot, status } = data;

        const { data: product, error } = await supabase
          .from('products')
          .insert({
            name, price: price || 0, original_price: original_price || 0,
            description: description || '', category_id: category_id || null,
            image: image || '', stock: stock || 999,
            auto_deliver: auto_deliver !== false, hot: hot || false,
            status: status || 'active',
          })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, product }), { headers: getCorsHeaders(req) });
      }

      case 'update': {
        const { id, ...updateData } = data;
        updateData.updated_at = new Date().toISOString();

        const { data: product, error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, product }), { headers: getCorsHeaders(req) });
      }

      case 'delete': {
        const { id } = data;
        await supabase.from('cards').delete().eq('product_id', id);
        await supabase.from('products').delete().eq('id', id);
        return new Response(JSON.stringify({ success: true }), { headers: getCorsHeaders(req) });
      }

      default:
        return new Response(JSON.stringify({ success: false, message: '未知操作' }), { headers: getCorsHeaders(req) });
    }
  } catch (error) {
    return safeErrorResponse(error, getCorsHeaders(req));
  }
});
