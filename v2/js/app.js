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

    const chipAvatar = document.querySelector('#accountChipAvatar');
    const chipName = document.querySelector('#accountChipName');
    const chipMeta = document.querySelector('#accountChipMeta');
    const manageTitle = document.querySelector('#manageAccountTitle');
    const manageRole = document.querySelector('#manageAccountRole');
    const manageAvatar = document.querySelector('#manageAccountAvatar');
    const manageName = document.querySelector('#manageAccountName');
    const manageMeta = document.querySelector('#manageAccountMeta');
    const manageEmail = document.querySelector('#manageAccountEmail');

    if (chipAvatar) chipAvatar.textContent = initials;
    if (chipName) chipName.textContent = displayName;
    if (chipMeta) chipMeta.textContent = role;

    if (manageTitle) manageTitle.textContent = displayName;
    if (manageRole) manageRole.textContent = role;
    if (manageAvatar) manageAvatar.textContent = initials;
    if (manageName) manageName.textContent = displayName;
    if (manageMeta) manageMeta.textContent = `@${username}`;
    if (manageEmail) manageEmail.textContent = email;
  }

  function ensureManageMount() {
    if (document.querySelector('#manageContent')) return;

    const manageView = document.querySelector('#manageView .content-stack');
    if (!manageView) return;

    const placeholderCard = Array.from(manageView.querySelectorAll('.panel-card')).find((card) => {
      const eyebrow = card.querySelector('.eyebrow');
      return eyebrow?.textContent?.trim() === 'Manage';
    });

    const mount = document.createElement('div');
    mount.id = 'manageContent';

    if (placeholderCard) {
      placeholderCard.replaceWith(mount);
    } else {
      manageView.appendChild(mount);
    }
  }

  function restoreManageFallback() {
    const mount = document.querySelector('#manageContent');
    if (!mount) return;

    mount.outerHTML = `
      <section class="panel-card">
        <div class="eyebrow">Manage</div>
        <h2>Settings and controls</h2>
        <p class="placeholder-copy">Manage preview is temporarily unavailable while the new control center finishes loading.</p>
      </section>
    `;
  }

  function ensureManageStylesheet() {
    const href = 'css/manage.css?v=v2manage1';

    const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find((link) => link.getAttribute('href') === href);
    if (existing) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Failed to load manage.css'));
      document.head.appendChild(link);
    });
  }

  function loadScript(src) {
    const existing = Array.from(document.querySelectorAll('script')).find((script) => script.getAttribute('src') === src);

    if (existing) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  }

  async function ensureManageAssets() {
    if (window.CR.__manageAssetsReady) return true;

    ensureManageMount();
    await ensureManageStylesheet();

    const scripts = [
      'js/manage/manage-model.js?v=v2manage1',
      'js/manage/manage-render.js?v=v2manage1',
      'js/manage/manage-events.js?v=v2manage1',
      'js/manage/manage.js?v=v2manage1'
    ];

    for (const src of scripts) {
      await loadScript(src);
    }

    window.CR.__manageAssetsReady = true;
    return true;
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
    window.CR.showToast?.('Rivalry refresh complete');
    window.CR.renderGameDayState?.();
    window.CR.renderHistory?.();
    window.CR.renderManage?.();
  };

  window.CR.startApp = async () => {
    try {
      renderAccountIdentity();
      bindAccountUi();
      window.CR.initTabs?.();
      window.CR.initGameDay?.();
      window.CR.initHistory?.();

      try {
        const manageReady = await ensureManageAssets();

        if (manageReady) {
          window.CR.initManage?.();
        }
      } catch (manageError) {
        console.error('Manage initialization failed', manageError);
        restoreManageFallback();
      }

      window.CR.initPullRefresh?.();

      const savedTab = window.CR.getSavedTab?.() || 'gameday';
      window.CR.switchTab?.(savedTab);
    } catch (error) {
      console.error('V2 bootstrap failed', error);
      const root = document.querySelector('#appRoot') || document.body;
      root.insertAdjacentHTML('afterbegin', '<div style="padding:16px;background:#fee;color:#900;font-weight:800">V2 preview render failed. Check console.</div>');
    }
  };
})();