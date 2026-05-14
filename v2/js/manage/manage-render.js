window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const escapeHtml = CR.ui?.escapeHtml || ((value) => String(value ?? ''));

  function iconSvg(name) {
    const icons = {
      plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
      pencil: '<path d="M21.17 6.4 17.6 2.83a2 2 0 0 0-2.83 0L3 14.6V20h5.4L20.17 8.23a2 2 0 0 0 0-2.83Z"/><path d="m14 4 6 6"/>',
      trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
      arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'
    };
    return `<svg class="cr-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.plus}</svg>`;
  }

  function iconButton({ icon, label, className = 'cr-icon-button--soft', attrs = '' }) {
    return `<button class="cr-icon-button ${className}" type="button" ${attrs} aria-label="${escapeHtml(label)}">${iconSvg(icon)}</button>`;
  }

  function renderToggleRow({ key, label, hint, checked }) {
    return `<button class="manage-toggle-row" type="button" data-manage-toggle="${escapeHtml(key)}" aria-pressed="${checked ? 'true' : 'false'}"><div class="manage-toggle-copy"><span class="manage-toggle-label">${escapeHtml(label)}</span>${hint ? `<span class="manage-toggle-hint">${escapeHtml(hint)}</span>` : ''}</div><span class="manage-switch ${checked ? 'is-on' : ''}" aria-hidden="true"><span class="manage-switch-knob"></span></span></button>`;
  }

  function renderPill(value, label, active, note) {
    return `<button class="manage-option-pill ${active ? 'is-active' : ''}" type="button" data-manage-stream-option="${escapeHtml(value)}" aria-pressed="${active ? 'true' : 'false'}"><span class="manage-option-pill-label">${escapeHtml(label)}</span>${note ? `<span class="manage-option-pill-note">${escapeHtml(note)}</span>` : ''}</button>`;
  }

  function renderHealthItem(label, value, tone = 'neutral') {
    return `<article class="manage-health-item"><div class="manage-health-topline"><span class="eyebrow">${escapeHtml(label)}</span><span class="cr-pill ${escapeHtml(tone)}">${escapeHtml(value)}</span></div></article>`;
  }

  function renderEditableMetaCard({ field, label, value }) {
    return `<button class="manage-meta-card manage-meta-button" type="button" data-manage-edit="${escapeHtml(field)}" aria-label="Edit ${escapeHtml(label)}"><span class="eyebrow">${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><span class="manage-meta-edit-hint cr-icon-button cr-icon-button--ghost" aria-hidden="true">${iconSvg('pencil')}</span></button>`;
  }

  function renderCardHeader(eyebrow, title, copy, badge, actionHtml = '') {
    const badgeHtml = badge ? `<span class="cr-pill ${escapeHtml(badge.className || 'neutral')}">${escapeHtml(badge.label || '')}</span>` : '';
    return `<div class="panel-header compact-header manage-card-header"><div><div class="eyebrow">${escapeHtml(eyebrow)}</div><h2>${escapeHtml(title)}</h2>${copy ? `<p class="manage-support-copy">${escapeHtml(copy)}</p>` : ''}</div><div class="cr-card-actions">${badgeHtml}${actionHtml}</div></div>`;
  }

  function renderNotifications(state) {
    const enabledCount = [state.notifications.pushEnabled, state.notifications.toastsEnabled].filter(Boolean).length;
    return `<section class="panel-card manage-card">${renderCardHeader('Notifications', 'Rivalry alerts', 'Simple notification controls while the smarter rivalry logic runs automatically behind the scenes.', { className: 'neutral', label: `${enabledCount} on` })}<div class="manage-setting-stack">${renderToggleRow({ key: 'notifications.pushEnabled', label: 'Push alerts', hint: 'Send rivalry moments to your phone.', checked: state.notifications.pushEnabled })}${renderToggleRow({ key: 'notifications.toastsEnabled', label: 'In-app toasts', hint: 'Show quick banners while the app is open.', checked: state.notifications.toastsEnabled })}</div></section>`;
  }

  function renderManageTools(state) {
    return `<section class="panel-card manage-card">${renderCardHeader('Manage data', 'Roster and schedule', 'Add, update, or deactivate future-facing roster and schedule data without touching history.', { className: 'neutral', label: 'Tools' })}<div class="cr-list-stack"><button class="cr-action-row" type="button" data-manage-view="roster"><div class="cr-action-copy"><strong>Roster</strong><span>${state.roster.filter((player) => player.active).length} active players · add, edit, remove</span></div><span class="cr-action-chevron">›</span></button><button class="cr-action-row" type="button" data-manage-view="schedule"><div class="cr-action-copy"><strong>Schedule</strong><span>${state.schedule.length} games · import, add, edit</span></div><span class="cr-action-chevron">›</span></button></div></section>`;
  }

  function renderWatchExperience(state) {
    const selected = state.streamMode.options.find((option) => option.value === state.streamMode.selected);
    return `<section class="panel-card manage-card manage-watch-card">${renderCardHeader('Watch experience', 'Stream Mode', 'Protect against broadcast spoilers without changing the underlying rivalry engine.', { className: 'neutral', label: selected?.label || 'Custom' })}<div class="manage-option-grid">${state.streamMode.options.map((option) => renderPill(option.value, option.label, option.value === state.streamMode.selected, option.note)).join('')}</div><div class="manage-setting-stack">${renderToggleRow({ key: 'streamMode.delayPush', label: 'Delay push notifications', hint: 'Keep lock-screen alerts aligned with your spoiler buffer.', checked: state.streamMode.delayPush })}${renderToggleRow({ key: 'streamMode.delayToasts', label: 'Delay in-app toasts too', hint: 'Useful if you keep the app open while watching.', checked: state.streamMode.delayToasts })}${renderToggleRow({ key: 'streamMode.delayFeed', label: 'Delay visible feed moments', hint: 'Internal scoring stays realtime while visible updates wait.', checked: state.streamMode.delayFeed })}</div></section>`;
  }

  function renderScoringSummary(state) {
    const selectedProfile = state.season.scoringProfile;
    const scoring = state.season.scoringSystems?.[selectedProfile] || {};
    const editAction = iconButton({ icon: 'pencil', label: 'Edit scoring', attrs: 'data-manage-edit-scoring' });
    return `<div class="manage-score-card"><div class="manage-score-card-header"><div><span class="eyebrow">${escapeHtml(selectedProfile)} scoring</span><strong>Point values</strong></div><div class="cr-card-actions">${editAction}</div></div><div class="manage-score-rule-row"><div class="manage-score-rule"><span class="eyebrow">First goal</span><strong>${escapeHtml(scoring.firstGoal ?? '—')}</strong></div><div class="manage-score-rule"><span class="eyebrow">Goal</span><strong>${escapeHtml(scoring.goal ?? '—')}</strong></div><div class="manage-score-rule"><span class="eyebrow">Assist</span><strong>${escapeHtml(scoring.assist ?? '—')}</strong></div></div></div>`;
  }

  function renderSeasonSetup(state) {
    const seasonBadge = state.season.playoffMode ? { className: 'playoff', label: 'Playoffs' } : { className: 'regular', label: 'Regular' };
    return `<section class="panel-card manage-card">${renderCardHeader('Season setup', 'Playoffs and defaults', 'Core rivalry settings for season behavior, scoring, and first-pick order.', seasonBadge)}<div class="manage-meta-grid">${renderEditableMetaCard({ field: 'activeSeasonLabel', label: 'Active season', value: state.season.activeSeasonLabel })}${renderEditableMetaCard({ field: 'scoringProfile', label: 'Scoring profile', value: state.season.scoringProfile })}${renderEditableMetaCard({ field: 'firstPicker', label: 'First picker', value: state.season.firstPicker })}</div>${renderScoringSummary(state)}<div class="manage-setting-stack">${renderToggleRow({ key: 'season.playoffMode', label: 'Playoff mode', hint: 'Use postseason behavior and settings language.', checked: state.season.playoffMode })}</div><div class="manage-action-row"><button class="cr-button secondary" type="button" data-manage-start-season>Start new season</button></div></section>`;
  }

  function renderStatus(state) {
    const realtimeTone = String(state.appHealth.realtimeStatus || '').toLowerCase() === 'connected' ? 'good' : 'neutral';
    const notificationTone = String(state.appHealth.notificationStatus || '').toLowerCase() === 'ready' ? 'good' : 'neutral';
    return `<section class="panel-card manage-card">${renderCardHeader('Status center', 'System status', 'Read-only health for realtime, notifications, install state, and sync timing.', { className: 'success', label: state.appHealth.syncStatus })}<div class="manage-health-grid">${renderHealthItem('Realtime', state.appHealth.realtimeStatus, realtimeTone)}${renderHealthItem('Notifications', state.appHealth.notificationStatus, notificationTone)}${renderHealthItem('PWA', state.appHealth.pwaStatus, 'neutral')}${renderHealthItem('Last sync', state.appHealth.lastSyncLabel, 'neutral')}</div></section>`;
  }

  function renderSubviewHeader(label, title, copy) {
    return `<section class="panel-card cr-subpage-hero manage-subview-hero"><button class="cr-button back cr-back-button" type="button" data-manage-view="main">← Manage</button><span class="cr-pill neutral">${escapeHtml(label)}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p></section>`;
  }

  function renderRosterView(state) {
    const activeCount = state.roster.filter((p) => p.active).length;
    const addAction = iconButton({ icon: 'plus', label: 'Add player', className: 'cr-icon-button--primary cr-section-action', attrs: 'data-manage-open-player-sheet="add"' });
    return `<div class="content-stack manage-stack">${renderSubviewHeader('Roster', 'Roster', 'Active pick list for future games. Removed players stay available in history records.')}<section class="panel-card manage-card">${renderCardHeader('Active players', 'Roster list', `${activeCount} active players`, null, addAction)}<div class="cr-list-stack">${state.roster.map((player) => `<article class="cr-action-row ${!player.active ? 'is-muted' : ''}"><div class="cr-action-copy"><strong>${escapeHtml(player.name)}</strong><span>${escapeHtml(player.position)} · ${player.active ? 'Active' : 'Inactive'}</span></div><div class="cr-row-icon-actions">${iconButton({ icon: 'pencil', label: `Edit ${player.name}`, attrs: `data-manage-edit-player="${escapeHtml(player.id)}"` })}${player.active ? iconButton({ icon: 'trash', label: `Remove ${player.name}`, className: 'cr-icon-button--danger', attrs: `data-manage-confirm-remove-player="${escapeHtml(player.id)}"` }) : ''}</div></article>`).join('')}</div></section>${renderRosterSheet(state)}${renderConfirmSheet(state)}</div>`;
  }

  function renderScheduleView(state) {
    const addAction = iconButton({ icon: 'plus', label: 'Add game', className: 'cr-icon-button--primary cr-section-action', attrs: 'data-manage-open-game-sheet="add"' });
    return `<div class="content-stack manage-stack">${renderSubviewHeader('Schedule', 'Schedule', 'Manage all games. Finalized history stays protected until explicitly edited.')}<section class="panel-card manage-card">${renderCardHeader('NHL schedule import', 'Safe sync', 'Import Canes games while preserving finalized history.', null)}<button class="cr-button primary" type="button" data-manage-import-schedule>Import NHL Schedule</button></section><section class="panel-card manage-card">${renderCardHeader('Games', 'All games', `${state.schedule.length} games`, null, addAction)}<div class="cr-list-stack">${state.schedule.map((game) => `<article class="cr-action-row"><div class="cr-action-copy"><strong>${escapeHtml(game.date)} · ${escapeHtml(game.opponent)}</strong><span>${escapeHtml(game.type)} · ${escapeHtml(game.firstPicker)} picks first</span></div><div class="cr-row-icon-actions">${iconButton({ icon: 'pencil', label: `Edit ${game.opponent} game`, attrs: `data-manage-edit-game="${escapeHtml(game.id)}"` })}${iconButton({ icon: 'trash', label: `Remove ${game.opponent} game`, className: 'cr-icon-button--danger', attrs: `data-manage-confirm-remove-game="${escapeHtml(game.id)}"` })}</div></article>`).join('')}</div></section>${renderScheduleSheet(state)}${renderConfirmSheet(state)}</div>`;
  }

  function renderSheetHeader(eyebrow, title, copy, closeAttr) {
    return `<div class="gd-sheet-handle"></div><div class="manage-edit-header"><div><div class="eyebrow">${escapeHtml(eyebrow)}</div><h2>${escapeHtml(title)}</h2>${copy ? `<p>${escapeHtml(copy)}</p>` : ''}</div><button class="manage-edit-close" type="button" ${closeAttr} aria-label="Close">×</button></div>`;
  }

  function renderRosterSheet(state) {
    if (!state.rosterSheetOpen) return '';
    const isEditing = Boolean(state.editingRosterPlayerId);
    const title = isEditing ? 'Edit Player' : 'Add Player';
    const actionLabel = isEditing ? 'Save Player' : 'Add Player';
    return `<div class="manage-edit-sheet" role="dialog" aria-modal="true"><div class="manage-edit-backdrop" data-manage-close-player-sheet></div><section class="manage-edit-card">${renderSheetHeader('Roster', title, 'Manage future pick eligibility without changing historical records.', 'data-manage-close-player-sheet')}<div class="cr-form-grid"><label><span class="eyebrow">Name</span><input class="cr-input" value="${escapeHtml(state.rosterDraft.name)}" placeholder="Player name" data-manage-roster-input="name" /></label><label><span class="eyebrow">Position</span><select class="cr-input" data-manage-roster-input="position"><option ${state.rosterDraft.position === 'F' ? 'selected' : ''}>F</option><option ${state.rosterDraft.position === 'D' ? 'selected' : ''}>D</option></select></label></div><button class="cr-button save" type="button" data-manage-save-player>${actionLabel}</button></section></div>`;
  }

  function renderScheduleSheet(state) {
    if (!state.scheduleSheetOpen) return '';
    const isEditing = Boolean(state.editingScheduleGameId);
    const title = isEditing ? 'Edit Game' : 'Add Game';
    const actionLabel = isEditing ? 'Save Game' : 'Add Game';
    return `<div class="manage-edit-sheet" role="dialog" aria-modal="true"><div class="manage-edit-backdrop" data-manage-close-game-sheet></div><section class="manage-edit-card">${renderSheetHeader('Schedule', title, 'Manage future schedule data without changing finalized history.', 'data-manage-close-game-sheet')}<div class="cr-form-grid"><label><span class="eyebrow">Date</span><input class="cr-input" value="${escapeHtml(state.scheduleDraft.date)}" placeholder="YYYY-MM-DD" data-manage-schedule-input="date" /></label><label><span class="eyebrow">Opponent</span><input class="cr-input" value="${escapeHtml(state.scheduleDraft.opponent)}" placeholder="NYR, FLA, etc." data-manage-schedule-input="opponent" /></label><label><span class="eyebrow">Type</span><select class="cr-input" data-manage-schedule-input="type"><option ${state.scheduleDraft.type === 'Regular' ? 'selected' : ''}>Regular</option><option ${state.scheduleDraft.type === 'Playoffs' ? 'selected' : ''}>Playoffs</option></select></label><label><span class="eyebrow">First pick</span><select class="cr-input" data-manage-schedule-input="firstPicker">${state.users.map((user) => `<option ${state.scheduleDraft.firstPicker === user.username ? 'selected' : ''}>${escapeHtml(user.username)}</option>`).join('')}</select></label></div><button class="cr-button save" type="button" data-manage-save-game>${actionLabel}</button></section></div>`;
  }

  function renderConfirmSheet(state) {
    if (!state.confirmRemove) return '';
    const item = state.confirmRemove;
    return `<div class="manage-edit-sheet" role="dialog" aria-modal="true"><div class="manage-edit-backdrop" data-manage-cancel-remove></div><section class="manage-edit-card">${renderSheetHeader('Confirm remove', item.type === 'player' ? 'Remove Player?' : 'Remove Game?', 'This removes the item from future setup while preserving existing history.', 'data-manage-cancel-remove')}<div class="manage-confirm-copy"><strong>${escapeHtml(item.label)}</strong><span>This cannot be restored from this screen.</span></div><div class="cr-sheet-actions single"><button class="cr-button remove full" type="button" data-manage-confirm-remove>Remove</button></div></section></div>`;
  }

  function renderEditSheet(state) {
    const field = state.activeEditField;
    if (!field) return '';
    const editConfig = state.editOptions?.[field];
    if (!editConfig) return '';
    const currentValue = state.season?.[field];
    return `<div class="manage-edit-sheet" role="dialog" aria-modal="true" aria-labelledby="manageEditSheetTitle"><div class="manage-edit-backdrop" data-manage-close-edit></div><section class="manage-edit-card">${renderSheetHeader('Season setup', editConfig.title, editConfig.hint, 'data-manage-close-edit')}<div class="manage-edit-options">${editConfig.options.map((option) => `<button class="manage-edit-option ${option === currentValue ? 'is-active' : ''}" type="button" data-manage-edit-value="${escapeHtml(option)}"><span>${escapeHtml(option)}</span>${option === currentValue ? '<strong>Selected</strong>' : ''}</button>`).join('')}</div></section></div>`;
  }

  function renderStartSeasonSheet(state) {
    if (!state.startSeasonOpen) return '';
    const draft = state.newSeasonDraft;
    return `<div class="manage-edit-sheet" role="dialog" aria-modal="true" aria-labelledby="manageStartSeasonTitle"><div class="manage-edit-backdrop" data-manage-close-start-season></div><section class="manage-edit-card">${renderSheetHeader('Season setup', 'Start new season', 'Creates a blank current season for History while all-time rivalry data stays intact.', 'data-manage-close-start-season')}<label class="cr-form-field"><span class="eyebrow">Season name</span><input class="cr-input" value="${escapeHtml(draft?.seasonLabel || '')}" placeholder="2026-27" data-manage-new-season-input /></label><div class="manage-edit-options manage-edit-options-spaced">${(state.users || []).map((user) => `<button class="manage-edit-option ${user.username === draft?.firstPicker ? 'is-active' : ''}" type="button" data-manage-new-season-picker="${escapeHtml(user.username)}"><span>${escapeHtml(user.username)} picks first</span>${user.username === draft?.firstPicker ? '<strong>Selected</strong>' : ''}</button>`).join('')}</div><button class="cr-button primary" type="button" data-manage-confirm-start-season>Start ${escapeHtml(draft?.seasonLabel || 'season')}</button></section></div>`;
  }

  function renderScoringSheet(state) {
    if (!state.scoringEditOpen) return '';
    const profile = state.season.scoringProfile;
    const scoring = state.season.scoringSystems?.[profile] || {};
    const fields = [{ key: 'firstGoal', label: 'First goal scorer' }, { key: 'goal', label: 'Goal' }, { key: 'assist', label: 'Assist' }];
    return `<div class="manage-edit-sheet" role="dialog" aria-modal="true" aria-labelledby="manageScoringTitle"><div class="manage-edit-backdrop" data-manage-close-scoring></div><section class="manage-edit-card">${renderSheetHeader(profile, 'Scoring values', 'Edit point values for first goal scorer, goals, and assists.', 'data-manage-close-scoring')}<div class="manage-score-edit-list">${fields.map((field) => `<div class="manage-score-edit-row"><div><span class="eyebrow">${escapeHtml(field.label)}</span><strong>${escapeHtml(scoring[field.key])} pts</strong></div><div class="manage-stepper"><button type="button" data-manage-score-step="${field.key}" data-step="-1">−</button><button type="button" data-manage-score-step="${field.key}" data-step="1">+</button></div></div>`).join('')}</div></section></div>`;
  }

  function renderMain(state) {
    return `<div class="content-stack manage-stack">${renderNotifications(state)}${renderWatchExperience(state)}${renderManageTools(state)}${renderSeasonSetup(state)}${renderStatus(state)}</div>${renderEditSheet(state)}${renderStartSeasonSheet(state)}${renderScoringSheet(state)}`;
  }

  function renderRoot(state) {
    if (state.activeManageView === 'roster') return renderRosterView(state);
    if (state.activeManageView === 'schedule') return renderScheduleView(state);
    return renderMain(state);
  }

  CR.manageRender = { renderRoot };
})();
