/* ============================================================
   Hello Kitty 治愈工作台 — 主应用控制器
   ============================================================ */

const App = {
  currentPage: 'fitness',

  init() {
    this.setupTheme();
    this.setupPassword();
    this.setupNav();
    this.setupHeader();
    this.setupMore();
    this.setupShortcuts();
    this.setupCloudSync();

    // 监听自定义事件（兜底：fitness 模块若在 window.App 暴露前就点击了云同步按钮）
    window.addEventListener('kitty:open-cloud-dialog', () => {
      this.openCloudDialog();
    });

    // 默认页面
    this.go(this.currentPage);

    // 暴露给开发使用
    window.Kitty = {
      DB,
      Utils,
      Components,
      SupabaseCfg,
      Fitness,
      Wellness,
      Study,
      Fortune,
      News,
      Bookkeeping,
      App,
    };
    // 暴露 App 全局引用，让其他模块（如 fitness 的云同步横幅卡按钮）可以调用其方法
    window.App = this;
  },

  // 主题切换
  setupTheme() {
    // 主题是本机偏好，单独存在 local_theme（不在云端 keys 中），
    // 不会被云同步覆盖/污染，跨设备各自独立
    const apply = (theme) => {
      document.body.dataset.theme = theme;
      document.querySelectorAll('[id$="-theme-toggle"]').forEach(b => {
        b.textContent = theme === 'dark' ? '☀️' : '🌗';
      });
    };

    const theme = DB.get('local_theme', null) || 'light';
    apply(theme);

    const toggle = () => {
      const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      DB.set('local_theme', next);
    };
    document.getElementById('mobile-theme-toggle')?.addEventListener('click', toggle);
    document.getElementById('pc-theme-toggle')?.addEventListener('click', toggle);
  },

  // 密码锁
  setupPassword() {
    const lockScreen = document.getElementById('lock-screen');
    const settings = DB.get('settings', {});
    const stored = DB.get('password');

    if (!stored) {
      // 首次访问 → 直接进入（无密码状态）
      lockScreen.classList.add('hidden');
      return;
    }

    lockScreen.classList.remove('hidden');

    const tryUnlock = () => {
      const v = document.getElementById('lock-password').value;
      if (v === stored) {
        lockScreen.classList.add('hidden');
        Utils.toast('欢迎回来～ 💖', 'success');
      } else {
        document.getElementById('lock-error').classList.remove('hidden');
        const input = document.getElementById('lock-password');
        input.value = '';
        input.focus();
        setTimeout(() => document.getElementById('lock-error').classList.add('hidden'), 2000);
      }
    };

    document.getElementById('lock-unlock').addEventListener('click', tryUnlock);
    document.getElementById('lock-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') tryUnlock();
    });
    document.getElementById('lock-skip')?.addEventListener('click', () => {
      lockScreen.classList.add('hidden');
    });
  },

  // 路由
  setupNav() {
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.go(el.dataset.page);
        // 关闭移动端菜单
        document.getElementById('mobile-more-menu')?.classList.add('hidden');
      });
    });
  },

  // 顶部栏
  setupHeader() {
    const greet = document.getElementById('mobile-greet');
    const date = document.getElementById('mobile-date');
    if (greet) greet.textContent = Utils.greeting();
    if (date) date.textContent = Utils.formatToday();

    // 导出按钮
    document.getElementById('pc-export')?.addEventListener('click', () => this.exportData());
    document.getElementById('mobile-more-menu')?.querySelector('[data-action="export"]')?.addEventListener('click', () => {
      document.getElementById('mobile-more-menu').classList.add('hidden');
      this.exportData();
    });

    // 密码锁按钮
    document.getElementById('pc-lock')?.addEventListener('click', () => this.setupPasswordDialog());
    document.getElementById('mobile-more-menu')?.querySelector('[data-action="lock"]')?.addEventListener('click', () => {
      document.getElementById('mobile-more-menu').classList.add('hidden');
      this.setupPasswordDialog();
    });
  },

  // 更多菜单
  setupMore() {
    const menu = document.getElementById('mobile-more-menu');
    document.getElementById('mobile-more')?.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });

    // 主题切换
    menu?.querySelector('[data-action="theme"]')?.addEventListener('click', () => {
      menu.classList.add('hidden');
      const cur = document.body.dataset.theme;
      document.body.dataset.theme = cur === 'dark' ? 'light' : 'dark';
      DB.set('settings', { ...(DB.get('settings', {})), theme: document.body.dataset.theme });
      document.querySelectorAll('[id$="-theme-toggle"]').forEach(b => {
        b.textContent = document.body.dataset.theme === 'dark' ? '☀️' : '🌗';
      });
    });

    // 关于
    menu?.querySelector('[data-action="about"]')?.addEventListener('click', () => {
      menu.classList.add('hidden');
      Components.modal({
        title: '关于 Hello Kitty 治愈工作台',
        body: `
          <div class="text-center mb-16">
            ${Utils.kittyImg({ size: 'card', module: 'default' })}
          </div>
          <p style="line-height:1.7;color:var(--text-secondary);font-size:14px">
            这是为热爱生活的你打造的<strong style="color:var(--primary-deep)">全能自律工作台</strong>。
            集健身打卡、养生打卡、学习收获、每日运势、信息资讯于一体，
            拥有 Hello Kitty 治愈梦幻风的视觉体验，支持本地存储 + 云端同步。
          </p>
          <div class="mt-12 text-sm text-muted">
            <div>版本：V2.0.0 · 全程 WorkBuddy 设计 + 开发</div>
            <div class="mt-4">每日内容：沪教牛津版 · 数据来源：模拟</div>
          </div>
        `,
      });
    });

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!menu?.contains(e.target) && !document.getElementById('mobile-more')?.contains(e.target)) {
        menu?.classList.add('hidden');
      }
    });
  },

  // 快捷键
  setupShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Esc 关闭 modal
      if (e.key === 'Escape') {
        document.querySelector('.modal-backdrop')?.remove();
      }
      // 数字键切换 tab
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.target.matches('input, textarea, select')) {
        const map = { '1': 'fitness', '2': 'wellness', '3': 'study', '4': 'fortune', '5': 'news', '6': 'bookkeeping' };
        if (map[e.key]) this.go(map[e.key]);
      }
    });
  },

  // 切换页面
  go(page) {
    this.currentPage = page;
    document.querySelectorAll('[data-page]').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    const main = document.getElementById('app-main');
    main.scrollTop = 0;
    switch (page) {
      case 'fitness': Fitness.mount(main); break;
      case 'wellness': Wellness.mount(main); break;
      case 'study': Study.mount(main); break;
      case 'fortune': Fortune.mount(main); break;
      case 'news': News.mount(main); break;
      case 'bookkeeping': Bookkeeping.mount(main); break;
    }
    // 更新 hash
    if (history.pushState) history.replaceState(null, '', '#' + page);
  },

  // 导出数据
  exportData() {
    const data = DB.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kitty-backup-${DB.todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    Utils.toast('已导出全部数据 🌸', 'success');
  },

  // 导入数据
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          const count = DB.importAll(data);
          Utils.toast(`已导入 ${count} 项数据 💖`, 'success');
          this.go(this.currentPage);
        } catch (err) {
          Utils.toast('文件格式错误', 'error');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  },

  // 密码设置
  setupPasswordDialog() {
    const stored = DB.get('password');
    const isSet = !!stored;
    Components.modal({
      title: isSet ? '修改密码锁' : '设置密码锁',
      body: `
        <p class="mb-12 text-sm text-secondary">
          ${isSet ? '请先输入旧密码' : '设置一个 4-12 位密码，下次进入时需要解锁'}
        </p>
        ${isSet ? `
          <label class="text-sm text-secondary mb-4" style="display:block">旧密码</label>
          <input id="old-pwd" type="password" class="input mb-12" placeholder="旧密码" />
        ` : ''}
        <label class="text-sm text-secondary mb-4" style="display:block">新密码</label>
        <input id="new-pwd" type="password" class="input mb-12" placeholder="4-12 位" />
        <label class="text-sm text-secondary mb-4" style="display:block">确认密码</label>
        <input id="new-pwd2" type="password" class="input" placeholder="再次输入" />
      `,
      footer: `
        ${isSet ? `<button class="btn-link" data-act="clear">清除密码</button>` : ''}
        <button class="btn-ghost btn-primary" data-act="cancel">取消</button>
        <button class="btn-primary" data-act="ok">保存</button>
      `,
    });
    const m = document.querySelector('.modal-backdrop');
    m.querySelector('[data-act="cancel"]').addEventListener('click', () => m.remove());
    m.querySelector('[data-act="clear"]')?.addEventListener('click', () => {
      const v = m.querySelector('#old-pwd').value;
      if (v === stored) {
        DB.remove('password');
        Utils.toast('密码已清除');
        m.remove();
      } else {
        Utils.toast('旧密码错误', 'error');
      }
    });
    m.querySelector('[data-act="ok"]').addEventListener('click', () => {
      const old = m.querySelector('#old-pwd')?.value;
      const v1 = m.querySelector('#new-pwd').value;
      const v2 = m.querySelector('#new-pwd2').value;
      if (isSet && old !== stored) return Utils.toast('旧密码错误', 'error');
      if (v1.length < 4 || v1.length > 12) return Utils.toast('密码长度需 4-12 位', 'warning');
      if (v1 !== v2) return Utils.toast('两次密码不一致', 'warning');
      DB.set('password', v1);
      Utils.toast('密码已保存，下次进入需要解锁', 'success');
      m.remove();
    });
  },

  // ============================================================
  // 云同步：初始化 + 登录入口 + 状态指示
  // ============================================================
  async setupCloudSync() {
    DB._initNetworkWatcher();

    // 初始化 Supabase 客户端（如果凭据已配置）
    await SupabaseCfg.init();
    if (SupabaseCfg.lastError) {
      Utils.toast('云同步诊断：' + SupabaseCfg.lastError, 'error');
    }

    // 监听登录状态变化 → 同步状态徽章 + 登录后先拉云端再推本地（顺序执行，杜绝竞态）
    const refreshBadge = () => this.refreshSyncBadge();
    SupabaseCfg.onAuthChange((u) => {
      refreshBadge();
      if (u) {
        // 关闭可能已打开的登录弹窗（OAuth 回调后会话建立但弹窗仍显示"未登录"的时序竞态）
        const modal = document.querySelector('.modal-backdrop');
        if (modal) modal.remove();
        Utils.toast('GitHub 登录成功 ✅ 正在同步数据...', 'success');
        // 关键：先拉取云端数据到本地，拉完后再推送本地数据
        // 这样 iOS/新设备首次登录时，本地空数据不会先覆盖云端
        DB.pullFromCloud().then((merged) => {
          if (merged > 0) {
            Utils.toast(`已从云端恢复 ${merged} 项数据 💖`, 'success');
            this.go(this.currentPage);
          }
          // 拉取完成后才推送本地数据（此时本地已含云端数据，推送不会覆盖）
          DB.pushAllToCloud().then((n) => {
            if (n > 0) Utils.toast(`已同步 ${n} 项本地数据到云端 ☁️`, 'success');
            this.refreshSyncBadge();
          });
        });
      }
    });
    DB.onSyncChange(refreshBadge);

    // 已登录则拉取云端数据，并把本地已有数据推送到云端（GitHub OAuth 登录也走这里）
    if (SupabaseCfg.user) {
      const merged = await DB.pullFromCloud();
      if (merged > 0) {
        Utils.toast(`已从云端恢复 ${merged} 项数据 💖`, 'success');
        this.go(this.currentPage);
      }
      // 关键修复：登录后把本地已有数据（含登录前/登录瞬间打卡的记录）全量推送到云端
      const pushed = await DB.pushAllToCloud();
      if (pushed > 0 && merged === 0) {
        Utils.toast(`已同步 ${pushed} 项本地数据到云端 ☁️`, 'success');
      }
    }

    // 在 PC 顶栏和移动菜单插入云同步入口
    this.injectCloudEntry();

    // 首次刷新状态徽章
    refreshBadge();

    // 云同步已启用但未登录 → 提示用户登录可恢复云端数据（iOS/新设备首次打开时尤其重要）
    if (SupabaseCfg.ENABLED && !SupabaseCfg.user) {
      setTimeout(() => {
        Utils.toast('☁️ 点击云同步登录，可恢复你的数据', 'info');
      }, 1500);
    }
  },

  // 刷新同步状态徽章
  refreshSyncBadge() {
    document.querySelectorAll('[data-sync-badge]').forEach(el => {
      const status = SupabaseCfg.ENABLED ? (SupabaseCfg.user ? DB.syncStatus : 'guest') : 'disabled';
      el.className = 'sync-badge sync-' + status;
      el.dataset.status = status;
      el.innerHTML = this._syncBadgeHtml(status);
    });
  },

  _syncBadgeHtml(status) {
    const iconMap = {
      disabled: '☁️',
      guest: '☁️',
      idle: '☁️',
      syncing: '🔄',
      success: '✅',
      error: '⚠️',
      offline: '📴',
    };
    const textMap = {
      disabled: '本地',
      guest: '登录同步',
      idle: '已同步',
      syncing: '同步中',
      success: '已同步',
      error: '同步失败',
      offline: '离线',
    };
    return `<span class="sync-ico">${iconMap[status] || '☁️'}</span>${textMap[status] || ''}`;
  },

  // 注入云同步入口（PC 顶栏 + 移动更多菜单）
  injectCloudEntry() {
    // PC 顶栏
    const pcFooter = document.querySelector('.pc-footer');
    if (pcFooter && !document.getElementById('pc-cloud')) {
      const btn = document.createElement('button');
      btn.id = 'pc-cloud';
      btn.className = 'pc-icon-btn';
      btn.title = '云同步';
      btn.innerHTML = `<span data-sync-badge class="sync-badge">${this._syncBadgeHtml(SupabaseCfg.status())}</span>`;
      btn.addEventListener('click', () => this.openCloudDialog());
      pcFooter.insertBefore(btn, pcFooter.firstChild);
    }
    // 移动更多菜单
    const menu = document.getElementById('mobile-more-menu');
    if (menu && !menu.querySelector('[data-action="cloud"]')) {
      const item = document.createElement('button');
      item.dataset.action = 'cloud';
      item.innerHTML = `<span data-sync-badge class="sync-badge">${this._syncBadgeHtml(SupabaseCfg.status())}</span> 云同步`;
      item.addEventListener('click', () => {
        menu.classList.add('hidden');
        this.openCloudDialog();
      });
      // 插入到"关于"之前
      const about = menu.querySelector('[data-action="about"]');
      if (about) menu.insertBefore(item, about);
      else menu.appendChild(item);
    }
  },

  // 云同步弹窗
  async openCloudDialog() {
    // 三种状态：未配置 / 未登录 / 已登录
    if (!SupabaseCfg.ENABLED) {
      // 未配置 → 详细启用步骤 + 一键保存凭据
      Components.modal({
        title: '☁️ 启用云同步',
        body: `
          <p style="margin:0 0 10px;font-size:14px;color:var(--text-primary)">
            <strong style="color:var(--primary-deep)">3 步启用（约 5 分钟，账户即用 GitHub 登录）</strong>
          </p>
          <ol style="margin:0 0 12px;padding-left:18px;line-height:1.8;font-size:13px;color:var(--text-secondary)">
            <li>打开 <a href="https://supabase.com" target="_blank" style="color:var(--primary);text-decoration:underline">supabase.com</a>，用 <b>GitHub 账号</b> 登录 → <b>New project</b>（记下数据库密码）。</li>
            <li>左侧 <b>Project Settings → API</b>，复制 <b>Project URL</b> 与 <b>anon public key</b>，填到下方保存即可自动启用。</li>
            <li>左侧 <b>SQL Editor</b> 新建查询，粘贴并执行项目里的 <code style="background:rgba(0,0,0,0.05);padding:1px 5px;border-radius:4px">schema.sql</code> 建表；再在 <b>Authentication → Providers</b> 开启 <b>GitHub</b>（回调填 <code style="background:rgba(0,0,0,0.05);padding:1px 5px;border-radius:4px">https://&lt;ref&gt;.supabase.co/auth/v1/callback</code>），并在 <b>URL Configuration</b> 的 Redirect URLs 增加你的站点地址。</li>
          </ol>
          <div style="background:rgba(255,143,188,0.08);border-radius:12px;padding:12px;margin-bottom:10px">
            <label class="text-sm" style="display:block;color:var(--text-secondary);margin-bottom:4px">Project URL</label>
            <input id="cfg-url" class="input mb-8" placeholder="https://xxxx.supabase.co" />
            <label class="text-sm" style="display:block;color:var(--text-secondary);margin-bottom:4px">anon public key</label>
            <input id="cfg-key" class="input mb-8" placeholder="eyJhbGciOi..." />
            <div id="cfg-err" class="text-sm" style="color:#e74c3c;min-height:16px;margin-bottom:6px"></div>
            <button class="btn-primary btn-block" data-act="save-cfg">💾 保存并启用云同步</button>
          </div>
          <p class="text-sm text-muted">数据只存在你自己的 Supabase 项目里；未配置时一切数据仍安全保存在浏览器本地，可离线使用。</p>
        `,
        footer: `<button class="btn-ghost btn-primary" data-act="close">关闭</button>`,
      });
      const m = document.querySelector('.modal-backdrop');
      m.querySelector('[data-act="close"]').addEventListener('click', () => m.remove());
      m.querySelector('[data-act="save-cfg"]').addEventListener('click', async () => {
        const errEl = m.querySelector('#cfg-err');
        errEl.textContent = '';
        const url = m.querySelector('#cfg-url').value.trim();
        const key = m.querySelector('#cfg-key').value.trim();
        Utils.toast('正在连接云同步...', 'info');
        const { error } = await SupabaseCfg.saveConfig(url, key);
        if (error) { errEl.textContent = error.message || '启用失败'; return; }
        m.remove();
        Utils.toast('云同步已启用 ✅ 请用 GitHub 登录', 'success');
        this.refreshSyncBadge();
        this.openCloudDialog(); // ENABLED 后进入登录流程
      });
      return;
    }

    if (!SupabaseCfg.user) {
      // 未登录 → 显示登录/注册表单
      this.openAuthDialog();
      return;
    }

    // 已登录 → 显示同步状态
    const cloud = await DB.pullFromCloud();
    Components.modal({
      title: '☁️ 云同步',
      body: `
        <div class="text-center mb-16">
          <div style="font-size:36px">☁️</div>
          <p style="margin:8px 0;color:var(--text-secondary);font-size:14px">
            已登录：<strong>${Utils.esc(SupabaseCfg.user.email || SupabaseCfg.user.user_metadata?.user_name || 'GitHub 用户')}</strong>
          </p>
        </div>
        <div class="card mb-12" style="padding:12px">
          <div class="flex-between mb-8">
            <span class="text-sm text-secondary">当前状态</span>
            <span data-sync-badge class="sync-badge sync-${DB.syncStatus}">${this._syncBadgeHtml(DB.syncStatus)}</span>
          </div>
          <div class="flex-between mb-8">
            <span class="text-sm text-secondary">网络</span>
            <span class="text-sm">${navigator.onLine ? '🟢 在线' : '🔴 离线'}</span>
          </div>
        </div>
        <div class="flex gap-8" style="gap:8px">
          <button class="btn-primary" data-act="sync" style="flex:1">🔄 立即同步</button>
          <button class="btn-ghost" data-act="logout" style="flex:1">退出登录</button>
        </div>
      `,
      footer: `<button class="btn-ghost btn-primary" data-act="close">关闭</button>`,
    });
    const m = document.querySelector('.modal-backdrop');
    m.querySelector('[data-act="close"]').addEventListener('click', () => m.remove());
    m.querySelector('[data-act="logout"]').addEventListener('click', async () => {
      await SupabaseCfg.signOut();
      m.remove();
      Utils.toast('已退出云同步', 'success');
    });
    m.querySelector('[data-act="sync"]').addEventListener('click', async () => {
      Utils.toast('开始全量同步...', 'info');
      const n = await DB.pushAllToCloud();
      Utils.toast(`已推送 ${n} 项到云端 ☁️`, 'success');
      this.refreshSyncBadge();
    });
  },

  // 登录/注册弹窗
  openAuthDialog() {
    Components.modal({
      title: '☁️ 云同步登录',
      body: `
        <div id="auth-form">
          <div class="text-xs" style="background:rgba(255,143,188,0.08);border-radius:10px;padding:8px 10px;margin-bottom:10px;color:var(--text-muted);word-break:break-all">
            🔧 诊断：SDK <b>${window.supabase ? '✅' : '❌'}</b> · 云同步 <b>${SupabaseCfg.ENABLED ? '已启用' : '未启用'}</b>${SupabaseCfg.lastError ? ' · ⚠️ ' + Utils.esc(SupabaseCfg.lastError) : ''}
          </div>
          <p class="mb-12 text-sm text-secondary">推荐用 GitHub 一键登录（你的 Supabase 账户即 GitHub 账号）；也可下方用邮箱注册。</p>
          <button class="btn-primary btn-block mb-12" data-act="github" style="background:linear-gradient(135deg,#24292e,#404a56);color:#fff">🐙 使用 GitHub 登录</button>
          ${navigator.standalone ? '<div style="background:rgba(255,179,71,0.14);border:1px solid rgba(255,179,71,0.45);border-radius:10px;padding:8px 10px;margin-bottom:12px;font-size:12px;color:#9a6a00;line-height:1.5">📱 你正从主屏 App 打开：受 iOS 限制，点 GitHub 会跳到 Safari 且<b>无法回跳本 App</b>，登录态会留在 Safari 而非主屏 App。请直接用下方「邮箱 + 密码」登录（全程在 App 内，数据可正常同步）；若要用 GitHub 账号，请在 <b>Safari</b> 浏览器中打开本页登录。</div>' : ''}
          <div style="text-align:center;color:var(--text-muted);font-size:12px;margin-bottom:10px">— 或使用邮箱 —</div>
          <label class="text-sm text-secondary mb-4" style="display:block">邮箱</label>
          <input id="auth-email" type="email" class="input mb-12" placeholder="your@email.com" />
          <label class="text-sm text-secondary mb-4" style="display:block">密码</label>
          <input id="auth-pwd" type="password" class="input mb-12" placeholder="至少 6 位" />
          <div id="auth-error" class="text-sm" style="color:#e74c3c;min-height:18px;margin-bottom:8px"></div>
          <div class="flex gap-8" style="gap:8px">
            <button class="btn-primary" data-act="signup" style="flex:1">注册新账号</button>
            <button class="btn-ghost btn-primary" data-act="signin" style="flex:1">登录</button>
          </div>
        </div>
      `,
    });
    const m = document.querySelector('.modal-backdrop');
    const showError = (msg) => {
      const el = m.querySelector('#auth-error');
      el.textContent = msg;
    };
    const getCreds = () => ({
      email: m.querySelector('#auth-email').value.trim(),
      password: m.querySelector('#auth-pwd').value,
    });
    const doAuth = async (act) => {
      const { email, password } = getCreds();
      if (!email || !password) return showError('请填写邮箱和密码');
      if (password.length < 6) return showError('密码至少 6 位');
      showError('');
      const fn = act === 'signup' ? SupabaseCfg.signUp : SupabaseCfg.signIn;
      const { error } = await fn.call(SupabaseCfg, email, password);
      if (error) {
        return showError(error.message || '操作失败');
      }
      Utils.toast(act === 'signup' ? '注册成功 ✅' : '登录成功 💖', 'success');
      // 登录后推送本地数据到云端
      if (act === 'signin') {
        const pulled = await DB.pullFromCloud();
        if (pulled === 0) {
          await DB.pushAllToCloud();
        }
        this.go(this.currentPage);
      } else {
        await DB.pushAllToCloud();
      }
      m.remove();
      this.refreshSyncBadge();
    };
    m.querySelector('[data-act="signup"]').addEventListener('click', () => doAuth('signup'));
    m.querySelector('[data-act="signin"]').addEventListener('click', () => doAuth('signin'));
    // GitHub OAuth 登录（重定向到 GitHub 授权）
    m.querySelector('[data-act="github"]').addEventListener('click', async () => {
      Utils.toast('正在跳转到 GitHub 授权…', 'info');
      const { error } = await SupabaseCfg.signInWithGitHub();
      if (error) {
        showError(error.message || 'GitHub 登录启动失败（请确认已在 Supabase 开启 GitHub Provider 并配置回调）');
      }
      // 成功时浏览器会被重定向到 GitHub，授权后自动回到本应用
    });
    // Enter 提交
    [m.querySelector('#auth-email'), m.querySelector('#auth-pwd')].forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doAuth('signin');
      });
    });
  },
};

// 启动
document.addEventListener('DOMContentLoaded', () => App.init());