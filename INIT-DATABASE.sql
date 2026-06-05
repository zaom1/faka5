-- =====================================================
-- 🚀 FakaShop 数据库一键初始化脚本
-- =====================================================
-- 使用方法：
-- 1. 登录 https://supabase.com/dashboard
-- 2. 选择项目 jmtvlbwyugnabgloeocy
-- 3. 点击左侧 SQL Editor
-- 4. 复制粘贴此文件全部内容并执行
-- 5. 等待执行完成
-- =====================================================

-- 第一部分：创建数据库表结构
-- =====================================================

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '📦',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_price DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image TEXT,
    stock INTEGER DEFAULT 999,
    auto_deliver BOOLEAN DEFAULT true,
    delivery_card_count INTEGER DEFAULT 1,
    sales INTEGER DEFAULT 0,
    hot BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 卡密表
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    card_content TEXT NOT NULL,
    card_type TEXT DEFAULT 'text',
    status TEXT DEFAULT 'available',
    order_id INTEGER,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_no TEXT UNIQUE NOT NULL,
    product_id INTEGER REFERENCES products(id),
    product_name TEXT,
    price DECIMAL(10,2),
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10,2),
    contact TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'pending',
    card_content TEXT,
    trade_no TEXT,
    crypto_address TEXT,
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 支付配置表
CREATE TABLE IF NOT EXISTS payment_config (
    id SERIAL PRIMARY KEY,
    payment_type TEXT UNIQUE NOT NULL,
    payment_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    fee_percent DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'admin',
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 管理员登录日志
CREATE TABLE IF NOT EXISTS admin_login_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    ip TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2FA配置表
CREATE TABLE IF NOT EXISTS two_factor_config (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    enabled BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2FA验证码表
CREATE TABLE IF NOT EXISTS two_factor_codes (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    purpose TEXT DEFAULT 'login',
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_cards_product ON cards(product_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_contact ON orders(contact);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- 启用 RLS 策略
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);

-- 第二部分：插入演示数据
-- =====================================================

-- 插入分类
INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('VIP会员', 'vip', '🎬', 1),
    ('账号类', 'account', '👤', 2),
    ('卡密类', 'card', '🔑', 3),
    ('下载类', 'download', '📥', 4),
    ('其他商品', 'other', '📦', 5)
ON CONFLICT (slug) DO NOTHING;

-- 插入商品
INSERT INTO products (name, price, original_price, description, category_id, image, stock, auto_deliver, sales, hot, status) VALUES
('Netflix VIP会员月卡', 29.99, 49.99, 'Netflix高级会员，4K画质，支持多设备同时观看', 1, 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop', 999, true, 156, true, 'active'),
('Spotify Premium账号', 19.99, 39.99, 'Spotify高级会员，无损音质，无广告', 2, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=300&fit=crop', 500, true, 89, true, 'active'),
('ChatGPT Plus代充', 149.00, 199.00, 'ChatGPT Plus一个月会员，GPT-4优先体验', 1, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop', 50, true, 234, true, 'active'),
('Adobe全家桶激活码', 59.99, 129.99, 'Adobe Creative Cloud全套软件一年使用权', 3, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop', 200, true, 67, false, 'active'),
('Steam游戏礼包', 99.00, 199.00, '包含10款热门独立游戏激活码', 3, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop', 100, true, 45, false, 'active'),
('1TB云存储空间', 39.99, 79.99, 'Google Drive/OneDrive 1TB空间一年', 4, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop', 300, true, 123, true, 'active'),
('YouTube Premium会员', 24.99, 44.99, 'YouTube无广告观看，后台播放', 1, 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop', 400, true, 178, true, 'active'),
('Disney+会员账号', 34.99, 59.99, 'Disney+高级会员，海量影视资源', 1, 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', 350, true, 92, false, 'active'),
('GitHub Pro账号', 49.99, 84.00, 'GitHub Pro一年，私有仓库无限制', 2, 'https://images.unsplash.com/photo-1618401471353-b98afee0b2a4?w=400&h=300&fit=crop', 150, true, 56, false, 'active'),
('Notion Team团队版', 79.00, 120.00, 'Notion团队版，协作更高效', 2, 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop', 80, true, 34, false, 'active')
ON CONFLICT DO NOTHING;

-- 插入卡密
INSERT INTO cards (product_id, card_content, status) VALUES
(1, '账号: netflix_vip_001@demo.com | 密码: NF2024VIP#Pass', 'available'),
(1, '账号: netflix_vip_002@demo.com | 密码: NF2024VIP#Pass', 'available'),
(1, '账号: netflix_vip_003@demo.com | 密码: NF2024VIP#Pass', 'available'),
(1, '账号: netflix_vip_004@demo.com | 密码: NF2024VIP#Pass', 'available'),
(1, '账号: netflix_vip_005@demo.com | 密码: NF2024VIP#Pass', 'available'),
(2, '账号: spotify_prem_001@demo.com | 密码: SP2024Prem#Pass', 'available'),
(2, '账号: spotify_prem_002@demo.com | 密码: SP2024Prem#Pass', 'available'),
(2, '账号: spotify_prem_003@demo.com | 密码: SP2024Prem#Pass', 'available'),
(3, 'ChatGPT Plus 兑换码: CGPT-PLUS-2024-XXXX-YYYY', 'available'),
(3, 'ChatGPT Plus 兑换码: CGPT-PLUS-2024-AAAA-BBBB', 'available'),
(3, 'ChatGPT Plus 兑换码: CGPT-PLUS-2024-CCCC-DDDD', 'available'),
(4, 'Adobe 激活码: ADBE-CC2024-1234-5678-9012', 'available'),
(4, 'Adobe 激活码: ADBE-CC2024-2345-6789-0123', 'available'),
(5, 'Steam Key: AAAA1-BBBB1-CCCC1-DDDD1', 'available'),
(5, 'Steam Key: AAAA2-BBBB2-CCCC2-DDDD2', 'available'),
(5, 'Steam Key: AAAA3-BBBB3-CCCC3-DDDD3', 'available'),
(5, 'Steam Key: AAAA4-BBBB4-CCCC4-DDDD4', 'available'),
(6, 'Google Drive 1TB 邀请链接: https://drive.google.com/demo/invite/xxxxx', 'available'),
(6, 'OneDrive 1TB 兑换码: ONEDRIVE-1TB-2024-XXXX', 'available'),
(7, '账号: youtube_prem_001@demo.com | 密码: YT2024Prem#Pass', 'available'),
(7, '账号: youtube_prem_002@demo.com | 密码: YT2024Prem#Pass', 'available'),
(8, '账号: disney_plus_001@demo.com | 密码: DP2024VIP#Pass', 'available'),
(8, '账号: disney_plus_002@demo.com | 密码: DP2024VIP#Pass', 'available'),
(9, 'GitHub Pro Token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'available'),
(10, 'Notion Team 邀请链接: https://notion.so/team/invite/xxxxx', 'available')
ON CONFLICT DO NOTHING;

-- 插入支付配置
INSERT INTO payment_config (payment_type, payment_name, enabled, fee_percent, config) VALUES
('nexapay', 'NexaPay (USDT TRC20)', true, 0, '{"cryptoAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "network": "TRC20"}'),
('stripe', 'Stripe (信用卡)', false, 2.9, '{}'),
('paypal', 'PayPal', false, 3.4, '{}'),
('alipay', '支付宝', false, 0, '{}'),
('wechat', '微信支付', false, 0, '{}')
ON CONFLICT (payment_type) DO NOTHING;

-- 插入系统配置
INSERT INTO system_config (config_key, config_value, description) VALUES
('site_name', '"FakaShop 发卡商城"', '网站名称'),
('site_description', '"优质虚拟商品自动发卡平台"', '网站描述'),
('currency', '"CNY"', '货币类型'),
('currency_symbol', '"¥"', '货币符号'),
('order_expire_minutes', '30', '订单过期时间(分钟)'),
('auto_deliver', 'true', '是否自动发货'),
('maintenance_mode', 'false', '维护模式'),
('customer_service_qq', '"12345678"', '客服QQ'),
('customer_service_email', '"service@fakashop.com"', '客服邮箱')
ON CONFLICT (config_key) DO NOTHING;

-- 插入演示管理员账号
-- ⚠️ 密码: Admin@123456
INSERT INTO admins (username, password_hash, salt, email, role) VALUES
('admin',
 '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
 'salt_demo_2024',
 'admin@fakashop.com',
 'admin'),
('demo',
 '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
 'salt_demo_2024',
 'demo@fakashop.com',
 'admin')
ON CONFLICT (username) DO NOTHING;

-- 插入示例订单
INSERT INTO orders (order_no, product_id, product_name, price, quantity, total_price, contact, payment_method, payment_status, status, card_content, created_at, paid_at, completed_at) VALUES
('ORD20240101000001', 1, 'Netflix VIP会员月卡', 29.99, 1, 29.99, 'QQ:12345678', 'nexapay', 'paid', 'completed', '账号: netflix_vip_completed@demo.com | 密码: NFCompleted#Pass', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '5 minutes', NOW() - INTERVAL '7 days' + INTERVAL '5 minutes'),
('ORD20240101000002', 3, 'ChatGPT Plus代充', 149.00, 1, 149.00, 'QQ:87654321', 'nexapay', 'paid', 'completed', 'ChatGPT Plus 兑换码: CGPT-PLUS-COMPLETED-XXXX', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '3 minutes', NOW() - INTERVAL '5 days' + INTERVAL '3 minutes'),
('ORD20240101000003', 2, 'Spotify Premium账号', 19.99, 2, 39.98, 'email: user@example.com', 'stripe', 'paid', 'completed', '账号: spotify_completed@demo.com | 密码: SPCompleted#Pass', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 minutes', NOW() - INTERVAL '3 days' + INTERVAL '2 minutes'),
('ORD20240101000004', 5, 'Steam游戏礼包', 99.00, 1, 99.00, 'QQ:11223344', 'nexapay', 'pending', 'pending', NULL, NOW() - INTERVAL '1 hour', NULL, NULL),
('ORD20240101000005', 7, 'YouTube Premium会员', 24.99, 1, 24.99, 'email: test@example.com', 'paypal', 'failed', 'cancelled', NULL, NOW() - INTERVAL '2 hours', NULL, NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 完成提示
-- =====================================================
DO $$
DECLARE
    cat_count INTEGER;
    prod_count INTEGER;
    card_count INTEGER;
    order_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO cat_count FROM categories;
    SELECT COUNT(*) INTO prod_count FROM products;
    SELECT COUNT(*) INTO card_count FROM cards WHERE status = 'available';
    SELECT COUNT(*) INTO order_count FROM orders;
    SELECT COUNT(*) INTO admin_count FROM admins;

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ 数据库初始化完成！';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 数据统计:';
    RAISE NOTICE '  - 分类数: %', cat_count;
    RAISE NOTICE '  - 商品数: %', prod_count;
    RAISE NOTICE '  - 可用卡密数: %', card_count;
    RAISE NOTICE '  - 订单数: %', order_count;
    RAISE NOTICE '  - 管理员数: %', admin_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔐 演示管理员账号:';
    RAISE NOTICE '  用户名: admin 或 demo';
    RAISE NOTICE '  密码: Admin@123456';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  注意: 生产环境请修改默认密码！';
    RAISE NOTICE '========================================';
END $$;
