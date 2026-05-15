window.CR = window.CR || {};

(() => {
  function safeText(value, fallback = '—') {
    const text = String(value || '').trim();
    return text || fallback;
  }

  function initialsFromProfile(profile) {
    const source = safeText(profile?.display_name || profile?.username || profile?.email, 'C');
    const parts = source.split(/\s+/).filter(Boolean);

    if (!parts.length) return 'C';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }

  function roleLabel(profile) {
    const role = String(profile?.role || '').trim().toLowerCase();
    return role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : 'Member';
  }

  function avatarThemeClass(profile) {
    const explicit = String(profile?.avatar_class || profile?.avatarClass || profile?.theme_class || profile?.themeClass || '').trim();
    if (explicit === 'avatar-primary' || explicit === 'avatar-secondary') return explicit;
    if (explicit === 'owner-primary') return 'avatar-primary';
    if (explicit === 'owner-secondary') return 'avatar-secondary';

    const username = String(profile?.username || profile?.display_name || '').trim().toLowerCase();
    const users = window.CR.historyMockData?.users || [];
    const matchedUser = users.find((item) => String(item.username || item.displayName || '').trim().toLowerCase() === username);

    if (matchedUser?.avatarClass) return matchedUser.avatarClass;
    if (matchedUser?.themeClass === 'owner-primary') return 'avatar-primary';
    if (matchedUser?.themeClass === 'owner-secondary') return 'avatar-secondary';

    return 'avatar-primary';
  }

  function applyAvatarTheme(element, themeClass) {
    if (!element) return;
    element.classList.remove('avatar-primary', 'avatar-secondary');
    element.classList.add(themeClass);
  }

  function renderAccountIdentity() {
    const profile = window.CR.currentProfile || {};
    const user = window.CR.currentUser || {};

    const displayName = safeText(profile.display_name || profile.username, 'Canes Rivalry');
    const username = safeText(profile.username, 'member');
    const email = safeText(user.email || profile.email, '—');
    const role = roleLabel(profile);
    const initials = initialsFromProfile({
      display_name: displayName,
      username,
      email
    });

    const avatarClass = avatarThemeClass(profile);

    const chipAvatar = document.querySelector('#accountChipAvatar');
    const chipName = document.querySelector('#accountChipName');
    const chipMeta = document.querySelector('#accountChipMeta');
    const manageTitle = document.querySelector('#manageAccountTitle');
    const manageRole = document.querySelector('#manageAccountRole');
    const manageAvatar = document.querySelector('#manageAccountAvatar');
    const manageName = document.querySelector('#manageAccountName');
    const manageMeta = document.querySelector('#manageAccountMeta');
    const manageEmail = document.querySelector('#manageAccountEmail');

    if (chipAvatar) {
      chipAvatar.textContent = initials;
      applyAvatarTheme(chipAvatar, avatarClass);
    }

    if (chipName) chipName.textContent = displayName;
    if (chipMeta) chipMeta.textContent = role;

    if (manageTitle) manageTitle.textContent = displayName;
    if (manageRole) manageRole.textContent = role;

    if (manageAvatar) {
      manageAvatar.textContent = initials;
      applyAvatarTheme(manageAvatar, avatarClass);
    }

    if (manageName) manageName.textContent = displayName;
    if (manageMeta) manageMeta.textContent = `@${username}`;
    if (manageEmail) manageEmail.textContent = email;
  }

  async function handleManageSignOut() {
    try {
      await window.CR.auth?.signOut?.();
    } catch (error) {
      console.error('Manage sign out failed', error);
    }

    window.CR.currentUser = null;
    window.CR.currentProfile = null;
    window.CR.session = null;
    window.location.reload();
  }

  function bindAccountUi() {
    document.querySelector('#accountChip')?.addEventListener('click', () => {
      window.CR.switchTab?.('manage');
    });

    document.querySelector('#manageSignOutButton')?.addEventListener('click', handleManageSignOut);
  }

  window.CR.refreshApp = async () => {
    window.CR.flashSync?.();

    try {
      await window.CR.refreshHistoryData?.();
      window.CR.renderGameDayState?.();
      window.CR.renderManage?.();
      window.CR.showToast?.('Rivalry refresh complete');
    } catch (error) {
      console.error('App refresh failed', error);
      window.CR.showToast?.({ message: 'Could not refresh rivalry data', tier: 'warning' });
    }
  };

  window.CR.startApp = () => {
    try {
      renderAccountIdentity();
      bindAccountUi();

      window.CR.initTabs?.();
      window.CR.initGameDay?.();
      window.CR.initHistory?.();
      window.CR.initManage?.();
      window.CR.initPullRefresh?.();

      window.CR.rivalryEventsConsumer?.register?.();
      window.CR.activeDeviceService?.bind?.();
      window.CR.activeDeviceService?.start?.();

      const savedTab = window.CR.getSavedTab?.() || 'gameday';
      window.CR.switchTab?.(savedTab);
    } catch (error) {
      console.error('V2 bootstrap failed', error);
      const root = document.querySelector('#appRoot') || document.body;
      root.insertAdjacentHTML('afterbegin', '<div style="padding:16px;background:#fee;color:#900;font-weight:800">V2 preview render failed. Check console.</div>');
    }
  };
})();