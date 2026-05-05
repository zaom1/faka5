import { getCorsHeaders, corsOptions, createSupabaseClient, safeErrorResponse } from '../shared/mod.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsOptions(req);
  }

  try {
    const corsHeaders = getCorsHeaders(req);
    const supabase = createSupabaseClient(false);

    const url = new URL(req.url);
    let orderNo = url.searchParams.get('order_no');

    if (!orderNo && req.method !== 'GET') {
      try {
        const body = await req.json();
        orderNo = body?.order_no || body?.orderNo || null;
      } catch {
        orderNo = null;
      }
    }

    if (!orderNo) {
      return new Response(
        JSON.stringify({ success: false, message: '缺少订单号' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (error || !order) {
      return new Response(
        JSON.stringify({ success: false, message: '订单不存在' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const safeOrder = {
      ...order,
      card_content: order.payment_status === 'paid' ? order.card_content : null,
    };

    return new Response(
      JSON.stringify({ success: true, order: safeOrder }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return safeErrorResponse(error, getCorsHeaders(req));
  }
});
