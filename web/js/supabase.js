// =====================================================
// Supabase 客户端 - 支持环境变量和手动配置
// =====================================================

class SupabaseClient {
  constructor() {
    this.supabase = null;
    this.config = null;
    
    // 尝试从多个来源加载配置（优先级从高到低）：
    // 1. Netlify 环境变量 (通过全局变量注入)
    // 2. localStorage 保存的配置
    // 3. 静默失败，让用户可以浏览但不能购买
    this.config = this.loadConfigFromEnv() || this.loadConfig();
    
    if (this.config) {
      this.initSupabase();
    }
  }

  loadConfigFromEnv() {
    // 从环境变量加载配置（Netlify部署时通过全局变量注入）
    // 支持两种变量名：SUPABASE_URL 或 SUPABASE_DATABASE_URL
    const envUrl = window.SUPABASE_URL || window.SUPABASE_DATABASE_URL;
    const envKey = window.SUPABASE_ANON_KEY;
    
    if (envUrl && envKey) {
      console.log('✅ 使用 Netlify 环境变量配置 Supabase');
      return { url: envUrl, key: envKey };
    }
    return null;
  }

  loadConfig() {
    // 优先检查 localStorage
    const saved = localStorage.getItem('supabase_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config && config.url && config.key) {
          return config;
        }
      } catch (e) {
        localStorage.removeItem('supabase_config');
      }
    }
    return null;
  }

  saveConfig(config) {
    localStorage.setItem('supabase_config', JSON.stringify(config));
    this.config = config;
    this.initSupabase();
  }

  initSupabase() {
    if (!this.config || !this.config.url || !this.config.key) {
      return false;
    }

    if (typeof window.supabase !== 'undefined') {
      this.supabase = window.supabase.createClient(this.config.url, this.config.key);
      return true;
    }
    return false;
  }

  isConnected() {
    return this.supabase !== null;
  }

  showConnectModal() {
    return new Promise((resolve) => {
      // 检查是否已配置 Netlify 环境变量
      const hasNetlifyConfig = window.SUPABASE_URL || window.SUPABASE_DATABASE_URL;
      const hasNetlifyKey = window.SUPABASE_ANON_KEY;
      
      if (hasNetlifyConfig && hasNetlifyKey) {
        // Netlify 扩展已配置，显示友好提示
        const modal = document.createElement('div');
        modal.id = 'supabaseConnectModal';
        modal.innerHTML = `
          <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;">
            <div style="background:#1e293b;border-radius:16px;padding:32px;width:90%;max-width:480px;border:1px solid rgba(255,255,255,0.1);">
              <h3 style="margin:0 0 24px;color:#f8fafc;display:flex;align-items:center;gap:12px;">
                <i class="bi bi-cloud-check" style="color:#10b981;"></i>
                Netlify 连接已配置
              </h3>
              <p style="color:#94a3b8;margin-bottom:24px;font-size:14px;">
                检测到 Netlify Supabase 扩展已自动配置，点击下方按钮连接数据库。
              </p>
              
              <div style="margin-bottom:24px;padding:16px;background:rgba(16,185,129,0.1);border-radius:8px;border:1px solid rgba(16,185,129,0.2);">
                <p style="margin:0;color:#34d399;font-size:13px;">
                  <i class="bi bi-check-circle-fill"></i> 
                  环境变量已就绪：SUPABASE_ANON_KEY
                </p>
              </div>

              <div style="display:flex;gap:12px;">
                <button id="btnManual" style="flex:1;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#94a3b8;cursor:pointer;">
                  手动配置
                </button>
                <button id="btnConnect" style="flex:1;padding:12px;border-radius:8px;border:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;cursor:pointer;font-weight:600;">
                  立即连接
                </button>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('btnManual').onclick = () => {
          document.body.removeChild(modal);
          this.showManualConnectModal().then(resolve);
        };

        document.getElementById('btnConnect').onclick = () => {
          const config = this.loadConfigFromEnv();
          if (config) {
            this.saveConfig(config);
            document.body.removeChild(modal);
            resolve(true);
          } else {
            alert('配置加载失败，请尝试手动配置');
          }
        };
        return;
      }

      // 未配置环境变量，显示手动配置界面
      this.showManualConnectModal().then(resolve);
    });
  }

  showManualConnectModal() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.id = 'supabaseConnectModal';
      modal.innerHTML = `
        <div style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;">
          <div style="background:#1e293b;border-radius:16px;padding:32px;width:90%;max-width:480px;border:1px solid rgba(255,255,255,0.1);">
            <h3 style="margin:0 0 24px;color:#f8fafc;display:flex;align-items:center;gap:12px;">
              <i class="bi bi-cloud-plus" style="color:#6366f1;"></i>
              连接 Supabase
            </h3>
            <p style="color:#94a3b8;margin-bottom:24px;font-size:14px;">
              请输入您的 Supabase 项目配置信息
            </p>
            
            <div style="margin-bottom:20px;">
              <label style="display:block;color:#f8fafc;margin-bottom:8px;font-size:14px;">Project URL</label>
              <input type="url" id="supabaseUrl" placeholder="https://xxxxx.supabase.co" 
                style="width:100%;padding:12px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#f8fafc;font-size:14px;">
            </div>
            
            <div style="margin-bottom:24px;">
              <label style="display:block;color:#f8fafc;margin-bottom:8px;font-size:14px;">anon Key</label>
              <input type="password" id="supabaseKey" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                style="width:100%;padding:12px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#f8fafc;font-size:14px;">
            </div>

            <div style="display:flex;gap:12px;">
              <button id="btnCancel" style="flex:1;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#94a3b8;cursor:pointer;">
                取消
              </button>
              <button id="btnConnect" style="flex:1;padding:12px;border-radius:8px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;cursor:pointer;font-weight:600;">
                连接
              </button>
            </div>

            <div style="margin-top:24px;padding:16px;background:rgba(99,102,241,0.1);border-radius:8px;">
              <p style="margin:0;color:#a5b4fc;font-size:13px;">
                <i class="bi bi-info-circle"></i> 
                获取方法：Supabase控制台 → Settings → API → copy "Project URL" and "anon public" key
              </p>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('btnCancel').onclick = () => {
        document.body.removeChild(modal);
        resolve(false);
      };

      document.getElementById('btnConnect').onclick = () => {
        const url = document.getElementById('supabaseUrl').value.trim();
        const key = document.getElementById('supabaseKey').value.trim();

        if (!url || !key) {
          alert('请填写完整的配置信息');
          return;
        }

        if (!url.includes('.supabase.co')) {
          alert('Project URL 格式不正确');
          return;
        }

        this.saveConfig({ url, key });
        document.body.removeChild(modal);
        resolve(true);
      };
    });
  }

  getClient() {
    return this.supabase;
  }

  disconnect() {
    localStorage.removeItem('supabase_config');
    this.supabase = null;
    this.config = null;
  }
}

window.supabaseClient = new SupabaseClient();
