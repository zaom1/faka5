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

    switch (action) {
      case 'list': {
        const { status } = data || {};
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (status && status !== 'all') query = query.eq('status', status);

        const { data: orders } = await query;
        return new Response(JSON.stringify({ success: true, orders: orders || [] }), { headers: getCorsHeaders(req) });
      }

      case 'update_status': {
        const { id, status, remark } = data;
        const updateData: any = { status, remark: remark || '' };
        if (status === 'completed') updateData.completed_at = new Date().toISOString();

        await supabase.from('orders').update(updateData).eq('id', id);
        return new Response(JSON.stringify({ success: true }), { headers: getCorsHeaders(req) });
      }

      case 'delete': {
        await supabase.from('orders').delete().eq('id', data.id);
        return new Response(JSON.stringify({ success: true }), { headers: getCorsHeaders(req) });
      }

      case 'stats': {
        const { data: totalOrders } = await supabase.from('orders').select('id', { count: 'exact' });
        const { data: pendingOrders } = await supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending');
        const { data: paidOrders } = await supabase.from('orders').select('total_price', { count: 'exact' }).eq('payment_status', 'paid');

        const totalRevenue = paidOrders?.reduce((sum: number, o: any) => sum + (parseFloat(o.total_price) || 0), 0) || 0;

        return new Response(JSON.stringify({
          success: true,
          stats: { totalOrders: totalOrders?.length || 0, pendingOrders: pendingOrders?.length || 0, totalRevenue }
        }), { headers: getCorsHeaders(req) });
      }

      default:
        return new Response(JSON.stringify({ success: false, message: '未知操作' }), { headers: getCorsHeaders(req) });
    }
  } catch (error) {
    return safeErrorResponse(error, getCorsHeaders(req));
  }
});
