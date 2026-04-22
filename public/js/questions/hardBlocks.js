// 「難しい積木」— 10個以上の大きな積み木を数える (むずかしい)
// おすすめ・ランダムには出ず、「じぶんで えらぶ」専用。
import { rand, shuffle } from '../util.js';
import { drawStack } from './blocks.js';

function totalBlocks(h) {
  let n = 0;
  for (const row of h) for (const v of row) n += v;
  return n;
}

// 全て 10 個以上の形
const SHAPES = [
  { h: [[2, 2, 2], [2, 2, 1]] },               // 11
  { h: [[2, 2], [2, 2], [1, 1]] },             // 10
  { h: [[3, 3], [2, 2]] },                     // 10
  { h: [[1, 2, 3], [1, 2, 2], [1, 1, 1]] },    // 14
  { h: [[2, 2, 2], [1, 2, 2], [1, 1, 1]] },    // 14
  { h: [[3, 2, 1], [3, 2, 1], [3, 2, 1]] },    // 18
  { h: [[2, 2, 2, 2], [1, 0, 0, 1]] },         // 10
  { h: [[4, 3, 2], [3, 2, 1], [2, 1, 0]] },    // 18
  { h: [[3, 3, 3], [3, 3, 3]] },               // 18
  { h: [[4, 4], [3, 3], [2, 2]] },             // 18
  { h: [[5, 3, 1], [3, 2, 1], [1, 1, 1]] },    // 18
  { h: [[2, 2, 2, 2], [2, 2, 2, 2]] },         // 16
  { h: [[3, 2, 2, 1], [2, 2, 1, 1], [1, 1, 1, 0]] }, // 17
  { h: [[4, 3, 2, 1], [1, 1, 1, 1]] },         // 14
  { h: [[3, 3, 2], [2, 2, 2], [1, 1, 1]] },    // 17
  { h: [[4, 2, 2], [4, 2, 1], [1, 1, 0]] },    // 17
  { h: [[3, 3, 3, 3], [2, 1, 1, 0]] },         // 16
];

export default {
  id: 'hardBlocks',
  name: 'むずかしい積木',
  emoji: '🏗️',
  description: 'おおきな つみきを ぜんぶ かぞえよう！',
  noAutoPlay: true,
  generate() {
    const shape = SHAPES[rand(SHAPES.length)];
    const n = totalBlocks(shape.h);
    const spread = [-4, -3, -2, -1, 1, 2, 3, 4, 5];
    const wrongPool = spread.map(d => n + d).filter(v => v >= 5 && v <= 30 && v !== n);
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
