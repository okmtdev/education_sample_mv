// LocalStorage に過去の成績を保存。キーは版管理のため "mk-" プレフィックス。
const KEY_SESSIONS = 'mk-sessions-v1';
const KEY_STATS = 'mk-stats-v1';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('storage write failed', e);
  }
}

export function loadSessions() {
  return read(KEY_SESSIONS, []);
}

export function loadStats() {
  return read(KEY_STATS, {});
}

/**
 * session = {
 *   startedAt, finishedAt, mode, typeBreakdown: { [typeId]: count },
 *   total, correct, results: [{ typeId, correct }]
 * }
 */
export function saveSession(session) {
  const sessions = loadSessions();
  sessions.push(session);
  // 最新100件のみ保持
  write(KEY_SESSIONS, sessions.slice(-100));

  const stats = loadStats();
  for (const r of session.results) {
    const s = stats[r.typeId] ?? { correct: 0, total: 0 };
    s.total += 1;
    if (r.correct) s.correct += 1;
    stats[r.typeId] = s;
  }
  write(KEY_STATS, stats);
}

export function clearAll() {
  localStorage.removeItem(KEY_SESSIONS);
  localStorage.removeItem(KEY_STATS);
}
