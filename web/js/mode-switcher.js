// =====================================================
// 模式切换UI组件 - ModeSwitcher
// 提供模式切换的可视化界面
// =====================================================

class ModeSwitcher {
  constructor() {
    this.currentMode = window.modeManager?.currentMode || 'supabase';
  }

  /**
   * 创建模式切换按钮（固定在页面右下角）
   */
  createFloatingButton() {
    const btn = document.createElement('button');
    btn.id = 'modeSwitcherBtn';
    btn.className = 'mode-switcher-btn';
    btn.innerHTML = `
      <i class="bi bi-gear-wide-connected"></i>
      <span class="mode-label">${this.getModeLabel()}</span>
    `;
    btn.onclick = () => this.showModal();
    
    document.body.appendChild(btn);
    this.addStyles();
  }

  /**
   * 获取模式标签
   */
  getModeLabel() {
    return this.currentMode === 'local' ? '本地模式' : '云端模式';
  }

  /**
   * 显示模式选择弹窗
   */
  showModal() {
    const existing = document.getElementById('modeSwitcherModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'modeSwitcherModal';
    modal.innerHTML = `
      <div class="mode-modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="mode-modal-content">
        <div class="mode-modal-header">
          <h3><i class="bi bi-layers"></i> 切换数据模式</h3>
          <button class="mode-modal-close" onclick="this.closest('.mode-modal-content').parentElement.remove()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div class="mode-modal-body">
          <p class="mode-modal-desc">选择数据存储方式，不同模式适用于不同场景</p>
          
          <div class="mode-option ${this.currentMode === 'local' ? 'active' : ''}" 
               onclick="window.modeSwitcher.switchTo('local')">
            <div class="mode-option-icon">
              <i class="bi bi-hdd"></i>
            </div>
            <div class="mode-option-content">
              <h4>本地开发模式</h4>
              <p>数据存储在浏览器localStorage，适合开发者本地学习和开发</p>
              <ul class="mode-features">
                <li><i class="bi bi-check-circle"></i> 无需网络连接</li>
                <li><i class="bi bi-check-circle"></i> 本地CRUD操作</li>
                <li><i class="bi bi-check-circle"></i> 模拟支付流程</li>
                <li><i class="bi bi-check-circle"></i> 数据不持久化</li>
              </ul>
              ${this.currentMode === 'local' ? '<span class="mode-badge active">当前模式</span>' : ''}
            </div>
          </div>

          <div class="mode-option ${this.currentMode === 'supabase' ? 'active' : ''}" 
               onclick="window.modeSwitcher.switchTo('supabase')">
            <div class="mode-option-icon">
              <i class="bi bi-cloud"></i>
            </div>
            <div class="mode-option-content">
              <h4>Supabase演示模式</h4>
              <p>数据存储在云端Supabase，支持完整的真实演示流程</p>
              <ul class="mode-features">
                <li><i class="bi bi-check-circle"></i> 真实支付流程</li>
                <li><i class="bi bi-check-circle"></i> 完整后台管理</li>
                <li><i class="bi bi-check-circle"></i> 数据云端持久化</li>
                <li><i class="bi bi-check-circle"></i> 支持多用户协作</li>
              </ul>
              ${this.currentMode === 'supabase' ? '<span class="mode-badge active">当前模式</span>' : ''}
            </div>
          </div>

          ${this.currentMode === 'supabase' ? this.renderSupabaseConfig() : ''}
        </div>

        <div class="mode-modal-footer">
          <button class="btn-mode-secondary" onclick="this.closest('.mode-modal-content').parentElement.remove()">
            取消
          </button>
          <button class="btn-mode-primary" onclick="window.modeSwitcher.resetToDefault()">
            恢复默认
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * 渲染Supabase配置表单
   */
  renderSupabaseConfig() {
    const config = window.modeManager?.loadSupabaseConfig() || {};
    return `
      <div class="supabase-config">
        <h5><i class="bi bi-gear"></i> Supabase配置</h5>
        <p class="text-sm text-muted">如需使用自己的Supabase项目，请配置以下信息</p>
        
        <div class="form-group">
          <label>Project URL</label>
          <input type="url" id="supabaseUrl" placeholder="https://xxxxx.supabase.co" 
                 value="${config.url || ''}">
        </div>
        
        <div class="form-group">
          <label>anon public Key</label>
          <input type="password" id="supabaseKey" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                 value="${config.key || ''}">
        </div>
        
        <button class="btn-mode-sm" onclick="window.modeSwitcher.saveSupabaseConfig()">
          <i class="bi bi-check-lg"></i> 保存配置
        </button>
      </div>
    `;
  }

  /**
   * 保存Supabase配置
   */
  saveSupabaseConfig() {
    const url = document.getElementById('supabaseUrl').value.trim();
    const key = document.getElementById('supabaseKey').value.trim();
    
    if (!url || !key) {
      alert('请填写完整的配置信息');
      return;
    }
    
    window.modeManager.saveSupabaseConfig(url, key);
    alert('✅ 配置已保存');
    location.reload();
  }

  /**
   * 切换到指定模式
   */
  async switchTo(mode) {
    if (mode === this.currentMode) {
      alert(`当前已是${mode === 'local' ? '本地开发' : 'Supabase演示'}模式`);
      return;
    }

    const confirm_msg = mode === 'local' 
      ? '切换到本地开发模式？\n\n• 数据将存储在浏览器localStorage\n• 使用模拟支付流程\n• 刷新后数据重置'
      : '切换到Supabase演示模式？\n\n• 需要配置Supabase连接\n• 使用真实支付流程\n• 数据云端持久化';

    if (confirm(confirm_msg)) {
      await window.modeManager.switchMode(mode);
    }
  }

  /**
   * 重置为默认模式
   */
  resetToDefault() {
    if (confirm('确定恢复默认设置吗？\n\n将自动检测最佳模式。')) {
      localStorage.removeItem('app_mode');
      location.reload();
    }
  }

  /**
   * 添加样式
   */
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* 模式切换按钮 */
      .mode-switcher-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        z-index: 9998;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .mode-switcher-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
      }
      .mode-switcher-btn .mode-label {
        font-size: 12px;
        opacity: 0.9;
      }

      /* 模式切换弹窗 */
      .mode-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 9999;
      }
      .mode-modal-content {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1e293b;
        border-radius: 20px;
        padding: 0;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 10000;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .mode-modal-header {
        padding: 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .mode-modal-header h3 {
        margin: 0;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .mode-modal-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        transition: all 0.2s;
      }
      .mode-modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #f8fafc;
      }
      .mode-modal-body {
        padding: 24px;
      }
      .mode-modal-desc {
        color: #94a3b8;
        margin-bottom: 24px;
        font-size: 14px;
      }
      .mode-option {
        display: flex;
        gap: 16px;
        padding: 20px;
        background: #0f172a;
        border-radius: 12px;
        margin-bottom: 16px;
        cursor: pointer;
        transition: all 0.3s;
        border: 2px solid transparent;
        position: relative;
      }
      .mode-option:hover {
        background: #1a2332;
        border-color: #6366f1;
      }
      .mode-option.active {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }
      .mode-option-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
        flex-shrink: 0;
      }
      .mode-option.active .mode-option-icon {
        background: linear-gradient(135deg, #10b981, #059669);
      }
      .mode-option-content h4 {
        margin: 0 0 8px 0;
        color: #f8fafc;
        font-size: 18px;
      }
      .mode-option-content p {
        margin: 0 0 12px 0;
        color: #94a3b8;
        font-size: 13px;
      }
      .mode-features {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .mode-features li {
        color: #cbd5e1;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .mode-features li i {
        color: #10b981;
        font-size: 14px;
      }
      .mode-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 4px 12px;
        background: #10b981;
        color: white;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
      }
      .supabase-config {
        margin-top: 24px;
        padding: 20px;
        background: #0f172a;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .supabase-config h5 {
        margin: 0 0 8px 0;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .supabase-config .text-sm {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 16px;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        color: #cbd5e1;
        font-size: 13px;
        margin-bottom: 6px;
      }
      .form-group input {
        width: 100%;
        padding: 10px 14px;
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #f8fafc;
        font-size: 13px;
      }
      .form-group input:focus {
        outline: none;
        border-color: #6366f1;
      }
      .btn-mode-sm {
        padding: 8px 16px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-mode-sm:hover {
        background: #059669;
      }
      .mode-modal-footer {
        padding: 20px 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      .btn-mode-secondary, .btn-mode-primary {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-mode-secondary {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #94a3b8;
      }
      .btn-mode-secondary:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      .btn-mode-primary {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border: none;
        color: white;
      }
      .btn-mode-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }
    `;
    document.head.appendChild(style);
  }
}

// 创建全局实例
window.modeSwitcher = new ModeSwitcher();
