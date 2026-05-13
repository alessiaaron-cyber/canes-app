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

  function getAssetBase() {
    const knownScript = Array.from(document.querySelectorAll('script[src]')).find((script) => {
      const src = script.getAttribute('src') || '';
      return src.includes('js/app.js') || src.includes('js/ui.js');
    });

    if (knownScript?.src) {
      return new URL('.', knownScript.src).href;
    }

    return new URL('./', window.location.href).href;
  }

  function assetUrl(relativePath) {
    return new URL(relativePath, getAssetBase()).href;
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

  function ensureInlineManagePreviewStyles() {
    if (document.querySelector('#inlineManagePreviewStyles')) return;

    const style = document.createElement('style');
    style.id = 'inlineManagePreviewStyles';
    style.textContent = `
      .inline-manage-stack { display:flex; flex-direction:column; gap:18px; }
      .inline-manage-copy { margin-top:8px; font-size:13px; line-height:1.45; color:var(--text-secondary); }
      .inline-manage-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:16px; }
      .inline-manage-pill { border:1px solid var(--border-subtle); border-radius:18px; padding:14px; background:#f8fafc; }
      .inline-manage-pill.active { background:#111827; color:#fff; border-color:#111827; }
      .inline-manage-pill strong, .inline-manage-stat strong { display:block; font-size:14px; font-weight:900; letter-spacing:-0.02em; }
      .inline-manage-pill span, .inline-manage-stat span { display:block; margin-top:6px; font-size:12px; line-height:1.35; color:inherit; opacity:0.82; }
      .inline-manage-list { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
      .inline-manage-row { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; border:1px solid var(--border-subtle); border-radius:18px; padding:14px 15px; background:#fbfcfd; }
      .inline-manage-row strong { display:block; font-size:14px; font-weight:800; letter-spacing:-0.02em; }
      .inline-manage-row span { display:block; margin-top:4px; font-size:12px; line-height:1.4; color:var(--text-secondary); }
      .inline-manage-toggle { flex:0 0 auto; min-width:52px; text-align:center; border-radius:999px; padding:7px 10px; font-size:11px; font-weight:900; background:#111827; color:#fff; }
      .inline-manage-toggle.off { background:#eaecf0; color:var(--text-secondary); }
      .inline-manage-stats { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:16px; }
      .inline-manage-stat { border:1px solid var(--border-subtle); border-radius:18px; padding:14px; background:#fbfcfd; }
      .inline-manage-actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:16px; }
      .inline-manage-actions .mini-button { background:#f3f4f6; color:var(--ink-strong); }
      @media (max-width: 430px) { .inline-manage-grid, .inline-manage-stats { grid-template-columns:1fr; } }
    `;
    document.head.appendChild(style);
  }

  function restoreManageFallback() {
    ensureInlineManagePreviewStyles();

    const mount = document.querySelector('#manageContent');
    if (!mount) return;

    mount.outerHTML = `
      <div id="manageContent" class="inline-manage-stack">
        <section class="panel-card">
          <div class="panel-header compact-header">
            <div>
              <div class="eyebrow">Watch experience</div>
              <h2>Stream Mode</h2>
              <p class="inline-manage-copy">Preview-safe fallback version while the full modular Manage bundle is loading through HTMLPreview.</p>
            </div>
            <span class="panel-tag warning">90s</span>
          </div>
          <div class="inline-manage-grid">
            <div class="inline-manage-pill"><strong>Realtime</strong><span>Show rivalry moments immediately.</span></div>
            <div class="inline-manage-pill"><strong>60s</strong><span>Balanced spoiler protection.</span></div>
            <div class="inline-manage-pill active"><strong>90s</strong><span>Recommended for streamed broadcasts.</span></div>
            <div class="inline-manage-pill"><strong>Final Only</strong><span>Hide visible moments until the game ends.</span></div>
          </div>
          <div class="inline-manage-list">
            <div class="inline-manage-row"><div><strong>Delay push notifications</strong><span>Keep lock-screen alerts aligned with your spoiler buffer.</span></div><div class="inline-manage-toggle">On</div></div>
            <div class="inline-manage-row"><div><strong>Delay in-app toasts</strong><span>Useful when the app is open while watching live TV on a delay.</span></div><div class="inline-manage-toggle">On</div></div>
            <div class="inline-manage-row"><div><strong>Big moments only</strong><span>Prioritize swings, goals, and high-drama rivalry beats.</span></div><div class="inline-manage-toggle off">Off</div></div>
          </div>
        </section>

        <section class="panel-card">
          <div class="panel-header compact-header">
            <div>
              <div class="eyebrow">Notifications</div>
              <h2>Rivalry alerts</h2>
              <p class="inline-manage-copy">Mock settings shell for the V2 Manage experience.</p>
            </div>
            <span class="panel-tag dark">4 on</span>
          </div>
          <div class="inline-manage-list">
            <div class="inline-manage-row"><div><strong>Push alerts</strong><span>Send rivalry moments to your phone.</span></div><div class="inline-manage-toggle">On</div></div>
            <div class="inline-manage-row"><div><strong>In-app toasts</strong><span>Show quick banners while the app is open.</span></div><div class="inline-manage-toggle">On</div></div>
            <div class="inline-manage-row"><div><strong>Lead-change swings</strong><span>Give priority to emotional momentum shifts.</span></div><div class="inline-manage-toggle">On</div></div>
            <div class="inline-manage-row"><div><strong>Recap summaries</strong><span>Bundle rapid bursts into cleaner rivalry summaries.</span></div><div class="inline-manage-toggle">On</div></div>
          </div>
        </section>

        <section class="panel-card">
          <div class="panel-header compact-header">
            <div>
              <div class="eyebrow">Season setup</div>
              <h2>Playoffs, carryover, and health</h2>
            </div>
            <span class="panel-tag calm">Ready</span>
          </div>
          <div class="inline-manage-stats">
            <div class="inline-manage-stat"><strong>2025-26</strong><span>Active season</span></div>
            <div class="inline-manage-stat"><strong>Classic</strong><span>Scoring profile</span></div>
            <div class="inline-manage-stat"><strong>Carryover On</strong><span>Keep carryover systems visible in V2.</span></div>
            <div class="inline-manage-stat"><strong>Connected</strong><span>Realtime and app-health placeholder state.</span></div>
          </div>
          <div class="inline-manage-actions">
            <button class="mini-button" type="button">Commissioner tools</button>
            <button class="mini-button" type="button">Review carryover</button>
            <button class="mini-button" type="button">Run health check</button>
          </div>
        </section>
      </div>
    `;
  }

  function ensureManageStylesheet() {
    const href = assetUrl('../css/manage.css?v=v2manage1');

    const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find((link) => link.href === href);
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

  function loadScript(relativePath) {
    const src = assetUrl(relativePath);

    const existing = Array.from(document.querySelectorAll('script')).find((script) => script.src === src);

    if (existing) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${relativePath}`));
      document.body.appendChild(script);
    });
  }

  async function ensureManageAssets() {
    if (window.CR.__manageAssetsReady) return true;

    ensureManageMount();
    await ensureManageStylesheet();

    const scripts = [
      'manage/manage-model.js?v=v2manage1',
      'manage/manage-render.js?v=v2manage1',
      'manage/manage-events.js?v=v2manage1',
      'manage/manage.js?v=v2manage1'
    ];

    for (const relativePath of scripts) {
      await loadScript(relativePath);
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