-- =====================================================
-- 演示数据 - FakaShop 发卡商城
-- 用途: 快速初始化测试数据，方便演示和开发
-- 执行: 在 Supabase SQL Editor 中运行此脚本
-- =====================================================

-- 插入示例分类（如果不存在）
INSERT INTO categories (name, slug, icon, sort_order) VALUES
    ('VIP会员', 'vip', '🎬', 1),
    ('账号类', 'account', '👤', 2),
    ('卡密类', 'card', '🔑', 3),
    ('下载类', 'download', '📥', 4),
    ('其他商品', 'other', '📦', 5)
ON CONFLICT (slug) DO NOTHING;

-- 插入示例商品
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

-- 插入示例卡密
INSERT INTO cards (product_id, card_content, status) VALUES
-- Netflix 卡密
(1, '账号: netflix_vip_001@demo.com | 密码: NF2024VIP#Pass', 'available'),
(1, '账号: netflix_vip_002@demo.com | 密码: NF2024VIP#Pass', 'available'),
(1, '账号: netflix_vip_003@demo.com | 密码: NF2024VIP#Pass', 'available'),
(1, '账号: netflix_vip_004@demo.com | 密码: NF2024VIP#Pass', 'available'),
(1, '账号: netflix_vip_005@demo.com | 密码: NF2024VIP#Pass', 'available'),

-- Spotify 卡密
(2, '账号: spotify_prem_001@demo.com | 密码: SP2024Prem#Pass', 'available'),
(2, '账号: spotify_prem_002@demo.com | 密码: SP2024Prem#Pass', 'available'),
(2, '账号: spotify_prem_003@demo.com | 密码: SP2024Prem#Pass', 'available'),

-- ChatGPT 卡密
(3, 'ChatGPT Plus 兑换码: CGPT-PLUS-2024-XXXX-YYYY', 'available'),
(3, 'ChatGPT Plus 兑换码: CGPT-PLUS-2024-AAAA-BBBB', 'available'),
(3, 'ChatGPT Plus 兑换码: CGPT-PLUS-2024-CCCC-DDDD', 'available'),

-- Adobe 卡密
(4, 'Adobe 激活码: ADBE-CC2024-1234-5678-9012', 'available'),
(4, 'Adobe 激活码: ADBE-CC2024-2345-6789-0123', 'available'),

-- Steam 卡密
(5, 'Steam Key: AAAA1-BBBB1-CCCC1-DDDD1', 'available'),
(5, 'Steam Key: AAAA2-BBBB2-CCCC2-DDDD2', 'available'),
(5, 'Steam Key: AAAA3-BBBB3-CCCC3-DDDD3', 'available'),
(5, 'Steam Key: AAAA4-BBBB4-CCCC4-DDDD4', 'available'),

-- 云存储 卡密
(6, 'Google Drive 1TB 邀请链接: https://drive.google.com/demo/invite/xxxxx', 'available'),
(6, 'OneDrive 1TB 兑换码: ONEDRIVE-1TB-2024-XXXX', 'available'),

-- YouTube 卡密
(7, '账号: youtube_prem_001@demo.com | 密码: YT2024Prem#Pass', 'available'),
(7, '账号: youtube_prem_002@demo.com | 密码: YT2024Prem#Pass', 'available'),

-- Disney+ 卡密
(8, '账号: disney_plus_001@demo.com | 密码: DP2024VIP#Pass', 'available'),
(8, '账号: disney_plus_002@demo.com | 密码: DP2024VIP#Pass', 'available'),

-- GitHub 卡密
(9, 'GitHub Pro Token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'available'),

-- Notion 卡密
(10, 'Notion Team 邀请链接: https://notion.so/team/invite/xxxxx', 'available')
ON CONFLICT DO NOTHING;

-- 插入演示支付配置
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

-- 插入演示管理员账号 (密码: Admin@123456)
-- 注意: 这是演示账号，生产环境请修改密码！
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

-- 插入示例订单（用于演示后台订单管理）
INSERT INTO orders (order_no, product_id, product_name, price, quantity, total_price, contact, payment_method, payment_status, status, card_content, created_at, paid_at, completed_at) VALUES
('ORD20240101000001', 1, 'Netflix VIP会员月卡', 29.99, 1, 29.99, 'QQ:12345678', 'nexapay', 'paid', 'completed', '账号: netflix_vip_completed@demo.com | 密码: NFCompleted#Pass', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '5 minutes', NOW() - INTERVAL '7 days' + INTERVAL '5 minutes'),
('ORD20240101000002', 3, 'ChatGPT Plus代充', 149.00, 1, 149.00, 'QQ:87654321', 'nexapay', 'paid', 'completed', 'ChatGPT Plus 兑换码: CGPT-PLUS-COMPLETED-XXXX', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '3 minutes', NOW() - INTERVAL '5 days' + INTERVAL '3 minutes'),
('ORD20240101000003', 2, 'Spotify Premium账号', 19.99, 2, 39.98, 'email: user@example.com', 'stripe', 'paid', 'completed', '账号: spotify_completed@demo.com | 密码: SPCompleted#Pass', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 minutes', NOW() - INTERVAL '3 days' + INTERVAL '2 minutes'),
('ORD20240101000004', 5, 'Steam游戏礼包', 99.00, 1, 99.00, 'QQ:11223344', 'nexapay', 'pending', 'pending', NULL, NOW() - INTERVAL '1 hour', NULL, NULL),
('ORD20240101000005', 7, 'YouTube Premium会员', 24.99, 1, 24.99, 'email: test@example.com', 'paypal', 'failed', 'cancelled', NULL, NOW() - INTERVAL '2 hours', NULL, NULL)
ON CONFLICT DO NOTHING;

-- 完成提示
DO $$
BEGIN
    RAISE NOTICE '✅ 演示数据插入完成！';
    RAISE NOTICE '';
    RAISE NOTICE '📊 数据统计:';
    RAISE NOTICE '  - 分类数: %', (SELECT COUNT(*) FROM categories);
    RAISE NOTICE '  - 商品数: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE '  - 卡密数: %', (SELECT COUNT(*) FROM cards WHERE status = ''available'');
    RAISE NOTICE '  - 订单数: %', (SELECT COUNT(*) FROM orders);
    RAISE NOTICE '  - 管理员数: %', (SELECT COUNT(*) FROM admins);
    RAISE NOTICE '';
    RAISE NOTICE '🔐 演示管理员账号:';
    RAISE NOTICE '  用户名: admin 或 demo';
    RAISE NOTICE '  密码: Admin@123456';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  注意: 生产环境请修改默认密码！';
END $$;
