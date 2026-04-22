// 「同図形発見」— 左のかたちを 90/180/270 どけ回転したものを 選ぶ
import { rand, shuffle, svg } from '../util.js';

// 2x2 の 4 分割で、塗りつぶしパターンを指定。true=塗り、false=白
function makePattern() {
  const p = [];
  for (let i = 0; i < 4; i++) p.push(Math.random() < 0.5);
  // 全部塗り/全部白 は避ける
  if (p.every(x => x) || p.every(x => !x)) return makePattern();
  return p;
}

// 90度 時計回り回転: [tl,tr,bl,br] -> [bl,tl,br,tr]
function rot90(p) { return [p[2], p[0], p[3], p[1]]; }
function rotN(p, n) { let r = p.slice(); for (let i = 0; i < n; i++) r = rot90(r); return r; }
function equalPattern(a, b) { return a.every((v, i) => v === b[i]); }

function drawShape(p, size = 80) {
  const s = svg('svg', { viewBox: '0 0 100 100', width: size, height: size });
  const half = 50;
  const cells = [
    [0, 0], [half, 0], [0, half], [half, half],
  ];
  s.appendChild(svg('rect', { x: 2, y: 2, width: 96, height: 96, fill: 'white', stroke: '#23314a', 'stroke-width': 3 }));
  p.forEach((fill, i) => {
    if (fill) {
      const [x, y] = cells[i];
      s.appendChild(svg('rect', { x, y, width: half, height: half, fill: '#23314a' }));
    }
  });
  // 中央の十字線
  s.appendChild(svg('line', { x1: 50, y1: 2, x2: 50, y2: 98, stroke: '#23314a', 'stroke-width': 2 }));
  s.appendChild(svg('line', { x1: 2, y1: 50, x2: 98, y2: 50, stroke: '#23314a', 'stroke-width': 2 }));
  return s;
}

export default {
  id: 'sameShape',
  name: '同図形発見',
  emoji: '🔄',
  description: 'まわすと おなじ かたちに なるのは どれ？',
  generate() {
    const base = makePattern();
    // 正解は 0..3 の回転
    const ansRot = 1 + rand(3);
    const correct = rotN(base, ansRot);
    // ダミーは base と回転で一致しないパターン
    const distractors = [];
    let guard = 0;
    while (distractors.length < 3 && guard++ < 200) {
      const p = makePattern();
      let match = false;
      for (let r = 0; r < 4; r++) {
        if (equalPattern(rotN(p, r), base)) { match = true; break; }
      }
      if (match) continue;
      if (distractors.some(d => equalPattern(d, p))) continue;
      distractors.push(p);
    }
    const options = shuffle([correct, ...distractors]);
    const labels = options.map((_, i) => ['あ', 'い', 'う', 'え'][i]);
    const answer = labels[options.indexOf(correct)];

    return {
      prompt: 'ひだりの かたちを まわすと おなじに なるのは どれ？',
      render(container) {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.gap = '16px';
        wrap.style.justifyContent = 'center';
        wrap.style.alignItems = 'center';
        wrap.style.marginBottom = '14px';
        const base1 = drawShape(base, 110);
        const arrow = document.createElement('span');
        arrow.textContent = '→ まわす →';
        arrow.style.fontSize = '18px';
        arrow.style.color = '#6b7a96';
        wrap.append(base1, arrow);
        container.appendChild(wrap);

        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = 'repeat(4, 1fr)';
        row.style.gap = '10px';
        options.forEach((p, i) => {
          const fig = document.createElement('figure');
          fig.style.margin = '0';
          fig.style.textAlign = 'center';
          fig.appendChild(drawShape(p, 90));
          const cap = document.createElement('figcaption');
          cap.textContent = labels[i];
          cap.style.fontSize = '18px';
          cap.style.fontWeight = 'bold';
          fig.appendChild(cap);
          row.appendChild(fig);
        });
        container.appendChild(row);
      },
      choices: labels,
      answer,
      explain: 'あたまの なかで かたちを まわして くらべるよ。',
    };
  },
};
