// =====================================================
// 双模式数据库架构 - ModeManager
// 支持: 1.本地开发模式(localStorage)  2.Supabase演示模式
// =====================================================

class ModeManager {
  constructor() {
    this.currentMode = this.detectMode();
    this.supabaseClient = null;
    this.localDB = new LocalDB(); // 本地数据库实例
  }

  /**
   * 检测当前模式
   * 优先级: URL参数 > localStorage > 默认模式(supabase)
   */
  detectMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    
    if (urlMode === 'local' || urlMode === 'supabase') {
      return urlMode;
    }
    
    const savedMode = localStorage.getItem('app_mode');
    return savedMode || 'supabase'; // 默认使用supabase演示模式
  }

  /**
   * 切换模式
   */
  async switchMode(newMode) {
    if (!['local', 'supabase'].includes(newMode)) {
      throw new Error('无效的模式: ' + newMode);
    }
    
    localStorage.setItem('app_mode', newMode);
    this.currentMode = newMode;
    
    if (newMode === 'supabase') {
      await this.initSupabase();
    }
    
    // 刷新页面应用新模式
    location.reload();
  }

  /**
   * 初始化Supabase客户端
   */
  async initSupabase() {
    if (this.supabaseClient) return;
    
    // 尝试加载配置
    const config = this.loadSupabaseConfig();
    if (!config) {
      console.warn('⚠️ Supabase配置未设置，将使用演示账号');
      return;
    }
    
    if (typeof window.supabase !== 'undefined') {
      this.supabaseClient = window.supabase.createClient(config.url, config.key);
      console.log('✅ Supabase客户端已初始化');
    }
  }

  /**
   * 加载Supabase配置
   */
  loadSupabaseConfig() {
    // 优先级: 环境变量 > localStorage
    if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
      return {
        url: window.SUPABASE_URL,
        key: window.SUPABASE_ANON_KEY
      };
    }
    
    const saved = localStorage.getItem('supabase_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    
    return null;
  }

  /**
   * 保存Supabase配置
   */
  saveSupabaseConfig(url, key) {
    const config = { url, key };
    localStorage.setItem('supabase_config', JSON.stringify(config));
    this.supabaseClient = window.supabase.createClient(url, key);
  }

  /**
   * 通用数据操作接口
   * 根据当前模式自动选择数据源
   */
  async query(table, options = {}) {
    if (this.currentMode === 'local') {
      return this.localDB.query(table, options);
    } else {
      return this.supabaseQuery(table, options);
    }
  }

  /**
   * Supabase查询
   */
  async supabaseQuery(table, options) {
    if (!this.supabaseClient) {
      throw new Error('Supabase客户端未初始化');
    }
    
    let query = this.supabaseClient.from(table).select(options.select || '*');
    
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    if (options.order) {
      query = query.order(options.order.field, { 
        ascending: options.order.ascending !== false 
      });
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  /**
   * 插入数据
   */
  async insert(table, data) {
    if (this.currentMode === 'local') {
      return this.localDB.insert(table, data);
    } else {
      const { data: result, error } = await this.supabaseClient
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      return result;
    }
  }

  /**
   * 更新数据
   */
  async update(table, id, data) {
    if (this.currentMode === 'local') {
      return this.localDB.update(table, id, data);
    } else {
      const { data: result, error } = await this.supabaseClient
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return result;
    }
  }

  /**
   * 删除数据
   */
  async delete(table, id) {
    if (this.currentMode === 'local') {
      return this.localDB.delete(table, id);
    } else {
      const { error } = await this.supabaseClient
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
  }

  /**
   * 用户认证
   */
  async login(username, password) {
    if (this.currentMode === 'local') {
      return this.localDB.login(username, password);
    } else {
      // Supabase模式：调用Edge Functions
      const { data, error } = await this.supabaseClient.functions.invoke('admin-login', {
        body: { username, password }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      return data;
    }
  }

  /**
   * 创建订单
   */
  async createOrder(orderData) {
    if (this.currentMode === 'local') {
      return this.localDB.createOrder(orderData);
    } else {
      const { data, error } = await this.supabaseClient.functions.invoke('create-order', {
        body: orderData
      });
      
      if (error) throw error;
      return data;
    }
  }

  /**
   * 获取模式信息
   */
  getModeInfo() {
    return {
      mode: this.currentMode,
      modeName: this.currentMode === 'local' ? '本地开发模式' : 'Supabase演示模式',
      description: this.currentMode === 'local' 
        ? '数据存储在浏览器本地存储中，适合开发学习'
        : '数据存储在云端Supabase，支持完整功能演示',
      features: this.currentMode === 'local'
        ? ['本地CRUD操作', '模拟支付', '数据不持久化', '无需网络']
        : ['真实支付流程', '完整后台管理', '数据持久化', '支持多用户']
    };
  }
}

// =====================================================
// 本地数据库 - 使用localStorage模拟
// =====================================================

class LocalDB {
  constructor() {
    this.tables = {
      products: this.loadTable('products'),
      orders: this.loadTable('orders'),
      cards: this.loadTable('cards'),
      categories: this.loadTable('categories'),
      admins: this.loadTable('admins')
    };
    
    // 初始化默认数据
    this.initDefaultData();
  }

  loadTable(name) {
    const data = localStorage.getItem(`localdb_${name}`);
    return data ? JSON.parse(data) : [];
  }

  saveTable(name) {
    localStorage.setItem(`localdb_${name}`, JSON.stringify(this.tables[name]));
  }

  initDefaultData() {
    // 如果表为空，初始化默认数据
    if (this.tables.products.length === 0) {
      this.tables.products = [
        { id: 1, name: 'Netflix VIP会员月卡', price: 29.99, original_price: 49.99, category_id: 1, stock: 999, sales: 156, status: 'active', hot: true, image: '🎬' },
        { id: 2, name: 'Spotify Premium账号', price: 19.99, original_price: 39.99, category_id: 2, stock: 500, sales: 89, status: 'active', hot: true, image: '🎵' },
        { id: 3, name: 'ChatGPT Plus代充', price: 149.00, original_price: 199.00, category_id: 1, stock: 50, sales: 234, status: 'active', hot: true, image: '🤖' }
      ];
      this.saveTable('products');
    }

    if (this.tables.categories.length === 0) {
      this.tables.categories = [
        { id: 1, name: 'VIP会员', slug: 'vip', icon: '🎬', sort_order: 1 },
        { id: 2, name: '账号类', slug: 'account', icon: '👤', sort_order: 2 },
        { id: 3, name: '卡密类', slug: 'card', icon: '🔑', sort_order: 3 }
      ];
      this.saveTable('categories');
    }

    if (this.tables.admins.length === 0) {
      this.tables.admins = [
        { id: 1, username: 'admin', password: 'admin123', role: 'admin' }
      ];
      this.saveTable('admins');
    }
  }

  async query(table, options = {}) {
    let data = [...this.tables[table]];
    
    if (options.where) {
      data = data.filter(item => {
        return Object.entries(options.where).every(([key, value]) => item[key] === value);
      });
    }
    
    if (options.order) {
      data.sort((a, b) => {
        const result = a[options.order.field] > b[options.order.field] ? 1 : -1;
        return options.order.ascending ? result : -result;
      });
    }
    
    if (options.limit) {
      data = data.slice(0, options.limit);
    }
    
    return data;
  }

  async insert(table, data) {
    const id = this.tables[table].length > 0 
      ? Math.max(...this.tables[table].map(item => item.id)) + 1 
      : 1;
    
    const newItem = { ...data, id };
    this.tables[table].push(newItem);
    this.saveTable(table);
    
    return [newItem];
  }

  async update(table, id, data) {
    const index = this.tables[table].findIndex(item => item.id === id);
    if (index === -1) throw new Error('记录不存在');
    
    this.tables[table][index] = { ...this.tables[table][index], ...data };
    this.saveTable(table);
    
    return [this.tables[table][index]];
  }

  async delete(table, id) {
    const index = this.tables[table].findIndex(item => item.id === id);
    if (index === -1) throw new Error('记录不存在');
    
    this.tables[table].splice(index, 1);
    this.saveTable(table);
    
    return true;
  }

  async login(username, password) {
    const admin = this.tables.admins.find(
      a => a.username === username && a.password === password
    );
    
    if (!admin) {
      throw new Error('用户名或密码错误');
    }
    
    return {
      success: true,
      admin: { id: admin.id, username: admin.username, role: admin.role },
      token: 'local-token-' + Date.now()
    };
  }

  async createOrder(orderData) {
    const orderNo = 'LOCAL' + Date.now();
    const order = {
      id: this.tables.orders.length + 1,
      order_no: orderNo,
      ...orderData,
      payment_status: 'pending',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    this.tables.orders.push(order);
    this.saveTable('orders');
    
    return {
      success: true,
      order,
      payment: {
        cryptoAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        cryptoAmount: orderData.total_price
      }
    };
  }
}

// 创建全局实例
window.modeManager = new ModeManager();
