-- =====================================================
-- 发卡系统数据库结构
-- 支持多数据库：PostgreSQL (Supabase/MySQL兼容)
-- =====================================================

-- 分类表（动态分类）
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

-- 索引
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_cards_product ON cards(product_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_contact ON orders(contact);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- RLS 策略 (如果不存在则创建)
DO $$ 
BEGIN
    -- 检查并启用RLS (兼容不同PostgreSQL版本)
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'products' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'categories' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'orders' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'cards' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'payment_config' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'admins' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'two_factor_config' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE two_factor_config ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'two_factor_codes' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE two_factor_codes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'system_config' AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- 创建策略（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'products_public_read') THEN
        CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'categories_public_read') THEN
        CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
    END IF;
END $$;

-- 初始数据
INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('VIP会员', 'vip', '🎬', 1),
    ('账号类', 'account', '👤', 2),
    ('卡密类', 'card', '🔑', 3),
    ('下载类', 'download', '📥', 4),
    ('其他商品', 'other', '📦', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO payment_config (payment_type, payment_name, enabled, fee_percent) VALUES
    ('nexapay', 'NexaPay (加密货币)', false, 0),
    ('stripe', 'Stripe (信用卡)', false, 2.9),
    ('paypal', 'PayPal', false, 3.4),
    ('paddle', 'Paddle', false, 5.0),
    ('alipay', '支付宝', false, 0),
    ('wechat', '微信支付', false, 0)
ON CONFLICT (payment_type) DO NOTHING;

INSERT INTO system_config (config_key, config_value, description) VALUES
    ('site_name', '"发卡商城"', '网站名称'),
    ('site_description', '"优质虚拟商品发售平台"', '网站描述'),
    ('currency', '"CNY"', '货币类型'),
    ('currency_symbol', '"¥"', '货币符号'),
    ('order_expire_minutes', '30', '订单过期时间(分钟)'),
    ('auto_deliver', 'true', '是否自动发货'),
    ('maintenance_mode', 'false', '维护模式')
ON CONFLICT (config_key) DO NOTHING;
