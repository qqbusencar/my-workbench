/* ============================================================
   模块：每日记账 — 随手记 / CSV 导入 / 月度汇总 / 可视化
   - 数据存本地 + 自动云同步（Supabase，与现有模块同一套 DB 基础设施）
   - 纯前端，不上传任何第三方，隐私安全
   - 语音录入：安卓 Chrome 网页 🎤 直用；iOS 主屏幕 PWA 用键盘听写键（已做降级提示）
   ============================================================ */

const Bookkeeping = {
  CATS: [
    { key: '餐饮', color: '#ff9eb5', ico: '🍜' },
    { key: '交通', color: '#8ec5ff', ico: '🚌' },
    { key: '购物', color: '#c9a7eb', ico: '🛍️' },
    { key: '居家', color: '#ffd28a', ico: '🏠' },
    { key: '娱乐', color: '#ff8fb1', ico: '🎮' },
    { key: '医疗', color: '#9be0c8', ico: '💊' },
    { key: '人情', color: '#f0a6c0', ico: '🎁' },
    { key: '其他', color: '#cdbfe8', ico: '📦' },
  ],
  CAT_MAP: null,
  KEYWORD: [
    { cat: '餐饮', kw: ['餐饮', '饭店', '餐厅', '饭', '外卖', '美团', '饿了么', '咖啡', '星巴克', '奶茶', '肯德基', '麦当劳', '食堂', '小吃', '火锅', '烧烤', '面包', '蛋糕', '早餐', '午餐', '晚餐', '宵夜', 'food', '吃的', '喝'] },
    { cat: '交通', kw: ['滴滴', '地铁', '公交', '高铁', '火车', '12306', '加油', '停车', '机票', '打车', 'uber', '出租车', '油价', '车站', '滴滴出行', '骑行', '共享单车'] },
    { cat: '购物', kw: ['淘宝', '天猫', '京东', '拼多多', '超市', '便利店', '商城', 'amazon', '唯品会', '苏宁', '沃尔玛', '购物', '服饰', '数码', '美妆', '母婴', '京东到家', '盒马'] },
    { cat: '居家', kw: ['物业', '水电', '燃气', '房租', '宽带', '家政', '居家', '物业费', '电费', '水费', '话费', '充值', '维修', '家居', '日用'] },
    { cat: '娱乐', kw: ['电影', '演出', '游戏', 'steam', '视频会员', '网易云', '腾讯视频', '爱奇艺', '娱乐', 'ktv', '酒吧', '门票', '演唱会', '健身卡', '主题公园'] },
    { cat: '医疗', kw: ['医院', '药店', '药房', '医保', '诊所', '体检', '医疗', '健康', '同仁堂', '挂号', '卫生'] },
    { cat: '人情', kw: ['红包', '转账', '随礼', '份子', '人情', '微信红包', '礼金', '礼物', '请客'] },
  ],

  state: {
    month: null,   // {y, m} 当前查看的月份，null=本月
  },

  // ---------- 数据读写 ----------
  all() {
    return DB.get('bookkeeping_records', []) || [];
  },
  save(list) {
    DB.set('bookkeeping_records', list);
  },
  add(rec) {
    const list = this.all();
    const item = {
      _id: DB.uid(),
      date: rec.date || DB.todayKey(),
      ts: rec.ts || Date.now(),
      amount: Number(rec.amount) || 0,
      category: rec.category || '其他',
      note: rec.note || '',
      source: rec.source || 'manual',
    };
    list.push(item);
    this.save(list);
    return item;
  },
  remove(id) {
    const list = this.all().filter(x => x._id !== id);
    this.save(list);
    return list;
  },

  // 修改某条记录（金额/分类/备注/日期）
  update(id, patch) {
    const list = this.all().map(x => {
      if (x._id !== id) return x;
      const next = { ...x, ...patch };
      if (patch.date && patch.date !== x.date) {
        next.date = patch.date;
        next.ts = new Date(patch.date + 'T12:00:00').getTime();
      }
      return next;
    });
    this.save(list);
    return list;
  },

  // ---------- 解析：随手记文本 ----------
  parseQuick(text) {
    const t = (text || '').trim();
    if (!t) return null;
    const m = t.match(/(\d+(?:\.\d{1,2})?)/g);
    let amount = 0;
    if (m) {
      const nums = m.map(Number).filter(n => n > 0 && n < 1e8 && !(n >= 1900 && n <= 2100));
      if (nums.length) amount = Math.max(...nums);
    }
    if (!amount) return null;
    // 提取备注：去掉金额/单位/动词
    const note = t
      .replace(/(\d+(?:\.\d{1,2})?)\s*(元|块|块钱|大洋)?/g, ' ')
      .replace(/(花费|花了|支出|消费|记|记账|一笔|付了|付|买|吃|喝)/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || '随手记';
    return { amount, note, category: this.categorize(t) };
  },

  categorize(text) {
    const t = (text || '').toLowerCase();
    for (const g of this.KEYWORD) {
      if (g.kw.some(k => t.includes(k.toLowerCase()))) return g.cat;
    }
    return '其他';
  },

  // ---------- 解析：CSV（支付宝/微信/美团/京东/淘宝 通用，best-effort）----------
  parseCsv(text) {
    const lines = (text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    const delim = lines[0].includes('\t') ? '\t'
      : (lines[0].split(',').length >= lines[0].split(';').length ? ',' : ';');
    const rows = lines.map(l => l.split(delim).map(c => c.replace(/^"|"$/g, '').trim()));
    const out = [];
    rows.forEach((cells) => {
      // 跳过表头（含这些关键词）
      if (cells.some(c => /^(交易时间|交易日期|日期|时间|商户|商品|交易对方|收\/支|金额|收入|支出|付款方式|类型|账单)$/.test(c))) return;
      const rowText = cells.join(' ');
      // 日期
      const dm = rowText.match(/(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})/);
      const date = dm ? `${dm[1]}-${String(dm[2]).padStart(2, '0')}-${String(dm[3]).padStart(2, '0')}` : DB.todayKey();
      // 金额：取非“年份区间”内的最大正数
      const amts = (rowText.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/g) || [])
        .map(s => parseFloat(s.replace(/,/g, '')))
        .filter(n => n > 0 && n < 1e8 && !(n >= 1900 && n <= 2100));
      if (!amts.length) return;
      const amount = Math.max(...amts);
      // 备注：CJK 字符最多的单元格
      let note = '';
      let best = 0;
      cells.forEach(c => {
        const cjk = (c.match(/[一-龥]/g) || []).length;
        if (cjk > best) { best = cjk; note = c; }
      });
      note = note.replace(/[\d.,¥$]/g, '').trim() || '账单导入';
      out.push({
        _id: DB.uid(),
        date,
        ts: new Date(date + 'T12:00:00').getTime(),
        amount,
        category: this.categorize(note + ' ' + rowText),
        note,
        source: 'csv',
      });
    });
    return out;
  },

  // ---------- 汇总计算 ----------
  monthKey() {
    const s = this.state.month;
    const d = s ? new Date(s.y, s.m - 1, 1) : new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },
  monthRecords() {
    const mk = this.monthKey();
    return this.all().filter(r => (r.date || '').startsWith(mk));
  },
  monthTotal() {
    return this.monthRecords().reduce((s, r) => s + (Number(r.amount) || 0), 0);
  },
  monthCount() {
    return this.monthRecords().length;
  },
  monthDailyAvg() {
    const recs = this.monthRecords();
    if (!recs.length) return 0;
    const days = new Set(recs.map(r => r.date)).size || 1;
    return this.monthTotal() / days;
  },
  categoryTotals() {
    const map = {};
    this.monthRecords().forEach(r => {
      map[r.category] = (map[r.category] || 0) + (Number(r.amount) || 0);
    });
    return this.CATS
      .map(c => ({ ...c, value: map[c.key] || 0 }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value);
  },
  last7Days() {
    const days = DB.lastNDays(7);
    return days.map(dk => {
      const v = this.all().filter(r => r.date === dk).reduce((s, r) => s + (Number(r.amount) || 0), 0);
      const [, m, d] = dk.split('-');
      return { label: `${+m}/${+d}`, value: v };
    });
  },
  todayRecords() {
    const tk = DB.todayKey();
    return this.all().filter(r => r.date === tk).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  },

  // ---------- 渲染：甜甜圈图 ----------
  donut(totals) {
    const total = totals.reduce((s, t) => s + t.value, 0);
    if (!total) return '<div class="empty-state" style="padding:20px">本月还没有支出，记一笔开启记录吧～</div>';
    const r = 50, cx = 60, cy = 60, circ = 2 * Math.PI * r;
    let acc = 0;
    const segs = totals.map(t => {
      const frac = t.value / total;
      const len = frac * circ;
      const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.color}" stroke-width="16"
        stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}"
        transform="rotate(-90 ${cx} ${cy})"><title>${t.key} ${((frac * 100).toFixed(1))}%</title></circle>`;
      acc += len;
      return seg;
    }).join('');
    const legend = totals.map(t => {
      const pct = ((t.value / total) * 100).toFixed(1);
      return `<div class="bk-legend-row">
        <span class="bk-dot" style="background:${t.color}"></span>
        <span class="bk-legend-name">${t.ico} ${t.key}</span>
        <span class="bk-legend-val">¥${Utils.num(t.value.toFixed(2))}</span>
        <span class="bk-legend-pct">${pct}%</span>
      </div>`;
    }).join('');
    return `
      <div class="bk-donut-wrap">
        <svg viewBox="0 0 120 120" width="150" height="150" class="bk-donut">
          ${segs}
          <text x="60" y="56" text-anchor="middle" font-size="9" fill="var(--text-muted)">本月支出</text>
          <text x="60" y="70" text-anchor="middle" font-size="13" font-weight="700" fill="var(--primary-deep)">¥${Utils.num(total.toFixed(0))}</text>
        </svg>
        <div class="bk-legend">${legend}</div>
      </div>`;
  },

  // ---------- 主页面 ----------
  mount(container) {
    // 注入一次性样式
    if (!document.getElementById('bookkeeping-style')) {
      const st = document.createElement('style');
      st.id = 'bookkeeping-style';
      st.textContent = `
        .bk-quick { display:flex; flex-direction:column; gap:8px; }
        .bk-quick-row { display:flex; gap:6px; align-items:center; }
        .bk-quick-row .input { flex:1; }
        .bk-quick-row select.select { width:96px; flex:none; }
        .bk-mic-btn { flex:none; width:42px; height:42px; border-radius:12px; border:none; background:linear-gradient(135deg,#b497d6,#d9a7e8); color:#fff; font-size:18px; cursor:pointer; }
        .bk-hint { font-size:11px; color:var(--text-muted); line-height:1.5; }
        .bk-rec { display:flex; align-items:center; gap:10px; padding:10px 4px; border-bottom:1px solid rgba(180,151,214,0.12); cursor:pointer; }
        .bk-rec:last-child { border-bottom:none; }
        .bk-rec:hover { background:rgba(180,151,214,0.06); border-radius:10px; }
        .bk-day-group { margin-bottom:6px; }
        .bk-day-head { display:flex; align-items:center; justify-content:space-between; padding:6px 4px; font-size:12px; color:var(--text-muted); border-bottom:1px dashed rgba(180,151,214,0.18); margin-bottom:2px; }
        .bk-day-total { font-weight:700; color:var(--primary-deep); }
        .bk-edit label { display:block; margin-bottom:4px; }
        .bk-edit .input, .bk-edit .select { margin-bottom:12px; width:100%; box-sizing:border-box; }
        .bk-rec-ico { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:17px; flex:none; }
        .bk-rec-main { flex:1; min-width:0; }
        .bk-rec-note { font-size:14px; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .bk-rec-sub { font-size:11px; color:var(--text-muted); margin-top:2px; }
        .bk-rec-amt { font-size:15px; font-weight:700; color:var(--primary-deep); flex:none; }
        .bk-rec-del { flex:none; border:none; background:none; color:var(--text-muted); font-size:16px; cursor:pointer; padding:4px; }
        .bk-donut-wrap { display:flex; gap:14px; align-items:center; flex-wrap:wrap; justify-content:center; }
        .bk-donut { flex:none; }
        .bk-legend { flex:1; min-width:150px; display:flex; flex-direction:column; gap:6px; }
        .bk-legend-row { display:flex; align-items:center; gap:6px; font-size:12px; }
        .bk-dot { width:10px; height:10px; border-radius:3px; flex:none; }
        .bk-legend-name { flex:1; color:var(--text-secondary); }
        .bk-legend-val { font-weight:600; color:var(--text-primary); }
        .bk-legend-pct { width:42px; text-align:right; color:var(--text-muted); }
        .bk-sum-grid { display:flex; gap:8px; }
        .bk-sum-cell { flex:1; background:rgba(180,151,214,0.08); border-radius:14px; padding:12px 8px; text-align:center; }
        .bk-sum-num { font-size:18px; font-weight:700; color:var(--primary-deep); }
        .bk-sum-label { font-size:11px; color:var(--text-muted); margin-top:2px; }
        .bk-month-nav { display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:6px; }
        .bk-month-nav .cal-title { font-size:15px; font-weight:600; color:var(--text-primary); }
        .bk-privacy { font-size:11px; color:var(--text-muted); text-align:center; margin-top:10px; line-height:1.6; }
      `;
      document.head.appendChild(st);
    }

    const monthTotal = this.monthTotal();
    const mk = this.monthKey();
    const [my, mm] = mk.split('-');
    const prev = this._shiftMonth(-1);
    const next = this._shiftMonth(1);
    const today = this.todayRecords();

    container.innerHTML = `
      <div class="page">
        ${Components.banner({
          module: 'bookkeeping',
          title: '每日记账',
          sub: '随手记 · 导入账单 · 月度汇总',
          actions: `<span class="tag btn-soft" style="margin-left:0">💰 已记录 ${Utils.num(this.all().length)} 笔</span>`,
        })}

        <div class="card mb-12">
          <div class="bk-sum-grid">
            <div class="bk-sum-cell">
              <div class="bk-sum-num">¥${Utils.num(monthTotal.toFixed(2))}</div>
              <div class="bk-sum-label">${my}年${+mm}月支出</div>
            </div>
            <div class="bk-sum-cell">
              <div class="bk-sum-num">${this.monthCount()}</div>
              <div class="bk-sum-label">笔数</div>
            </div>
            <div class="bk-sum-cell">
              <div class="bk-sum-num">¥${Utils.num(this.monthDailyAvg().toFixed(2))}</div>
              <div class="bk-sum-label">日均</div>
            </div>
          </div>
        </div>

        <div class="card mb-12">
          <div class="lfc-title mb-8">✍️ 随手记一笔</div>
          <div class="bk-quick">
            <div class="bk-quick-row">
              <input id="bk-input" class="input" placeholder="如：午餐 38 元 / 打车去机场 120" />
              <select id="bk-cat" class="select">
                ${this.CATS.map(c => `<option value="${c.key}">${c.ico} ${c.key}</option>`).join('')}
              </select>
              <button class="bk-mic-btn" id="bk-mic" title="语音录入">🎤</button>
              <button class="btn-primary" id="bk-add" style="flex:none">记一笔</button>
            </div>
            <div class="bk-hint">
              💡 支持语音：安卓 Chrome 点 🎤 直接说；iOS 主屏幕进入时点输入框 → 用键盘左下角 🎙 听写键（系统级，PWA 同样可用）。
            </div>
          </div>
        </div>

        <div class="card mb-12">
          <div class="bk-month-nav">
            <button class="cal-nav" data-mnav="prev">‹</button>
            <div class="cal-title">${my}年${+mm}月</div>
            <button class="cal-nav" data-mnav="next">›</button>
          </div>
          ${this.donut(this.categoryTotals())}
        </div>

        <div class="card mb-12">
          <div class="lfc-title mb-8">📊 近 7 日趋势</div>
          ${Utils.barChart(this.last7Days(), { color: '#b497d6', height: 120 })}
        </div>

        <div class="card mb-12">
          <div class="flex-between mb-8">
            <div class="lfc-title">🧾 本月明细（${this.monthRecords().length}）</div>
            ${this.all().length ? `<button class="btn-link" id="bk-clear" style="font-size:12px">清空全部</button>` : ''}
          </div>
          ${this.renderMonthDetail()}
        </div>

        <div class="bk-privacy">
          🔒 数据仅保存在你的浏览器本地 + 你自己的 Supabase 云端（需开启云同步）。<br>
          本工具纯属个人记账，不联网抓取任何支付平台，不涉及荐股或投资咨询。
        </div>

        <div class="card mb-12">
          <div class="flex-between mb-8">
            <div class="lfc-title">📥 导入账单</div>
            <button class="btn-ghost btn-primary" id="bk-import" style="font-size:12px;padding:6px 10px">选择 CSV 文件</button>
          </div>
          <div class="bk-hint">
            支付宝 / 微信 / 美团 / 京东 / 淘宝 均可导出 CSV → 在此上传，自动识别金额、日期并归类（best-effort）。数据仅存本机与你的 Supabase，不上传任何第三方。
            <input type="file" id="bk-file" accept=".csv,text/csv" style="display:none" />
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  },

  renderRow(r) {
    const c = (this.CAT_MAP || (this.CAT_MAP = Object.fromEntries(this.CATS.map(x => [x.key, x]))))[r.category] || this.CATS[this.CATS.length - 1];
    const time = r.ts ? Utils.formatDate(r.ts, 'HH:mm') : '';
    return `
      <div class="bk-rec" data-id="${r._id}">
        <div class="bk-rec-ico" style="background:${c.color}22">${c.ico}</div>
        <div class="bk-rec-main">
          <div class="bk-rec-note">${Utils.esc(r.note || c.key)}</div>
          <div class="bk-rec-sub">${c.key}${r.source === 'csv' ? ' · 导入' : ''}${time ? ' · ' + time : ''}</div>
        </div>
        <div class="bk-rec-amt">¥${Utils.num((Number(r.amount) || 0).toFixed(2))}</div>
        <button class="bk-rec-del" data-del="${r._id}" title="删除">🗑</button>
      </div>`;
  },

  // 本月明细：按日期分组，每天一行小计，每条可点开修改
  renderMonthDetail() {
    const recs = this.monthRecords().slice().sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return (b.ts || 0) - (a.ts || 0);
    });
    if (!recs.length) return Components.empty({ icon: '🧾', title: '这个月还没有记账哦', sub: '随手记一笔，或导入账单开始吧', module: 'bookkeeping' });
    const groups = {};
    recs.forEach(r => { (groups[r.date] = groups[r.date] || []).push(r); });
    const dates = Object.keys(groups).sort((a, b) => b < a ? 1 : -1);
    return dates.map(dk => {
      const dayTotal = groups[dk].reduce((s, r) => s + (Number(r.amount) || 0), 0);
      const [, m, d] = dk.split('-');
      const rows = groups[dk].map(r => this.renderRow(r)).join('');
      return `
        <div class="bk-day-group">
          <div class="bk-day-head">
            <span>${+m}月${+d}日</span>
            <span class="bk-day-total">¥${Utils.num(dayTotal.toFixed(2))}</span>
          </div>
          ${rows}
        </div>`;
    }).join('');
  },

  // 打开修改弹窗
  openEdit(id) {
    const rec = this.all().find(x => x._id === id);
    if (!rec) return;
    const c = (this.CAT_MAP || (this.CAT_MAP = Object.fromEntries(this.CATS.map(x => [x.key, x]))))[rec.category] || this.CATS[this.CATS.length - 1];
    const body = `
      <div class="bk-edit">
        <label class="text-sm text-secondary">金额（元）</label>
        <input id="bk-edit-amt" class="input" type="number" step="0.01" min="0" value="${Utils.esc((Number(rec.amount) || 0).toFixed(2))}" />
        <label class="text-sm text-secondary">分类</label>
        <select id="bk-edit-cat" class="select">
          ${this.CATS.map(x => `<option value="${x.key}" ${x.key === rec.category ? 'selected' : ''}>${x.ico} ${x.key}</option>`).join('')}
        </select>
        <label class="text-sm text-secondary">备注</label>
        <input id="bk-edit-note" class="input" value="${Utils.esc(rec.note || '')}" />
        <label class="text-sm text-secondary">日期</label>
        <input id="bk-edit-date" class="input" type="date" value="${Utils.esc(rec.date || '')}" />
      </div>`;
    const m = Components.modal({
      title: '修改这笔记账',
      body,
      footer: `<button class="btn-ghost btn-primary" data-act="cancel">取消</button><button class="btn-primary btn-pink" data-act="save">保存</button>`,
    });
    m.wrap.querySelector('[data-act="cancel"]').addEventListener('click', m.close);
    m.wrap.querySelector('[data-act="save"]').addEventListener('click', () => {
      const amount = parseFloat(m.wrap.querySelector('#bk-edit-amt').value);
      const category = m.wrap.querySelector('#bk-edit-cat').value;
      const note = m.wrap.querySelector('#bk-edit-note').value.trim();
      const date = m.wrap.querySelector('#bk-edit-date').value;
      if (!(amount >= 0) || !date) { Utils.toast('请填好金额和日期', 'warning'); return; }
      this.update(id, { amount, category, note, date });
      m.close();
      Utils.toast('已更新 💖', 'success');
      this.mount(document.getElementById('app-main'));
    });
  },

  _shiftMonth(delta) {
    const s = this.state.month;
    const base = s ? new Date(s.y, s.m - 1, 1) : new Date();
    base.setMonth(base.getMonth() + delta);
    return { y: base.getFullYear(), m: base.getMonth() + 1 };
  },

  bindEvents() {
    const input = document.getElementById('bk-input');
    const catSel = document.getElementById('bk-cat');
    const addBtn = document.getElementById('bk-add');
    const micBtn = document.getElementById('bk-mic');
    const fileInput = document.getElementById('bk-file');
    const importBtn = document.getElementById('bk-import');

    const doAdd = () => {
      const parsed = this.parseQuick(input.value);
      if (!parsed) {
        Utils.toast('没看出金额呢，试试"午餐 38 元"这种格式～', 'warning');
        return;
      }
      parsed.category = catSel.value || parsed.category;
      this.add(parsed);
      Utils.toast('已记一笔 💖', 'success');
      this.mount(document.getElementById('app-main'));
    };

    addBtn?.addEventListener('click', doAdd);
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doAdd(); });

    // 语音：安卓直用 Web Speech API；iOS 主屏 PWA 降级提示用键盘听写
    micBtn?.addEventListener('click', () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
      if (SR && !isIOS) {
        try {
          const rec = new SR();
          rec.lang = 'zh-CN';
          rec.interimResults = false;
          rec.onresult = (ev) => {
            const txt = ev.results[0][0].transcript;
            input.value = txt;
            Utils.toast('已识别："' + txt + '"，点记一笔保存', 'success');
          };
          rec.onerror = () => Utils.toast('语音识别失败，可直接输入文字', 'error');
          rec.start();
          Utils.toast('请说话…', 'info');
          return;
        } catch (e) { /* fallthrough */ }
      }
      Utils.toast('iOS 请在输入框聚焦后，用键盘左下角 🎙 听写键说话，文字会自动填入', 'info');
    });

    // 导入 CSV
    importBtn?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const recs = this.parseCsv(ev.target.result);
        if (!recs.length) {
          Utils.toast('没解析到有效流水，确认是导出的 CSV 吗？', 'warning');
          return;
        }
        const list = this.all();
        recs.forEach(r => list.push(r));
        this.save(list);
        Utils.toast(`已导入 ${recs.length} 笔流水 💖`, 'success');
        this.mount(document.getElementById('app-main'));
      };
      reader.readAsText(f);
      e.target.value = '';
    });

    // 月份切换
    document.querySelectorAll('[data-mnav]').forEach(b => {
      b.addEventListener('click', () => {
        this.state.month = this._shiftMonth(b.dataset.mnav === 'prev' ? -1 : 1);
        this.mount(document.getElementById('app-main'));
      });
    });

    // 删除
    document.querySelectorAll('[data-del]').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.remove(b.dataset.del);
        Utils.toast('已删除', 'success');
        this.mount(document.getElementById('app-main'));
      });
    });

    // 点击任意一条记录 → 打开修改弹窗
    document.querySelectorAll('.bk-rec[data-id]').forEach(row => {
      row.addEventListener('click', () => this.openEdit(row.dataset.id));
    });

    // 清空全部（带确认）
    document.getElementById('bk-clear')?.addEventListener('click', async () => {
      const ok = await Components.confirm({
        title: '清空所有记账？',
        message: '将删除全部本地 + 云端记账记录，且无法恢复。确认吗？',
        okText: '确认清空', danger: true,
      });
      if (ok) {
        this.save([]);
        Utils.toast('已清空全部记账', 'success');
        this.mount(document.getElementById('app-main'));
      }
    });
  },
};

window.Bookkeeping = Bookkeeping;
