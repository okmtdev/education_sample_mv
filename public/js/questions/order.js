// 「順番」— 4〜5この 同じ絵文字の大きさを見て、小さい(または大きい)ほうから n 番目を選ぶ
import { rand, shuffle, el } from '../util.js';

const ICONS = [
  { e: '🍑', name: 'もも' },
  { e: '🍎', name: 'りんご' },
  { e: '🍓', name: 'いちご' },
  { e: '🍋', name: 'レモン' },
  { e: '🐟', name: 'さかな' },
  { e: '🐶', name: 'いぬ' },
  { e: '🌸', name: 'はな' },
];

export default {
  id: 'order',
  name: '順番',
  emoji: '📏',
  description: 'ちいさい/おおきい じゅんに なんばんめ？',
  generate() {
    const icon = ICONS[rand(ICONS.length)];
    const count = 4 + rand(2); // 4 or 5
    // ランダムな大きさ (重複なし)
    const sizes = shuffle([30, 42, 54, 66, 78].slice(0, count));
    const labels = ['あ', 'い', 'う', 'え', 'お'].slice(0, count);
    const fromSmall = rand(2) === 0;
    const nth = 1 + rand(count - 1); // 1..count-1
    // 並び替えて nth 番目 を求める
    const sorted = sizes.map((sz, i) => ({ sz, label: labels[i] })).sort((a, b) => fromSmall ? a.sz - b.sz : b.sz - a.sz);
    const answer = sorted[nth - 1].label;
    const word = fromSmall ? 'ちいさい' : 'おおきい';
    const ordinal = ['', '1ばんめ', '2ばんめ', '3ばんめ', '4ばんめ'][nth];
    return {
      prompt: `${word} ほうから ${ordinal} の ${icon.name} は どれ？`,
      render(container) {
        const row = el('div');
        row.style.display = 'flex';
        row.style.alignItems = 'flex-end';
        row.style.justifyContent = 'center';
        row.style.gap = '14px';
        row.style.marginBottom = '14px';
        sizes.forEach((sz, i) => {
          const col = el('div', { class: 'choice' });
          col.style.background = '#fff';
          col.style.border = '2px solid #e8ecf5';
          col.style.minHeight = '0';
          col.style.padding = '8px';
          col.innerHTML = `<span style="font-size:${sz}px">${icon.e}</span><span style="font-size:14px;color:#6b7a96">${labels[i]}</span>`;
          row.appendChild(col);
        });
        container.appendChild(row);
      },
      choices: labels.slice(),
      answer,
      explain: `${word} じゅんに ならべると ${sorted.map(x => x.label).join(' → ')} だよ。`,
    };
  },
};
