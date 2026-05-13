window.CR = window.CR || {};

(() => {
  const CR = window.CR;

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
    const option = CR.manageState?.streamMode?.options?.find((item) => item.value === value);
    return option?.label || 'Updated';
  }

  function closeAllSheets() {
    if (!CR.manageState) return;
    CR.manageState.activeEditField = null;
    CR.manageState.startSeasonOpen = false;
    CR.manageState.scoringEditOpen = false;
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function resetRosterDraft() {
    CR.manageState.rosterDraft = { name: '', position: 'F' };
    CR.manageState.editingRosterPlayerId = null;
  }

  function resetScheduleDraft() {
    CR.manageState.scheduleDraft = {
      date: '',
      opponent: '',
      type: 'Regular',
      firstPicker: CR.manageState.season.firstPicker
    };
    CR.manageState.editingScheduleGameId = null;
  }

  function rerender(options = {}) {
    CR.renderManage?.({ scrollTop: options.scrollTop });
  }

  function bindManageEvents() {
    const root = document.querySelector('#manageContent');
    if (!root) return;

    root.addEventListener('input', (event) => {
      const newSeasonInput = event.target.closest('[data-manage-new-season-input]');
      if (newSeasonInput) {
        CR.manageState.newSeasonDraft.seasonLabel = newSeasonInput.value;
        return;
      }

      const rosterInput = event.target.closest('[data-manage-roster-input]');
      if (rosterInput) {
        CR.manageState.rosterDraft[rosterInput.dataset.manageRosterInput] = rosterInput.value;
        return;
      }

      const scheduleInput = event.target.closest('[data-manage-schedule-input]');
      if (scheduleInput) {
        CR.manageState.scheduleDraft[scheduleInput.dataset.manageScheduleInput] = scheduleInput.value;
      }
    });

    root.addEventListener('click', (event) => {
      const viewTrigger = event.target.closest('[data-manage-view]');
      if (viewTrigger) {
        closeAllSheets();
        CR.manageState.activeManageView = viewTrigger.dataset.manageView || 'main';
        rerender({ scrollTop: true });
        return;
      }

      const editPlayer = event.target.closest('[data-manage-edit-player]');
      if (editPlayer) {
        const player = CR.manageState.roster.find((item) => item.id === editPlayer.dataset.manageEditPlayer);
        if (player) {
          CR.manageState.editingRosterPlayerId = player.id;
          CR.manageState.rosterDraft = { name: player.name, position: player.position };
          CR.showToast?.({ message: `Editing ${player.name}` });
          rerender({ scrollTop: true });
        }
        return;
      }

      const cancelEditPlayer = event.target.closest('[data-manage-cancel-edit-player]');
      if (cancelEditPlayer) {
        resetRosterDraft();
        rerender();
        CR.showToast?.({ message: 'Edit canceled' });
        return;
      }

      const savePlayer = event.target.closest('[data-manage-save-player]');
      if (savePlayer) {
        const draft = CR.manageState.rosterDraft;
        const name = String(draft.name || '').trim();
        if (!name) {
          CR.showToast?.({ message: 'Add a player name first' });
          return;
        }
        const payload = { name, position: draft.position || 'F' };
        if (CR.manageState.editingRosterPlayerId) {
          const player = CR.manageState.roster.find((item) => item.id === CR.manageState.editingRosterPlayerId);
          if (player) Object.assign(player, payload);
          resetRosterDraft();
          rerender();
          CR.showToast?.({ message: `${name} updated` });
          return;
        }
        CR.manageState.roster.push({ id: makeId('player'), ...payload, active: true });
        resetRosterDraft();
        rerender();
        CR.showToast?.({ message: `${name} added` });
        return;
      }

      const editGame = event.target.closest('[data-manage-edit-game]');
      if (editGame) {
        const game = CR.manageState.schedule.find((item) => item.id === editGame.dataset.manageEditGame);
        if (game) {
          CR.manageState.editingScheduleGameId = game.id;
          CR.manageState.scheduleDraft = {
            date: game.date,
            opponent: game.opponent,
            type: game.type,
            firstPicker: game.firstPicker
          };
          CR.showToast?.({ message: `Editing ${game.opponent}` });
          rerender({ scrollTop: true });
        }
        return;
      }

      const cancelEditGame = event.target.closest('[data-manage-cancel-edit-game]');
      if (cancelEditGame) {
        resetScheduleDraft();
        rerender();
        CR.showToast?.({ message: 'Edit canceled' });
        return;
      }

      const startSeason = event.target.closest('[data-manage-start-season]');
      if (startSeason) {
        closeAllSheets();
        CR.manageState.startSeasonOpen = true;
        rerender();
        return;
      }

      const closeStartSeason = event.target.closest('[data-manage-close-start-season]');
      if (closeStartSeason) {
        CR.manageState.startSeasonOpen = false;
        rerender();
        return;
      }

      const newSeasonPicker = event.target.closest('[data-manage-new-season-picker]');
      if (newSeasonPicker) {
        CR.manageState.newSeasonDraft.firstPicker = newSeasonPicker.dataset.manageNewSeasonPicker;
        rerender();
        return;
      }

      const confirmStartSeason = event.target.closest('[data-manage-confirm-start-season]');
      if (confirmStartSeason) {
        const draft = CR.manageState.newSeasonDraft;
        const seasonLabel = String(draft.seasonLabel || '').trim();
        if (!seasonLabel) {
          CR.showToast?.({ message: 'Add a season name first' });
          return;
        }
        CR.manageState.season.activeSeasonLabel = seasonLabel;
        CR.manageState.season.firstPicker = draft.firstPicker;
        CR.manageState.season.playoffMode = false;
        CR.manageState.schedule = [];
        resetScheduleDraft();
        CR.manageState.startSeasonOpen = false;
        rerender();
        CR.showToast?.({ message: `${seasonLabel} season started` });
        return;
      }

      const editScoring = event.target.closest('[data-manage-edit-scoring]');
      if (editScoring) {
        closeAllSheets();
        CR.manageState.scoringEditOpen = true;
        rerender();
        return;
      }

      const closeScoring = event.target.closest('[data-manage-close-scoring]');
      if (closeScoring) {
        CR.manageState.scoringEditOpen = false;
        rerender();
        return;
      }

      const scoreStep = event.target.closest('[data-manage-score-step]');
      if (scoreStep) {
        const profile = CR.manageState.season.scoringProfile;
        const key = scoreStep.dataset.manageScoreStep;
        const delta = Number(scoreStep.dataset.step || 0);
        const scoring = CR.manageState.season.scoringSystems?.[profile];
        if (scoring && Object.prototype.hasOwnProperty.call(scoring, key)) {
          scoring[key] = Math.max(0, Number(scoring[key] || 0) + delta);
          rerender();
        }
        return;
      }

      const togglePlayer = event.target.closest('[data-manage-toggle-player]');
      if (togglePlayer) {
        const player = CR.manageState.roster.find((item) => item.id === togglePlayer.dataset.manageTogglePlayer);
        if (player) {
          if (CR.manageState.editingRosterPlayerId === player.id) resetRosterDraft();
          player.active = !player.active;
          rerender();
          CR.showToast?.({ message: `${player.name} ${player.active ? 'restored' : 'removed from future picks'}` });
        }
        return;
      }

      const importSchedule = event.target.closest('[data-manage-import-schedule]');
      if (importSchedule) {
        CR.showToast?.({ message: 'Mock NHL schedule sync complete' });
        return;
      }

      const saveGame = event.target.closest('[data-manage-save-game]');
      if (saveGame) {
        const draft = CR.manageState.scheduleDraft;
        const opponent = String(draft.opponent || '').trim().toUpperCase();
        const date = String(draft.date || '').trim();
        if (!date || !opponent) {
          CR.showToast?.({ message: 'Add a date and opponent first' });
          return;
        }

        const payload = {
          date,
          opponent,
          type: draft.type || 'Regular',
          firstPicker: draft.firstPicker || CR.manageState.season.firstPicker
        };

        if (CR.manageState.editingScheduleGameId) {
          const game = CR.manageState.schedule.find((item) => item.id === CR.manageState.editingScheduleGameId);
          if (game) Object.assign(game, payload);
          resetScheduleDraft();
          rerender();
          CR.showToast?.({ message: `${opponent} game updated` });
          return;
        }

        CR.manageState.schedule.push({ id: makeId('game'), ...payload });
        resetScheduleDraft();
        rerender();
        CR.showToast?.({ message: `${opponent} game added` });
        return;
      }

      const removeGame = event.target.closest('[data-manage-remove-game]');
      if (removeGame) {
        if (CR.manageState.editingScheduleGameId === removeGame.dataset.manageRemoveGame) resetScheduleDraft();
        CR.manageState.schedule = CR.manageState.schedule.filter((game) => game.id !== removeGame.dataset.manageRemoveGame);
        rerender();
        CR.showToast?.({ message: 'Game removed from schedule' });
        return;
      }

      const editTrigger = event.target.closest('[data-manage-edit]');
      if (editTrigger) {
        closeAllSheets();
        CR.manageState.activeEditField = editTrigger.dataset.manageEdit;
        rerender();
        return;
      }

      const closeEdit = event.target.closest('[data-manage-close-edit]');
      if (closeEdit) {
        CR.manageState.activeEditField = null;
        rerender();
        return;
      }

      const editOption = event.target.closest('[data-manage-edit-value]');
      if (editOption) {
        const field = CR.manageState.activeEditField;
        const value = editOption.dataset.manageEditValue;
        if (field && Object.prototype.hasOwnProperty.call(CR.manageState.season, field)) {
          CR.manageState.season[field] = value;
          CR.manageState.activeEditField = null;
          rerender();
          CR.showToast?.({ message: `${value} selected` });
        }
        return;
      }

      const toggleButton = event.target.closest('[data-manage-toggle]');
      if (toggleButton) {
        const key = toggleButton.dataset.manageToggle;
        const currentValue = Boolean(getNestedValue(CR.manageState, key));
        setNestedValue(CR.manageState, key, !currentValue);
        rerender();
        CR.showToast?.({ message: `${toggleButton.querySelector('.manage-toggle-label')?.textContent || 'Setting'} ${!currentValue ? 'on' : 'off'}` });
        return;
      }

      const streamOption = event.target.closest('[data-manage-stream-option]');
      if (streamOption) {
        const nextValue = streamOption.dataset.manageStreamOption;
        CR.manageState.streamMode.selected = nextValue;
        rerender();
        CR.showToast?.({ message: `Stream Mode set to ${labelForStreamOption(nextValue)}` });
      }
    });
  }

  CR.manageEvents = { bindManageEvents };
})();
