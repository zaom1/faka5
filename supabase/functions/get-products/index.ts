import { getCorsHeaders, corsOptions, createSupabaseClient, safeErrorResponse } from '../shared/mod.ts';

function parsePositiveInt(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsOptions(req);
  }

  try {
    const corsHeaders = getCorsHeaders(req);
    // 使用 ANON_KEY + RLS（公开只读策略）
    const supabase = createSupabaseClient(false);

    const url = new URL(req.url);
    let categoryId = url.searchParams.get('category_id');
    let keyword = (url.searchParams.get('keyword') || '').trim();
    let limit = parsePositiveInt(url.searchParams.get('limit'), 100);

    if (req.method !== 'GET') {
      try {
        const body = await req.json();
        categoryId = body?.category_id ?? body?.categoryId ?? categoryId;
        keyword = (body?.keyword ?? body?.q ?? keyword ?? '').trim();
        limit = parsePositiveInt(body?.limit ?? limit, limit);
      } catch {
        // ignore invalid JSON body
      }
    }

    limit = Math.min(limit, 200);

    // 转义 SQL LIKE 通配符防止模式注入
    const escapeLike = (s: string) => s.replace(/%/g, '\\%').replace(/_/g, '\\_');

    let query = supabase
      .from('products')
      .select('*, categories:category_id(id, name, slug, icon)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', Number(categoryId));
    }

    if (keyword) {
      query = query.ilike('name', `%${escapeLike(keyword)}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, products: data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return safeErrorResponse(error, getCorsHeaders(req));
  }
});
