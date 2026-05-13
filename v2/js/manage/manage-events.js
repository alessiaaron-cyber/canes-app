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

  function bindManageEvents() {
    const root = document.querySelector('#manageContent');
    if (!root) return;

    root.addEventListener('input', (event) => {
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

    root.addEventListener('change', (event) => {
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
        CR.renderManage?.();
        return;
      }

      const startSeason = event.target.closest('[data-manage-start-season]');
      if (startSeason) {
        closeAllSheets();
        CR.manageState.startSeasonOpen = true;
        CR.renderManage?.();
        return;
      }

      const closeStartSeason = event.target.closest('[data-manage-close-start-season]');
      if (closeStartSeason) {
        CR.manageState.startSeasonOpen = false;
        CR.renderManage?.();
        return;
      }

      const newSeasonValue = event.target.closest('[data-manage-new-season-value]');
      if (newSeasonValue) {
        CR.manageState.newSeasonDraft.seasonLabel = newSeasonValue.dataset.manageNewSeasonValue;
        CR.renderManage?.();
        return;
      }

      const newSeasonPicker = event.target.closest('[data-manage-new-season-picker]');
      if (newSeasonPicker) {
        CR.manageState.newSeasonDraft.firstPicker = newSeasonPicker.dataset.manageNewSeasonPicker;
        CR.renderManage?.();
        return;
      }

      const confirmStartSeason = event.target.closest('[data-manage-confirm-start-season]');
      if (confirmStartSeason) {
        const draft = CR.manageState.newSeasonDraft;
        CR.manageState.season.activeSeasonLabel = draft.seasonLabel;
        CR.manageState.season.firstPicker = draft.firstPicker;
        CR.manageState.season.playoffMode = false;
        CR.manageState.schedule = [];
        CR.manageState.startSeasonOpen = false;
        CR.renderManage?.();
        CR.showToast?.({ message: `${draft.seasonLabel} season started` });
        return;
      }

      const editScoring = event.target.closest('[data-manage-edit-scoring]');
      if (editScoring) {
        closeAllSheets();
        CR.manageState.scoringEditOpen = true;
        CR.renderManage?.();
        return;
      }

      const closeScoring = event.target.closest('[data-manage-close-scoring]');
      if (closeScoring) {
        CR.manageState.scoringEditOpen = false;
        CR.renderManage?.();
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
          CR.renderManage?.();
        }
        return;
      }

      const addPlayer = event.target.closest('[data-manage-add-player]');
      if (addPlayer) {
        const draft = CR.manageState.rosterDraft;
        const name = String(draft.name || '').trim();
        if (!name) {
          CR.showToast?.({ message: 'Add a player name first' });
          return;
        }
        CR.manageState.roster.push({ id: makeId('player'), name, position: draft.position || 'F', active: true });
        CR.manageState.rosterDraft = { name: '', position: 'F' };
        CR.renderManage?.();
        CR.showToast?.({ message: `${name} added` });
        return;
      }

      const togglePlayer = event.target.closest('[data-manage-toggle-player]');
      if (togglePlayer) {
        const player = CR.manageState.roster.find((item) => item.id === togglePlayer.dataset.manageTogglePlayer);
        if (player) {
          player.active = !player.active;
          CR.renderManage?.();
          CR.showToast?.({ message: `${player.name} ${player.active ? 'restored' : 'removed from future picks'}` });
        }
        return;
      }

      const importSchedule = event.target.closest('[data-manage-import-schedule]');
      if (importSchedule) {
        CR.showToast?.({ message: 'Mock NHL schedule sync complete' });
        return;
      }

      const addGame = event.target.closest('[data-manage-add-game]');
      if (addGame) {
        const draft = CR.manageState.scheduleDraft;
        const opponent = String(draft.opponent || '').trim().toUpperCase();
        const date = String(draft.date || '').trim();
        if (!date || !opponent) {
          CR.showToast?.({ message: 'Add a date and opponent first' });
          return;
        }
        CR.manageState.schedule.push({ id: makeId('game'), date, opponent, type: draft.type || 'Regular', firstPicker: draft.firstPicker || CR.manageState.season.firstPicker });
        CR.manageState.scheduleDraft = { date: '', opponent: '', type: 'Regular', firstPicker: CR.manageState.season.firstPicker };
        CR.renderManage?.();
        CR.showToast?.({ message: `${opponent} game added` });
        return;
      }

      const removeGame = event.target.closest('[data-manage-remove-game]');
      if (removeGame) {
        CR.manageState.schedule = CR.manageState.schedule.filter((game) => game.id !== removeGame.dataset.manageRemoveGame);
        CR.renderManage?.();
        CR.showToast?.({ message: 'Game removed from mock schedule' });
        return;
      }

      const editTrigger = event.target.closest('[data-manage-edit]');
      if (editTrigger) {
        closeAllSheets();
        CR.manageState.activeEditField = editTrigger.dataset.manageEdit;
        CR.renderManage?.();
        return;
      }

      const closeEdit = event.target.closest('[data-manage-close-edit]');
      if (closeEdit) {
        CR.manageState.activeEditField = null;
        CR.renderManage?.();
        return;
      }

      const editOption = event.target.closest('[data-manage-edit-value]');
      if (editOption) {
        const field = CR.manageState.activeEditField;
        const value = editOption.dataset.manageEditValue;
        if (field && Object.prototype.hasOwnProperty.call(CR.manageState.season, field)) {
          CR.manageState.season[field] = value;
          CR.manageState.activeEditField = null;
          CR.renderManage?.();
          CR.showToast?.({ message: `${value} selected` });
        }
        return;
      }

      const toggleButton = event.target.closest('[data-manage-toggle]');
      if (toggleButton) {
        const key = toggleButton.dataset.manageToggle;
        const currentValue = Boolean(getNestedValue(CR.manageState, key));
        setNestedValue(CR.manageState, key, !currentValue);
        CR.renderManage?.();
        CR.showToast?.({ message: `${toggleButton.querySelector('.manage-toggle-label')?.textContent || 'Setting'} ${!currentValue ? 'on' : 'off'}` });
        return;
      }

      const streamOption = event.target.closest('[data-manage-stream-option]');
      if (streamOption) {
        const nextValue = streamOption.dataset.manageStreamOption;
        CR.manageState.streamMode.selected = nextValue;
        CR.renderManage?.();
        CR.showToast?.({ message: `Stream Mode set to ${labelForStreamOption(nextValue)}` });
      }
    });
  }

  CR.manageEvents = { bindManageEvents };
})();
