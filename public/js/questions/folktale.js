// 「常識」— 昔話・年中行事などの知識
import { choice, shuffle } from '../util.js';

const TALES = [
  { t: 'ももたろう', e: '🍑', keys: ['おに', 'いぬ', 'さる', 'きじ', 'きびだんご'] },
  { t: 'うらしまたろう', e: '🐢', keys: ['かめ', 'りゅうぐうじょう', 'たまてばこ'] },
  { t: 'かぐやひめ', e: '🎋', keys: ['たけ', 'つき', 'おじいさん'] },
  { t: 'シンデレラ', e: '👠', keys: ['ガラスのくつ', 'まほう', 'おうじ'] },
  { t: 'しらゆきひめ', e: '🍎', keys: ['りんご', '7にんのこびと', 'まじょ'] },
  { t: 'ながぐつをはいたネコ', e: '🥾', keys: ['ネコ', 'ながぐつ', 'おに'] },
  { t: 'はなさかじいさん', e: '🌸', keys: ['いぬ', 'さくら', 'はい'] },
  { t: 'きんたろう', e: '🪓', keys: ['おの', 'くま', 'やま'] },
  { t: 'さるかに', e: '🦀', keys: ['かに', 'さる', 'かき'] },
  { t: 'つるのおんがえし', e: '🕊️', keys: ['つる', 'はた', 'おる'] },
];

export default {
  id: 'folktale',
  name: '常識（昔話）',
  emoji: '📜',
  description: 'えを みて、どの むかしばなし か こたえてね',
  generate() {
    const t = choice(TALES);
    const distractors = shuffle(TALES.filter(x => x.t !== t.t)).slice(0, 3).map(x => x.t);
    return {
      prompt: 'これは どの おはなし？',
      render(container) {
        const big = document.createElement('div');
        big.className = 'choice big';
        big.setAttribute('aria-hidden', 'true');
        big.innerHTML = `<span class="big" style="font-size:72px">${t.e}</span><span style="font-size:14px;color:#6b7a96">ヒント: ${t.keys.slice(0, 2).join('・')}</span>`;
        container.appendChild(big);
      },
      choices: shuffle([t.t, ...distractors]),
      answer: t.t,
      explain: `${t.t} の おはなし に でて くるよ (${t.keys.join('、')})`,
    };
  },
};
