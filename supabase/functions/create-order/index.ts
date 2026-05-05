import { getCorsHeaders, corsOptions, createSupabaseClient, validateString, validateNumber, safeErrorResponse } from '../shared/mod.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsOptions(req);
  }

  try {
    const corsHeaders = getCorsHeaders(req);
    const supabase = createSupabaseClient(true);

    const { productId, quantity, contact, paymentMethod } = await req.json();

    // 参数校验：必要参数不能为空
    if (!productId || !contact || !paymentMethod) {
      return new Response(
        JSON.stringify({ success: false, message: '缺少必要参数' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 输入校验：联系方式最大长度 200，支付方式最大长度 50，数量 1-999
    const contactStr = validateString(contact, '联系方式', 200);
    const paymentMethodStr = validateString(paymentMethod, '支付方式', 50);
    const qty = quantity ? validateNumber(quantity, '数量', 1, 999) : 1;

    // 查询商品信息：只查询状态为 active 的商品
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('status', 'active')
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ success: false, message: '商品不存在或已下架' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 库存检查：库存不足时拒绝创建订单
    if (product.stock <= 0) {
      return new Response(
        JSON.stringify({ success: false, message: '商品库存不足' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 自动发货商品检查：只检查库存是否足够，不标记为 used
    // 注意：卡密分配在支付成功后由 webhook 执行，避免预扣导致库存浪费
    let cardContent = null;
    if (product.auto_deliver) {
      const qty = quantity || 1;
      const needCount = product.delivery_card_count * qty;

      const { data: cards } = await supabase
        .from('cards')
        .select('id, card_content')
        .eq('product_id', productId)
        .eq('status', 'available')
        .limit(needCount);

      if (!cards || cards.length < needCount) {
        return new Response(
          JSON.stringify({ success: false, message: '卡密库存不足' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 不返回实际卡密内容，支付成功后由 webhook 填充
      cardContent = null;
    }

    // 生成唯一订单号：格式 ORD + 时间戳 + 6位随机字符
    const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
    const totalPrice = parseFloat((product.price * qty).toFixed(2));

    // 获取加密货币收款地址（仅 nexapay 支付方式需要）
    const cryptoAddress = Deno.env.get('NEXAPAY_CRYPTO_ADDRESS');

    // 创建订单记录
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_no: orderNo,
        product_id: productId,
        product_name: product.name,
        price: product.price,
        quantity: qty,
        total_price: totalPrice,
        contact: contactStr,
        payment_method: paymentMethodStr,
        payment_status: 'pending',
        status: 'pending',
        card_content: cardContent,
        crypto_address: cryptoAddress || null, // 未配置时不返回支付信息
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 更新商品销量（异步操作，失败不影响订单创建）
    await supabase
      .from('products')
      .update({ sales: product.sales + qty })
      .eq('id', productId);

    // 构建支付信息：仅 nexapay 支付方式需要返回加密地址
    let paymentResult: any = { success: true };

    if (paymentMethodStr === 'nexapay') {
      if (!cryptoAddress) {
        return new Response(
          JSON.stringify({ success: false, message: 'USDT 支付功能未配置，请联系管理员' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      paymentResult = {
        success: true,
        paymentMethod: 'nexapay',
        cryptoAddress: cryptoAddress,
        cryptoAmount: totalPrice.toString(),
        message: '请向以上地址转账USDT',
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: order,
        payment: paymentResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return safeErrorResponse(error, getCorsHeaders(req));
  }
});
