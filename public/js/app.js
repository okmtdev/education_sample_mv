import { TYPES, TYPE_BY_ID, RECOMMENDED } from './questions/index.js';
import { el, clear, shuffle, choice, formatDate, svg } from './util.js';
import { saveSession, loadSessions, loadStats, clearAll } from './storage.js';

const root = document.getElementById('app');

// --- 画面切り替え ---
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
    el('p', { text: '「おすすめ」「ランダム」「じぶんで えらぶ」の 3つから えらべるよ。' }),
  ]);
  root.appendChild(header);

  const grid = el('div', { class: 'home-grid' }, [
    modeCard('⭐', 'おすすめ', 'バランス よく 10もん を あそぶよ', () => startFromBreakdown('recommended', RECOMMENDED)),
    modeCard('🎲', 'ランダム', 'いろんな もんだいを 10もん ランダムに 出すよ', () => startRandom(10)),
    modeCard('🧩', 'じぶんで えらぶ', 'もんだいの しゅるいと かずを じぶんで えらぶよ', () => renderCustom()),
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
  const state = {};
  TYPES.forEach(t => { state[t.id] = 0; });

  const card = el('div', { class: 'card' }, [
    el('h2', { text: 'もんだいを くみあわせよう' }),
    el('p', { class: 'muted', text: '「＋」「−」で かずを きめてから はじめてね。' }),
  ]);

  const form = el('div', { class: 'set-form' });
  TYPES.forEach(t => {
    const numSpan = el('span', { class: 'num', text: '0' });
    const inc = el('button', { text: '＋', on: { click: () => {
      if (state[t.id] < 20) state[t.id]++;
      numSpan.textContent = state[t.id];
      updateTotal();
    }}});
    const dec = el('button', { text: '−', on: { click: () => {
      if (state[t.id] > 0) state[t.id]--;
      numSpan.textContent = state[t.id];
      updateTotal();
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
  startBtn.addEventListener('click', () => startFromBreakdown('custom', state));

  const homeBtn = el('button', { class: 'btn ghost', text: '← もどる', on: { click: renderHome } });
  card.appendChild(el('div', { class: 'play-footer' }, [homeBtn, startBtn]));

  root.appendChild(card);

  function updateTotal() {
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
  TYPES.forEach(t => { breakdown[t.id] = 0; });
  for (let i = 0; i < count; i++) {
    const t = choice(TYPES);
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

    const card = el('div', { class: 'card pop' });
    // 進捗バー
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
        const correct = String(q.answer) === label;
        btn.classList.add(correct ? 'correct' : 'wrong');
        // 正解を反転表示
        if (!correct) {
          [...choices.children].forEach(child => {
            if (child.textContent === String(q.answer)) child.classList.add('correct');
          });
        }
        results.push({ typeId: type.id, correct });
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

  const overview = el('div', { class: 'card' }, [
    el('h2', { text: 'いままでの きろく' }),
    el('p', { text: `プレイ回数: ${sessions.length}｜ぜん もんだい数: ${sumTotal(sessions)}｜せいかい: ${sumCorrect(sessions)}` }),
  ]);

  if (sessions.length === 0) {
    overview.appendChild(el('div', { class: 'empty-state', text: 'まだ きろく が ないよ。ホームから あそんで みよう！' }));
    overview.appendChild(el('div', { class: 'play-footer' }, [
      el('span'),
      el('button', { class: 'btn', text: 'ホームへ', on: { click: renderHome } }),
    ]));
    root.appendChild(overview);
    return;
  }

  overview.appendChild(el('h3', { text: '正解率の うつりかわり' }));
  overview.appendChild(accuracyChart(sessions));

  overview.appendChild(el('h3', { text: 'しゅるいべつ せいかい りつ' }));
  overview.appendChild(typeBarChart(stats));

  overview.appendChild(el('h3', { text: '最近 10かいの プレイ' }));
  const list = el('ul', { class: 'history-list' });
  sessions.slice(-10).reverse().forEach(s => {
    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    const types = Object.entries(s.typeBreakdown || {})
      .filter(([, n]) => n > 0)
      .map(([id, n]) => {
        const t = TYPE_BY_ID[id];
        return t ? `${t.emoji}${t.name}×${n}` : `${id}×${n}`;
      });
    list.appendChild(el('li', {}, [
      el('div', {}, [
        el('div', { text: `${formatDate(s.finishedAt || s.startedAt)}｜モード: ${modeLabel(s.mode)}` }),
        el('div', { class: 'type-chips' }, types.map(tx => el('span', { class: 'chip', text: tx }))),
      ]),
      el('span', { text: `${s.correct} / ${s.total}` }),
      el('span', { class: 'pct', text: pct + '%' }),
    ]));
  });
  overview.appendChild(list);

  overview.appendChild(el('div', { class: 'play-footer' }, [
    el('button', { class: 'btn warn', text: 'きろくを ぜんぶ けす', on: { click: () => {
      if (confirm('ほんとうに ぜんぶ けしても いい？ (もとに もどせません)')) {
        clearAll();
        renderHistory();
      }
    }}}),
    el('button', { class: 'btn', text: 'ホームへ', on: { click: renderHome } }),
  ]));

  root.appendChild(overview);
}

function modeLabel(mode) {
  return ({ recommended: 'おすすめ', random: 'ランダム', custom: 'じぶんで' }[mode]) || mode;
}

function sumTotal(sessions) { return sessions.reduce((a, s) => a + (s.total || 0), 0); }
function sumCorrect(sessions) { return sessions.reduce((a, s) => a + (s.correct || 0), 0); }

// 軌跡(線グラフ風)を SVG で描画
function accuracyChart(sessions) {
  const w = 680, h = 180, pad = 28;
  const svgEl = svg('svg', { viewBox: `0 0 ${w} ${h}`, class: 'history-chart', width: '100%' });
  // 背景格子
  for (let i = 0; i <= 4; i++) {
    const y = pad + ((h - pad * 2) * i) / 4;
    svgEl.appendChild(svg('line', { x1: pad, y1: y, x2: w - pad, y2: y, stroke: '#d6deea', 'stroke-width': 1 }));
    const lbl = svg('text', { x: 6, y: y + 4, 'font-size': 11, fill: '#6b7a96' });
    lbl.textContent = `${100 - i * 25}%`;
    svgEl.appendChild(lbl);
  }

  const data = sessions.slice(-30).map(s => (s.total ? s.correct / s.total : 0));
  if (data.length < 2) {
    // 1点のみ
    const y = pad + (h - pad * 2) * (1 - (data[0] ?? 0));
    svgEl.appendChild(svg('circle', { cx: w / 2, cy: y, r: 6, fill: '#ff7a59' }));
    return svgEl;
  }
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + step * i, pad + (h - pad * 2) * (1 - v)]);
  // 折れ線
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  svgEl.appendChild(svg('path', { d, fill: 'none', stroke: '#ff7a59', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  pts.forEach(([x, y]) => {
    svgEl.appendChild(svg('circle', { cx: x, cy: y, r: 4, fill: '#ff7a59' }));
  });
  return svgEl;
}

// しゅるい別 棒グラフ
function typeBarChart(stats) {
  const rows = TYPES.map(t => {
    const s = stats[t.id];
    const pct = s && s.total ? Math.round((s.correct / s.total) * 100) : 0;
    return { t, pct, total: s?.total || 0 };
  });
  const box = el('div');
  rows.forEach(({ t, pct, total }) => {
    const line = el('div');
    line.style.display = 'grid';
    line.style.gridTemplateColumns = '120px 1fr auto';
    line.style.alignItems = 'center';
    line.style.gap = '8px';
    line.style.padding = '4px 0';

    line.appendChild(el('span', { text: `${t.emoji} ${t.name}` }));

    const bar = el('div');
    bar.style.height = '14px';
    bar.style.background = '#eef1f8';
    bar.style.borderRadius = '999px';
    bar.style.overflow = 'hidden';
    const fill = el('div');
    fill.style.height = '100%';
    fill.style.width = pct + '%';
    fill.style.background = total === 0 ? '#cbd5e1' : 'linear-gradient(90deg, #ffd166, #ff7a59)';
    bar.appendChild(fill);
    line.appendChild(bar);

    line.appendChild(el('span', { text: total === 0 ? '-' : `${pct}% (${total}もん)` }));
    box.appendChild(line);
  });
  return box;
}

// 初期描画
renderHome();
