window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderToggleRow({ key, label, hint, checked }) {
    return `
      <button class="manage-toggle-row" type="button" data-manage-toggle="${escapeHtml(key)}" aria-pressed="${checked ? 'true' : 'false'}">
        <div class="manage-toggle-copy">
          <span class="manage-toggle-label">${escapeHtml(label)}</span>
          ${hint ? `<span class="manage-toggle-hint">${escapeHtml(hint)}</span>` : ''}
        </div>
        <span class="manage-switch ${checked ? 'is-on' : ''}" aria-hidden="true"><span class="manage-switch-knob"></span></span>
      </button>
    `;
  }

  function renderPill(value, label, active, note) {
    return `
      <button class="manage-option-pill ${active ? 'is-active' : ''}" type="button" data-manage-stream-option="${escapeHtml(value)}" aria-pressed="${active ? 'true' : 'false'}">
        <span class="manage-option-pill-label">${escapeHtml(label)}</span>
        ${note ? `<span class="manage-option-pill-note">${escapeHtml(note)}</span>` : ''}
      </button>
    `;
  }

  function renderHealthItem(label, value, tone = 'neutral') {
    return `
      <article class="manage-health-item">
        <div class="manage-health-topline">
          <span class="eyebrow">${escapeHtml(label)}</span>
          <span class="manage-health-badge is-${escapeHtml(tone)}">${escapeHtml(value)}</span>
        </div>
      </article>
    `;
  }

  function renderCardHeader(eyebrow, title, copy, badge) {
    let badgeHtml = '';

    if (badge) {
      badgeHtml = `<span class="panel-tag ${escapeHtml(badge.className || 'neutral')}">${escapeHtml(badge.label || '')}</span>`;
    }

    return `
      <div class="panel-header compact-header manage-card-header">
        <div>
          <div class="eyebrow">${escapeHtml(eyebrow)}</div>
          <h2>${escapeHtml(title)}</h2>
          ${copy ? `<p class="manage-support-copy">${escapeHtml(copy)}</p>` : ''}
        </div>
        ${badgeHtml}
      </div>
    `;
  }

  function renderWatchExperience(state) {
    const selected = state.streamMode.options.find((option) => option.value === state.streamMode.selected);

    return `
      <section class="panel-card manage-card manage-watch-card">
        ${renderCardHeader('Watch experience', 'Stream Mode', 'Protect against broadcast spoilers without changing the underlying rivalry engine.', { className: 'warning', label: selected?.label || 'Custom' })}
        <div class="manage-option-grid">
          ${state.streamMode.options.map((option) => renderPill(option.value, option.label, option.value === state.streamMode.selected, option.note)).join('')}
        </div>
        <div class="manage-setting-stack">
          ${renderToggleRow({ key: 'streamMode.delayPush', label: 'Delay push notifications', hint: 'Keep lock-screen alerts aligned with your spoiler buffer.', checked: state.streamMode.delayPush })}
          ${renderToggleRow({ key: 'streamMode.delayToasts', label: 'Delay in-app toasts too', hint: 'Useful if you keep the app open while watching.', checked: state.streamMode.delayToasts })}
          ${renderToggleRow({ key: 'streamMode.delayFeed', label: 'Delay visible feed moments', hint: 'Internal scoring stays realtime while visible updates wait.', checked: state.streamMode.delayFeed })}
        </div>
      </section>
    `;
  }

  function renderNotifications(state) {
    const enabledCount = [
      state.notifications.pushEnabled,
      state.notifications.toastsEnabled,
      state.notifications.rivalrySwings,
      state.notifications.scoringMoments
    ].filter(Boolean).length;

    return `
      <section class="panel-card manage-card">
        ${renderCardHeader('Notifications', 'Rivalry alerts', 'Keep moments punchy without turning the app into a horn spam machine.', { className: 'dark', label: `${enabledCount} on` })}
        <div class="manage-setting-stack">
          ${renderToggleRow({ key: 'notifications.pushEnabled', label: 'Push alerts', hint: 'Send rivalry moments to your phone.', checked: state.notifications.pushEnabled })}
          ${renderToggleRow({ key: 'notifications.toastsEnabled', label: 'In-app toasts', hint: 'Show quick banners while the app is open.', checked: state.notifications.toastsEnabled })}
          ${renderToggleRow({ key: 'notifications.rivalrySwings', label: 'Lead-change rivalry swings', hint: 'Prioritize emotional momentum changes.', checked: state.notifications.rivalrySwings })}
          ${renderToggleRow({ key: 'notifications.scoringMoments', label: 'Scoring moments', hint: 'Goals, first-goal hits, and scoring surges.', checked: state.notifications.scoringMoments })}
        </div>
      </section>
    `;
  }

  function renderSeasonSetup(state) {
    const seasonBadge = state.season.playoffMode
      ? { className: 'warning', label: 'Playoffs' }
      : { className: 'neutral', label: 'Regular' };

    return `
      <section class="panel-card manage-card">
        ${renderCardHeader('Season setup', 'Playoffs and defaults', 'Core rivalry settings that shape how the season behaves before backend wiring lands.', seasonBadge)}
        <div class="manage-meta-grid">
          <article class="manage-meta-card">
            <span class="eyebrow">Active season</span>
            <strong>${escapeHtml(state.season.activeSeasonLabel)}</strong>
          </article>
          <article class="manage-meta-card">
            <span class="eyebrow">Scoring profile</span>
            <strong>${escapeHtml(state.season.scoringProfile)}</strong>
          </article>
          <article class="manage-meta-card">
            <span class="eyebrow">Draft rotation</span>
            <strong>${escapeHtml(state.season.draftRotation)}</strong>
          </article>
        </div>
        <div class="manage-setting-stack">
          ${renderToggleRow({ key: 'season.playoffMode', label: 'Playoff mode', hint: 'Use postseason behavior and settings language.', checked: state.season.playoffMode })}
        </div>
      </section>
    `;
  }

  function renderStatus(state) {
    const realtimeTone = String(state.appHealth.realtimeStatus || '').toLowerCase() === 'connected' ? 'good' : 'neutral';
    const notificationTone = String(state.appHealth.notificationStatus || '').toLowerCase() === 'ready' ? 'good' : 'neutral';

    return `
      <section class="panel-card manage-card">
        ${renderCardHeader('Status center', 'System status', 'Read-only health for realtime, notifications, install state, and sync timing.', { className: 'calm', label: state.appHealth.syncStatus })}
        <div class="manage-health-grid">
          ${renderHealthItem('Realtime', state.appHealth.realtimeStatus, realtimeTone)}
          ${renderHealthItem('Notifications', state.appHealth.notificationStatus, notificationTone)}
          ${renderHealthItem('PWA', state.appHealth.pwaStatus, 'neutral')}
          ${renderHealthItem('Last sync', state.appHealth.lastSyncLabel, 'neutral')}
        </div>
      </section>
    `;
  }

  function renderAdmin(state) {
    return `
      <section class="panel-card manage-card">
        ${renderCardHeader('Commissioner tools', 'Admin tools', 'Focused entry points for roster management, schedule imports, and commissioner workflows.', { className: 'dark', label: 'Admin' })}
        <div class="manage-meta-grid manage-meta-grid-admin">
          <article class="manage-meta-card">
            <span class="eyebrow">Roster</span>
            <strong>${escapeHtml(state.admin.rosterStatus)}</strong>
          </article>
          <article class="manage-meta-card">
            <span class="eyebrow">Schedule</span>
            <strong>${escapeHtml(state.admin.scheduleStatus)}</strong>
          </article>
          <article class="manage-meta-card manage-meta-card-wide">
            <span class="eyebrow">Current context</span>
            <strong>${escapeHtml(state.admin.activeGameContext)}</strong>
          </article>
        </div>
        <div class="manage-action-row">
          <button class="mini-button" type="button" data-manage-action="commissioner">Commissioner tools</button>
        </div>
      </section>
    `;
  }

  function renderRoot(state) {
    return `
      <div class="content-stack manage-stack">
        ${renderWatchExperience(state)}
        ${renderNotifications(state)}
        ${renderSeasonSetup(state)}
        ${renderStatus(state)}
        ${renderAdmin(state)}
      </div>
    `;
  }

  CR.manageRender = {
    renderRoot
  };
})();
