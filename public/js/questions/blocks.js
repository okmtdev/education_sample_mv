// 「積木」— 3D の つみきの かずを かぞえる
//
// 形は「平面(x, y)のマス目に何段つむか」の高さマップで定義する。
// これにより すべての キューブが 下から 積み上がる (重力) ことが 保証される。
// 描画は 等角投影 (アイソメ) + 画家のアルゴリズム (奥から手前) で
// 面の重なりを正しく処理する。
import { rand, shuffle, svg } from '../util.js';

// heights[x][y] = そのマスに積む段数 (0 なら何もない)
// 配列は x → y の 2D。どの shape も 地面 (z=0) から 積みあがる。
// diff: 1=やさしい / 2=ふつう / 3=むずかしい
const SHAPES = [
  // やさしい (3〜5 個)
  { diff: 1, h: [[1, 1], [1, 0]] },
  { diff: 1, h: [[1, 1], [1, 1]] },
  { diff: 1, h: [[2, 1], [1, 0]] },
  { diff: 1, h: [[1, 0, 0], [1, 1, 0], [1, 0, 0]] },
  { diff: 1, h: [[1, 0], [1, 1], [1, 0]] },
  { diff: 1, h: [[2, 1], [1, 1]] },
  { diff: 1, h: [[1, 1, 1], [0, 1, 0]] },
  { diff: 1, h: [[1, 1, 0], [0, 1, 1]] },
  // ふつう (5〜8 個)
  { diff: 2, h: [[2, 2], [1, 1]] },
  { diff: 2, h: [[3, 1], [1, 1]] },
  { diff: 2, h: [[2, 1, 1], [1, 0, 0]] },
  { diff: 2, h: [[1, 1], [1, 1], [0, 1]] },
  { diff: 2, h: [[1, 0, 0, 0], [1, 1, 1, 1]] },
  { diff: 2, h: [[2, 1], [2, 1]] },
  { diff: 2, h: [[2, 2, 1], [1, 1, 0]] },
  { diff: 2, h: [[3, 2], [1, 0]] },
  // むずかしい (8〜13 個、一部見えない ところ あり)
  { diff: 3, h: [[2, 2, 2], [2, 2, 1]] },               // 11
  { diff: 3, h: [[3, 2, 1], [2, 1, 0]] },               // 9
  { diff: 3, h: [[2, 2], [2, 2], [1, 1]] },             // 10
  { diff: 3, h: [[4, 2], [2, 1]] },                     // 9
  { diff: 3, h: [[3, 3], [2, 2]] },                     // 10
  { diff: 3, h: [[1, 2, 3], [1, 2, 2], [1, 1, 1]] },    // 14
  { diff: 3, h: [[2, 2, 2], [1, 2, 2], [1, 1, 1]] },    // 14
  { diff: 3, h: [[3, 2, 1], [3, 2, 1], [3, 2, 1]] },    // 18 (大ピラミッド風)
  { diff: 3, h: [[1, 1, 1, 1], [0, 1, 1, 0], [0, 0, 1, 0]] }, // 8
  { diff: 3, h: [[2, 2, 2, 2], [1, 0, 0, 1]] },         // 10
];

function heightsToCells(h) {
  const cells = [];
  for (let x = 0; x < h.length; x++) {
    for (let y = 0; y < h[x].length; y++) {
      const n = h[x][y];
      for (let z = 0; z < n; z++) cells.push([x, y, z]);
    }
  }
  return cells;
}
function totalBlocks(h) {
  let n = 0;
  for (const row of h) for (const v of row) n += v;
  return n;
}

// 等角投影 のパラメータ
//   +x : 画面の右下方向 (手前右)
//   +y : 画面の左下方向 (手前左)
//   +z : 画面の上方向
// 画家のアルゴリズムでは (x+y) が小さい順 → z が小さい順 に描画することで
// 後ろ下の キューブが先、手前上の キューブが 後に描画される。
const UX = 26, UY = 15;       // +x ベクトル
const VX = -26, VY = 15;      // +y ベクトル
const H = 30;                 // +z (高さ)

// 全体の画面サイズを決めるためのボックス計算
function computeBounds(cells) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const corners = [];
  for (const [x, y, z] of cells) {
    // 8 頂点
    for (const [dx, dy, dz] of [
      [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
      [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
    ]) {
      corners.push([(x + dx), (y + dy), (z + dz)]);
    }
  }
  for (const [x, y, z] of corners) {
    const sx = x * UX + y * VX;
    const sy = x * UY + y * VY - z * H;
    if (sx < minX) minX = sx;
    if (sx > maxX) maxX = sx;
    if (sy < minY) minY = sy;
    if (sy > maxY) maxY = sy;
  }
  return { minX, maxX, minY, maxY };
}

function drawStack(h) {
  const cells = heightsToCells(h);
  const b = computeBounds(cells);
  const pad = 20;
  const w = (b.maxX - b.minX) + pad * 2;
  const hh = (b.maxY - b.minY) + pad * 2;
  const ox = -b.minX + pad;
  const oy = -b.minY + pad;
  const s = svg('svg', {
    viewBox: `0 0 ${w} ${hh}`,
    width: Math.min(360, w),
    height: Math.min(260, hh),
    class: 'blocks-svg',
    'aria-hidden': 'true',
  });

  const proj = (x, y, z) => [x * UX + y * VX + ox, x * UY + y * VY - z * H + oy];

  // 地面 (影) を先に描く — 実際の問題と同じ「水平な地面」に置かれている感を出す
  const xs = h.length;
  const ys = Math.max(...h.map(r => r.length));
  const g0 = proj(0, 0, 0);
  const g1 = proj(xs, 0, 0);
  const g2 = proj(xs, ys, 0);
  const g3 = proj(0, ys, 0);
  s.appendChild(svg('polygon', {
    points: `${g0[0]},${g0[1]} ${g1[0]},${g1[1]} ${g2[0]},${g2[1]} ${g3[0]},${g3[1]}`,
    fill: '#eef1f8', stroke: '#cbd5e1', 'stroke-width': 1.5, 'stroke-dasharray': '4 4',
  }));

  // 画家のアルゴリズム: 奥(x+y 小さい) から、低い (z 小さい) から 描画
  const sorted = cells.slice().sort((a, b) => {
    return (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2] || a[0] - b[0];
  });

  for (const [x, y, z] of sorted) {
    // 8 頂点 (画面座標)
    const p000 = proj(x, y, z);
    const p100 = proj(x + 1, y, z);
    const p010 = proj(x, y + 1, z);
    const p110 = proj(x + 1, y + 1, z);
    const p001 = proj(x, y, z + 1);
    const p101 = proj(x + 1, y, z + 1);
    const p011 = proj(x, y + 1, z + 1);
    const p111 = proj(x + 1, y + 1, z + 1);

    // 右の面 (+x 側) : p100 - p110 - p111 - p101
    s.appendChild(svg('polygon', {
      points: [p100, p110, p111, p101].map(p => p.join(',')).join(' '),
      fill: '#f4a261', stroke: '#2b2b2b', 'stroke-width': 1.8, 'stroke-linejoin': 'round',
    }));
    // 左の面 (+y 側) : p010 - p110 - p111 - p011
    s.appendChild(svg('polygon', {
      points: [p010, p110, p111, p011].map(p => p.join(',')).join(' '),
      fill: '#e9c46a', stroke: '#2b2b2b', 'stroke-width': 1.8, 'stroke-linejoin': 'round',
    }));
    // 上の面 (+z 側) : p001 - p101 - p111 - p011
    s.appendChild(svg('polygon', {
      points: [p001, p101, p111, p011].map(p => p.join(',')).join(' '),
      fill: '#ffe7a0', stroke: '#2b2b2b', 'stroke-width': 1.8, 'stroke-linejoin': 'round',
    }));
  }

  return s;
}

export default {
  id: 'blocks',
  name: '積木',
  emoji: '🧱',
  description: 'つみきは ぜんぶで なんこ？',
  generate() {
    const shape = SHAPES[rand(SHAPES.length)];
    const n = totalBlocks(shape.h);
    // 正解の前後数値をダミーに。個数が大きい問題では 乱れ幅も 大きく。
    const spread = n >= 10 ? [-3, -2, -1, 1, 2, 3, 4] : [-2, -1, 1, 2, 3];
    const wrongPool = spread.map(d => n + d).filter(v => v >= 1 && v <= 25 && v !== n);
    const wrongs = shuffle(wrongPool).slice(0, 3);
    return {
      prompt: 'つみきは ぜんぶで なんこ あるかな？',
      render(container) {
        container.appendChild(drawStack(shape.h));
      },
      choices: shuffle([n, ...wrongs]),
      answer: n,
      explain: `こたえは ${n}こ だよ。みえて いない ところも かぞえるよ。`,
    };
  },
};
