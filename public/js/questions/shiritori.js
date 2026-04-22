// 「しりとり」— まえの ことばの さいごの おん から はじまる ことばを えらぶ
import { choice, shuffle } from '../util.js';

// name はひらがな読み、emoji は表示用。基本的に濁点半濁点・長音は末尾では直音に変換。
const WORDS = [
  { n: 'りんご', e: '🍎' }, { n: 'ごりら', e: '🦍' },
  { n: 'らっぱ', e: '🎺' }, { n: 'ぱんだ', e: '🐼' },
  { n: 'だるま', e: '🎎' }, { n: 'まくら', e: '🛏️' },
  { n: 'らくだ', e: '🐫' }, { n: 'だちょう', e: '🦤' },
  { n: 'うさぎ', e: '🐰' }, { n: 'ぎたあ', e: '🎸' },
  { n: 'あひる', e: '🦆' }, { n: 'るびい', e: '💎' },
  { n: 'いちご', e: '🍓' }, { n: 'ごま', e: '🟤' },
  { n: 'まり', e: '⚪' }, { n: 'りす', e: '🐿️' },
  { n: 'すいか', e: '🍉' }, { n: 'かさ', e: '🌂' },
  { n: 'さる', e: '🐒' }, { n: 'るり', e: '💙' },
  { n: 'ねこ', e: '🐱' }, { n: 'こま', e: '🪀' },
  { n: 'たこ', e: '🐙' }, { n: 'こけし', e: '🪆' },
  { n: 'めだか', e: '🐟' }, { n: 'かに', e: '🦀' },
  { n: 'にんじん', e: '🥕' }, // ん止まりは鎖の終わりに
  { n: 'ぞう', e: '🐘' }, // う止まり
  { n: 'くま', e: '🐻' }, { n: 'まめ', e: '🫘' },
];

function normTail(s) {
  const c = s[s.length - 1];
  const map = { 'ー': s[s.length - 2] || 'あ', 'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'っ': s[s.length - 2] || 'つ' };
  return map[c] ?? c;
}
function normHead(s) {
  const c = s[0];
  const dmap = { 'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ',
    'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ',
    'だ': 'た', 'ぢ': 'ち', 'づ': 'つ', 'で': 'て', 'ど': 'と',
    'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ',
    'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ' };
  return dmap[c] ?? c;
}
function connects(prev, next) {
  return normTail(prev.n) === normHead(next.n);
}

export default {
  id: 'shiritori',
  name: 'しりとり',
  emoji: '🔗',
  description: 'つぎに つなげる ことばは どれ？',
  generate() {
    // 長さ2〜3の鎖を作る
    let chain;
    for (let tries = 0; tries < 50; tries++) {
      const start = choice(WORDS.filter(w => !w.n.endsWith('ん')));
      const second = WORDS.filter(w => w.n !== start.n && connects(start, w) && !w.n.endsWith('ん'));
      if (!second.length) continue;
      const s2 = choice(second);
      chain = [start, s2];
      break;
    }
    if (!chain) {
      // フォールバック
      chain = [{ n: 'りんご', e: '🍎' }, { n: 'ごりら', e: '🦍' }];
    }
    // 次に来る語 (正解)
    const correctList = WORDS.filter(w => !chain.some(c => c.n === w.n) && connects(chain[chain.length - 1], w) && !w.n.endsWith('ん'));
    if (!correctList.length) {
      chain = [{ n: 'りんご', e: '🍎' }, { n: 'ごりら', e: '🦍' }];
    }
    const correct = choice(correctList.length ? correctList : WORDS.filter(w => connects(chain[chain.length - 1], w)));
    const wrongs = shuffle(WORDS.filter(w => w.n !== correct.n && !chain.some(c => c.n === w.n) && !connects(chain[chain.length - 1], w))).slice(0, 3);
    const options = shuffle([correct, ...wrongs]);
    const label = (w) => `${w.e} ${w.n}`;
    return {
      prompt: `「${chain[chain.length - 1].n}」の つぎに つながる ことばは？`,
      render(container) {
        const row = document.createElement('div');
        row.className = 'chain';
        chain.forEach((w, i) => {
          if (i > 0) {
            const a = document.createElement('span');
            a.className = 'arrow';
            a.textContent = '→';
            row.appendChild(a);
          }
          const t = document.createElement('span');
          t.className = 'tok';
          t.textContent = `${w.e} ${w.n}`;
          row.appendChild(t);
        });
        const a = document.createElement('span');
        a.className = 'arrow';
        a.textContent = '→';
        row.appendChild(a);
        const next = document.createElement('span');
        next.className = 'next';
        next.textContent = '？';
        row.appendChild(next);
        container.appendChild(row);
      },
      choices: options.map(label),
      answer: label(correct),
      explain: `「${chain[chain.length - 1].n}」は「${normTail(chain[chain.length - 1].n)}」で おわるから、「${normTail(chain[chain.length - 1].n)}」で はじまる ことばを えらぶよ。`,
    };
  },
};
