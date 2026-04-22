// 「季節」— 絵(絵文字)を見て関係する季節を選ぶ
import { choice, shuffle, el } from '../util.js';

const SEASONS = ['はる', 'なつ', 'あき', 'ふゆ'];

const ITEMS = [
  // はる
  { e: '🌸', name: 'さくら', s: 'はる' },
  { e: '🌷', name: 'チューリップ', s: 'はる' },
  { e: '🎎', name: 'ひなまつり', s: 'はる' },
  { e: '🎏', name: 'こいのぼり', s: 'はる' },
  { e: '🐛', name: 'あおむし', s: 'はる' },
  { e: '🐣', name: 'ひよこ', s: 'はる' },
  // なつ
  { e: '🍉', name: 'すいか', s: 'なつ' },
  { e: '🌻', name: 'ひまわり', s: 'なつ' },
  { e: '🎆', name: 'はなび', s: 'なつ' },
  { e: '🏖️', name: 'うみ', s: 'なつ' },
  { e: '🍧', name: 'かきごおり', s: 'なつ' },
  { e: '🦋', name: 'ちょう', s: 'なつ' },
  { e: '🦗', name: 'せみ', s: 'なつ' },
  // あき
  { e: '🍁', name: 'もみじ', s: 'あき' },
  { e: '🍂', name: 'おちば', s: 'あき' },
  { e: '🌰', name: 'くり', s: 'あき' },
  { e: '🎃', name: 'かぼちゃ', s: 'あき' },
  { e: '🍠', name: 'さつまいも', s: 'あき' },
  { e: '🌕', name: 'おつきみ', s: 'あき' },
  { e: '🍇', name: 'ぶどう', s: 'あき' },
  // ふゆ
  { e: '⛄', name: 'ゆきだるま', s: 'ふゆ' },
  { e: '☃️', name: 'ゆき', s: 'ふゆ' },
  { e: '🎅', name: 'サンタさん', s: 'ふゆ' },
  { e: '🎄', name: 'クリスマス', s: 'ふゆ' },
  { e: '🍊', name: 'みかん', s: 'ふゆ' },
  { e: '🧣', name: 'マフラー', s: 'ふゆ' },
  { e: '🎍', name: 'かどまつ', s: 'ふゆ' },
];

export default {
  id: 'season',
  name: '季節',
  emoji: '🌸',
  description: 'えをみて、どのきせつか おしえてね',
  generate() {
    const item = choice(ITEMS);
    return {
      prompt: 'どのきせつの ものかな？',
      render(container) {
        container.appendChild(
          el('div', { class: 'choice big', attrs: { 'aria-hidden': 'true' }, html: `<span class="big">${item.e}</span><span>${item.name}</span>` })
        );
      },
      choices: shuffle(SEASONS.slice()),
      answer: item.s,
      explain: `「${item.name}」は ${item.s} だよ。`,
    };
  },
};
