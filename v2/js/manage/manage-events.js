window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function state() {
    return CR.manageStore?.getState?.() || CR.manageState;
  }

  function getNestedValue(target, path) {
    return String(path || '').split('.').reduce((acc, key) => (acc ? acc[key] : undefined), target);
  }

  function setNestedValue(target, path, value) {
    const keys = String(path || '').split('.').filter(Boolean);
    if (!keys.length) return;
    let cursor = target;
    for (let i = 0; i < keys.length - 1; i += 1) {
      cursor = cursor[keys[i]];
      if (!cursor) return;
    }
    cursor[keys[keys.length - 1]] = value;
  }

  function labelForStreamOption(value) {
    const option = state()?.streamMode?.options?.find((item) => item.value === value);
    return option?.label || 'Updated';
  }

  function closeAllSheets() {
    const current = state();
    if (!current) return;
    current.activeEditField = null;
    current.startSeasonOpen = false;
    current.scoringEditOpen = false;
    current.rosterSheetOpen = false;
    current.scheduleSheetOpen = false;
    current.confirmRemove = null;
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function resetRosterDraft() {
    const current = state();
    current.rosterDraft = { name: '', position: 'F' };
    current.editingRosterPlayerId = null;
  }

  function resetScheduleDraft() {
    const current = state();
    current.scheduleDraft = { date: '', opponent: '', type: 'Regular', firstPicker: current.season.firstPicker };
    current.editingScheduleGameId = null;
  }

  function rerender(options = {}) {
    const current = state();
    CR.manageState = current;
    CR.manageStore?.replaceState?.(current, { render: false });
    CR.renderManage?.({ scrollTop: options.scrollTop });
  }

  function bindManageEvents() {
    const root = document.querySelector('#manageContent');
    if (!root) return;

    root.addEventListener('input', (event) => {
      const current = state();
      const newSeasonInput = event.target.closest('[data-manage-new-season-input]');
      if (newSeasonInput) { current.newSeasonDraft.seasonLabel = newSeasonInput.value; return; }
      const rosterInput = event.target.closest('[data-manage-roster-input]');
      if (rosterInput) { current.rosterDraft[rosterInput.dataset.manageRosterInput] = rosterInput.value; return; }
      const scheduleInput = event.target.closest('[data-manage-schedule-input]');
      if (scheduleInput) current.scheduleDraft[scheduleInput.dataset.manageScheduleInput] = scheduleInput.value;
    });

    root.addEventListener('click', (event) => {
      const current = state();
      const viewTrigger = event.target.closest('[data-manage-view]');
      if (viewTrigger) { closeAllSheets(); current.activeManageView = viewTrigger.dataset.manageView || 'main'; rerender({ scrollTop: true }); return; }

      const openPlayerSheet = event.target.closest('[data-manage-open-player-sheet]');
      if (openPlayerSheet) { closeAllSheets(); resetRosterDraft(); current.rosterSheetOpen = true; rerender(); return; }

      const closePlayerSheet = event.target.closest('[data-manage-close-player-sheet]');
      if (closePlayerSheet) { resetRosterDraft(); current.rosterSheetOpen = false; rerender(); return; }

      const editPlayer = event.target.closest('[data-manage-edit-player]');
      if (editPlayer) {
        const player = current.roster.find((item) => item.id === editPlayer.dataset.manageEditPlayer);
        if (player) {
          closeAllSheets();
          current.editingRosterPlayerId = player.id;
          current.rosterDraft = { name: player.name, position: player.position };
          current.rosterSheetOpen = true;
          rerender();
        }
        return;
      }

      const savePlayer = event.target.closest('[data-manage-save-player]');
      if (savePlayer) {
        const draft = current.rosterDraft;
        const name = String(draft.name || '').trim();
        if (!name) { CR.showToast?.({ message: 'Add a player name first' }); return; }
        const payload = { name, position: draft.position || 'F' };
        if (current.editingRosterPlayerId) {
          const player = current.roster.find((item) => item.id === current.editingRosterPlayerId);
          if (player) Object.assign(player, payload);
          resetRosterDraft(); current.rosterSheetOpen = false; rerender(); CR.showToast?.({ message: `${name} updated` }); return;
        }
        current.roster.push({ id: makeId('player'), ...payload, active: true });
        resetRosterDraft(); current.rosterSheetOpen = false; rerender(); CR.showToast?.({ message: `${name} added` }); return;
      }

      const openGameSheet = event.target.closest('[data-manage-open-game-sheet]');
      if (openGameSheet) { closeAllSheets(); resetScheduleDraft(); current.scheduleSheetOpen = true; rerender(); return; }

      const closeGameSheet = event.target.closest('[data-manage-close-game-sheet]');
      if (closeGameSheet) { resetScheduleDraft(); current.scheduleSheetOpen = false; rerender(); return; }

      const editGame = event.target.closest('[data-manage-edit-game]');
      if (editGame) {
        const game = current.schedule.find((item) => item.id === editGame.dataset.manageEditGame);
        if (game) {
          closeAllSheets();
          current.editingScheduleGameId = game.id;
          current.scheduleDraft = { date: game.date, opponent: game.opponent, type: game.type, firstPicker: game.firstPicker };
          current.scheduleSheetOpen = true;
          rerender();
        }
        return;
      }

      const saveGame = event.target.closest('[data-manage-save-game]');
      if (saveGame) {
        const draft = current.scheduleDraft;
        const opponent = String(draft.opponent || '').trim().toUpperCase();
        const date = String(draft.date || '').trim();
        if (!date || !opponent) { CR.showToast?.({ message: 'Add a date and opponent first' }); return; }
        const payload = { date, opponent, type: draft.type || 'Regular', firstPicker: draft.firstPicker || current.season.firstPicker };
        if (current.editingScheduleGameId) {
          const game = current.schedule.find((item) => item.id === current.editingScheduleGameId);
          if (game) Object.assign(game, payload);
          resetScheduleDraft(); current.scheduleSheetOpen = false; rerender(); CR.showToast?.({ message: `${opponent} game updated` }); return;
        }
        current.schedule.push({ id: makeId('game'), ...payload });
        resetScheduleDraft(); current.scheduleSheetOpen = false; rerender(); CR.showToast?.({ message: `${opponent} game added` }); return;
      }

      const confirmRemovePlayer = event.target.closest('[data-manage-confirm-remove-player]');
      if (confirmRemovePlayer) {
        const player = current.roster.find((item) => item.id === confirmRemovePlayer.dataset.manageConfirmRemovePlayer);
        if (player) { closeAllSheets(); current.confirmRemove = { type: 'player', id: player.id, label: player.name }; rerender(); }
        return;
      }

      const confirmRemoveGame = event.target.closest('[data-manage-confirm-remove-game]');
      if (confirmRemoveGame) {
        const game = current.schedule.find((item) => item.id === confirmRemoveGame.dataset.manageConfirmRemoveGame);
        if (game) { closeAllSheets(); current.confirmRemove = { type: 'game', id: game.id, label: `${game.date} · ${game.opponent}` }; rerender(); }
        return;
      }

      const cancelRemove = event.target.closest('[data-manage-cancel-remove]');
      if (cancelRemove) { current.confirmRemove = null; rerender(); return; }

      const confirmRemove = event.target.closest('[data-manage-confirm-remove]');
      if (confirmRemove) {
        const item = current.confirmRemove;
        if (item?.type === 'player') current.roster = current.roster.filter((player) => player.id !== item.id);
        if (item?.type === 'game') current.schedule = current.schedule.filter((game) => game.id !== item.id);
        current.confirmRemove = null;
        rerender();
        CR.showToast?.({ message: 'Removed' });
        return;
      }

      const startSeason = event.target.closest('[data-manage-start-season]');
      if (startSeason) { closeAllSheets(); current.startSeasonOpen = true; rerender(); return; }
      const closeStartSeason = event.target.closest('[data-manage-close-start-season]');
      if (closeStartSeason) { current.startSeasonOpen = false; rerender(); return; }
      const newSeasonPicker = event.target.closest('[data-manage-new-season-picker]');
      if (newSeasonPicker) { current.newSeasonDraft.firstPicker = newSeasonPicker.dataset.manageNewSeasonPicker; rerender(); return; }
      const confirmStartSeason = event.target.closest('[data-manage-confirm-start-season]');
      if (confirmStartSeason) {
        const draft = current.newSeasonDraft;
        const seasonLabel = String(draft.seasonLabel || '').trim();
        if (!seasonLabel) { CR.showToast?.({ message: 'Add a season name first' }); return; }
        current.season.activeSeasonLabel = seasonLabel;
        current.season.firstPicker = draft.firstPicker;
        current.season.playoffMode = false;
        current.schedule = [];
        resetScheduleDraft(); current.startSeasonOpen = false; rerender(); CR.showToast?.({ message: `${seasonLabel} season started` }); return;
      }

      const editScoring = event.target.closest('[data-manage-edit-scoring]');
      if (editScoring) { closeAllSheets(); current.scoringEditOpen = true; rerender(); return; }
      const closeScoring = event.target.closest('[data-manage-close-scoring]');
      if (closeScoring) { current.scoringEditOpen = false; rerender(); return; }
      const scoreStep = event.target.closest('[data-manage-score-step]');
      if (scoreStep) {
        const profile = current.season.scoringProfile;
        const key = scoreStep.dataset.manageScoreStep;
        const delta = Number(scoreStep.dataset.step || 0);
        const scoring = current.season.scoringSystems?.[profile];
        if (scoring && Object.prototype.hasOwnProperty.call(scoring, key)) { scoring[key] = Math.max(0, Number(scoring[key] || 0) + delta); rerender(); }
        return;
      }

      const editTrigger = event.target.closest('[data-manage-edit]');
      if (editTrigger) { closeAllSheets(); current.activeEditField = editTrigger.dataset.manageEdit; rerender(); return; }
      const closeEdit = event.target.closest('[data-manage-close-edit]');
      if (closeEdit) { current.activeEditField = null; rerender(); return; }
      const editOption = event.target.closest('[data-manage-edit-value]');
      if (editOption) {
        const field = current.activeEditField;
        const value = editOption.dataset.manageEditValue;
        if (field && Object.prototype.hasOwnProperty.call(current.season, field)) { current.season[field] = value; current.activeEditField = null; rerender(); CR.showToast?.({ message: `${value} selected` }); }
        return;
      }

      const importSchedule = event.target.closest('[data-manage-import-schedule]');
      if (importSchedule) { CR.showToast?.({ message: 'Schedule sync complete' }); return; }
      const toggleButton = event.target.closest('[data-manage-toggle]');
      if (toggleButton) {
        const key = toggleButton.dataset.manageToggle;
        const currentValue = Boolean(getNestedValue(current, key));
        setNestedValue(current, key, !currentValue);
        rerender();
        CR.showToast?.({ message: `${toggleButton.querySelector('.manage-toggle-label')?.textContent || 'Setting'} ${!currentValue ? 'on' : 'off'}` });
        return;
      }
      const streamOption = event.target.closest('[data-manage-stream-option]');
      if (streamOption) { const nextValue = streamOption.dataset.manageStreamOption; current.streamMode.selected = nextValue; rerender(); CR.showToast?.({ message: `Stream Mode set to ${labelForStreamOption(nextValue)}` }); }
    });
  }

  CR.manageEvents = { bindManageEvents };
})();