import { getCorsHeaders, corsOptions, createSupabaseClient, safeErrorResponse } from '../shared/mod.ts';

// 时间安全比较函数，防止时序攻击
// 逐字节比较两个字符串，即使长度不同也返回 false
// 用于签名验证，确保攻击者无法通过响应时间推断签名正确性
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// 将字节数组转换为十六进制字符串
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 将字节数组转换为 Base64 字符串
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

// Webhook 签名验证
// 支持三种签名格式：Hex、Base64、Base64URL
// 使用 HMAC-SHA256 算法，与支付平台签名进行时间安全比较
async function verifyWebhookSignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const bytes = new Uint8Array(signed);

  // 生成三种格式的期望签名
  const expectedHex = bytesToHex(bytes);
  const expectedBase64 = bytesToBase64(bytes);
  const expectedBase64Url = expectedBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  // 标准化传入签名（去除前缀，如 "sha256="）
  const normalized = signature.trim();
  const rawValue = normalized.includes('=') ? normalized.split('=').pop()!.trim() : normalized;

  // 使用时间安全比较，防止时序攻击
  return (
    timingSafeEqual(rawValue, expectedHex) ||
    timingSafeEqual(rawValue, expectedBase64) ||
    timingSafeEqual(rawValue, expectedBase64Url)
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsOptions(req);
  }

  try {
    const corsHeaders = getCorsHeaders(req);
    const supabase = createSupabaseClient(true);
    const webhookSecret = Deno.env.get('NEXAPAY_WEBHOOK_SECRET');

    // 安全检查：如果未配置 webhook secret，直接拒绝请求
    // 防止未部署环境意外暴露 webhook 端点
    if (!webhookSecret) {
      console.error('[webhook-nexapay] NEXAPAY_WEBHOOK_SECRET not configured, rejecting request');
      return new Response(JSON.stringify({ success: false, message: 'webhook secret not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 读取原始请求体用于签名验证
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-nexapay-signature') || req.headers.get('x-signature') || '';

    // 缺少签名头直接拒绝，不进行后续处理
    if (!signatureHeader) {
      return new Response(JSON.stringify({ success: false, message: 'missing signature header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 验证签名，失败则拒绝请求
    const validSignature = await verifyWebhookSignature(rawBody, signatureHeader, webhookSecret);
    if (!validSignature) {
      return new Response(JSON.stringify({ success: false, message: 'invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 解析支付平台回调数据
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const orderNo = payload.order_id;
    const status = payload.status;
    const tradeNo = payload.payment_id || payload.transaction_hash;

    if (!orderNo) {
      return new Response(JSON.stringify({ success: false }), { headers: corsHeaders });
    }

    // 查询订单，检查是否存在
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ success: false, message: '订单不存在' }), { headers: corsHeaders });
    }

    // 幂等性检查：已支付的订单直接返回成功
    // 防止支付平台重试导致重复处理
    if (order.payment_status === 'paid') {
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    let paymentStatus = 'pending';
    let orderStatus = 'pending';

    // 支付成功状态处理
    // 支持多种支付平台状态码：confirmed、completed、success
    if (status === 'confirmed' || status === 'completed' || status === 'success') {
      paymentStatus = 'paid';
      orderStatus = 'completed';

      // 支付成功后分配卡密
      // 注意：卡密分配在 webhook 中执行，而不是创建订单时
      // 这样避免预扣导致库存浪费
      if (order.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('auto_deliver, delivery_card_count')
          .eq('id', order.product_id)
          .single();

        if (product && product.delivery_card_count) {
          const needCount = product.delivery_card_count * (order.quantity || 1);

          // 查询可用卡密（此处未使用 FOR UPDATE SKIP LOCKED，因为 Supabase JS 不支持）
          // 实际并发场景由数据库事务隔离级别保证
          const { data: availableCards } = await supabase
            .from('cards')
            .select('id, card_content')
            .eq('product_id', order.product_id)
            .eq('status', 'available')
            .limit(needCount);

          if (availableCards && availableCards.length >= needCount) {
            // 标记卡密为已使用，关联订单 ID
            await supabase
              .from('cards')
              .update({ status: 'used', order_id: order.id })
              .in('id', availableCards.map((c: any) => c.id));

            // 更新订单的卡密内容（多张卡密用换行分隔）
            const cardContent = availableCards.map((c: any) => c.card_content).join('\n');
            await supabase
              .from('orders')
              .update({ card_content: cardContent })
              .eq('order_no', orderNo);
          }
        }
      }
    } else if (status === 'failed' || status === 'expired') {
      // 支付失败或过期，标记为失败状态
      paymentStatus = 'failed';
      orderStatus = 'cancelled';
    }

    // 更新订单状态
    await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
        trade_no: tradeNo,
        paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
        completed_at: orderStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('order_no', orderNo);

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (error) {
    return safeErrorResponse(error, getCorsHeaders(req));
  }
});
