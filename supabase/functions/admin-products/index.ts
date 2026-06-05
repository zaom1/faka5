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
