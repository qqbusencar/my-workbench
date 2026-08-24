/* ============================================================
   模块一：健身打卡
   ============================================================ */

const Fitness = {
  state: {
    view: 'today', // today / week / month / calendar
  },

  // 无预设类别：全部由用户手动添加

  // 模拟 iOS 健身数据
  iosHealthData() {
    // 通过快捷指令 Webhook 同步 → 当前为本地模拟
    const seed = DB.todayKey();
    const stored = DB.get('ios_health_' + seed);
    if (stored) return stored;
    // 基于日期生成稳定但有变化的模拟数据
    const d = new Date();
    const baseSteps = 5000 + (d.getDate() * 137) % 4000;
    const data = {
      steps: baseSteps,
      calories: Math.floor(baseSteps * 0.045),
      duration: Math.floor(baseSteps / 110),
      distance: +(baseSteps / 1400).toFixed(2),
      source: 'iOS 健身 (模拟)',
      syncedAt: new Date().toISOString(),
    };
    DB.set('ios_health_' + seed, data);
    return data;
  },

  // 生成随机同步码（24 位，去掉易混淆字符）
  _genToken() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let s = '';
    for (let i = 0; i < 24; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  },

  // 取已有同步码，没有则生成并写入 sync_tokens
  async ensureSyncToken() {
    if (!SupabaseCfg.ENABLED || !SupabaseCfg.user) return null;
    try {
      const { data } = await SupabaseCfg.client
        .from('sync_tokens').select('token')
        .eq('user_id', SupabaseCfg.user.id).maybeSingle();
      if (data?.token) return data.token;
      const token = this._genToken();
      const { error } = await SupabaseCfg.client
        .from('sync_tokens').upsert({ user_id: SupabaseCfg.user.id, token });
      if (error) { console.warn('[sync-token]', error); return null; }
      return token;
    } catch (e) { console.warn('[sync-token]', e); return null; }
  },

  // 重新生成同步码
  async regenSyncToken() {
    if (!SupabaseCfg.ENABLED || !SupabaseCfg.user) return null;
    const token = this._genToken();
    const { error } = await SupabaseCfg.client
      .from('sync_tokens').update({ token }).eq('user_id', SupabaseCfg.user.id);
    if (error) { console.warn('[sync-token]', error); return null; }
    return token;
  },

  // 读取某天真实健康快照
  async fetchHealthSnapshot(date) {
    if (!SupabaseCfg.ENABLED || !SupabaseCfg.user) return null;
    try {
      const { data } = await SupabaseCfg.client
        .from('health_snapshot').select('*')
        .eq('snapshot_date', date).maybeSingle();
      return data || null;
    } catch (e) { console.warn('[health]', e); return null; }
  },

  // 从云端拉取今日真实数据，覆盖模拟值并刷新页面卡片
  async refreshHealthFromCloud() {
    if (!SupabaseCfg.ENABLED || !SupabaseCfg.user) return;
    const today = DB.todayKey();
    const snap = await this.fetchHealthSnapshot(today);
    const stateEl = document.getElementById('fit-sync-state');
    if (!snap) {
      if (stateEl) stateEl.textContent = '未同步（用模拟值）';
      return;
    }
    const real = {
      steps: snap.steps || 0,
      calories: snap.calories || 0,
      duration: snap.active_minutes || 0,
      distance: snap.distance_km || 0,
      source: 'iOS 健身 (快捷指令同步)',
      syncedAt: snap.synced_at,
    };
    // 写入本地缓存，下次进入直接读
    DB.set('ios_health_' + today, real);
    // 精准更新三个数据卡
    const setVal = (key, val) => {
      const el = document.querySelector(`[data-stat="${key}"]`);
      if (el) el.textContent = (key === 'steps' || key === 'cal') ? Utils.num(val) : val;
    };
    setVal('steps', real.steps);
    const todayCal = (DB.filterByDate('fitness_records', today)
      .filter(r => r.calories).reduce((s, r) => s + (r.calories || 0), 0)) + real.calories;
    setVal('cal', todayCal);
    setVal('min', (DB.filterByDate('fitness_records', today)
      .filter(r => r.minutes).reduce((s, r) => s + (r.minutes || 0), 0)) + real.duration);
    if (stateEl) stateEl.textContent = '已同步 ' + (snap.synced_at || '').slice(0, 10);
  },

  // 注入页面
  mount(container) {
    const today = DB.todayKey();
    const records = DB.filterByDate('fitness_records', today);
    const checkedToday = new Set(records.filter(r => r.checked).map(r => r.itemId));
    const ios = this.iosHealthData();
    const streak = DB.streakCount('fitness_records');

    // 计算今日数据
    const todayMinutes = records.filter(r => r.minutes).reduce((s, r) => s + (r.minutes || 0), 0);
    const todayCal = records.filter(r => r.calories).reduce((s, r) => s + (r.calories || 0), 0) + ios.calories;

    container.innerHTML = `
      <div class="page">
        ${Components.banner({
          module: 'fitness',
          title: '健身打卡',
          sub: '今天也要好好宠爱身体呀~',
          actions: `
            <button class="tag btn-soft" id="fit-cal" title="日历">📅 日历</button>
            <button class="tag btn-soft" id="fit-sync" title="同步 iOS">📲 同步</button>
            <button class="btn-primary" id="fit-add" title="添加项目">＋ 添加</button>
          `
        })}

        <div class="kitty-feature-card" style="margin-bottom:16px">
          <div class="kitty-portrait" style="background:linear-gradient(135deg,#c8e6c9,#b8d8e8)">${Utils.kittyImg({ size: 'small', module: 'fitness' })}</div>
          <div class="lfc-text">
            <div class="lfc-title">🏃‍♀️ 一起动起来吧</div>
            <div class="lfc-sub">${streak >= 7 ? `已坚持 ${streak} 天，太棒啦！` : streak > 0 ? `已连续 ${streak} 天，继续加油哦` : '今天就开始你的第一个运动项目吧～'}</div>
          </div>
        </div>

        <div class="fitness-overview">
          <div class="fitness-stat float-anim" style="animation-delay:0s">
            <div class="stat-ico">👟</div>
            <div class="stat-value" data-stat="steps">${Utils.num(ios.steps)}</div>
            <div class="stat-label">步数</div>
          </div>
          <div class="fitness-stat float-anim" style="animation-delay:0.1s">
            <div class="stat-ico">🔥</div>
            <div class="stat-value" data-stat="cal">${Utils.num(todayCal)}</div>
            <div class="stat-label">千卡</div>
          </div>
          <div class="fitness-stat float-anim" style="animation-delay:0.2s">
            <div class="stat-ico">⏱️</div>
            <div class="stat-value" data-stat="min">${todayMinutes + ios.duration}</div>
            <div class="stat-label">分钟</div>
          </div>
          <div class="fitness-stat float-anim" style="animation-delay:0.3s">
            <div class="stat-ico">🌟</div>
            <div class="stat-value">${streak}</div>
            <div class="stat-label">连续天</div>
          </div>
        </div>

        <div class="card mb-16" id="fit-sync-card" style="position:relative;overflow:visible">
          <div class="flex-between mb-8">
            <div class="card-title">
              <span class="card-title-ico">📲</span>自动同步（快捷指令）
            </div>
            <span class="text-xs text-muted" id="fit-sync-state">未同步</span>
          </div>
          <div class="text-sm text-muted mb-10">用 iPhone「快捷指令」读取健康步数，自动写入云端，本页实时显示真实数据（不再用模拟值）。</div>
          <button class="btn-soft" id="fit-sync-code">🔑 查看 / 复制同步码</button>
        </div>

        <div class="card mb-16" style="position:relative;overflow:visible">
          <div class="flex-between mb-12">
            <div class="card-title">
              <span class="card-title-ico">📊</span>运动趋势
            </div>
            <div class="flex gap-6">
              <button class="tag ${this.state.view === 'today' ? 'tag-pink' : ''}" data-fv="today">今日</button>
              <button class="tag ${this.state.view === 'week' ? 'tag-pink' : ''}" data-fv="week">本周</button>
            </div>
          </div>
          <div id="fit-chart" class="fitness-chart"></div>
        </div>

        <div class="card mb-16" style="position:relative;overflow:visible">
          <div class="flex-between mb-12">
            <div class="card-title">
              <span class="card-title-ico">🌸</span>今日打卡
            </div>
            <div class="text-sm text-muted" id="fit-progress-text">${checkedToday.size} / ${this.allItems().length}</div>
          </div>
          <div id="fit-today-list"></div>
        </div>

        <div class="card" style="position:relative;overflow:visible">
          <div class="card-title">
            <span class="card-title-ico">📈</span>统计概览
          </div>
          <div class="card-grid-3">
            <div class="card-soft text-center">
              <div class="text-2xl font-bold" style="color:var(--primary-deep)">${this.weekCount()}</div>
              <div class="text-sm text-muted">本周打卡</div>
            </div>
            <div class="card-soft text-center">
              <div class="text-2xl font-bold" style="color:var(--primary-deep)">${this.monthCount()}</div>
              <div class="text-sm text-muted">本月打卡</div>
            </div>
            <div class="card-soft text-center">
              <div class="text-2xl font-bold" style="color:var(--primary-deep)">${this.totalCount()}</div>
              <div class="text-sm text-muted">累计打卡</div>
          </div>
          </div>
        </div>

        <div style="text-align:center;padding:16px;font-size:11px;color:var(--text-muted)">
          数据来源：iOS 健身 + 手动记录 · 已云端同步 🌸
        </div>

        ${this._renderCloudBanner()}
      </div>
    `;

    this.renderTodayList();
    this.renderChart();
    this.bindEvents();
    this.bindCloudBanner();
    // 若已登录云同步，异步拉取真实健康数据覆盖模拟值
    this.refreshHealthFromCloud();
  },

  // 页面顶部云同步横幅卡 — 让用户一眼看到是否已登录 GitHub
  _renderCloudBanner() {
    const sb = window.SupabaseCfg || {};
    const loggedIn = !!(sb.ENABLED && sb.user);
    const email = sb.user?.email || sb.user?.user_metadata?.user_name || sb.user?.user_metadata?.preferred_username || '';
    if (loggedIn) {
      return `
        <div class="cloud-banner-card cloud-logged-in" data-sync-banner>
          <div class="cloud-banner-icon">☁️</div>
          <div class="cloud-banner-text">
            <div class="cloud-banner-title">✅ 已登录 GitHub · 数据自动同步中</div>
            <div class="cloud-banner-sub">账号：${this._esc(email)} · 所有打卡记录将实时备份到云端</div>
          </div>
          <button class="cloud-banner-action is-light" data-cloud-act="manage">⚙️ 管理</button>
        </div>
      `;
    }
    // 未登录或未配置 → 显示显眼的引导
    if (!sb.ENABLED) {
      return `
        <div class="cloud-banner-card" data-sync-banner>
          <div class="cloud-banner-icon">☁️</div>
          <div class="cloud-banner-text">
            <div class="cloud-banner-title">☁️ 启用云同步 · 跨设备永不丢失</div>
            <div class="cloud-banner-sub">首次启用约 5 分钟，之后登录即自动备份</div>
          </div>
          <button class="cloud-banner-action" data-cloud-act="enable">🔧 启用</button>
        </div>
      `;
    }
    return `
      <div class="cloud-banner-card" data-sync-banner style="animation: cloud-breathe 2.2s ease-in-out infinite">
        <div class="cloud-banner-icon">🐙</div>
        <div class="cloud-banner-text">
          <div class="cloud-banner-title">☁️ 一键登录 GitHub · 立即同步数据</div>
          <div class="cloud-banner-sub">授权后所有健身、养生打卡自动备份到云端，换设备也找得回</div>
        </div>
        <button class="cloud-banner-action" data-cloud-act="github">🐙 登录</button>
      </div>
    `;
  },

  _esc(s) { return String(s || '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c])); },

  bindCloudBanner() {
    document.querySelectorAll('[data-cloud-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        // 兼容不同初始化时机：App 可能还没完全注册到 window 上，做 3 重兜底
        const tryOpen = (retriesLeft) => {
          const app = window.App;
          if (app && typeof app.openCloudDialog === 'function') {
            app.openCloudDialog();
            return;
          }
          if (retriesLeft > 0) {
            // 50ms 后重试，最多 10 次（约 500ms 内）
            setTimeout(() => tryOpen(retriesLeft - 1), 50);
          } else {
            // 终极兜底：派发自定义事件，让 App.init() 监听器捕获
            window.dispatchEvent(new CustomEvent('kitty:open-cloud-dialog'));
            Utils.toast('正在准备登录窗口…', 'info');
          }
        };
        tryOpen(10);
      });
    });
  },

  allItems() {
    return DB.get('fitness_custom_items', []);
  },

  renderTodayList() {
    const today = DB.todayKey();
    const records = DB.filterByDate('fitness_records', today);
    const checkedMap = {};
    records.forEach(r => { if (r.checked) checkedMap[r.itemId] = r; });

    const list = document.getElementById('fit-today-list');
    if (!list) return;

    const items = this.allItems();
    if (!items.length) {
      list.innerHTML = Components.empty({ icon: '🌸', title: '还没有运动项目', sub: '点击右上角「＋添加」手动添加你的运动类别吧～', hero: true });
      return;
    }

    list.innerHTML = items.map((item, i) => {
      const r = checkedMap[item._id];
      const isCheck = !!r;
      const icoClass = this.iconClass(item.icon);
      return `
        <div class="fitness-item slide-up" style="animation-delay:${i * 0.04}s" data-id="${item._id}">
          <div class="fitness-item-info">
            <div class="fitness-item-ico ${icoClass}">${item.icon || '🌸'}</div>
            <div>
              <div class="fitness-item-name">${Utils.esc(item.name)}</div>
              <div class="fitness-item-meta">${item.goal ? `目标 ${item.goal}${item.unit || '分钟'}` : '随时开始'}</div>
            </div>
          </div>
          <button class="btn-icon" data-del="${item._id}" title="删除">🗑️</button>
          <button class="checkin-btn ${isCheck ? 'btn-pink btn-primary' : 'btn-ghost btn-primary'}" data-check="${item._id}" style="min-width:72px;padding:6px 14px;font-size:12px">
            ${isCheck ? '✓ 已打卡' : '打卡'}
          </button>
        </div>
      `;
    }).join('');
  },

  iconClass(icon) {
    if (!icon) return 'fitness-ico-default';
    if (icon.includes('瑜伽')) return 'fitness-ico-yoga';
    if (icon.includes('跑') || icon.includes('走') || icon.includes('步')) return 'fitness-ico-run';
    if (icon.includes('舞') || icon.includes('跳')) return 'fitness-ico-dance';
    if (icon.includes('力') || icon.includes('拳')) return 'fitness-ico-strength';
    return 'fitness-ico-default';
  },

  renderChart() {
    const el = document.getElementById('fit-chart');
    if (!el) return;
    if (this.state.view === 'today') {
      // 今日累计分钟数 / 卡路里
      const today = DB.todayKey();
      const records = DB.filterByDate('fitness_records', today);
      const items = records.length ? records : [{ minutes: 0, calories: 0 }];
      el.innerHTML = Utils.barChart(
        items.map((r, i) => ({
          value: r.minutes || 0,
          label: (r.itemName || '项目').slice(0, 3),
          color: ['#b497d6', '#ffc6d5', '#b8d8e8', '#c8e6c9', '#ffd8b5'][i % 5],
        })),
        { width: 320, height: 120 }
      );
    } else {
      // 本周每天
      const days = DB.lastNDays(7);
      const data = days.map(d => {
        const recs = DB.filterByDate('fitness_records', d);
        const total = recs.reduce((s, r) => s + (r.minutes || 0), 0);
        return { value: total, label: d.slice(-2) + '日' };
      });
      el.innerHTML = Utils.barChart(data, { width: 320, height: 120 });
    }
  },

  bindEvents() {
    const root = document.getElementById('app-main');

    // 视图切换
    root.querySelectorAll('[data-fv]').forEach(b => {
      b.addEventListener('click', () => {
        this.state.view = b.dataset.fv;
        this.mount(root);
      });
    });

    // 打卡
    root.querySelectorAll('[data-check]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.check;
        const item = this.allItems().find(x => x._id === id);
        if (!item) return;
        const today = DB.todayKey();
        const records = DB.filterByDate('fitness_records', today);
        const exists = records.find(r => r.itemId === id && r.checked);

        if (exists) {
          // 取消
          DB.removeById('fitness_records', exists._id);
          Utils.toast('已取消打卡');
        } else {
          // 输入时长 / 卡路里
          const r = await Components.form({
            title: `打卡 · ${item.name}`,
            fields: [
              { key: 'minutes', label: '运动时长（分钟）', type: 'number', placeholder: '30', value: item.goal || 30, required: true },
              { key: 'calories', label: '消耗卡路里（千卡）', type: 'number', placeholder: '120', value: 120 },
            ],
            okText: '完成打卡 ✓',
          });
          if (r) {
            DB.push('fitness_records', {
              itemId: id,
              itemName: item.name,
              icon: item.icon,
              minutes: parseInt(r.minutes) || 0,
              calories: parseInt(r.calories) || 0,
              date: today,
              checked: true,
            });
            Utils.toast('打卡成功 🌸', 'success');
            Utils.burst(b, ['🌸', '💖', '✨', '🌟']);
            this.mount(root);
          }
        }
      });
    });

    // 删除自定义
    root.querySelectorAll('[data-del]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.del;
        const ok = await Components.confirm({
          title: '删除运动项目',
          message: '删除后将无法恢复，确定要删除吗？',
          okText: '删除',
          danger: true,
        });
        if (ok) {
          const items = DB.get('fitness_custom_items', []);
          DB.set('fitness_custom_items', items.filter(x => x._id !== id));
          Utils.toast('已删除');
          this.mount(root);
        }
      });
    });

    // 添加自定义
    document.getElementById('fit-add')?.addEventListener('click', async () => {
      const r = await Components.form({
        title: '添加自定义运动项目',
        fields: [
          { key: 'name', label: '项目名称', placeholder: '例如：普拉提', required: true },
          { key: 'icon', label: '表情图标', placeholder: '🧘‍♀️', value: '🌸' },
          { key: 'goal', label: '目标时长（分钟）', type: 'number', placeholder: '30', value: 30 },
        ],
        okText: '添加',
      });
      if (r && r.name) {
        const items = DB.get('fitness_custom_items', []);
        items.push({
          _id: Utils.uid(),
          name: r.name,
          icon: r.icon || '🌸',
          goal: parseInt(r.goal) || 30,
          type: 'custom',
        });
        DB.set('fitness_custom_items', items);
        Utils.toast('已添加新项目');
        this.mount(root);
      }
    });

    // 日历视图
    document.getElementById('fit-cal')?.addEventListener('click', () => {
      this.showCalendar();
    });

    // iOS 同步：从云端拉取真实健康数据
    document.getElementById('fit-sync')?.addEventListener('click', async () => {
      if (!SupabaseCfg.ENABLED || !SupabaseCfg.user) {
        Utils.toast('请先在设置里登录云同步（GitHub）', 'info');
        return;
      }
      Utils.toast('正在从云端拉取健康数据...');
      await this.refreshHealthFromCloud();
      Utils.toast('同步完成 ✓', 'success');
    });

    // 查看 / 复制同步码
    document.getElementById('fit-sync-code')?.addEventListener('click', async () => {
      if (!SupabaseCfg.ENABLED || !SupabaseCfg.user) {
        Utils.toast('请先在设置里登录云同步（GitHub）', 'info');
        return;
      }
      const token = await this.ensureSyncToken();
      if (!token) { Utils.toast('生成同步码失败', 'error'); return; }
      const apiUrl = (SupabaseCfg.URL || '').replace(/\/+$/, '') + '/functions/v1/sync-health';
      const m = Components.modal({
        title: '📲 自动同步设置',
        body: `
          <div class="text-sm mb-10">把下面两样填进你 iPhone 快捷指令的「获取 URL 内容」里（详见聊天里的配置说明）：</div>
          <div style="margin-bottom:10px">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">① 接口地址（URL）</div>
            <div style="background:var(--bg-soft,#f6f1fb);border:1px solid var(--border,#eee);border-radius:10px;padding:10px;font-family:monospace;font-size:12px;word-break:break-all">${this._esc(apiUrl)}</div>
          </div>
          <div style="margin-bottom:10px">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">② 同步码（token，一人一个，切勿外泄）</div>
            <div style="background:var(--bg-soft,#f6f1fb);border:1px solid var(--border,#eee);border-radius:10px;padding:10px;font-family:monospace;font-size:12px;word-break:break-all" id="sync-token-val">${this._esc(token)}</div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);line-height:1.6">
            快捷指令请求体示例：<br>
            <code>{"token":"上面的码","date":"今天日期","steps":健康样本值,"distance_km":距离,"calories":卡路里,"active_minutes":运动分钟}</code>
          </div>
          <div class="flex gap-8 mt-12">
            <button class="btn-primary" id="sync-copy">📋 复制接口+同步码</button>
            <button class="btn-soft" id="sync-regen">🔄 重新生成</button>
          </div>
        `,
      });
      const copyBtn = document.getElementById('sync-copy');
      const tokenValEl = document.getElementById('sync-token-val');
      copyBtn?.addEventListener('click', () => {
        const txt = '接口地址：' + apiUrl + '\n同步码：' + token + '\n请求体示例：{"token":"' + token + '","date":"' + DB.todayKey() + '","steps":步数}';
        try { navigator.clipboard?.writeText(txt); } catch (e) {}
        Utils.toast('已复制，去快捷指令粘贴', 'success');
      });
      document.getElementById('sync-regen')?.addEventListener('click', async () => {
        const newToken = await this.regenSyncToken();
        if (newToken && tokenValEl) {
          tokenValEl.textContent = newToken;
          Utils.toast('已重新生成，请重新复制', 'success');
        } else {
          Utils.toast('生成失败', 'error');
        }
      });
    });
  },

  showCalendar() {
    const records = DB.get('fitness_records', []);
    const checkedDays = [...new Set(records.filter(r => r.checked).map(r => r.date))];
    const today = new Date();
    let viewY = today.getFullYear();
    let viewM = today.getMonth() + 1;
    let viewRecords = [...records];

    const render = () => {
      body.innerHTML = `
        ${Components.calendar({ year: viewY, month: viewM, checkedDates: checkedDays })}
        <div style="margin-top:12px;text-align:center;font-size:12px;color:var(--text-muted)">
          过去 30 天打卡 ${checkedDays.length} 天
        </div>
        <div style="margin-top:12px;max-height:240px;overflow-y:auto">
          ${viewRecords.filter(r => r.date.startsWith(`${viewY}-${String(viewM).padStart(2, '0')}`)).map(r => `
            <div class="fitness-item" style="margin-bottom:6px">
              <div class="fitness-item-info">
                <div class="fitness-item-ico fitness-ico-default">${r.icon || '🌸'}</div>
                <div>
                  <div class="fitness-item-name">${Utils.esc(r.itemName)}</div>
                  <div class="fitness-item-meta">${r.date} · ${r.minutes || 0} 分钟</div>
                </div>
              </div>
            </div>
          `).join('') || '<div class="empty-state"><span class="empty-ico">🌸</span><div class="empty-title">本月还没有记录</div></div>'}
        </div>
      `;
      body.querySelectorAll('[data-nav]').forEach(b => {
        b.addEventListener('click', () => {
          if (b.dataset.nav === 'prev') viewM--;
          else viewM++;
          if (viewM < 1) { viewM = 12; viewY--; }
          if (viewM > 12) { viewM = 1; viewY++; }
          render();
        });
      });
    };

    const m = Components.modal({
      title: '打卡日历',
      body: '<div id="cal-body"></div>',
    });
    const body = document.getElementById('cal-body');
    render();
  },

  weekCount() {
    const days = DB.lastNDays(7);
    const records = DB.get('fitness_records', []);
    return records.filter(r => days.includes(r.date) && r.checked).length;
  },

  monthCount() {
    const today = new Date();
    const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    return DB.get('fitness_records', []).filter(r => r.date.startsWith(monthPrefix) && r.checked).length;
  },

  totalCount() {
    return DB.get('fitness_records', []).filter(r => r.checked).length;
  },
};

window.Fitness = Fitness;