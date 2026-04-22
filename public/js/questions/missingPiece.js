// 「欠所補充」— おなじ かたちの うち、どこか かけている ものを 選ぶ
import { rand, shuffle, svg } from '../util.js';

// 基本図形を中央に描く + ランダムで「線を1本欠落」させる。
function drawHouse(missing) {
  const s = svg('svg', { viewBox: '0 0 120 120', class: 'shape-svg' });
  // おおわく
  s.appendChild(svg('rect', { x: 10, y: 10, width: 100, height: 100, fill: 'white', stroke: '#23314a', 'stroke-width': 3 }));
  const draw = (a) => { if (!a.skip) s.appendChild(svg('line', a)); };
  // 屋根 (3本)
  draw({ x1: 30, y1: 60, x2: 60, y2: 30, stroke: '#23314a', 'stroke-width': 3, 'stroke-linecap': 'round', skip: missing === 'roofL' });
  draw({ x1: 60, y1: 30, x2: 90, y2: 60, stroke: '#23314a', 'stroke-width': 3, 'stroke-linecap': 'round', skip: missing === 'roofR' });
  draw({ x1: 30, y1: 60, x2: 90, y2: 60, stroke: '#23314a', 'stroke-width': 3, 'stroke-linecap': 'round', skip: missing === 'roofB' });
  // 壁
  draw({ x1: 30, y1: 60, x2: 30, y2: 100, stroke: '#23314a', 'stroke-width': 3, skip: missing === 'wallL' });
  draw({ x1: 90, y1: 60, x2: 90, y2: 100, stroke: '#23314a', 'stroke-width': 3, skip: missing === 'wallR' });
  draw({ x1: 30, y1: 100, x2: 90, y2: 100, stroke: '#23314a', 'stroke-width': 3, skip: missing === 'floor' });
  // ドア
  draw({ x1: 50, y1: 100, x2: 50, y2: 80, stroke: '#23314a', 'stroke-width': 2.5, skip: missing === 'doorL' });
  draw({ x1: 70, y1: 100, x2: 70, y2: 80, stroke: '#23314a', 'stroke-width': 2.5, skip: missing === 'doorR' });
  draw({ x1: 50, y1: 80, x2: 70, y2: 80, stroke: '#23314a', 'stroke-width': 2.5, skip: missing === 'doorTop' });
  return s;
}

const PARTS = ['roofL', 'roofR', 'roofB', 'wallL', 'wallR', 'floor', 'doorL', 'doorR', 'doorTop'];
const NAMES = {
  roofL: 'やねの ひだりの せん',
  roofR: 'やねの みぎの せん',
  roofB: 'やねの したの せん',
  wallL: 'ひだりの かべ',
  wallR: 'みぎの かべ',
  floor: 'ゆか',
  doorL: 'ドアの ひだりの せん',
  doorR: 'ドアの みぎの せん',
  doorTop: 'ドアの うえの せん',
};

export default {
  id: 'missingPiece',
  name: '欠所補充',
  emoji: '🧩',
  description: 'うえと した、ちがうのは どこ？',
  generate() {
    const missing = PARTS[rand(PARTS.length)];
    const wrongs = shuffle(PARTS.filter(p => p !== missing)).slice(0, 3);
    const options = shuffle([missing, ...wrongs]).map(k => NAMES[k]);
    return {
      prompt: 'うえの えと くらべて、したの えに 足りない ところは どこ？',
      render(container) {
        const pair = document.createElement('div');
        pair.className = 'shape-pair';
        const f1 = document.createElement('figure');
        f1.appendChild(drawHouse(null));
        const c1 = document.createElement('figcaption'); c1.textContent = 'うえ (かんせい)';
        f1.appendChild(c1);
        const f2 = document.createElement('figure');
        f2.appendChild(drawHouse(missing));
        const c2 = document.createElement('figcaption'); c2.textContent = 'した';
        f2.appendChild(c2);
        pair.append(f1, f2);
        container.appendChild(pair);
      },
      choices: options,
      answer: NAMES[missing],
      explain: `かけて いるのは「${NAMES[missing]}」だよ。`,
    };
  },
};
