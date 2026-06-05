import { getCorsHeaders, corsOptions, createSupabaseClient, safeErrorResponse, requireAdminAuth } from '../shared/mod.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsOptions(req);
  }

  try {
    const supabase = createSupabaseClient(true);

    const authResult = await requireAdminAuth(req);
    if (authResult instanceof Response) return authResult;
    const auth = authResult;

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
        const { product_id, status } = data || {};
        let query = supabase.from('cards').select('*, products:product_id(name)').order('created_at', { ascending: false });
        if (product_id) query = query.eq('product_id', product_id);
        if (status) query = query.eq('status', status);

        const { data: cards } = await query;
        return new Response(JSON.stringify({ success: true, cards: cards || [] }), { headers: getCorsHeaders(req) });
      }

      case 'add': {
        const { product_id, cards, card_type } = data;
        const cardRecords = cards.map((card: string) => ({
          product_id,
          card_content: card.trim(),
          card_type: card_type || 'text',
          status: 'available',
        }));

        const { error } = await supabase.from('cards').insert(cardRecords);
        if (error) throw error;

        const { data: availableCards } = await supabase
          .from('cards')
          .select('id', { count: 'exact' })
          .eq('product_id', product_id)
          .eq('status', 'available');

        await supabase.from('products').update({ stock: availableCards?.length || 0 }).eq('id', product_id);

        return new Response(JSON.stringify({ success: true, count: cards.length }), { headers: getCorsHeaders(req) });
      }

      case 'delete': {
        await supabase.from('cards').delete().eq('id', data.id);
        return new Response(JSON.stringify({ success: true }), { headers: getCorsHeaders(req) });
      }

      default:
        return new Response(JSON.stringify({ success: false, message: '未知操作' }), { headers: getCorsHeaders(req) });
    }
  } catch (error) {
    return safeErrorResponse(error, getCorsHeaders(req));
  }
});
