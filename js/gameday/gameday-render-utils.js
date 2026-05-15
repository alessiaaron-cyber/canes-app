window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function identity() {
    return CR.identity || {};
  }

  function userName(index) {
    return identity().getDisplayName?.(index) || (index === 0 ? 'Aaron' : 'Julie');
  }

  function scoreKey(index) {
    return identity().getScoreKey?.(index) || userName(index);
  }

  function ownerClass(index) {
    return identity().ownerClass?.(index) || (index === 0 ? 'owner-primary' : 'owner-secondary');
  }

  function changedClass(key, className = 'is-realtime-changed') {
    return CR.ui?.changedClass?.(key, className) || '';
  }

  function normalizeKeyPart(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
  }

  function scoreChangedKey(owner) {
    return `gameday:score:${normalizeKeyPart(owner)}`;
  }

  function pickChangedKey(player, stat) {
    return `gameday:pick:${normalizeKeyPart(player)}:${normalizeKeyPart(stat)}`;
  }

  function firstGoalChangedKey() {
    return 'gameday:first-goal';
  }

  function feedChangedKey() {
    return 'gameday:feed';
  }

  function getUserPicks(users, index) {
    const key = scoreKey(index);
    const name = userName(index);
    const fallback = index === 0 ? 'Aaron' : 'Julie';
    return users?.[key] || users?.[name] || users?.[fallback] || [];
  }

  function getUserScore(scores, index) {
    const key = scoreKey(index);
    const name = userName(index);
    const fallback = index === 0 ? 'Aaron' : 'Julie';
    return Number(scores?.[key] ?? scores?.[name] ?? scores?.[fallback] ?? 0);
  }

  function getSideContext(index, data = {}) {
    return {
      index,
      name: userName(index),
      key: scoreKey(index),
      ownerClass: ownerClass(index),
      picks: getUserPicks(data.users, index),
      score: getUserScore(data.scores, index)
    };
  }

  function sides(data = {}) {
    return [getSideContext(0, data), getSideContext(1, data)];
  }

  CR.gameDayRenderUtils = {
    userName,
    scoreKey,
    ownerClass,
    changedClass,
    normalizeKeyPart,
    scoreChangedKey,
    pickChangedKey,
    firstGoalChangedKey,
    feedChangedKey,
    getUserPicks,
    getUserScore,
    getSideContext,
    sides
  };
})();
