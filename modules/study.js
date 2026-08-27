/* ============================================================
   模块三：学习收获
   权威英语词典词库（ECDICT 英汉词典 · 牛津 3000 核心词 · 成人难度）
   每日：10 个新词 · 答错 2 次进入待复习词库
   单词 quiz：选选项 → 点「确认」→ 答错/答对
   ============================================================ */

const Study = {
  state: {
    tab: 'word', // word / listen / speak / review
  },

  /* ---------- 权威词典词库（ECDICT 英汉词典 · 牛津 3000 核心词 · 成人难度） ---------- */
  dictMeta: {
    version: 'D2.0.0',
    name: '权威英语词典词库',
    source: 'ECDICT 英汉词典 · 牛津 3000 核心词（成人难度）',
    total: 0,                 // 运行时由 buildPool 填充
    lastSyncDate: '2026-08-27',
    autoSync: true,           // 启动时检测版本
  },

  DAILY_WORDS: 10,

  /* ---------- 词库（DICT_BANK 已按词频排序 = 由易到难） ---------- */
  flatPool: null,
  buildPool() {
    if (!this.flatPool) {
      const bank = (window.DICT_BANK || []).map((w, i) => ({
        word: w.word,
        phonetic: w.phonetic,
        pos: w.pos || '',
        meaning: w.meaning,
        example: '',
        exampleZh: '',
        stage: '词典',
        stageIdx: i,
      }));
      this.flatPool = bank;
      this.dictMeta.total = bank.length;
    }
    return this.flatPool;
  },



  /* ---------- 词典词库同步（启动时检查版本） ---------- */
  checkDictSync() {
    const saved = DB.get('study_dict_meta', null);
    const current = this.dictMeta;
    if (!saved) {
      // 首次访问
      DB.set('study_dict_meta', { ...current, firstInstalled: DB.todayKey() });
      return { status: 'first', meta: current };
    }
    if (saved.version !== current.version) {
      // 版本变化 → 标记待同步
      DB.set('study_dict_meta', { ...current, upgradedAt: DB.todayKey(), oldVersion: saved.version });
      return { status: 'upgraded', meta: current, oldVersion: saved.version };
    }
    // 同版本：仅更新最近同步日期
    DB.set('study_dict_meta', { ...saved, lastSyncDate: DB.todayKey() });
    return { status: 'current', meta: saved };
  },

  /* ---------- 学习进度核心 ---------- */
  startDate() {
    let s = DB.get('study_start_date');
    if (!s) {
      s = DB.todayKey();
      DB.set('study_start_date', s);
    }
    return s;
  },

  dayIndex() {
    const start = new Date(this.startDate() + 'T00:00:00');
    const now = new Date(DB.todayKey() + 'T00:00:00');
    return Math.max(0, Math.floor((now - start) / 86400000));
  },

  todayWords() {
    return this.batchFor('study_word_batch', this.buildPool(), this.DAILY_WORDS, 'word', 'study_word_done');
  },

  todayStage() {
    const total = this.buildPool().length;
    if (total === 0) return '⚠️ 词库未加载';
    const done = this.doneWordsSet().size;
    if (done >= total) return '全部完成 🎉';
    return '已学 ' + done + ' / ' + total + ' 词';
  },

  // 通用批次：从"未做过的"项目里按词频顺序取 daily 个；同一天稳定不重排
  // 做过的不再出现；词库做遍后自然结束（不轮转）；全部做完返回空
  batchFor(prefix, pool, daily, idKey, doneKey) {
    const key = prefix + '_batch';
    const today = DB.todayKey();
    let batch = DB.get(key, null);
    const doneSet = new Set(DB.get(doneKey, []).map(r => r[idKey]));
    if (!batch || batch.date !== today) {
      const remaining = pool.filter(x => !doneSet.has(x[idKey]));
      batch = { date: today, ids: remaining.slice(0, daily).map(x => x[idKey]) };
      DB.set(key, batch);
    }
    return batch.ids.map(id => pool.find(x => x[idKey] === id)).filter(Boolean);
  },

  doneWordsSet() {
    return new Set(DB.get('study_word_done', []).map(r => r.word));
  },

  wrongMap() {
    const m = {};
    DB.get('study_word_wrong', []).forEach(x => { m[x.word] = x.count || 0; });
    return m;
  },

  reviewWords() {
    const wrongs = this.wrongMap();
    const done = this.doneWordsSet();
    return this.buildPool().filter(w => wrongs[w.word] >= 2 && !done.has(w.word));
  },


  streakDays() {
    const dates = new Set([
      ...DB.get('study_word_done', []).map(r => r.date),
      ...DB.get('study_checkin', []).map(r => r.date),
    ]);
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (dates.has(key)) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  },

  /* ---------- 页面 ---------- */
  mount(container) {
    // 教材自动同步检查
    const syncResult = this.checkDictSync();
    this.buildPool();
    if (syncResult.status === 'upgraded') {
      Utils.toast(`词典词库已更新到 ${syncResult.meta.version} 🎉`, 'success');
    }

    const today = DB.todayKey();
    const words = this.todayWords();
    const doneSet = this.doneWordsSet();
    const wordDoneToday = words.filter(w => doneSet.has(w.word)).length;
    const reviews = this.reviewWords();
    const books = DB.get('study_books', []);
    const readingStats = this.readingStats();
    const dayNo = this.dayIndex() + 1;
    const stage = this.todayStage();
    const meta = this.dictMeta;

    const wordAllDone = wordDoneToday >= this.DAILY_WORDS;

    container.innerHTML = `
      <div class="page">
        ${Components.banner({
          module: 'study',
          title: '学习收获',
          sub: `第 ${dayNo} 天 · ${stage}`,
          actions: `
            <span class="tag tag-pink" style="margin-left:0">🔥 连续 ${this.streakDays()} 天</span>
            <span class="tag btn-soft">📚 ${meta.version}</span>
          `
        })}

        <div class="kitty-feature-card" style="margin-bottom:16px">
          <div class="kitty-portrait" style="background:linear-gradient(135deg,#d9e2f3,#ffd7c3)">${Utils.kittyImg({ size: 'small', module: 'study' })}</div>
          <div class="lfc-text">
            <div class="lfc-title">${this.streakDays() >= 7 ? '🌟 太厉害啦！' : this.streakDays() > 0 ? '📖 继续加油哦～' : '📖 开始今天的学习吧～'}</div>
            <div class="lfc-sub">每天 10 个权威词典单词，来自 ECDICT 英汉词典 · 牛津 3000 核心词（成人难度），按使用频率由易到难；答错 2 次自动进复习～</div>
          </div>
        </div>

        <div class="card mb-16" style="background:linear-gradient(135deg, rgba(255,236,247,0.6), rgba(255,225,232,0.4))">
          <div class="flex-between mb-8">
            <div class="card-title" style="margin:0">
              <span class="card-title-ico">📕</span>权威词典词库
            </div>
            <span class="tag tag-pink" style="font-size:11px">🔄 ${syncResult.status === 'upgraded' ? '已升级' : syncResult.status === 'first' ? '已安装' : '最新'}</span>
          </div>
          <div class="text-sm text-secondary" style="line-height:1.7">
            <div>📖 <strong>${Utils.esc(meta.name)}</strong></div>
            <div>🏷️ 版本：<strong>${Utils.esc(meta.version)}</strong> · 共 ${meta.total} 词 · ${Utils.esc(meta.source)}</div>
            <div>📅 更新日期：<strong>${Utils.esc(meta.lastSyncDate)}</strong></div>
            ${syncResult.status === 'upgraded' ? `<div class="mt-4" style="color:#c2185b">⬆️ 从 ${Utils.esc(syncResult.oldVersion)} 升级到 ${Utils.esc(meta.version)}</div>` : ''}
          </div>
        </div>

        <div class="card mb-16">
          <div class="flex-between mb-12">
            <div class="card-title">
              <span class="card-title-ico">📊</span>学习统计
            </div>
            <div class="tag tag-pink">🔥 连续 ${this.streakDays()} 天</div>
          </div>
          <div class="stat-bar">
            <div class="stat-bar-item">
              <div class="stat-bar-num">${DB.get('study_word_done', []).length}</div>
              <div class="stat-bar-label">累计掌握</div>
            </div>
            <div class="stat-bar-item">
              <div class="stat-bar-num" style="color:#e8919f">${reviews.length}</div>
              <div class="stat-bar-label">待复习</div>
            </div>
            <div class="stat-bar-item">
              <div class="stat-bar-num">${wordDoneToday}/${this.DAILY_WORDS}</div>
              <div class="stat-bar-label">今日单词</div>
            </div>
          </div>
        </div>

        <div class="card mb-16">
          <div class="flex-between mb-12">
            <div class="card-title">
              <span class="card-title-ico">🌸</span>今日英语任务
              <span class="tag tag-pink" style="margin-left:8px">${stage}</span>
            </div>
            <div class="text-sm text-muted">第 ${dayNo} 天</div>
          </div>

          <div class="english-grid">
            <div class="english-tile ${this.state.tab === 'word' ? 'active' : ''}" data-stab="word">
              <div class="tile-ico">📝</div>
              <div class="tile-label">每日单词 ×${this.DAILY_WORDS}</div>
              <div class="tile-sub">${wordAllDone ? '✓ 已完成' : wordDoneToday + '/' + this.DAILY_WORDS}</div>
            </div>
            ${reviews.length ? `
            <div class="english-tile ${this.state.tab === 'review' ? 'active' : ''}" data-stab="review">
              <div class="tile-ico">🔁</div>
              <div class="tile-label">待复习词库</div>
              <div class="tile-sub">${reviews.length} 个单词</div>
            </div>` : ''}
          </div>

          <div id="english-panel"></div>

          <div class="mt-16 mb-8 text-sm text-secondary font-medium">兼容英语软件</div>
          <div class="app-row">
            <a class="app-tile" href="momo://" target="_blank" rel="noopener">
              <span class="app-ico">🪺</span>
              <span class="app-name">墨墨背单词</span>
              <span class="app-sub">一键打开</span>
            </a>
            <a class="app-tile" href="kekenet://" target="_blank" rel="noopener">
              <span class="app-ico">🦉</span>
              <span class="app-name">可可英语</span>
              <span class="app-sub">跳转 APP</span>
            </a>
            <a class="app-tile" href="duolingo://" target="_blank" rel="noopener">
              <span class="app-ico">🦉</span>
              <span class="app-name">Duolingo</span>
              <span class="app-sub">跳转 APP</span>
            </a>
          </div>
        </div>

        <div class="card mb-16">
          <div class="flex-between mb-12">
            <div class="card-title">
              <span class="card-title-ico">📖</span>看书打卡
            </div>
            <button class="btn-ghost btn-primary text-sm" id="study-book-add">+ 添加书籍</button>
          </div>
          <div id="study-books-list">
            ${books.length ? books.map((b, i) => this.renderBook(b, i)).join('') : Components.empty({ icon: '📚', title: '还没有添加书籍', sub: '点击右上角添加你想读的书籍', hero: true })}
          </div>
          ${books.length ? `
            <div class="card-grid-3 mt-16">
              <div class="card-soft text-center">
                <div class="text-2xl font-bold" style="color:var(--primary-deep)">${readingStats.todayMinutes}</div>
                <div class="text-sm text-muted">今日分钟</div>
              </div>
              <div class="card-soft text-center">
                <div class="text-2xl font-bold" style="color:var(--primary-deep)">${readingStats.weekDays}</div>
                <div class="text-sm text-muted">本周天数</div>
              </div>
              <div class="card-soft text-center">
                <div class="text-2xl font-bold" style="color:var(--primary-deep)">${readingStats.totalMinutes}</div>
                <div class="text-sm text-muted">累计分钟</div>
              </div>
            </div>
          ` : ''}
        </div>

        <div style="text-align:center;padding:16px;font-size:11px;color:var(--text-muted)">
          每日 10 个权威词典单词 ·  做过的不再出现 · 答错 2 次自动进入待复习词库 🌸
        </div>
      </div>
    `;

    this.renderEnglishPanel();
    this.bindEvents();
  },

  /* ---------- 今日任务面板 ---------- */
  renderEnglishPanel() {
    const el = document.getElementById('english-panel');
    if (!el) return;
    const tab = this.state.tab;

    if (tab === 'word') {
      const words = this.todayWords();
      const doneSet = this.doneWordsSet();
      const wrongs = this.wrongMap();
      if (words.length === 0) {
        el.innerHTML = `
          <div class="english-panel">
            ${Components.empty({
              icon: '⚠️',
              title: '词库未加载',
              sub: '词典数据加载失败，请硬刷新页面（设置 → 清除缓存 → 硬刷新）。',
              hero: true,
            })}
          </div>
        `;
        return;
      }
      el.innerHTML = `
        <div class="english-panel">
          <div class="flex-between mb-8">
            <div class="card-title"><span class="card-title-ico">📝</span>今日新词（点击卡片 → 选答案 → 确认）</div>
            <div class="text-sm text-muted">${words.filter(w => doneSet.has(w.word)).length}/${this.DAILY_WORDS} 已掌握</div>
          </div>
          <div class="word-list">
            ${words.map((w, i) => {
              const done = doneSet.has(w.word);
              const inReview = wrongs[w.word] >= 2 && !done;
              return `
                <div class="word-chip ${done ? 'done' : ''} ${inReview ? 'review' : ''}" data-quiz="${i}">
                  <span class="word-chip-en">${Utils.esc(w.word)}</span>
                  <span class="word-chip-status">${done ? '✓' : (inReview ? '🔁' : i + 1)}</span>
                </div>
              `;
            }).join('')}
          </div>
          <div class="text-sm text-muted mt-8" style="font-size:11px">✓ 已掌握 · 🔁 待复习 · 数字 未学习 · 单击卡片开始答题</div>
        </div>
      `;
      this.bindQuiz();
    } else if (tab === 'review') {
      const reviews = this.reviewWords();
      el.innerHTML = `
        <div class="english-panel">
          <div class="card-title mb-8"><span class="card-title-ico">🔁</span>待复习词库（${reviews.length}）</div>
          ${reviews.length ? `
            <div class="word-list">
              ${reviews.map((w, i) => `
                <div class="word-chip review" data-review-quiz="${Utils.esc(w.word)}">
                  <span class="word-chip-en">${Utils.esc(w.word)}</span>
                  <span class="word-chip-status">🔁</span>
                </div>
              `).join('')}
            </div>
            <div class="text-sm text-muted mt-8" style="font-size:11px">这些词你答错了 2 次，复习答对即可移出词库</div>
          ` : Components.empty({ icon: '🎉', title: '太棒了，没有待复习单词！', sub: '继续保持每日学习节奏' })}
        </div>
      `;
      this.bindReview();
    }
  },

  /* ============================================================
     单词答题：选选项 → 状态切换 → 点「确认」→ 提交
     ============================================================ */
  openQuiz(word, isReview = false) {
    const pool = this.buildPool();
    const correct = word.meaning;
    // 生成 4 个选项
    const distract = pool.filter(w => w.meaning !== correct).map(w => w.meaning);
    const opts = new Set([correct]);
    while (opts.size < 4) opts.add(distract[Math.floor(Math.random() * distract.length)]);
    const shuffled = [...opts].sort(() => Math.random() - 0.5);
    const wrongs = DB.get('study_word_wrong', []);
    const rec = wrongs.find(x => x.word === word.word);
    const wrongCount = rec ? rec.count : 0;

    const m = Components.modal({
      title: isReview ? '🔁 复习模式' : '📝 单词小测验',
      body: `
        <div class="text-center mb-16">
          <div class="word-quiz-en">${Utils.esc(word.word)}</div>
          <div class="word-quiz-phonetic">${Utils.esc(word.phonetic)} <span class="word-pos">${Utils.esc(word.pos)}</span></div>
          <div class="text-sm text-muted mt-4">答错次数：${wrongCount} / 2 · 请选择正确释义</div>
        </div>
        <div id="quiz-options" data-correct="${Utils.esc(correct)}">
          ${shuffled.map((o, i) => `
            <button class="quiz-option" data-opt="${Utils.esc(o)}" data-idx="${i}">
              <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
              <span class="quiz-option-text">${Utils.esc(o)}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-actions">
          <button class="btn-primary btn-block" id="quiz-confirm" disabled>✓ 确认答案</button>
        </div>
        <div id="quiz-feedback"></div>
      `,
    });

    const box = document.getElementById('quiz-options');
    if (!box) return;
    const correctAns = box.dataset.correct;
    const confirmBtn = document.getElementById('quiz-confirm');
    let selected = null;

    // 选选项
    box.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        box.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = btn.dataset.opt;
        confirmBtn.disabled = false;
      });
    });

    // 确认提交
    confirmBtn.addEventListener('click', () => {
      if (!selected) return;
      confirmBtn.disabled = true;
      box.querySelectorAll('.quiz-option').forEach(b => b.classList.add('disabled'));

      const fb = document.getElementById('quiz-feedback');
      if (selected === correctAns) {
        // 答对：标记掌握
        box.querySelectorAll('.quiz-option').forEach(b => {
          if (b.dataset.opt === correctAns) b.classList.add('correct');
        });
        if (!this.doneWordsSet().has(word.word)) {
          DB.push('study_word_done', { word: word.word, date: DB.todayKey(), stage: word.stage });
        }
        // 复习答对 → 移出待复习
        DB.set('study_word_wrong', DB.get('study_word_wrong', []).filter(x => x.word !== word.word));
        const exHtml = word.example ? `<br><span style="font-size:12px">${Utils.esc(word.example)}<br>${Utils.esc(word.exampleZh)}</span>` : '';
        if (fb) fb.innerHTML = `<div class="quiz-fb ok">🎉 答对了！${Utils.esc(word.word)} · ${Utils.esc(word.meaning)}${exHtml}</div>`;
        Utils.toast('答对了 🌸', 'success');
        confirmBtn.textContent = '✓ 已掌握，关闭';
        confirmBtn.disabled = false;
        confirmBtn.onclick = () => {
          document.querySelector('.modal-backdrop')?.remove();
          this.mount(document.getElementById('app-main'));
        };
      } else {
        // 答错：错误计数 +1
        box.querySelectorAll('.quiz-option').forEach(b => {
          if (b.dataset.opt === correctAns) b.classList.add('correct');
          if (b.dataset.opt === selected) b.classList.add('wrong');
        });
        const list = DB.get('study_word_wrong', []);
        const r = list.find(x => x.word === word.word);
        if (r) r.count = (r.count || 0) + 1;
        else list.push({ word: word.word, count: 1, date: DB.todayKey() });
        DB.set('study_word_wrong', list);
        const cnt = (r ? r.count : 1);
        const exHtml2 = word.example ? `<br>${Utils.esc(word.example)}` : '';
        if (fb) fb.innerHTML = `<div class="quiz-fb bad">${cnt >= 2 ? '🔁 已加入待复习词库' : '❌ 再想想，还剩 ' + (2 - cnt) + ' 次机会'}<br><span style="font-size:12px">正确答案：${Utils.esc(correctAns)}${exHtml2}</span></div>`;
        if (cnt >= 2) Utils.toast('该词已进入待复习词库 🔁', 'warning');
        confirmBtn.textContent = '↻ 再练一次';
        confirmBtn.disabled = false;
        confirmBtn.onclick = () => {
          document.querySelector('.modal-backdrop')?.remove();
          this.mount(document.getElementById('app-main'));
        };
      }
    });
  },

  bindQuiz() {
    const words = this.todayWords();
    document.querySelectorAll('[data-quiz]').forEach(el => {
      el.addEventListener('click', () => this.openQuiz(words[parseInt(el.dataset.quiz)]));
    });
  },

  bindReview() {
    const pool = this.buildPool();
    document.querySelectorAll('[data-review-quiz]').forEach(el => {
      el.addEventListener('click', () => {
        const w = pool.find(x => x.word === el.dataset.reviewQuiz);
        if (w) this.openQuiz(w, true);
      });
    });
  },

  renderBook(b, i) {
    const coverCls = `book-cover-${(i % 6) + 1}`;
    const status = b.done ? 'done' : (b.progress > 0 ? 'reading' : '');
    const statusText = b.done ? '已读完' : (b.progress > 0 ? '继续阅读' : '开始阅读');
    return `
      <div class="book-row slide-up" style="animation-delay:${i * 0.05}s" data-book="${b._id}">
        <div class="book-cover ${coverCls}">${(b.title || '?')[0]}</div>
        <div class="book-info">
          <div class="book-title">${Utils.esc(b.title)}</div>
          <div class="book-author">${Utils.esc(b.author || '佚名')} ${b.progress ? `· 第 ${b.progress} 页` : ''}</div>
          ${b.progress > 0 ? `
            <div class="book-progress"><div class="book-progress-fill" style="width:${Math.min(100, b.progress / (b.totalPages || b.progress) * 100)}%"></div></div>
          ` : ''}
        </div>
        <button class="book-status ${status}" data-book-action="${b._id}">${statusText}</button>
      </div>
    `;
  },

  bindEvents() {
    const root = document.getElementById('app-main');

    // tab 切换
    root.querySelectorAll('[data-stab]').forEach(b => {
      b.addEventListener('click', () => {
        this.state.tab = b.dataset.stab;
        this.mount(root);
      });
    });

    // 添加书籍
    document.getElementById('study-book-add')?.addEventListener('click', async () => {
      const r = await Components.form({
        title: '添加一本想读的书',
        fields: [
          { key: 'title', label: '书名', placeholder: '例如：小王子', required: true },
          { key: 'author', label: '作者', placeholder: '圣埃克苏佩里' },
          { key: 'progress', label: '当前页数', type: 'number', placeholder: '0' },
          { key: 'totalPages', label: '总页数', type: 'number', placeholder: '200' },
        ],
        okText: '添加',
      });
      if (r && r.title) {
        const books = DB.get('study_books', []);
        books.push({
          _id: Utils.uid(),
          title: r.title,
          author: r.author || '',
          progress: parseInt(r.progress) || 0,
          totalPages: parseInt(r.totalPages) || 0,
          done: false,
          addedAt: new Date().toISOString(),
        });
        DB.set('study_books', books);
        Utils.toast('已添加书籍 📖', 'success');
        this.mount(root);
      }
    });

    // 书籍操作
    root.querySelectorAll('[data-book-action]').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.dataset.bookAction;
        const books = DB.get('study_books', []);
        const book = books.find(x => x._id === id);
        if (!book) return;
        if (book.done) {
          const ok = await Components.confirm({ title: '重新阅读', message: '标记为未读完并继续阅读？' });
          if (ok) {
            book.done = false;
            DB.set('study_books', books);
            this.mount(root);
          }
          return;
        }
        const r = await Components.form({
          title: `打卡 · ${book.title}`,
          fields: [
            { key: 'minutes', label: '阅读时长（分钟）', type: 'number', value: 30, required: true },
            { key: 'progress', label: '当前页数', type: 'number', value: (book.progress || 0) + 10 },
            { key: 'note', label: '读书笔记 / 感悟', type: 'textarea', placeholder: '今天读到的内容...' },
          ],
          okText: '完成打卡 ✓',
        });
        if (r) {
          const minutes = parseInt(r.minutes) || 0;
          const newProgress = parseInt(r.progress) || 0;
          book.progress = newProgress;
          if (book.totalPages && newProgress >= book.totalPages) {
            book.done = true;
          }
          DB.push('study_checkin', {
            bookId: id,
            bookTitle: book.title,
            minutes,
            progress: newProgress,
            note: r.note || '',
            date: DB.todayKey(),
          });
          DB.set('study_books', books);
          Utils.toast('打卡成功 📖', 'success');
          this.mount(root);
        }
      });
    });
  },

  readingStats() {
    const today = DB.todayKey();
    const records = DB.get('study_checkin', []);
    const todayRecs = records.filter(r => r.date === today);
    const todayMinutes = todayRecs.reduce((s, r) => s + (r.minutes || 0), 0);
    const weekDays = [...new Set(records.filter(r => {
      const d = new Date(r.date);
      const now = new Date();
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff < 7;
    }).map(r => r.date))].length;
    const totalMinutes = records.reduce((s, r) => s + (r.minutes || 0), 0);
    return { todayMinutes, weekDays, totalMinutes };
  },
};

window.Study = Study;
