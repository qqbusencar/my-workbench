/* ============================================================
   数据持久化层 — 基于 localStorage，模拟云同步接口
   ============================================================ */

const DB = {
  PREFIX: 'labubu_wb_',

  // 数据表
  keys: {
    fitness: 'fitness_records',
    fitness_custom: 'fitness_custom_items',
    wellness: 'wellness_records',
    wellness_products: 'wellness_products',
    study_english: 'study_english_daily',
    study_books: 'study_books',
    study_checkin: 'study_checkin',
    fortune_history: 'fortune_history',
    fortune_user: 'fortune_user',
    news_favorites: 'news_favorites',
    news_watchlist: 'news_watchlist',
    bookkeeping: 'bookkeeping_records',
    settings: 'settings',
    sync_log: 'sync_log',
    password: 'app_password',
    i18n: 'language_pref',
  },

  // 本机偏好（不同步到云端，避免跨设备覆盖主题等个人设置）
  LOCAL_ONLY_KEYS: new Set(['local_theme']),

  // 读取
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('DB.get failed:', key, e);
      return fallback;
    }
  },

  // 写入
  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      this._lastLocalWriteTime = this._lastLocalWriteTime || {};
      this._lastLocalWriteTime[key] = Date.now();
      this.logSync(key, 'write');
      this._enqueueSync(key);
      return true;
    } catch (e) {
      console.error('DB.set failed:', key, e);
      return false;
    }
  },

  // 删除
  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
    this._lastLocalWriteTime = this._lastLocalWriteTime || {};
    delete this._lastLocalWriteTime[key];
    this._enqueueSync(key);
  },

  // 推送单条记录（带日期）
  push(key, record) {
    const list = this.get(key, []);
    list.push({ ...record, _id: this.uid(), _ts: Date.now() });
    this.set(key, list);
    return record;
  },

  // 更新
  update(key, id, updater) {
    const list = this.get(key, []);
    const idx = list.findIndex(x => x._id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updater(list[idx]), _ts: Date.now() };
    this.set(key, list);
    return list[idx];
  },

  // 删除
  removeById(key, id) {
    const list = this.get(key, []);
    const next = list.filter(x => x._id !== id);
    this.set(key, next);
    return next.length !== list.length;
  },

  // 生成唯一 ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  // 同步日志（直接写 localStorage，避免与 DB.set → logSync 形成无限递归）
  logSync(key, op) {
    try {
      const raw = localStorage.getItem(this.PREFIX + 'sync_log');
      const log = raw ? JSON.parse(raw) : [];
      log.push({ key, op, ts: Date.now() });
      if (log.length > 200) log.splice(0, log.length - 200);
      localStorage.setItem(this.PREFIX + 'sync_log', JSON.stringify(log));
    } catch (e) { /* ignore */ }
  },

  // 今日 key（YYYY-MM-DD）
  todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  // 今天 0 点时间戳
  todayStart() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  },

  // 近 N 天日期
  lastNDays(n) {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(this.dateKey(d));
    }
    return days;
  },

  // 单日 key
  dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  // 查询某日记录
  filterByDate(key, dateKey) {
    const list = this.get(key, []);
    return list.filter(r => r.date === dateKey);
  },

  // 查询日期范围
  filterByDateRange(key, startKey, endKey) {
    const list = this.get(key, []);
    return list.filter(r => r.date >= startKey && r.date <= endKey);
  },

  // 连续打卡天数
  streakCount(key, dateField = 'date') {
    const list = this.get(key, []);
    if (!list.length) return 0;
    const dates = [...new Set(list.map(r => r[dateField]))].sort().reverse();
    let streak = 0;
    let cursor = new Date();
    for (let i = 0; i < 365; i++) {
      const k = this.dateKey(cursor);
      if (dates.includes(k)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (i === 0) {
        // 今日未打卡，从昨天算起
        cursor.setDate(cursor.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    return streak;
  },

  // 全部数据导出
  exportAll() {
    const result = {};
    for (const k of Object.values(this.keys)) {
      result[k] = this.get(k);
    }
    result._meta = {
      exportTime: new Date().toISOString(),
      version: '1.0.0',
      platform: 'Labubu 治愈工作台',
    };
    return result;
  },

  // 全部数据导入
  importAll(data) {
    if (!data || typeof data !== 'object') return false;
    let count = 0;
    for (const k of Object.values(this.keys)) {
      if (data[k] !== undefined) {
        this.set(k, data[k]);
        count++;
      }
    }
    return count;
  },

  // 清空全部
  clearAll() {
    for (const k of Object.values(this.keys)) {
      this.remove(k);
    }
  },

  // ============================================================
  // 云同步：localStorage + Supabase 双写模式
  // ============================================================
  // 策略：
  // - 本地写入立即生效（保证离线可用）
  // - 已登录 + Supabase 可用时，后台推送到云端
  // - 启动时若云端有数据且比本地新，自动拉取并合并
  // - 网络异常时静默重试，不阻塞 UI
  // ============================================================

  _syncQueue: new Map(),          // 待同步的 key 队列（防抖合并）
  _syncTimer: null,
  _syncListeners: new Set(),      // 同步状态订阅
  _syncStatus: 'idle',            // idle / syncing / success / error / offline

  // 脏 key 持久化：即使关闭标签页 / 清缓存前未推送完成，下次启动也会补推
  DIRTY_KEY: 'labubu_wb_sync_dirty',
  _dirtySet: null,
  _loadDirty() {
    if (this._dirtySet) return this._dirtySet;
    try { this._dirtySet = new Set(JSON.parse(localStorage.getItem(this.DIRTY_KEY) || '[]')); }
    catch { this._dirtySet = new Set(); }
    return this._dirtySet;
  },
  _saveDirty() {
    try { localStorage.setItem(this.DIRTY_KEY, JSON.stringify([...this._loadDirty()])); } catch { /* ignore */ }
  },
  _markDirty(key) { this._loadDirty().add(key); this._saveDirty(); },
  _clearDirty(key) { this._loadDirty().delete(key); this._saveDirty(); },

  get syncStatus() { return this._syncStatus; },

  onSyncChange(fn) {
    this._syncListeners.add(fn);
    return () => this._syncListeners.delete(fn);
  },

  _setSyncStatus(s) {
    this._syncStatus = s;
    this._syncListeners.forEach(fn => {
      try { fn(s); } catch (e) { /* noop */ }
    });
  },

  // 触发同步某个 key：
  // 1) 无论如何先标记脏（即使尚未登录也保留，登录后补推）
  // 2) 已登录且在线时防抖 800ms 推送（合并多次写入）
  _enqueueSync(key) {
    this._markDirty(key);
    if (!SupabaseCfg.ENABLED || !SupabaseCfg.user) return;
    this._syncQueue.set(key, true);
    if (this._syncTimer) clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => this._flushSync(), 800);
  },

  // 执行队列中的同步（合并：内存队列 + 持久化脏 key）
  async _flushSync() {
    if (!SupabaseCfg.ENABLED || !SupabaseCfg.user) return;
    if (!navigator.onLine) {
      this._setSyncStatus('offline');
      return;
    }
    this._setSyncStatus('syncing');
    const keys = new Set(this._syncQueue.keys());
    this._loadDirty().forEach(k => keys.add(k));
    this._syncQueue.clear();
    if (keys.size === 0) { this._setSyncStatus('idle'); return; }
    let hasError = false;
    for (const k of keys) {
      let value = this.get(k);
      if (value === null || value === undefined) { this._clearDirty(k); continue; }
      if (k === 'settings' && value && typeof value === 'object') {
        const { theme, ...rest } = value;
        value = rest;
      }
      const ok = await SupabaseCfg.pushKey(k, value);
      if (ok) {
        this._clearDirty(k);
      } else {
        hasError = true;
        this._syncQueue.set(k, true);   // 失败：保留脏标记，10s 后自愈
        this._markDirty(k);
      }
    }
    this._setSyncStatus(hasError ? 'error' : 'success');
    if (hasError) {
      // 自愈：10 秒后若仍在队列则重试一次（应对网络抖动 / 登录态延迟）
      setTimeout(() => { if (this._syncQueue.size > 0) this._flushSync(); }, 10000);
    }
    // 3 秒后回到 idle
    setTimeout(() => {
      if (this._syncStatus !== 'syncing') this._setSyncStatus('idle');
    }, 3000);
  },

  // 立即推送所有脏 / 待推 key（页面隐藏或关闭前调用，不再等待防抖）
  flushNow() {
    if (!SupabaseCfg.ENABLED || !SupabaseCfg.user || !navigator.onLine) return;
    const keys = new Set(this._syncQueue.keys());
    this._loadDirty().forEach(k => keys.add(k));
    this._syncQueue.clear();
    if (keys.size === 0) return;
    this._setSyncStatus('syncing');
    let pending = keys.size;
    let hasError = false;
    keys.forEach(async (k) => {
      let value = this.get(k);
      if (value === null || value === undefined) {
        this._clearDirty(k);
      } else {
        if (k === 'settings' && value && typeof value === 'object') {
          const { theme, ...rest } = value;
          value = rest;
        }
        const ok = await SupabaseCfg.pushKey(k, value);
        if (ok) this._clearDirty(k);
        else { hasError = true; this._markDirty(k); }
      }
      if (--pending === 0) this._setSyncStatus(hasError ? 'error' : 'success');
    });
  },

  // 启动时拉取云端数据并合并到本地
  async pullFromCloud() {
    if (!SupabaseCfg.ENABLED || !SupabaseCfg.user) return 0;
    if (!navigator.onLine) return 0;
    this._setSyncStatus('syncing');
    try {
      const cloud = await SupabaseCfg.fetchAll();
      let merged = 0;
      // 已知的静态 key + 动态 key 前缀（如 ios_health_2026-08-18）
      const knownKeys = Object.values(this.keys);
      const dynamicPrefixes = ['ios_health_', 'study_'];
      const isSyncable = (key) => knownKeys.includes(key) || dynamicPrefixes.some(p => key.startsWith(p));
      for (const [key, row] of Object.entries(cloud)) {
        if (!isSyncable(key)) continue;
        const local = this.get(key, null);
        const cloudTime = new Date(row.updated_at).getTime();
        const localTime = local ? (this._lastLocalWriteTime?.[key] || 0) : 0;
        // 简单的 last-write-wins：云端更新则覆盖本地
        if (!local || cloudTime >= localTime) {
          this.set(key, row.data);
          merged++;
        }
      }
      this._setSyncStatus('success');
      setTimeout(() => this._setSyncStatus('idle'), 2000);
      return merged;
    } catch (e) {
      console.warn('[DB] pullFromCloud failed:', e);
      this._setSyncStatus('error');
      return 0;
    }
  },

  // 全量推送到云端（首次登录或手动同步）
  async pushAllToCloud() {
    if (!SupabaseCfg.ENABLED || !SupabaseCfg.user) return 0;
    if (!navigator.onLine) {
      Utils.toast('当前离线，无法同步', 'warning');
      return 0;
    }
    this._setSyncStatus('syncing');
    let count = 0;
    // 收集所有需要同步的 key：静态 keys + 动态 key（扫描 localStorage）+ 脏 key 队列
    // 注意：LOCAL_ONLY_KEYS（local_theme 等本机偏好）不同步到云端，避免跨设备覆盖
    const keysToSync = new Set(Object.values(this.keys));
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (fullKey && fullKey.startsWith(this.PREFIX)) {
        const k = fullKey.slice(this.PREFIX.length);
        if (!this.LOCAL_ONLY_KEYS.has(k)) keysToSync.add(k);
      }
    }
    // 也包含脏 key 队列中待推的 key
    this._loadDirty().forEach(k => {
      if (!this.LOCAL_ONLY_KEYS.has(k)) keysToSync.add(k);
    });
    for (const k of keysToSync) {
      let v = this.get(k);
      if (v === null || v === undefined) continue;
      // settings 里的 theme 是本机偏好，推送时剥离防止跨设备覆盖
      if (k === 'settings' && v && typeof v === 'object') {
        const { theme, ...rest } = v;
        v = rest;
      }
      const ok = await SupabaseCfg.pushKey(k, v);
      if (ok) {
        count++;
        this._clearDirty(k);
      }
    }
    this._setSyncStatus('success');
    setTimeout(() => this._setSyncStatus('idle'), 2000);
    return count;
  },

  // 监听网络状态 + 启动时补推
  _initNetworkWatcher() {
    window.addEventListener('online', () => {
      if (this._syncQueue.size > 0 || this._loadDirty().size > 0) this._flushSync();
      else this._setSyncStatus('idle');
    });
    window.addEventListener('offline', () => {
      this._setSyncStatus('offline');
    });
    // 页面隐藏 / 关闭前：立即把未推送的数据刷到云端（避免防抖未触发就丢数据）
    const flushOnLeave = () => this.flushNow();
    window.addEventListener('pagehide', flushOnLeave);
    window.addEventListener('beforeunload', flushOnLeave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flushNow();
    });
    // 启动即补推历史脏 key（例如上次关闭过快未推送完成的数据）
    if (this._loadDirty().size > 0) {
      setTimeout(() => this._flushSync(), 1500);
    }
  },
};

// 暴露到全局
window.DB = DB;