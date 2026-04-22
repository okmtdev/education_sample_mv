import season from './season.js';
import storyMemory from './storyMemory.js';
import leftRight from './leftRight.js';
import sequence from './sequence.js';
import sameShape from './sameShape.js';
import folktale from './folktale.js';
import shiritori from './shiritori.js';
import missingPiece from './missingPiece.js';
import blocks from './blocks.js';
import hardBlocks from './hardBlocks.js';
import order from './order.js';

// 全種類 (「じぶんで えらぶ」に表示)
export const TYPES = [
  season,
  storyMemory,
  leftRight,
  sequence,
  sameShape,
  folktale,
  shiritori,
  missingPiece,
  blocks,
  hardBlocks,
  order,
];

export const TYPE_BY_ID = Object.fromEntries(TYPES.map(t => [t.id, t]));

// おすすめ・ランダムで使う種類 (noAutoPlay:true を除く)
export const AUTO_TYPES = TYPES.filter(t => !t.noAutoPlay);

// 「おすすめ」構成 (記憶・常識・空間把握・言語・数量 をバランス良く、約10問)
export const RECOMMENDED = {
  season: 1,
  storyMemory: 1,
  leftRight: 1,
  sequence: 1,
  sameShape: 1,
  folktale: 1,
  shiritori: 1,
  missingPiece: 1,
  blocks: 1,
  order: 1,
};
