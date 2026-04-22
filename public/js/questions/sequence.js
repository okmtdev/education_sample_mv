// 「系列」— さいころの目の並びに規則があり、空いているマスの数を答える
import { rand, shuffle, el } from '../util.js';

function diceNode(n, unknown = false) {
  const d = el('div', { class: 'dice' + (unknown ? ' unknown' : '') });
  if (unknown) {
    d.textContent = '?';
    return d;
  }
  // 1..6 のドット配置
  const pos = {
    1: [[2, 2]],
    2: [[1, 1], [3, 3]],
    3: [[1, 1], [2, 2], [3, 3]],
    4: [[1, 1], [1, 3], [3, 1], [3, 3]],
    5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
    6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]],
  };
  // Grid の 9 セルを作って、該当位置に dot をいれる
  const cells = {};
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 3; c++) {
      const cell = el('div');
      cell.style.gridRow = r;
      cell.style.gridColumn = c;
      d.appendChild(cell);
      cells[`${r},${c}`] = cell;
    }
  }
  for (const [r, c] of pos[n]) {
    cells[`${r},${c}`].appendChild(el('div', { class: 'dot' }));
  }
  return d;
}

export default {
  id: 'sequence',
  name: '系列',
  emoji: '🎲',
  description: 'さいころの めの ならび。? に はいる かず は？',
  generate() {
    // 等差数列 (1,2,3,4,5,6 / 2,3,4,5,6,1 / 6,5,4,3,2,1 など)
    const start = 1 + rand(6);
    const step = [1, 2, -1, -2][rand(4)];
    const len = 7;
    const seq = [];
    for (let i = 0; i < len; i++) {
      let v = start + step * i;
      // 1..6 に収める (サイコロなので mod 6, 0->6)
      v = ((v - 1) % 6 + 6) % 6 + 1;
      seq.push(v);
    }
    const hideIdx = 2 + rand(len - 3); // 端を避ける
    const answer = seq[hideIdx];
    const shown = seq.slice();
    return {
      prompt: '? の マス に はいる さいころの め は どれ？',
      render(container) {
        const row = el('div', { class: 'dice-row' });
        shown.forEach((v, i) => {
          row.appendChild(i === hideIdx ? diceNode(0, true) : diceNode(v));
        });
        container.appendChild(row);
      },
      choices: shuffle([answer, ...shuffle([1, 2, 3, 4, 5, 6].filter(x => x !== answer)).slice(0, 3)]),
      answer,
      explain: `まえから ${step > 0 ? 'ひとつ' : ''} ${Math.abs(step)} ずつ ${step > 0 ? 'ふえて' : 'へって'} いくから、こたえは ${answer} だよ。`,
    };
  },
};
