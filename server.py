#!/usr/bin/env python3
"""
FakaShop 本地开发服务器
自动注入 Supabase 配置到前端页面，无需手动连接数据库
"""

import http.server
import socketserver
import os
import re
from pathlib import Path

PORT = 8080
WEB_DIR = Path(__file__).parent / "web"

# 从 .env 读取配置
ENV_FILE = Path(__file__).parent / ".env"
config = {}
if ENV_FILE.exists():
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                config[key.strip()] = value.strip()

# HTML 转义函数，防止 .env 值中的特殊字符导致注入
def escape_html(text):
    return (text
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&#x27;'))

SUPABASE_URL = escape_html(config.get('SUPABASE_URL', ''))
SUPABASE_ANON_KEY = escape_html(config.get('SUPABASE_ANON_KEY', ''))

class FakaShopHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def do_GET(self):
        # 注入 Supabase 配置到 HTML 页面
        if self.path.endswith('.html') or self.path == '/' or self.path.endswith('/'):
            file_path = WEB_DIR
            if self.path == '/':
                file_path = file_path / 'index.html'
            elif self.path.endswith('/'):
                file_path = file_path / self.path.lstrip('/') / 'index.html'
            else:
                file_path = WEB_DIR / self.path.lstrip('/')

            if file_path.exists() and file_path.suffix in ['.html', '']:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # 注入 Supabase 配置
                    config_script = f'''
<script>
// 自动注入的 Supabase 配置
window.SUPABASE_URL = "{SUPABASE_URL}";
window.SUPABASE_ANON_KEY = "{SUPABASE_ANON_KEY}";
</script>
'''
                    # 在 </head> 前注入配置
                    content = content.replace('</head>', config_script + '</head>')

                    self.send_response(200)
                    self.send_header('Content-type', 'text/html; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(content.encode('utf-8'))
                    return
                except Exception as e:
                    self.send_error(500, str(e))
                    return

        # 默认处理静态文件
        super().do_GET()

    def log_message(self, format, *args):
        print(f"[FakaShop] {self.address_string()} - {format % args}")

with socketserver.TCPServer(("", PORT), FakaShopHandler) as httpd:
    print(f"\n{'='*60}")
    print(f"  FakaShop 本地开发服务器")
    print(f"{'='*60}")
    print(f"\n  🌐 前台商城:   http://localhost:{PORT}")
    print(f"  🌐 演示模式:   http://localhost:{PORT}/?demo=true")
    print(f"  🔧 管理后台:   http://localhost:{PORT}/admin/")
    print(f"  🔧 演示模式:   http://localhost:{PORT}/admin/?demo=true")
    print(f"\n  ✅ Supabase 配置已自动注入")
    print(f"     URL: {SUPABASE_URL}")
    print(f"\n  按 Ctrl+C 停止服务器\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n服务器已停止")
        httpd.shutdown()
