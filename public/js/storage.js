// LocalStorage に過去の成績・設定を保存。キーは版管理のため "mk-" プレフィックス。
const KEY_SESSIONS = 'mk-sessions-v1';
const KEY_STATS = 'mk-stats-v1';
const KEY_CUSTOM = 'mk-custom-v1';
const KEY_GEMINI = 'mk-gemini-key-v1';
const KEY_CHILD_NAME = 'mk-child-name-v1';
const KEY_CHILD_GENDER = 'mk-child-gender-v1';

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

export function loadCustomBreakdown() {
  return read(KEY_CUSTOM, null);
}

export function saveCustomBreakdown(breakdown) {
  write(KEY_CUSTOM, breakdown);
}

export function loadGeminiKey() {
  return read(KEY_GEMINI, '') || '';
}

export function saveGeminiKey(key) {
  if (key == null || key === '') {
    localStorage.removeItem(KEY_GEMINI);
  } else {
    write(KEY_GEMINI, String(key));
  }
}

export function loadChildName() {
  return read(KEY_CHILD_NAME, '') || '';
}

export function saveChildName(name) {
  if (name == null || name === '') {
    localStorage.removeItem(KEY_CHILD_NAME);
  } else {
    write(KEY_CHILD_NAME, String(name));
  }
}

export function loadChildGender() {
  return read(KEY_CHILD_GENDER, 'chan') || 'chan';
}

export function saveChildGender(g) {
  write(KEY_CHILD_GENDER, String(g));
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

// 指定した 1 セッションを削除。統計は残りのセッションから再計算する。
export function deleteSession(startedAt) {
  const sessions = loadSessions().filter(s => s.startedAt !== startedAt);
  write(KEY_SESSIONS, sessions);
  const stats = {};
  for (const s of sessions) {
    for (const r of (s.results || [])) {
      const st = stats[r.typeId] ?? { correct: 0, total: 0 };
      st.total += 1;
      if (r.correct) st.correct += 1;
      stats[r.typeId] = st;
    }
  }
  write(KEY_STATS, stats);
}
