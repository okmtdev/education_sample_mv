// 「欠所補充」— 同じ絵を「ひだり」と「みぎ」に並べ、みぎに 1 つだけ 足りない ところがある
// 家以外にも いろいろなバリエーションを用意する。
import { rand, shuffle, svg, el } from '../util.js';

// 各 shape = { name, viewBox, parts: [{ key, label, build(opts) => SVGElement[] }] }
// build は、この "パーツ" を描画する SVG 要素配列を返す。
// 「完成図」は 全パーツを描画、「欠損図」は missing キー以外を描画。

const SHAPES = [];

// ---------- 1. いえ ----------
SHAPES.push({
  name: 'いえ',
  viewBox: '0 0 140 140',
  parts: [
    { key: 'roofL', label: 'やねの ひだりの せん', build: () => line(30, 70, 70, 30) },
    { key: 'roofR', label: 'やねの みぎの せん', build: () => line(70, 30, 110, 70) },
    { key: 'roofB', label: 'やねの したの せん', build: () => line(30, 70, 110, 70) },
    { key: 'wallL', label: 'ひだりの かべ', build: () => line(30, 70, 30, 120) },
    { key: 'wallR', label: 'みぎの かべ', build: () => line(110, 70, 110, 120) },
    { key: 'floor', label: 'ゆか', build: () => line(30, 120, 110, 120) },
    { key: 'doorL', label: 'ドアの ひだりの せん', build: () => line(55, 120, 55, 95) },
    { key: 'doorR', label: 'ドアの みぎの せん', build: () => line(85, 120, 85, 95) },
    { key: 'doorTop', label: 'ドアの うえの せん', build: () => line(55, 95, 85, 95) },
    { key: 'window', label: 'まど', build: () => rect(65, 80, 20, 10) },
  ],
});

// ---------- 2. かお ----------
SHAPES.push({
  name: 'かお',
  viewBox: '0 0 140 140',
  parts: [
    { key: 'head', label: 'かおの りんかく', build: () => circle(70, 72, 50) },
    { key: 'eyeL', label: 'ひだりの め', build: () => circle(52, 60, 5, '#23314a') },
    { key: 'eyeR', label: 'みぎの め', build: () => circle(88, 60, 5, '#23314a') },
    { key: 'nose', label: 'はな', build: () => line(70, 70, 70, 82) },
    { key: 'mouth', label: 'くち', build: () => arc(55, 95, 85, 95, 6) },
    { key: 'earL', label: 'ひだりの みみ', build: () => circle(25, 72, 8) },
    { key: 'earR', label: 'みぎの みみ', build: () => circle(115, 72, 8) },
  ],
});

// ---------- 3. き (木) ----------
SHAPES.push({
  name: 'き',
  viewBox: '0 0 140 140',
  parts: [
    { key: 'canopy', label: 'はっぱ', build: () => circle(70, 50, 35) },
    { key: 'trunkL', label: 'みきの ひだりの せん', build: () => line(60, 80, 60, 125) },
    { key: 'trunkR', label: 'みきの みぎの せん', build: () => line(80, 80, 80, 125) },
    { key: 'trunkBottom', label: 'みきの したの せん', build: () => line(60, 125, 80, 125) },
    { key: 'ground', label: 'じめん', build: () => line(20, 125, 120, 125) },
    { key: 'fruit', label: 'みの まる', build: () => circle(55, 55, 4, '#ff6b6b') },
  ],
});

// ---------- 4. くるま ----------
SHAPES.push({
  name: 'くるま',
  viewBox: '0 0 160 110',
  parts: [
    { key: 'body', label: 'くるまの ボディ', build: () => rect(20, 55, 120, 30) },
    { key: 'top', label: 'うえの やね', build: () => polyline([[45, 55], [60, 30], [100, 30], [115, 55]]) },
    { key: 'wheelL', label: 'ひだりの タイヤ', build: () => circle(45, 90, 12) },
    { key: 'wheelR', label: 'みぎの タイヤ', build: () => circle(115, 90, 12) },
    { key: 'window', label: 'まど', build: () => rect(62, 35, 36, 18) },
    { key: 'light', label: 'まえの ライト', build: () => circle(135, 68, 4) },
  ],
});

// ---------- 5. ひと ----------
SHAPES.push({
  name: 'ひと',
  viewBox: '0 0 140 160',
  parts: [
    { key: 'head', label: 'あたま', build: () => circle(70, 35, 20) },
    { key: 'bodyL', label: 'からだの ひだりの せん', build: () => line(55, 60, 55, 110) },
    { key: 'bodyR', label: 'からだの みぎの せん', build: () => line(85, 60, 85, 110) },
    { key: 'bodyTop', label: 'からだの うえの せん', build: () => line(55, 60, 85, 60) },
    { key: 'bodyBottom', label: 'からだの したの せん', build: () => line(55, 110, 85, 110) },
    { key: 'armL', label: 'ひだりの うで', build: () => line(55, 70, 30, 95) },
    { key: 'armR', label: 'みぎの うで', build: () => line(85, 70, 110, 95) },
    { key: 'legL', label: 'ひだりの あし', build: () => line(62, 110, 58, 145) },
    { key: 'legR', label: 'みぎの あし', build: () => line(78, 110, 82, 145) },
  ],
});

// ---------- 6. さかな ----------
SHAPES.push({
  name: 'さかな',
  viewBox: '0 0 160 110',
  parts: [
    { key: 'body', label: 'からだ', build: () => ellipse(65, 55, 45, 25) },
    { key: 'tailTop', label: 'しっぽの うえ', build: () => line(110, 55, 140, 30) },
    { key: 'tailBottom', label: 'しっぽの した', build: () => line(110, 55, 140, 80) },
    { key: 'tailBack', label: 'しっぽの うしろ', build: () => line(140, 30, 140, 80) },
    { key: 'eye', label: 'め', build: () => circle(40, 48, 3, '#23314a') },
    { key: 'fin', label: 'せびれ', build: () => polyline([[55, 30], [70, 22], [80, 30]]) },
    { key: 'mouth', label: 'くち', build: () => line(20, 58, 28, 58) },
  ],
});

// ---------- 描画ヘルパ ----------
function line(x1, y1, x2, y2, w = 2.5) {
  return [svg('line', { x1, y1, x2, y2, stroke: '#23314a', 'stroke-width': w, 'stroke-linecap': 'round' })];
}
function rect(x, y, w, h) {
  return [svg('rect', { x, y, width: w, height: h, fill: 'none', stroke: '#23314a', 'stroke-width': 2.5 })];
}
function circle(cx, cy, r, fill = 'none') {
  return [svg('circle', { cx, cy, r, fill, stroke: '#23314a', 'stroke-width': 2.5 })];
}
function ellipse(cx, cy, rx, ry) {
  return [svg('ellipse', { cx, cy, rx, ry, fill: 'none', stroke: '#23314a', 'stroke-width': 2.5 })];
}
function polyline(pts) {
  return [svg('polyline', { points: pts.map(p => p.join(',')).join(' '), fill: 'none', stroke: '#23314a', 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })];
}
function arc(x1, y1, x2, y2, bend) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + bend;
  return [svg('path', { d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`, fill: 'none', stroke: '#23314a', 'stroke-width': 2.5, 'stroke-linecap': 'round' })];
}

function drawShape(shape, missingKey /* string|null */) {
  const s = svg('svg', { viewBox: shape.viewBox, class: 'shape-svg' });
  // 背景 (紙の色)
  const [, , vbw, vbh] = shape.viewBox.split(' ').map(Number);
  s.appendChild(svg('rect', { x: 0, y: 0, width: vbw, height: vbh, fill: 'white' }));
  for (const part of shape.parts) {
    if (part.key === missingKey) continue;
    for (const node of part.build()) s.appendChild(node);
  }
  return s;
}

export default {
  id: 'missingPiece',
  name: '欠所補充',
  emoji: '🧩',
  description: 'ひだりの えと くらべて、みぎに たりない ところは どこ？',
  generate() {
    const shape = SHAPES[rand(SHAPES.length)];
    const missing = shape.parts[rand(shape.parts.length)];
    const others = shuffle(shape.parts.filter(p => p.key !== missing.key)).slice(0, 3);
    const choices = shuffle([missing, ...others]).map(p => p.label);
    return {
      prompt: `ひだりの ${shape.name} と くらべて、みぎに たりない ところは どこ？`,
      render(container) {
        const pair = el('div', { class: 'shape-pair' });
        const f1 = el('figure');
        f1.appendChild(drawShape(shape, null));
        f1.appendChild(el('figcaption', { text: 'ひだり (かんせい)' }));
        const f2 = el('figure');
        f2.appendChild(drawShape(shape, missing.key));
        f2.appendChild(el('figcaption', { text: 'みぎ' }));
        pair.append(f1, f2);
        container.appendChild(pair);
      },
      choices,
      answer: missing.label,
      explain: `みぎの えに かけているのは「${missing.label}」だよ。`,
    };
  },
};
