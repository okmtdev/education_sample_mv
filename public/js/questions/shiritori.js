// 「しりとり」— まえの ことばの さいごの おん から はじまる ことばを えらぶ
import { choice, shuffle } from '../util.js';

const WORDS = [
  // あ行 ------------------------------
  { n: 'あひる', e: '🦆' },
  { n: 'あか', e: '🟥' },
  { n: 'あし', e: '🦵' },
  { n: 'あり', e: '🐜' },
  { n: 'あめ', e: '🍬' },
  { n: 'あおぞら', e: '🌤️' },
  { n: 'あじさい', e: '💠' },
  { n: 'いか', e: '🦑' },
  { n: 'いぬ', e: '🐶' },
  { n: 'いす', e: '🪑' },
  { n: 'いちご', e: '🍓' },
  { n: 'いのしし', e: '🐗' },
  { n: 'いも', e: '🍠' },
  { n: 'うさぎ', e: '🐰' },
  { n: 'うま', e: '🐴' },
  { n: 'うし', e: '🐮' },
  { n: 'うに', e: '🐚' },
  { n: 'うみ', e: '🌊' },
  { n: 'えび', e: '🦐' },
  { n: 'えんぴつ', e: '✏️' },
  { n: 'えのぐ', e: '🎨' },
  { n: 'おに', e: '👹' },
  { n: 'おの', e: '🪓' },
  { n: 'おかし', e: '🍩' },
  { n: 'おてら', e: '⛩️' },
  // か行 ------------------------------
  { n: 'かさ', e: '🌂' },
  { n: 'かに', e: '🦀' },
  { n: 'かぎ', e: '🔑' },
  { n: 'かめ', e: '🐢' },
  { n: 'かみ', e: '📄' },
  { n: 'かわ', e: '🌊' },
  { n: 'かご', e: '🧺' },
  { n: 'きつね', e: '🦊' },
  { n: 'きのこ', e: '🍄' },
  { n: 'きりん', e: '🦒' },
  { n: 'きんぎょ', e: '🐠' },
  { n: 'くま', e: '🐻' },
  { n: 'くつ', e: '👟' },
  { n: 'くじら', e: '🐳' },
  { n: 'くも', e: '☁️' },
  { n: 'くり', e: '🌰' },
  { n: 'くるま', e: '🚗' },
  { n: 'けむし', e: '🐛' },
  { n: 'こま', e: '🪀' },
  { n: 'こあら', e: '🐨' },
  { n: 'こい', e: '🎏' },
  { n: 'こうもり', e: '🦇' },
  { n: 'こおり', e: '🧊' },
  // さ行 ------------------------------
  { n: 'さる', e: '🐒' },
  { n: 'さかな', e: '🐟' },
  { n: 'さくら', e: '🌸' },
  { n: 'しか', e: '🦌' },
  { n: 'しまうま', e: '🦓' },
  { n: 'すいか', e: '🍉' },
  { n: 'すずめ', e: '🐦' },
  { n: 'すな', e: '⏳' },
  { n: 'そら', e: '🌈' },
  { n: 'そり', e: '🛷' },
  // た行 ------------------------------
  { n: 'たこ', e: '🐙' },
  { n: 'たまご', e: '🥚' },
  { n: 'たいこ', e: '🥁' },
  { n: 'たぬき', e: '🦝' },
  { n: 'たんぽぽ', e: '🌼' },
  { n: 'ちょう', e: '🦋' },
  { n: 'ちきゅう', e: '🌍' },
  { n: 'つき', e: '🌕' },
  { n: 'つくえ', e: '🪑' },
  { n: 'つる', e: '🕊️' },
  { n: 'てがみ', e: '✉️' },
  { n: 'てぶくろ', e: '🧤' },
  { n: 'とり', e: '🐦' },
  { n: 'とけい', e: '⏰' },
  { n: 'とまと', e: '🍅' },
  { n: 'とんぼ', e: '🪲' },
  { n: 'とら', e: '🐯' },
  // な行 ------------------------------
  { n: 'なす', e: '🍆' },
  { n: 'なし', e: '🍐' },
  { n: 'にじ', e: '🌈' },
  { n: 'にわとり', e: '🐓' },
  { n: 'ぬいぐるみ', e: '🧸' },
  { n: 'ねこ', e: '🐱' },
  { n: 'ねずみ', e: '🐭' },
  { n: 'ねっこ', e: '🌿' },
  // は行 ------------------------------
  { n: 'はな', e: '🌺' },
  { n: 'はし', e: '🥢' },
  { n: 'はと', e: '🕊️' },
  { n: 'はりねずみ', e: '🦔' },
  { n: 'ひこうき', e: '✈️' },
  { n: 'ひつじ', e: '🐑' },
  { n: 'ひよこ', e: '🐤' },
  { n: 'ふね', e: '🚢' },
  { n: 'ふうせん', e: '🎈' },
  { n: 'へび', e: '🐍' },
  { n: 'ほし', e: '⭐' },
  { n: 'ほん', e: '📕' },
  { n: 'ほたる', e: '🌟' },
  // ま行 ------------------------------
  { n: 'まめ', e: '🫘' },
  { n: 'まり', e: '⚽' },
  { n: 'まくら', e: '🛏️' },
  { n: 'みかん', e: '🍊' },
  { n: 'みずたまり', e: '💧' },
  { n: 'むし', e: '🐛' },
  { n: 'むらさき', e: '🟣' },
  { n: 'めがね', e: '👓' },
  { n: 'もも', e: '🍑' },
  { n: 'もぐら', e: '🐾' },
  { n: 'もり', e: '🌲' },
  // や行 ------------------------------
  { n: 'やま', e: '⛰️' },
  { n: 'やかん', e: '🫖' },
  { n: 'やさい', e: '🥬' },
  { n: 'やぎ', e: '🐐' },
  { n: 'ゆき', e: '❄️' },
  { n: 'ゆびわ', e: '💍' },
  { n: 'よる', e: '🌙' },
  { n: 'ようかい', e: '👻' },
  // ら行 ------------------------------
  { n: 'らいおん', e: '🦁' },
  { n: 'らっぱ', e: '🎺' },
  { n: 'りす', e: '🐿️' },
  { n: 'りんご', e: '🍎' },
  { n: 'ろうそく', e: '🕯️' },
  { n: 'ろけっと', e: '🚀' },
  // わ行 ------------------------------
  { n: 'わに', e: '🐊' },
  { n: 'わた', e: '☁️' },
  // その他（よく使うもの）
  { n: 'ぱんだ', e: '🐼' },
  { n: 'ぎたあ', e: '🎸' },
  { n: 'だるま', e: '🎎' },
  { n: 'ごりら', e: '🦍' },
  { n: 'ぞう', e: '🐘' },
  { n: 'ぐみ', e: '🍬' },
  { n: 'ばなな', e: '🍌' },
  { n: 'ぼうし', e: '🎩' },
  { n: 'ばった', e: '🦗' },
  { n: 'ぶどう', e: '🍇' },
  { n: 'びよういん', e: '💇' },
  { n: 'べんきょう', e: '📖' },
  { n: 'ぽすと', e: '📮' },
  { n: 'ぺんぎん', e: '🐧' },
];

// 末尾の音を 直音 に正規化 (ー / 拗音 / 促音 / 撥音 の扱い)
function normTail(s) {
  const c = s[s.length - 1];
  const map = {
    'ー': s[s.length - 2] || 'あ',
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
    'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ',
    'っ': s[s.length - 2] || 'つ',
  };
  return map[c] ?? c;
}

// 先頭の 濁点・半濁点 を清音に正規化
function normHead(s) {
  const c = s[0];
  const dmap = {
    'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ',
    'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ',
    'だ': 'た', 'ぢ': 'ち', 'づ': 'つ', 'で': 'て', 'ど': 'と',
    'ば': 'は', 'び': 'ひ', 'ぶ': 'ふ', 'べ': 'へ', 'ぼ': 'ほ',
    'ぱ': 'は', 'ぴ': 'ひ', 'ぷ': 'ふ', 'ぺ': 'へ', 'ぽ': 'ほ',
  };
  return dmap[c] ?? c;
}
function connects(prev, next) {
  return normTail(prev.n) === normHead(next.n);
}

function buildChain() {
  const nonNEnd = WORDS.filter(w => !w.n.endsWith('ん'));
  for (let tries = 0; tries < 80; tries++) {
    const start = choice(nonNEnd);
    const seconds = nonNEnd.filter(w => w.n !== start.n && connects(start, w));
    if (!seconds.length) continue;
    const s2 = choice(seconds);
    // 3語鎖を積極的に作る (middle 問題に使うため確率を高めに)
    if (Math.random() < 0.6) {
      const thirds = nonNEnd.filter(w => ![start.n, s2.n].includes(w.n) && connects(s2, w));
      if (thirds.length) return [start, s2, choice(thirds)];
    }
    return [start, s2];
  }
  return [{ n: 'りんご', e: '🍎' }, { n: 'ごりら', e: '🦍' }];
}

function makeChainRow(slots) {
  // slots: 配列。{ type:'tok', w } or { type:'unknown' }
  const row = document.createElement('div');
  row.className = 'chain';
  slots.forEach((s, i) => {
    if (i > 0) {
      const a = document.createElement('span');
      a.className = 'arrow';
      a.textContent = '→';
      row.appendChild(a);
    }
    if (s.type === 'tok') {
      const t = document.createElement('span');
      t.className = 'tok';
      t.textContent = `${s.w.e} ${s.w.n}`;
      row.appendChild(t);
    } else {
      const q = document.createElement('span');
      q.className = 'next';
      q.textContent = '？';
      row.appendChild(q);
    }
  });
  return row;
}

export default {
  id: 'shiritori',
  name: 'しりとり',
  emoji: '🔗',
  description: 'つぎに つなげる ことばは どれ？',
  generate() {
    const chain = buildChain();
    const label = (w) => `${w.e} ${w.n}`;

    // バリアントをランダム選択 (3語鎖があれば middle も候補に)
    const variants = chain.length >= 3 ? ['next', 'first', 'middle'] : ['next', 'first'];
    const variant = choice(variants);

    // ---- 1つ目を当てる ----
    if (variant === 'first') {
      const target = chain[0];
      const wrongPool = WORDS.filter(w =>
        w.n !== target.n && !chain.some(c => c.n === w.n) && !connects(w, chain[1]));
      const wrongs = shuffle(wrongPool).slice(0, 3);
      return {
        prompt: `「${chain[1].n}」の まえに つながる ことばは？`,
        render(container) {
          const slots = [
            { type: 'unknown' },
            ...chain.slice(1).map(w => ({ type: 'tok', w })),
          ];
          container.appendChild(makeChainRow(slots));
        },
        choices: shuffle([target, ...wrongs]).map(label),
        answer: label(target),
        explain: `「${chain[1].n}」は「${normHead(chain[1].n)}」で はじまるから、「${normHead(chain[1].n)}」で おわる ことばを えらぶよ。`,
      };
    }

    // ---- 2つ目を当てる (3語鎖のみ) ----
    if (variant === 'middle') {
      const target = chain[1];
      const wrongPool = WORDS.filter(w =>
        w.n !== target.n && !chain.some(c => c.n === w.n) && !connects(chain[0], w));
      const wrongs = shuffle(wrongPool).slice(0, 3);
      return {
        prompt: `「${chain[0].n}」と「${chain[2].n}」を つなぐ ことばは？`,
        render(container) {
          const slots = [
            { type: 'tok', w: chain[0] },
            { type: 'unknown' },
            { type: 'tok', w: chain[2] },
          ];
          container.appendChild(makeChainRow(slots));
        },
        choices: shuffle([target, ...wrongs]).map(label),
        answer: label(target),
        explain: `「${chain[0].n}」は「${normTail(chain[0].n)}」で おわるから「${normTail(chain[0].n)}」で はじまって、「${chain[2].n}」の まえの「${normHead(chain[2].n)}」に つながる ことばを えらぶよ。`,
      };
    }

    // ---- 3つ目（次）を当てる (既存) ----
    const tail = chain[chain.length - 1];
    const correctPool = WORDS.filter(w =>
      !chain.some(c => c.n === w.n) && connects(tail, w));
    const correct = correctPool.length ? choice(correctPool) : choice(WORDS.filter(w => w.n !== tail.n));
    const wrongPool = WORDS.filter(w =>
      w.n !== correct.n && !chain.some(c => c.n === w.n) && !connects(tail, w));
    const wrongs = shuffle(wrongPool).slice(0, 3);
    return {
      prompt: `「${tail.n}」の つぎに つながる ことばは？`,
      render(container) {
        const slots = chain.map(w => ({ type: 'tok', w }));
        const row = makeChainRow(slots);
        const a = document.createElement('span');
        a.className = 'arrow';
        a.textContent = '→';
        row.appendChild(a);
        const q = document.createElement('span');
        q.className = 'next';
        q.textContent = '？';
        row.appendChild(q);
        container.appendChild(row);
      },
      choices: shuffle([correct, ...wrongs]).map(label),
      answer: label(correct),
      explain: `「${tail.n}」は「${normTail(tail.n)}」で おわるから、「${normTail(tail.n)}」で はじまる ことばを えらぶよ。`,
    };
  },
};
