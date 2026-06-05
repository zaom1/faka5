import { getCorsHeaders, corsOptions, createSupabaseClient, safeErrorResponse } from '../shared/mod.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsOptions(req);
  }

  // 只接受 POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: '不支持的请求方法' }),
      { status: 405, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }

  try {
    const corsHeaders = getCorsHeaders(req);
    const supabase = createSupabaseClient(true);

    let orderNo: string | null = null;
    let accessToken: string | null = null;

    try {
      const body = await req.json();
      orderNo = body?.order_no || body?.orderNo || null;
      accessToken = body?.access_token || body?.accessToken || null;
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: '请求体格式错误' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!orderNo) {
      return new Response(
        JSON.stringify({ success: false, message: '缺少订单号' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 查询订单时必须带上 access_token
    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, message: '缺少访问令牌' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_no', orderNo)
      .eq('access_token', accessToken)
      .single();

    if (error || !order) {
      return new Response(
        JSON.stringify({ success: false, message: '订单不存在或令牌无效' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 不返回 access_token 字段本身
    const { access_token, ...safeOrder } = order;

    return new Response(
      JSON.stringify({ success: true, order: safeOrder }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return safeErrorResponse(error, getCorsHeaders(req));
  }
});
