window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  const fallbackUsers = [
    { username: 'Aaron', displayName: 'Aaron', themeClass: 'owner-primary', avatarClass: 'avatar-primary', scoreKey: 'Aaron', colorHex: '#c8102e', colorLabel: 'Canes Red' },
    { username: 'Julie', displayName: 'Julie', themeClass: 'owner-secondary', avatarClass: 'avatar-secondary', scoreKey: 'Julie', colorHex: '#111827', colorLabel: 'Graphite' }
  ];

  function normalizeHex(value, fallback = '#111827') {
    const hex = String(value || '').trim();
    return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.toLowerCase() : fallback;
  }

  function hexToRgb(hex) {
    const clean = normalizeHex(hex).slice(1);
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }

  function rgbString(hex) {
    const rgb = hexToRgb(hex);
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }

  function shade(hex, percent = -18) {
    const rgb = hexToRgb(hex);
    const adjust = (channel) => {
      const next = percent < 0
        ? channel * (1 + percent / 100)
        : channel + (255 - channel) * (percent / 100);
      return Math.max(0, Math.min(255, Math.round(next)));
    };
    return `#${[adjust(rgb.r), adjust(rgb.g), adjust(rgb.b)].map((part) => part.toString(16).padStart(2, '0')).join('')}`;
  }

  function normalizeUser(user, index) {
    const fallback = fallbackUsers[index] || fallbackUsers[0];
    const username = user?.username || user?.displayName || user?.display_name || fallback.username;
    const displayName = user?.displayName || user?.display_name || user?.username || fallback.displayName;
    const themeClass = user?.themeClass || user?.theme_class || fallback.themeClass;
    const avatarClass = user?.avatarClass || user?.avatar_class || (themeClass === 'owner-secondary' ? 'avatar-secondary' : 'avatar-primary');
    const scoreKey = user?.scoreKey || user?.score_key || displayName || username || fallback.scoreKey;
    const colorHex = normalizeHex(user?.colorHex || user?.color_hex, fallback.colorHex);
    const colorLabel = user?.colorLabel || user?.color_label || fallback.colorLabel || 'User color';

    return { ...user, username, displayName, themeClass, avatarClass, scoreKey, colorHex, colorLabel };
  }

  function getUsers(source) {
    const candidates = source?.users || CR.gameDay?.users || CR.currentProfiles || CR.historyMockData?.users || CR.gameDayUsers || fallbackUsers;
    const users = Array.isArray(candidates) && candidates.length ? candidates : fallbackUsers;
    return users.map(normalizeUser);
  }

  function getUser(index = 0, source) {
    return getUsers(source)[index] || normalizeUser(null, index);
  }

  function findUser(indexOrName = 0, source) {
    if (typeof indexOrName === 'number') return getUser(indexOrName, source);
    const lookup = String(indexOrName || '').trim().toLowerCase();
    return getUsers(source).find((user) => [user.id, user.username, user.displayName, user.scoreKey].some((value) => String(value || '').trim().toLowerCase() === lookup)) || null;
  }

  function getDisplayName(index = 0, source) {
    return getUser(index, source).displayName;
  }

  function getThemeClass(indexOrName = 0, source) {
    return findUser(indexOrName, source)?.themeClass || '';
  }

  function getAvatarClass(indexOrName = 0, source) {
    return findUser(indexOrName, source)?.avatarClass || 'avatar-primary';
  }

  function getColor(indexOrName = 0, source) {
    return findUser(indexOrName, source)?.colorHex || normalizeUser(null, typeof indexOrName === 'number' ? indexOrName : 0).colorHex;
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

  function setVar(root, name, value) {
    root?.style?.setProperty?.(name, value);
  }

  function applyUserColorVariables(source) {
    const root = document.documentElement;
    const users = getUsers(source);

    users.slice(0, 2).forEach((user, index) => {
      const slot = index + 1;
      const color = normalizeHex(user.colorHex, fallbackUsers[index]?.colorHex);
      const dark = shade(color, -30);
      const rgb = rgbString(color);

      setVar(root, `--cr-user-${slot}-color`, color);
      setVar(root, `--cr-user-${slot}-color-dark`, dark);
      setVar(root, `--cr-user-${slot}-rgb`, rgb);
      setVar(root, `--cr-user-${slot}-soft`, `rgba(${rgb}, 0.08)`);
      setVar(root, `--cr-user-${slot}-border`, `rgba(${rgb}, 0.16)`);
    });

    const current = CR.currentProfile ? normalizeUser(CR.currentProfile, users.findIndex((user) => String(user.id || '') === String(CR.currentProfile?.id || ''))) : null;
    const currentColor = current?.colorHex || users[0]?.colorHex || fallbackUsers[0].colorHex;
    const currentRgb = rgbString(currentColor);

    setVar(root, '--cr-current-user-color', currentColor);
    setVar(root, '--cr-current-user-color-dark', shade(currentColor, -30));
    setVar(root, '--cr-current-user-rgb', currentRgb);
    setVar(root, '--cr-current-user-soft', `rgba(${currentRgb}, 0.08)`);
    setVar(root, '--cr-current-user-border', `rgba(${currentRgb}, 0.16)`);
  }

  CR.identity = {
    getUsers,
    getUser,
    findUser,
    getDisplayName,
    getThemeClass,
    getAvatarClass,
    getColor,
    getScoreKey,
    ownerClass,
    leaderClass,
    winnerClass,
    applyUserColorVariables,
    normalizeHex,
    shade,
    rgbString
  };
})();