window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  const fallbackUsers = [
    { username: 'Aaron', displayName: 'Aaron', themeClass: 'owner-primary', avatarClass: 'avatar-primary', scoreKey: 'Aaron' },
    { username: 'Julie', displayName: 'Julie', themeClass: 'owner-secondary', avatarClass: 'avatar-secondary', scoreKey: 'Julie' }
  ];

  function normalizeUser(user, index) {
    const fallback = fallbackUsers[index] || fallbackUsers[0];
    const username = user?.username || user?.displayName || user?.display_name || fallback.username;
    const displayName = user?.displayName || user?.display_name || user?.username || fallback.displayName;
    const themeClass = user?.themeClass || user?.theme_class || fallback.themeClass;
    const avatarClass = user?.avatarClass || user?.avatar_class || (themeClass === 'owner-secondary' ? 'avatar-secondary' : 'avatar-primary');
    const scoreKey = user?.scoreKey || user?.score_key || username || fallback.scoreKey;

    return { ...user, username, displayName, themeClass, avatarClass, scoreKey };
  }

  function getUsers(source) {
    const candidates = source?.users || CR.historyMockData?.users || CR.gameDayUsers || fallbackUsers;
    const users = Array.isArray(candidates) && candidates.length ? candidates : fallbackUsers;
    return users.map(normalizeUser);
  }

  function getUser(index = 0, source) {
    return getUsers(source)[index] || normalizeUser(null, index);
  }

  function getDisplayName(index = 0, source) {
    return getUser(index, source).displayName;
  }

  function getThemeClass(indexOrName = 0, source) {
    if (typeof indexOrName === 'number') return getUser(indexOrName, source).themeClass;
    const lookup = String(indexOrName || '').trim().toLowerCase();
    return getUsers(source).find((user) => [user.username, user.displayName, user.scoreKey].some((value) => String(value || '').trim().toLowerCase() === lookup))?.themeClass || '';
  }

  function getAvatarClass(indexOrName = 0, source) {
    if (typeof indexOrName === 'number') return getUser(indexOrName, source).avatarClass;
    const lookup = String(indexOrName || '').trim().toLowerCase();
    return getUsers(source).find((user) => [user.username, user.displayName, user.scoreKey].some((value) => String(value || '').trim().toLowerCase() === lookup))?.avatarClass || 'avatar-primary';
  }

  function getScoreKey(index = 0, source) {
    return getUser(index, source).scoreKey;
  }

  function ownerClass(indexOrName = 0, source) {
    return getThemeClass(indexOrName, source);
  }

  function leaderClass(indexOrName = 0, source) {
    const owner = ownerClass(indexOrName, source);
    return owner ? owner.replace('owner-', 'leader-') : 'leader-tie';
  }

  function winnerClass(indexOrName = 0, source) {
    if (String(indexOrName || '').toLowerCase() === 'tie') return 'winner-tie';
    const owner = ownerClass(indexOrName, source);
    return owner ? owner.replace('owner-', 'winner-') : 'winner-tie';
  }

  CR.identity = { getUsers, getUser, getDisplayName, getThemeClass, getAvatarClass, getScoreKey, ownerClass, leaderClass, winnerClass };
})();
