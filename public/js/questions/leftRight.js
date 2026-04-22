// 「左右」— その人(子供)の みぎ/ひだり の て に持っているのは?
// 子どもと向かい合っている絵なので、絵の「右」は本人の「左」。
import { choice, shuffle, svg, el } from '../util.js';

const ITEMS = [
  { e: '🎒', name: 'ランドセル' },
  { e: '🧺', name: 'かご' },
  { e: '🪣', name: 'バケツ' },
  { e: '🦋', name: 'チョウ' },
  { e: '🎈', name: 'ふうせん' },
  { e: '📕', name: 'ほん' },
  { e: '🖍️', name: 'クレヨン' },
  { e: '🍎', name: 'りんご' },
  { e: '🌂', name: 'かさ' },
  { e: '🧢', name: 'ぼうし' },
];

function drawChild(facing /* 'front' | 'back' */, leftItem, rightItem) {
  // facing=front: 画面の右は子の左手、画面の左は子の右手
  // facing=back: 画面の右は子の右手、画面の左は子の左手
  const g = svg('svg', {
    viewBox: '0 0 240 260', width: '220', height: '240',
    class: 'person-svg', 'aria-hidden': 'true',
  });
  // 頭
  g.appendChild(svg('circle', { cx: 120, cy: 60, r: 34, fill: '#ffd7a8', stroke: '#23314a', 'stroke-width': 3 }));
  if (facing === 'front') {
    g.appendChild(svg('circle', { cx: 108, cy: 58, r: 3, fill: '#23314a' }));
    g.appendChild(svg('circle', { cx: 132, cy: 58, r: 3, fill: '#23314a' }));
    g.appendChild(svg('path', { d: 'M108 74 Q120 82 132 74', stroke: '#23314a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  } else {
    // うしろむき
    g.appendChild(svg('path', { d: 'M88 45 Q120 20 152 45 L150 70 Q120 55 90 70 Z', fill: '#3b2a1d' }));
  }
  // からだ
  g.appendChild(svg('rect', { x: 90, y: 100, width: 60, height: 80, rx: 10, fill: '#6cb4ee', stroke: '#23314a', 'stroke-width': 3 }));
  // 腕
  g.appendChild(svg('line', { x1: 95, y1: 110, x2: 55, y2: 160, stroke: '#23314a', 'stroke-width': 5, 'stroke-linecap': 'round' }));
  g.appendChild(svg('line', { x1: 145, y1: 110, x2: 185, y2: 160, stroke: '#23314a', 'stroke-width': 5, 'stroke-linecap': 'round' }));
  // あし
  g.appendChild(svg('line', { x1: 108, y1: 180, x2: 104, y2: 230, stroke: '#23314a', 'stroke-width': 6, 'stroke-linecap': 'round' }));
  g.appendChild(svg('line', { x1: 132, y1: 180, x2: 136, y2: 230, stroke: '#23314a', 'stroke-width': 6, 'stroke-linecap': 'round' }));
  // もちもの (絵文字)
  const leftItemNode = svg('text', { x: 55, y: 172, 'text-anchor': 'middle', 'font-size': 36 }, []);
  leftItemNode.textContent = leftItem;
  g.appendChild(leftItemNode);
  const rightItemNode = svg('text', { x: 185, y: 172, 'text-anchor': 'middle', 'font-size': 36 }, []);
  rightItemNode.textContent = rightItem;
  g.appendChild(rightItemNode);
  return g;
}

export default {
  id: 'leftRight',
  name: '左右',
  emoji: '👈',
  description: 'こどもの みぎて・ひだりて は どっち？',
  generate() {
    const a = choice(ITEMS);
    let b = choice(ITEMS);
    while (b.name === a.name) b = choice(ITEMS);
    const facing = Math.random() < 0.5 ? 'front' : 'back';
    // 画面の左に "a", 画面の右に "b" を描画
    const screenLeft = a, screenRight = b;
    // 本人視点に変換
    const childLeftHand = facing === 'front' ? screenRight : screenLeft;
    const childRightHand = facing === 'front' ? screenLeft : screenRight;

    const ask = choice(['みぎて', 'ひだりて']);
    const answer = ask === 'みぎて' ? childRightHand.name : childLeftHand.name;
    const choices = shuffle([a.name, b.name, ...shuffle(ITEMS.filter(x => x.name !== a.name && x.name !== b.name)).slice(0, 2).map(x => x.name)]);

    const facingLabel = facing === 'front' ? 'こっちを むいて いる' : 'うしろを むいて いる';
    return {
      prompt: `${facingLabel} こどもが ${ask} に もって いるのは？`,
      render(container) {
        container.appendChild(drawChild(facing, screenLeft.e, screenRight.e));
      },
      choices,
      answer,
      explain: facing === 'front'
        ? 'こっちむき なので、えの みぎは あいての ひだりて だよ。'
        : 'うしろむき なので、えの みぎは あいての みぎて だよ。',
    };
  },
};
