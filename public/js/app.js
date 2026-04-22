import { TYPES, TYPE_BY_ID, AUTO_TYPES, RECOMMENDED } from './questions/index.js';
import { el, clear, shuffle, choice, formatDate, svg } from './util.js';
import {
  saveSession,
  loadSessions,
  loadStats,
  deleteSession,
  loadCustomBreakdown,
  saveCustomBreakdown,
  loadGeminiKey,
  saveGeminiKey,
  loadChildName,
  saveChildName,
  loadChildGender,
  saveChildGender,
} from './storage.js';

const root = document.getElementById('app');

document.querySelectorAll('[data-nav]').forEach(b => {
  b.addEventListener('click', () => {
    const nav = b.dataset.nav;
    if (nav === 'home') renderHome();
    else if (nav === 'history') renderHistory();
  });
});

// -------------------------------------------------------------------
// ホーム
// -------------------------------------------------------------------
function renderHome() {
  clear(root);
  const header = el('div', { class: 'card' }, [
    el('h2', { text: 'あそびかたを えらんでね' }),
    el('p', { text: '「おすすめ」「ランダム」「じぶんで えらぶ」「にがてを とっくん」の 4つから えらべるよ。' }),
  ]);
  root.appendChild(header);

  const grid = el('div', { class: 'home-grid' }, [
    modeCard('⭐', 'おすすめ', 'バランス よく 10もん を あそぶよ', () => startFromBreakdown('recommended', RECOMMENDED)),
    modeCard('🎲', 'ランダム', 'いろんな もんだいを 10もん ランダムに 出すよ', () => startRandom(10)),
    modeCard('🧩', 'じぶんで えらぶ', 'もんだいの しゅるいと かずを じぶんで えらぶよ', () => renderCustom()),
    modeCard('🎯', 'にがてを とっくん', 'これまでの きろくから にがてな もんだいを 10もん 出すよ', () => startNigate()),
    modeCard('📈', 'きろく', 'これまでの せいせき を みる', () => renderHistory()),
  ]);
  root.appendChild(grid);
}

function modeCard(emoji, title, desc, onClick) {
  return el('button', { class: 'mode-card', on: { click: onClick } }, [
    el('span', { class: 'emoji', text: emoji }),
    el('h3', { text: title }),
    el('p', { text: desc }),
  ]);
}

// -------------------------------------------------------------------
// じぶんで えらぶ (カスタム)
// -------------------------------------------------------------------
function renderCustom() {
  clear(root);
  const saved = loadCustomBreakdown() || {};
  const state = {};
  TYPES.forEach(t => { state[t.id] = Math.max(0, Math.min(20, Number(saved[t.id]) || 0)); });

  const card = el('div', { class: 'card' }, [
    el('h2', { text: 'もんだいを くみあわせよう' }),
    el('p', { class: 'muted', text: '「＋」「−」で かずを きめてね。せっていは つぎかいも のこるよ。' }),
  ]);

  const form = el('div', { class: 'set-form' });
  const numSpans = {};
  TYPES.forEach(t => {
    const numSpan = el('span', { class: 'num', text: String(state[t.id]) });
    numSpans[t.id] = numSpan;
    const inc = el('button', { text: '＋', on: { click: () => {
      if (state[t.id] < 20) state[t.id]++;
      numSpan.textContent = state[t.id];
      persistAndUpdate();
    }}});
    const dec = el('button', { text: '−', on: { click: () => {
      if (state[t.id] > 0) state[t.id]--;
      numSpan.textContent = state[t.id];
      persistAndUpdate();
    }}});
    const row = el('div', { class: 'set-row' }, [
      el('div', { class: 'label' }, [
        el('span', { class: 'emoji', text: t.emoji }),
        el('div', {}, [
          el('strong', { text: t.name }),
          el('small', { text: t.description }),
        ]),
      ]),
      el('div', { class: 'count-ctrl' }, [dec, numSpan, inc]),
    ]);
    form.appendChild(row);
  });
  card.appendChild(form);

  const total = el('div', { class: 'set-total', text: 'ごうけい: 0 もん' });
  card.appendChild(total);

  const startBtn = el('button', { class: 'btn', text: '▶ はじめる', attrs: { disabled: 'true' }});
  startBtn.addEventListener('click', () => {
    saveCustomBreakdown(state);
    startFromBreakdown('custom', state);
  });

  const resetBtn = el('button', { class: 'btn ghost', text: 'ぜんぶ 0 に', on: { click: () => {
    TYPES.forEach(t => { state[t.id] = 0; numSpans[t.id].textContent = '0'; });
    persistAndUpdate();
  }}});
  const homeBtn = el('button', { class: 'btn ghost', text: '← もどる', on: { click: renderHome } });
  card.appendChild(el('div', { class: 'play-footer' }, [
    el('div', {}, [homeBtn, el('span', { text: ' ' }), resetBtn]),
    startBtn,
  ]));

  root.appendChild(card);
  persistAndUpdate();

  function persistAndUpdate() {
    saveCustomBreakdown(state);
    const sum = Object.values(state).reduce((a, b) => a + b, 0);
    total.textContent = `ごうけい: ${sum} もん`;
    if (sum > 0) startBtn.removeAttribute('disabled');
    else startBtn.setAttribute('disabled', 'true');
  }
}

// -------------------------------------------------------------------
// ゲーム開始
// -------------------------------------------------------------------
function startRandom(count) {
  const breakdown = {};
  AUTO_TYPES.forEach(t => { breakdown[t.id] = 0; });
  for (let i = 0; i < count; i++) {
    const t = choice(AUTO_TYPES);
    breakdown[t.id]++;
  }
  startFromBreakdown('random', breakdown);
}

function startFromBreakdown(mode, breakdown) {
  const queue = [];
  for (const [id, n] of Object.entries(breakdown)) {
    const type = TYPE_BY_ID[id];
    if (!type || !n) continue;
    for (let i = 0; i < n; i++) queue.push(type);
  }
  if (!queue.length) return renderHome();
  runSession({ mode, breakdown, queue: shuffle(queue) });
}

// -------------------------------------------------------------------
// にがてをとっくん
// -------------------------------------------------------------------
function computeWeakTypes(sessions) {
  const typeStats = {};
  for (const s of sessions) {
    for (const r of (s.results || [])) {
      if (!typeStats[r.typeId]) typeStats[r.typeId] = { correct: 0, total: 0 };
      typeStats[r.typeId].total++;
      if (r.correct) typeStats[r.typeId].correct++;
    }
  }
  return Object.entries(typeStats)
    .filter(([, s]) => s.total >= 1)
    .map(([id, s]) => ({ id, pct: s.correct / s.total, total: s.total }))
    .sort((a, b) => a.pct - b.pct);
}

function startNigate() {
  const sessions = loadSessions();
  const weakTypes = computeWeakTypes(sessions);

  if (weakTypes.length === 0) {
    openModal({
      title: 'にがてが わからないよ',
      body: el('p', { text: 'まずは いろんな もんだいを あそんで みてね！' }),
      confirmLabel: 'OK',
      onConfirm: () => {},
    });
    return;
  }

  // 苦手上位 3 種 (noAutoPlay を除く)
  const autoIds = new Set(AUTO_TYPES.map(t => t.id));
  const filtered = weakTypes.filter(wt => autoIds.has(wt.id));
  const top = filtered.slice(0, Math.min(3, filtered.length));
  if (top.length === 0) {
    openModal({
      title: 'にがてが わからないよ',
      body: el('p', { text: 'まずは いろんな もんだいを あそんで みてね！' }),
      confirmLabel: 'OK',
      onConfirm: () => {},
    });
    return;
  }
  const totalQ = 10;
  const perType = Math.floor(totalQ / top.length);
  const remainder = totalQ % top.length;
  const breakdown = {};
  AUTO_TYPES.forEach(t => { breakdown[t.id] = 0; });
  top.forEach((wt, i) => {
    breakdown[wt.id] = perType + (i < remainder ? 1 : 0);
  });
  startFromBreakdown('nigate', breakdown);
}

// -------------------------------------------------------------------
// ゲームプレイ
// -------------------------------------------------------------------
function runSession(session) {
  const results = [];
  const startedAt = Date.now();
  let idx = 0;
  renderQuestion();

  function renderQuestion() {
    clear(root);
    if (idx >= session.queue.length) return renderResult();
    const type = session.queue[idx];
    const q = type.generate();
    const total = session.queue.length;
    const questionStartedAt = Date.now();

    const card = el('div', { class: 'card pop' });
    const bar = el('div', { class: 'progress-bar' }, [
      el('span', { attrs: { style: `width:${(idx / total) * 100}%` } }),
    ]);
    card.appendChild(bar);
    card.appendChild(el('div', { class: 'q-meta' }, [
      el('span', { text: `${idx + 1} / ${total}もん｜${type.emoji} ${type.name}` }),
      el('button', { class: 'btn small ghost', text: 'ホーム', on: { click: () => {
        if (confirm('ゲームを ちゅうだんして ホーム に もどる？')) renderHome();
      }}}),
    ]));
    card.appendChild(el('h2', { class: 'q-prompt', text: q.prompt }));

    const figure = el('div');
    q.render(figure);
    card.appendChild(figure);

    const choices = el('div', { class: 'choices' });
    let answered = false;
    q.choices.forEach(c => {
      const label = String(c);
      const btn = el('button', { class: 'choice', text: label, on: { click: () => {
        if (answered) return;
        answered = true;
        const elapsedMs = Date.now() - questionStartedAt;
        const correct = String(q.answer) === label;
        btn.classList.add(correct ? 'correct' : 'wrong');
        if (!correct) {
          [...choices.children].forEach(child => {
            if (child.textContent === String(q.answer)) child.classList.add('correct');
          });
        }
        results.push({ typeId: type.id, correct, elapsedMs });
        const fb = el('div', { class: `feedback ${correct ? 'ok' : 'ng'}` }, [
          document.createTextNode(correct ? '⭕ せいかい！' : '❌ ちがうよ…'),
          el('span', { class: 'hint', text: q.explain }),
        ]);
        card.appendChild(fb);
        const nextBtn = el('button', { class: 'btn', text: idx + 1 === total ? 'けっかを みる' : 'つぎへ ▶', on: { click: () => {
          idx++;
          renderQuestion();
        }}});
        card.appendChild(el('div', { class: 'play-footer' }, [
          el('span'),
          nextBtn,
        ]));
      }}});
      choices.appendChild(btn);
    });
    card.appendChild(choices);

    root.appendChild(card);
  }

  function renderResult() {
    const finishedAt = Date.now();
    const total = results.length;
    const correct = results.filter(r => r.correct).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const stars = pct >= 90 ? '⭐⭐⭐⭐⭐'
      : pct >= 70 ? '⭐⭐⭐⭐'
        : pct >= 50 ? '⭐⭐⭐'
          : pct >= 30 ? '⭐⭐' : '⭐';

    const sessionRecord = {
      startedAt,
      finishedAt,
      mode: session.mode,
      typeBreakdown: session.breakdown,
      total,
      correct,
      results,
    };
    saveSession(sessionRecord);

    clear(root);
    const card = el('div', { class: 'card pop' }, [
      el('h2', { text: 'おつかれさま！' }),
      el('div', { class: 'result-stars', text: stars }),
      el('div', { class: 'result-stat' }, [
        el('div', { class: 'box' }, [ el('div', { class: 'k', text: 'もんだいすう' }), el('div', { class: 'v', text: String(total) }) ]),
        el('div', { class: 'box' }, [ el('div', { class: 'k', text: 'せいかい' }), el('div', { class: 'v', text: String(correct) }) ]),
        el('div', { class: 'box' }, [ el('div', { class: 'k', text: 'せいかいりつ' }), el('div', { class: 'v', text: pct + '%' }) ]),
      ]),
      el('h3', { text: 'しゅるいべつの けっか' }),
      breakdownList(results),
      el('div', { class: 'play-footer' }, [
        el('button', { class: 'btn ghost', text: 'ホームへ', on: { click: renderHome } }),
        el('button', { class: 'btn secondary', text: 'もういちど', on: { click: () => startFromBreakdown(session.mode, session.breakdown) } }),
      ]),
    ]);
    root.appendChild(card);
  }
}

function breakdownList(results) {
  const byType = {};
  for (const r of results) {
    if (!byType[r.typeId]) byType[r.typeId] = { total: 0, correct: 0 };
    byType[r.typeId].total++;
    if (r.correct) byType[r.typeId].correct++;
  }
  const list = el('ul', { class: 'history-list' });
  for (const [id, st] of Object.entries(byType)) {
    const t = TYPE_BY_ID[id];
    const pct = Math.round((st.correct / st.total) * 100);
    list.appendChild(el('li', {}, [
      el('span', { text: `${t.emoji} ${t.name}` }),
      el('span', { text: `${st.correct} / ${st.total}` }),
      el('span', { class: 'pct', text: pct + '%' }),
    ]));
  }
  return list;
}

// -------------------------------------------------------------------
// きろく (History)
// -------------------------------------------------------------------
function renderHistory() {
  clear(root);
  const sessions = loadSessions();
  const stats = loadStats();

  if (sessions.length === 0) {
    root.appendChild(el('div', { class: 'card' }, [
      el('h2', { text: 'いままでの きろく' }),
      el('div', { class: 'empty-state', text: 'まだ きろく が ないよ。ホームから あそんで みよう！' }),
      el('div', { class: 'play-footer' }, [
        el('span'),
        el('button', { class: 'btn', text: 'ホームへ', on: { click: renderHome } }),
      ]),
    ]));
    return;
  }

  // ---- AI解析 (一番上) ----
  root.appendChild(el('div', { class: 'card ai-card' }, [
    el('div', { class: 'ai-card-inner' }, [
      el('span', { class: 'ai-icon', text: '🤖' }),
      el('div', {}, [
        el('strong', { text: 'AI かいせき' }),
        el('p', { class: 'muted', attrs: { style: 'margin:4px 0 0;font-size:14px' }, text: 'Gemini AI が これまでの プレイを ぶんせき して アドバイス してくれるよ' }),
      ]),
      el('button', { class: 'btn secondary', text: '🤖 AI かいせき', on: { click: () => openAiAnalysisModal(sessions) } }),
    ]),
  ]));

  // ---- 概要 ----
  root.appendChild(el('div', { class: 'card' }, [
    el('h2', { text: 'いままでの きろく' }),
    el('p', { text: `プレイ回数: ${sessions.length}｜ぜん もんだい数: ${sumTotal(sessions)}｜せいかい: ${sumCorrect(sessions)}` }),
  ]));

  // ---- 正解率のうつりかわり (プルダウン付き) ----
  root.appendChild(accuracyTrendCard(sessions));

  // ---- スピードのうつりかわり (プルダウン付き) ----
  root.appendChild(speedTrendCard(sessions));

  // ---- しゅるいべつ 正解率・スピード ----
  const typeCard = el('div', { class: 'card' });
  typeCard.appendChild(el('h3', { text: 'しゅるいべつ せいかいりつ と スピード' }));
  typeCard.appendChild(typeStatsTable(sessions, stats));
  root.appendChild(typeCard);

  // ---- プレイカレンダー ----
  const calCard = el('div', { class: 'card' });
  calCard.appendChild(el('h3', { text: 'プレイ カレンダー' }));
  calCard.appendChild(calendarView(sessions));
  root.appendChild(calCard);

  // ---- プレイ履歴 (全件, フィルタ, ページング) ----
  root.appendChild(sessionListCard(sessions));
}

// プルダウン付き 正解率うつりかわりカード
function accuracyTrendCard(sessions) {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h3', { text: '正解率の うつりかわり' }));
  const sel = makeTypeSelect('ぜんたい（全体）');
  card.appendChild(el('div', { class: 'chart-select-wrap' }, [sel]));
  const chartBox = el('div');
  card.appendChild(chartBox);

  function render() {
    clear(chartBox);
    const typeId = sel.value;
    let data;
    if (!typeId) {
      data = sessions.slice(-30).map(s => s.total ? s.correct / s.total : null);
    } else {
      data = sessions
        .filter(s => s.results?.some(r => r.typeId === typeId))
        .slice(-30)
        .map(s => {
          const rs = s.results.filter(r => r.typeId === typeId);
          return rs.length ? rs.filter(r => r.correct).length / rs.length : null;
        });
    }
    data = data.filter(v => v !== null);
    if (!data.length) {
      chartBox.appendChild(el('p', { class: 'muted', attrs: { style: 'text-align:center;padding:20px' }, text: 'データが ありません' }));
      return;
    }
    chartBox.appendChild(lineChart(data, v => `${Math.round(v * 100)}%`, 0, 1, '#ff7a59'));
  }
  sel.addEventListener('change', render);
  render();
  return card;
}

// プルダウン付き スピードうつりかわりカード
function speedTrendCard(sessions) {
  const card = el('div', { class: 'card' });
  card.appendChild(el('h3', { text: 'かいとうスピードの うつりかわり（秒）' }));
  const sel = makeTypeSelect('しゅるいを えらんでね');
  if (TYPES[0]) sel.value = TYPES[0].id;
  card.appendChild(el('div', { class: 'chart-select-wrap' }, [sel]));
  const infoBox = el('div', { class: 'speed-info' });
  card.appendChild(infoBox);
  const chartBox = el('div');
  card.appendChild(chartBox);

  function render() {
    clear(chartBox);
    clear(infoBox);
    const typeId = sel.value;
    if (!typeId) {
      infoBox.textContent = 'しゅるいを えらんでください';
      return;
    }
    const t = TYPE_BY_ID[typeId];
    const speedData = sessions
      .filter(s => s.results?.some(r => r.typeId === typeId && r.elapsedMs != null))
      .slice(-30)
      .map(s => {
        const rs = s.results.filter(r => r.typeId === typeId && r.elapsedMs != null);
        return rs.length ? rs.reduce((a, r) => a + r.elapsedMs, 0) / rs.length / 1000 : null;
      })
      .filter(v => v !== null);

    if (!speedData.length) {
      infoBox.textContent = `${t?.emoji || ''} ${t?.name || ''}: スピードデータ がありません（あたらしく プレイすると 表示されます）`;
      return;
    }
    const allMs = [], correctMs = [];
    for (const s of sessions) {
      for (const r of (s.results || [])) {
        if (r.typeId === typeId && r.elapsedMs != null) {
          allMs.push(r.elapsedMs);
          if (r.correct) correctMs.push(r.elapsedMs);
        }
      }
    }
    const avg = (allMs.reduce((a, b) => a + b, 0) / allMs.length / 1000).toFixed(1);
    const cAvg = correctMs.length ? (correctMs.reduce((a, b) => a + b, 0) / correctMs.length / 1000).toFixed(1) : '-';
    const span = document.createElement('span');
    span.innerHTML = `${t?.emoji || ''} ${t?.name || ''} ⏱ へいきん <b>${avg}秒</b>　✅ せいかい <b>${cAvg}秒</b>`;
    infoBox.appendChild(span);
    const maxS = Math.max(...speedData) * 1.15 || 10;
    chartBox.appendChild(lineChart(speedData, v => `${v.toFixed(0)}秒`, 0, maxS, '#2ec4b6'));
  }
  sel.addEventListener('change', render);
  render();
  return card;
}

// 汎用 折れ線グラフ
function lineChart(data, formatLabel, yMin, yMax, color) {
  const w = 680, h = 180, pad = 28;
  const range = yMax - yMin || 1;
  const svgEl = svg('svg', { viewBox: `0 0 ${w} ${h}`, class: 'history-chart', width: '100%' });
  for (let i = 0; i <= 4; i++) {
    const y = pad + ((h - pad * 2) * i) / 4;
    svgEl.appendChild(svg('line', { x1: pad, y1: y, x2: w - pad, y2: y, stroke: '#d6deea', 'stroke-width': 1 }));
    const lbl = svg('text', { x: 6, y: y + 4, 'font-size': 11, fill: '#6b7a96' });
    lbl.textContent = formatLabel(yMax - (range * i) / 4);
    svgEl.appendChild(lbl);
  }
  if (data.length < 2) {
    if (data.length === 1) {
      const cy = pad + (h - pad * 2) * (1 - Math.max(0, Math.min(1, (data[0] - yMin) / range)));
      svgEl.appendChild(svg('circle', { cx: w / 2, cy, r: 6, fill: color }));
    }
    return svgEl;
  }
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const norm = Math.max(0, Math.min(1, (v - yMin) / range));
    return [pad + step * i, pad + (h - pad * 2) * (1 - norm)];
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  svgEl.appendChild(svg('path', { d, fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  pts.forEach(([x, y]) => svgEl.appendChild(svg('circle', { cx: x, cy: y, r: 4, fill: color })));
  return svgEl;
}

// しゅるいべつ 正解率棒グラフ + スピード集計
function typeStatsTable(sessions, stats) {
  const box = el('div', { class: 'type-trend-table' });
  TYPES.forEach(t => {
    const s = stats[t.id];
    const pct = s && s.total ? Math.round((s.correct / s.total) * 100) : 0;
    const total = s?.total || 0;
    const allMs = [];
    for (const ses of sessions) {
      for (const r of (ses.results || [])) {
        if (r.typeId === t.id && r.elapsedMs != null) allMs.push(r.elapsedMs);
      }
    }
    const avgSpeed = allMs.length ? (allMs.reduce((a, b) => a + b, 0) / allMs.length / 1000).toFixed(1) : null;
    const row = el('div', { class: 'type-trend-row' });
    row.appendChild(el('span', { class: 'type-trend-name', text: `${t.emoji} ${t.name}` }));
    const barBg = el('div', { class: 'type-trend-bar-bg' });
    const barFill = el('div', { class: 'type-trend-bar-fill' });
    barFill.style.width = pct + '%';
    barFill.style.background = total === 0 ? '#cbd5e1' : 'linear-gradient(90deg,#ffd166,#ff7a59)';
    barBg.appendChild(barFill);
    row.appendChild(el('div', { class: 'type-trend-bar-wrap' }, [barBg]));
    row.appendChild(el('span', { class: 'type-trend-pct', text: total === 0 ? '-' : `${pct}%` }));
    row.appendChild(el('span', { class: 'speed-val', text: avgSpeed !== null ? `⏱${avgSpeed}秒` : '-' }));
    box.appendChild(row);
  });
  return box;
}

// しゅるい選択プルダウン
function makeTypeSelect(defaultLabel) {
  const select = document.createElement('select');
  select.className = 'chart-type-select';
  const opt0 = document.createElement('option');
  opt0.value = '';
  opt0.textContent = defaultLabel;
  select.appendChild(opt0);
  TYPES.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.emoji} ${t.name}`;
    select.appendChild(opt);
  });
  return select;
}

// プレイ履歴カード (全件 + フィルタ + ページング)
function sessionListCard(allSessions) {
  const PAGE_SIZE = 10;
  let currentType = '';
  let currentPage = 0;

  const card = el('div', { class: 'card' });
  card.appendChild(el('h3', { text: 'プレイ きろく' }));

  const filterSel = makeTypeSelect('すべての しゅるい');
  filterSel.addEventListener('change', () => { currentType = filterSel.value; currentPage = 0; renderList(); });
  card.appendChild(el('div', { class: 'chart-select-wrap' }, [filterSel]));

  const countLabel = el('div', { attrs: { style: 'font-size:13px;color:#6b7a96;margin:6px 0' } });
  card.appendChild(countLabel);

  const listContainer = el('div');
  card.appendChild(listContainer);

  const paginationDiv = el('div', { class: 'pagination-controls' });
  card.appendChild(paginationDiv);

  card.appendChild(el('div', { class: 'play-footer' }, [
    el('span'),
    el('button', { class: 'btn', text: 'ホームへ', on: { click: renderHome } }),
  ]));

  function renderList() {
    clear(listContainer);
    clear(paginationDiv);

    let filtered = allSessions.slice().reverse();
    if (currentType) filtered = filtered.filter(s => s.results?.some(r => r.typeId === currentType));

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage >= totalPages) currentPage = totalPages - 1;
    const pageItems = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    countLabel.textContent = total === 0 ? '該当なし' : `全${total}件（${currentPage + 1} / ${totalPages}ページ）`;

    const list = el('ul', { class: 'history-list' });
    pageItems.forEach(s => {
      const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
      const types = Object.entries(s.typeBreakdown || {})
        .filter(([, n]) => n > 0)
        .map(([id, n]) => { const t = TYPE_BY_ID[id]; return t ? `${t.emoji}${t.name}×${n}` : `${id}×${n}`; });
      const delBtn = el('button', {
        class: 'row-delete',
        attrs: { 'aria-label': 'このきろくをけす', title: 'このきろくをけす' },
        text: '🗑',
        on: { click: () => confirmDeleteSession(s) },
      });
      list.appendChild(el('li', { class: 'with-delete' }, [
        delBtn,
        el('div', {}, [
          el('div', { text: `${formatDate(s.finishedAt || s.startedAt)}｜モード: ${modeLabel(s.mode)}` }),
          el('div', { class: 'type-chips' }, types.map(tx => el('span', { class: 'chip', text: tx }))),
        ]),
        el('span', { text: `${s.correct} / ${s.total}` }),
        el('span', { class: 'pct', text: pct + '%' }),
      ]));
    });
    listContainer.appendChild(list);

    if (totalPages > 1) {
      const prevBtn = el('button', { class: 'btn ghost small', text: '← まえへ' });
      const nextBtn = el('button', { class: 'btn ghost small', text: 'つぎへ →' });
      prevBtn.disabled = currentPage === 0;
      nextBtn.disabled = currentPage >= totalPages - 1;
      prevBtn.addEventListener('click', () => { currentPage--; renderList(); });
      nextBtn.addEventListener('click', () => { currentPage++; renderList(); });
      paginationDiv.appendChild(prevBtn);
      paginationDiv.appendChild(el('span', { class: 'page-indicator', text: `${currentPage + 1} / ${totalPages}` }));
      paginationDiv.appendChild(nextBtn);
    }
  }

  renderList();
  return card;
}

// -------------------------------------------------------------------
// カレンダー
// -------------------------------------------------------------------
function calendarView(sessions) {
  const container = el('div', { class: 'calendar-container' });
  const today = new Date();

  // 今月と先月を表示
  for (let offset = 1; offset >= 0; offset--) {
    const d = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    container.appendChild(renderCalendarMonth(d, sessions, today));
  }

  return container;
}

function renderCalendarMonth(firstDay, sessions, today) {
  const year = firstDay.getFullYear();
  const month = firstDay.getMonth();

  const playsByDay = {};
  for (const s of sessions) {
    const d = new Date(s.finishedAt || s.startedAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!playsByDay[day]) playsByDay[day] = [];
      playsByDay[day].push(s);
    }
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = firstDay.getDay();

  const wrap = el('div', { class: 'calendar-month' });
  wrap.appendChild(el('div', { class: 'cal-month-title', text: `${year}年${month + 1}月` }));

  const grid = el('div', { class: 'cal-grid' });
  ['日', '月', '火', '水', '木', '金', '土'].forEach(dow => {
    grid.appendChild(el('div', { class: 'cal-dow', text: dow }));
  });

  for (let i = 0; i < firstDow; i++) {
    grid.appendChild(el('div', { class: 'cal-cell empty' }));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const plays = playsByDay[d] || [];
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const cell = el('div', { class: `cal-cell${plays.length > 0 ? ' has-plays' : ''}${isToday ? ' today' : ''}` }, [
      el('span', { class: 'cal-date', text: String(d) }),
    ]);
    if (plays.length > 0) {
      cell.appendChild(el('span', { class: 'cal-badge', text: `${plays.length}回` }));
      // ツールチップ: モード一覧
      const modes = [...new Set(plays.map(p => modeLabel(p.mode)))].join('・');
      cell.title = `${plays.length}回プレイ (${modes})`;
    }
    grid.appendChild(cell);
  }

  wrap.appendChild(grid);
  return wrap;
}

// -------------------------------------------------------------------
// AI 解析モーダル
// -------------------------------------------------------------------
function openAiAnalysisModal(sessions) {
  const inputStyle = 'width:100%;padding:10px;border:2px solid #e8ecf5;border-radius:10px;font-size:15px;margin-bottom:10px;box-sizing:border-box';

  const keyInput = el('input', { attrs: { type: 'password', placeholder: 'Gemini API Key を にゅうりょく', style: inputStyle } });
  keyInput.value = loadGeminiKey();

  const nameInput = el('input', { attrs: { type: 'text', placeholder: 'お子様の なまえ（例: たろう）', style: inputStyle } });
  nameInput.value = loadChildName();

  // 性別トグル
  let gender = loadChildGender();
  const kunBtn  = el('button', { class: `ai-gender-btn${gender === 'kun'  ? ' active' : ''}`, text: '👦 男の子（くん）' });
  const chanBtn = el('button', { class: `ai-gender-btn${gender === 'chan' ? ' active' : ''}`, text: '👧 女の子（ちゃん）' });
  kunBtn.addEventListener('click', () => {
    gender = 'kun';
    kunBtn.classList.add('active'); chanBtn.classList.remove('active');
    saveChildGender(gender);
  });
  chanBtn.addEventListener('click', () => {
    gender = 'chan';
    chanBtn.classList.add('active'); kunBtn.classList.remove('active');
    saveChildGender(gender);
  });

  const spinner    = el('div', { class: 'ai-spinner', attrs: { style: 'display:none' }, text: '🤖 かいせきちゅう…' });
  const imgSpinner = el('div', { class: 'ai-spinner', attrs: { style: 'display:none' }, text: '🖼️ がぞうを せいせいちゅう…' });
  const resultArea = el('div', { class: 'ai-result', attrs: { style: 'display:none' } });
  const imageArea  = el('div', { attrs: { style: 'display:none;margin-top:12px;text-align:center' } });

  const copyBtn = el('button', { class: 'btn ghost small', text: '📋 コピー', attrs: { style: 'display:none' } });
  const imgBtn  = el('button', { class: 'btn secondary small', text: '🖼️ レポート画像', attrs: { style: 'display:none;margin-left:8px' } });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(resultArea.textContent).then(() => {
      copyBtn.textContent = '✅ コピーしました';
      setTimeout(() => { copyBtn.textContent = '📋 コピー'; }, 2000);
    });
  });

  let lastAnalysisText = '';
  imgBtn.addEventListener('click', async () => {
    const key    = keyInput.value.trim();
    const name   = nameInput.value.trim();
    const suffix = gender === 'kun' ? 'くん' : 'ちゃん';
    imgBtn.disabled = true;
    imgSpinner.style.display = 'block';
    imageArea.style.display = 'none';
    try {
      const dataUrl = await callGeminiImage(key, name, suffix, lastAnalysisText);
      const img = el('img', { attrs: { src: dataUrl, style: 'max-width:100%;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.15)' } });
      while (imageArea.firstChild) imageArea.removeChild(imageArea.firstChild);
      imageArea.appendChild(img);
      imageArea.style.display = 'block';
    } catch (err) {
      imageArea.textContent = `エラー: ${err.message}`;
      imageArea.style.display = 'block';
    } finally {
      imgSpinner.style.display = 'none';
      imgBtn.disabled = false;
    }
  });

  const body = el('div', {}, [
    el('p', { class: 'muted', attrs: { style: 'font-size:13px;margin-bottom:8px' }, text: 'API Key と お名前は localStorageに 保存されます。' }),
    keyInput,
    nameInput,
    el('div', { class: 'ai-gender-toggle' }, [kunBtn, chanBtn]),
    spinner,
    resultArea,
    el('div', { class: 'ai-result-actions' }, [copyBtn, imgBtn]),
    imgSpinner,
    imageArea,
  ]);

  const overlay = el('div', { class: 'modal-overlay', on: { click: (e) => { if (e.target === overlay) close(); } } });
  const box = el('div', { class: 'modal-box', attrs: { style: 'max-width:540px' } });
  box.appendChild(el('h3', { class: 'modal-title', text: '🤖 AI かいせき' }));
  box.appendChild(body);

  const analyzeBtn = el('button', { class: 'btn secondary', text: 'かいせきする' });
  analyzeBtn.disabled = true;

  function syncBtn() {
    analyzeBtn.disabled = !keyInput.value.trim() || !nameInput.value.trim();
  }
  keyInput.addEventListener('input', syncBtn);
  nameInput.addEventListener('input', syncBtn);
  syncBtn();

  analyzeBtn.addEventListener('click', async () => {
    const key    = keyInput.value.trim();
    const name   = nameInput.value.trim();
    const suffix = gender === 'kun' ? 'くん' : 'ちゃん';
    saveGeminiKey(key);
    saveChildName(name);
    spinner.style.display = 'block';
    resultArea.style.display = 'none';
    copyBtn.style.display = 'none';
    imgBtn.style.display = 'none';
    imageArea.style.display = 'none';
    analyzeBtn.disabled = true;
    try {
      const text = await callGemini(key, name, suffix, sessions);
      lastAnalysisText = text;
      resultArea.textContent = text;
      resultArea.style.display = 'block';
      copyBtn.style.display = 'inline-block';
      imgBtn.style.display = 'inline-block';
    } catch (err) {
      resultArea.textContent = `エラー: ${err.message}`;
      resultArea.style.display = 'block';
    } finally {
      spinner.style.display = 'none';
      syncBtn();
    }
  });

  const actions = el('div', { class: 'modal-actions' }, [
    el('button', { class: 'btn ghost', text: 'とじる', on: { click: close } }),
    analyzeBtn,
  ]);
  box.appendChild(actions);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  function close() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }
}

async function callGemini(apiKey, childName, suffix, sessions) {
  const stats = {};
  const speedStats = {};
  for (const s of sessions) {
    for (const r of (s.results || [])) {
      if (!stats[r.typeId]) stats[r.typeId] = { correct: 0, total: 0 };
      stats[r.typeId].total++;
      if (r.correct) stats[r.typeId].correct++;
      if (r.elapsedMs != null) {
        if (!speedStats[r.typeId]) speedStats[r.typeId] = { all: [], correct: [] };
        speedStats[r.typeId].all.push(r.elapsedMs);
        if (r.correct) speedStats[r.typeId].correct.push(r.elapsedMs);
      }
    }
  }

  const typeLines = TYPES.map(t => {
    const st = stats[t.id];
    if (!st || st.total === 0) return `・${t.name}: データなし`;
    const pct = Math.round((st.correct / st.total) * 100);
    const sp = speedStats[t.id];
    const avgStr = sp?.all.length
      ? `へいきん${(sp.all.reduce((a, b) => a + b, 0) / sp.all.length / 1000).toFixed(1)}秒`
      : '';
    return `・${t.name}: ${pct}% (${st.total}問) ${avgStr}`;
  }).join('\n');

  const recent = sessions.slice(-10).map(s => {
    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    return `  ${formatDate(s.finishedAt || s.startedAt)} ${modeLabel(s.mode)} ${pct}%`;
  }).join('\n');

  const prompt =
    `あなたは幼児教育のプロフェッショナルです。以下は「${childName}${suffix}」のプレイデータです。\n` +
    `保護者に向けて、「${childName}${suffix}」の強みと弱点の分析、改善のためのアドバイスを300〜400字程度で、` +
    `やさしい日本語で教えてください。\n\n` +
    `【全体】プレイ回数: ${sessions.length}回、総問題数: ${sumTotal(sessions)}問、` +
    `総正解数: ${sumCorrect(sessions)}問\n\n` +
    `【しゅるいべつ 正解率・スピード】\n${typeLines}\n\n` +
    `【直近10回の結果】\n${recent}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || '解析結果が取得できませんでした。';
}

async function callGeminiImage(apiKey, childName, suffix, analysisText) {
  const prompt =
    `日本語で子ども向け学習レポートカードの画像を作ってください。\n` +
    `お名前: ${childName}${suffix}\n` +
    `以下の分析内容をもとに、カラフルで可愛らしいA4縦型のレポートカードを作成してください。\n` +
    `星・動物などのかわいいイラストを使い、ひらがなメインで読みやすくしてください。\n\n` +
    `分析内容:\n${analysisText}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  const parts = json.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData);
  if (!imagePart) throw new Error('画像データが 取得できませんでした。このモデルは 画像生成に 対応していない 可能性があります。');
  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
}

// -------------------------------------------------------------------
// 削除確認
// -------------------------------------------------------------------
function confirmDeleteSession(session) {
  const pct = session.total ? Math.round((session.correct / session.total) * 100) : 0;
  openModal({
    title: 'このきろくを けしますか？',
    body: el('div', {}, [
      el('p', { text: `${formatDate(session.finishedAt || session.startedAt)}｜モード: ${modeLabel(session.mode)}` }),
      el('p', { text: `けっか: ${session.correct} / ${session.total} (${pct}%)` }),
      el('p', { class: 'muted', text: 'いちど けすと もとに もどせません。' }),
    ]),
    confirmLabel: 'けす',
    confirmClass: 'btn warn',
    onConfirm: () => {
      deleteSession(session.startedAt);
      renderHistory();
    },
  });
}

function openModal({ title, body, confirmLabel = 'OK', confirmClass = 'btn', onConfirm }) {
  const overlay = el('div', { class: 'modal-overlay', on: { click: (e) => {
    if (e.target === overlay) close();
  } } });
  const box = el('div', { class: 'modal-box' });
  box.appendChild(el('h3', { class: 'modal-title', text: title }));
  if (body) box.appendChild(body);
  const actions = el('div', { class: 'modal-actions' }, [
    el('button', { class: 'btn ghost', text: 'やめる', on: { click: close } }),
    el('button', { class: confirmClass, text: confirmLabel, on: { click: () => {
      close();
      if (onConfirm) onConfirm();
    } } }),
  ]);
  box.appendChild(actions);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  function close() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }
}

function modeLabel(mode) {
  return ({ recommended: 'おすすめ', random: 'ランダム', custom: 'じぶんで', nigate: 'にがてとっくん' }[mode]) || mode;
}

function sumTotal(sessions) { return sessions.reduce((a, s) => a + (s.total || 0), 0); }
function sumCorrect(sessions) { return sessions.reduce((a, s) => a + (s.correct || 0), 0); }

renderHome();
