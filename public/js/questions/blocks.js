// 「積木」— 3D の つみきの かずを かぞえる
import { rand, shuffle, svg } from '../util.js';

// L 字、T 字、十字などのシンプルな配置を用意。各セルは { x, y, z } (整数格子)。
const SHAPES = [
  { n: 3, cells: [[0, 0, 0], [1, 0, 0], [0, 0, 1]] }, // L
  { n: 4, cells: [[0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1]] }, // 田(平)
  { n: 4, cells: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0]] }, // T
  { n: 5, cells: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 0, 1], [1, 1, 0]] }, // 十
  { n: 4, cells: [[0, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1]] }, // 階段風
  { n: 6, cells: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1]] },
  { n: 3, cells: [[0, 0, 0], [0, 1, 0], [0, 2, 0]] }, // 縦3
  { n: 5, cells: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [0, 1, 0]] }, // Lの大
];

function drawStack(cells) {
  const size = 300;
  const s = svg('svg', { viewBox: '0 0 320 280', width: size, height: 260, class: 'blocks-svg' });
  // 等角投影 (isometric)
  const ux = 24, uy = 14; // 奥行きステップ
  const vx = -24, vy = 14; // 幅ステップ
  const h = 28; // 高さ
  const projX = (x, y, z) => 150 + x * ux + y * vx;
  const projY = (x, y, z) => 180 + x * uy + y * vy - z * h;

  // 描画順: y 大→小 (奥から), x 小→大, z 小→大
  const sorted = cells.slice().sort((a, b) => (b[1] - a[1]) || (a[0] - b[0]) || (a[2] - b[2]));
  for (const [x, y, z] of sorted) {
    const px = projX(x, y, z), py = projY(x, y, z);
    // 天面
    const topPath = `M ${px} ${py} l ${ux} ${uy} l ${vx} ${vy} l ${-ux} ${-uy} Z`.replace(/l (\S+) (\S+) l (\S+) (\S+) l (\S+) (\S+) l (\S+) (\S+)/, (_m, a, b, c, d, e, f, g, hh) => `l ${a} ${b} l ${c} ${d} l ${e} ${f} l ${g} ${hh}`);
    s.appendChild(svg('path', { d: `M ${px} ${py} l ${ux} ${uy} l ${vx} ${vy} l ${-ux} ${-uy} Z`, fill: '#ffe7a0', stroke: '#23314a', 'stroke-width': 2 }));
    // 左面
    s.appendChild(svg('path', { d: `M ${px} ${py} l 0 ${h} l ${vx} ${vy} l 0 ${-h} Z`, fill: '#ffd166', stroke: '#23314a', 'stroke-width': 2 }));
    // 右面
    s.appendChild(svg('path', { d: `M ${px + vx} ${py + vy} l 0 ${h} l ${ux} ${uy} l 0 ${-h} Z`, fill: '#ffb347', stroke: '#23314a', 'stroke-width': 2 }));
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
    const n = shape.n;
    const wrongs = shuffle([n - 2, n - 1, n + 1, n + 2, n + 3].filter(v => v >= 1 && v <= 10 && v !== n)).slice(0, 3);
    return {
      prompt: 'つみきは ぜんぶで なんこ あるかな？',
      render(container) {
        container.appendChild(drawStack(shape.cells));
      },
      choices: shuffle([n, ...wrongs]),
      answer: n,
      explain: `こたえは ${n}こ だよ。みえて いない ところも かぞえるよ。`,
    };
  },
};
