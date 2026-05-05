#!/bin/bash

# =====================================================
# 一键部署脚本 - FakaShop 发卡商城
# 用途: 快速启动本地演示站或部署到 Netlify
# =====================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 打印函数
print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_step() {
    echo -e "${BLUE}[步骤]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 检查依赖
check_dependencies() {
    print_step "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js"
        echo "下载地址: https://nodejs.org/"
        exit 1
    fi
    
    print_success "Node.js 已安装: $(node --version)"
}

# 本地演示模式
run_demo() {
    print_header "启动本地演示站（演示模式）"
    
    check_dependencies
    
    print_step "安装依赖..."
    npm install
    
    print_step "启动本地服务器..."
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  演示站已启动！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "🌐 前台商城: ${CYAN}http://localhost:3000/index.html?demo=true${NC}"
    echo -e "🔐 管理后台: ${CYAN}http://localhost:3000/admin/index.html?demo=true${NC}"
    echo ""
    echo -e "${YELLOW}提示: 按 Ctrl+C 停止服务器${NC}"
    echo ""
    
    # 使用 npx serve 启动
    npx serve web -p 3000
}

# 部署到 Netlify
deploy_netlify() {
    print_header "部署到 Netlify"
    
    check_dependencies
    
    # 检查是否安装 Netlify CLI
    if ! command -v netlify &> /dev/null; then
        print_step "安装 Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # 检查是否登录
    if ! netlify status &> /dev/null; then
        print_step "请登录 Netlify..."
        netlify login
    fi
    
    print_step "初始化 Netlify 项目..."
    netlify init
    
    print_step "部署前端..."
    netlify deploy --prod --dir=web
    
    print_success "部署完成！"
    echo ""
    echo -e "${GREEN}请访问您的 Netlify 站点并添加 ?demo=true 参数体验演示模式${NC}"
}

# 生成演示数据 SQL
generate_demo_sql() {
    print_header "生成演示数据 SQL"
    
    local sql_file="supabase/database/demo-data.sql"
    
    cat > "$sql_file" << 'EOF'
-- =====================================================
-- 演示数据 - FakaShop 发卡商城
-- 用途: 快速初始化测试数据，方便演示和开发
-- =====================================================

-- 插入示例商品
INSERT INTO products (name, price, original_price, description, category_id, image, stock, auto_deliver, sales, hot, status) VALUES
('Netflix VIP会员月卡', 29.99, 49.99, 'Netflix高级会员，4K画质，支持多设备同时观看', 1, '🎬', 999, true, 156, true, 'active'),
('Spotify Premium账号', 19.99, 39.99, 'Spotify高级会员，无损音质，无广告', 2, '🎵', 500, true, 89, true, 'active'),
('ChatGPT Plus代充', 149.00, 199.00, 'ChatGPT Plus一个月会员，GPT-4优先体验', 1, '🤖', 50, true, 234, true, 'active'),
('Adobe全家桶激活码', 59.99, 129.99, 'Adobe Creative Cloud全套软件一年使用权', 3, '🎨', 200, true, 67, false, 'active'),
('Steam游戏礼包', 99.00, 199.00, '包含10款热门独立游戏激活码', 3, '🎮', 100, true, 45, false, 'active'),
('1TB云存储空间', 39.99, 79.99, 'Google Drive/OneDrive 1TB空间一年', 4, '☁️', 300, true, 123, true, 'active')
ON CONFLICT DO NOTHING;

-- 插入示例卡密
INSERT INTO cards (product_id, card_content, status) VALUES
(1, '账号: netflix001@demo.com | 密码: NF2024pass', 'available'),
(1, '账号: netflix002@demo.com | 密码: NF2024pass', 'available'),
(2, '账号: spotify001@demo.com | 密码: SP2024pass', 'available'),
(3, 'ChatGPT Plus 兑换码: CGPT-XXXX-YYYY-ZZZZ', 'available'),
(4, 'Adobe 激活码: ADBE-1234-5678-9012', 'available'),
(5, 'Steam Key 1: ABCD-EFGH-IJKL', 'available'),
(5, 'Steam Key 2: MNOP-QRST-UVWX', 'available')
ON CONFLICT DO NOTHING;

-- 插入演示管理员账号 (密码: Demo@123456)
INSERT INTO admins (username, password_hash, salt, email, role) VALUES
('demo', 
 '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
 'dem0salt',
 'demo@fakashop.com',
 'admin')
ON CONFLICT (username) DO NOTHING;

EOF
    
    print_success "演示数据已生成: $sql_file"
    echo ""
    echo -e "${YELLOW}使用方法:${NC}"
    echo "1. 登录 Supabase 控制台"
    echo "2. 进入 SQL Editor"
    echo "3. 执行 $sql_file 文件"
}

# 创建 .env.example
create_env_example() {
    print_header "创建环境变量示例文件"
    
    cat > ".env.example" << 'EOF'
# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 支付配置
NEXAPAY_CRYPTO_ADDRESS=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
NEXAPAY_WEBHOOK_SECRET=your-webhook-secret

# 管理员配置
ADMIN_JWT_SECRET=your-strong-random-secret-key-at-least-32-chars
EOF
    
    print_success "已创建 .env.example 文件"
    echo ""
    print_warning "请勿将 .env 文件提交到 Git 仓库！"
}

# 显示帮助
show_help() {
    print_header "FakaShop 部署脚本"
    
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  demo        启动本地演示站（演示模式，无需数据库）"
    echo "  deploy      部署到 Netlify"
    echo "  sql         生成演示数据 SQL"
    echo "  env         创建环境变量示例文件"
    echo "  help        显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 demo              # 启动本地演示"
    echo "  $0 deploy            # 部署到 Netlify"
    echo "  $0 sql               # 生成演示数据"
    echo ""
}

# 主函数
main() {
    case "${1:-demo}" in
        demo)
            run_demo
            ;;
        deploy)
            deploy_netlify
            ;;
        sql)
            generate_demo_sql
            ;;
        env)
            create_env_example
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
