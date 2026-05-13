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

  function renderEditableMetaCard({ field, label, value }) {
    return `
      <button class="manage-meta-card manage-meta-button" type="button" data-manage-edit="${escapeHtml(field)}" aria-label="Edit ${escapeHtml(label)}">
        <span class="eyebrow">${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <span class="manage-meta-edit-hint">Tap to edit</span>
      </button>
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

  function renderNotifications(state) {
    const enabledCount = [
      state.notifications.pushEnabled,
      state.notifications.toastsEnabled
    ].filter(Boolean).length;

    return `
      <section class="panel-card manage-card">
        ${renderCardHeader('Notifications', 'Rivalry alerts', 'Simple notification controls while the smarter rivalry logic runs automatically behind the scenes.', { className: 'dark', label: `${enabledCount} on` })}
        <div class="manage-setting-stack">
          ${renderToggleRow({ key: 'notifications.pushEnabled', label: 'Push alerts', hint: 'Send rivalry moments to your phone.', checked: state.notifications.pushEnabled })}
          ${renderToggleRow({ key: 'notifications.toastsEnabled', label: 'In-app toasts', hint: 'Show quick banners while the app is open.', checked: state.notifications.toastsEnabled })}
        </div>
      </section>
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

  function renderSeasonSetup(state) {
    const seasonBadge = state.season.playoffMode
      ? { className: 'warning', label: 'Playoffs' }
      : { className: 'neutral', label: 'Regular' };

    return `
      <section class="panel-card manage-card">
        ${renderCardHeader('Season setup', 'Playoffs and defaults', 'Core rivalry settings that shape how the season behaves before backend wiring lands.', seasonBadge)}
        <div class="manage-meta-grid">
          ${renderEditableMetaCard({ field: 'activeSeasonLabel', label: 'Active season', value: state.season.activeSeasonLabel })}
          ${renderEditableMetaCard({ field: 'scoringProfile', label: 'Scoring profile', value: state.season.scoringProfile })}
          ${renderEditableMetaCard({ field: 'draftRotation', label: 'Draft rotation', value: state.season.draftRotation })}
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

  function renderEditSheet(state) {
    const field = state.activeEditField;
    if (!field) return '';

    const editConfig = state.editOptions?.[field];
    if (!editConfig) return '';

    const currentValue = state.season?.[field];

    return `
      <div class="manage-edit-sheet" role="dialog" aria-modal="true" aria-labelledby="manageEditSheetTitle">
        <div class="manage-edit-backdrop" data-manage-close-edit></div>
        <section class="manage-edit-card">
          <div class="gd-sheet-handle"></div>
          <div class="manage-edit-header">
            <div>
              <div class="eyebrow">Season setup</div>
              <h2 id="manageEditSheetTitle">${escapeHtml(editConfig.title)}</h2>
              <p>${escapeHtml(editConfig.hint)}</p>
            </div>
            <button class="manage-edit-close" type="button" data-manage-close-edit aria-label="Close editor">×</button>
          </div>
          <div class="manage-edit-options">
            ${editConfig.options.map((option) => `
              <button class="manage-edit-option ${option === currentValue ? 'is-active' : ''}" type="button" data-manage-edit-value="${escapeHtml(option)}">
                <span>${escapeHtml(option)}</span>
                ${option === currentValue ? '<strong>Selected</strong>' : ''}
              </button>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderRoot(state) {
    return `
      <div class="content-stack manage-stack">
        ${renderNotifications(state)}
        ${renderWatchExperience(state)}
        ${renderSeasonSetup(state)}
        ${renderStatus(state)}
      </div>
      ${renderEditSheet(state)}
    `;
  }

  CR.manageRender = {
    renderRoot
  };
})();
