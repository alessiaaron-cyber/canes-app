window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function openHistorySheet(config) {
    CR.historyState.sheet = {
      open: true,
      title: config.title,
      message: config.message,
      primaryAction: config.primaryAction || ''
    };
    CR.renderHistory?.();
  }

  function bindHistoryEvents() {
    const root = document.querySelector('#historyView');
    if (!root) return;

    root.querySelector('#historySeasonSelect')?.addEventListener('change', (event) => {
      const nextSeasonId = event.target.value;
      CR.historyState.seasonId = nextSeasonId;
      CR.historyState.editingGameId = null;
      CR.historyState.editTab = 'result';
      CR.renderHistory?.();
    });

    root.addEventListener('click', (event) => {
      const seasonJump = event.target.closest('button[data-history-season]');
      if (seasonJump) {
        CR.historyState.seasonId = seasonJump.dataset.historySeason;
        CR.historyState.editingGameId = null;
        CR.historyState.editTab = 'result';
        CR.renderHistory?.();
        return;
      }

      const openGame = event.target.closest('button[data-history-open-game]');
      if (openGame) {
        const gameId = openGame.dataset.historyOpenGame;
        const game = (CR.historyData?.seasonGames?.[CR.historyState.seasonId] || []).find((item) => item.id === gameId);
        openHistorySheet({
          title: game ? `Game ${game.title || gameId}` : 'Game detail',
          message: game
            ? `${game.playoff ? 'Playoff' : 'Regular'} game on ${game.date}. Score ${game.aaronScore}-${game.julieScore}. First goal: ${game.picks?.Aaron?.find((pick) => pick.firstGoal)?.playerName || game.picks?.Julie?.find((pick) => pick.firstGoal)?.playerName || '—'}.`
            : 'Game detail mock view coming next.',
          primaryAction: 'Open full game view'
        });
        return;
      }

      const access = event.target.closest('button[data-history-access]');
      if (access) {
        const id = access.dataset.historyAccess;
        const configs = {
          seasons: { title: 'Seasons', message: 'Season browser mock view coming next.', primaryAction: 'Open season list' },
          records: { title: 'Records', message: 'Rivalry records drill-down mock view coming next.', primaryAction: 'View records' },
          players: { title: 'Top performers', message: 'Player history drill-down mock view coming next.', primaryAction: 'Open players' },
          moments: { title: 'Moments', message: 'Iconic moments mock view coming next.', primaryAction: 'Open moments' },
          commissioner: { title: 'Commissioner tools', message: 'Admin history tools will live behind this entry point.', primaryAction: 'Open tools' }
        };
        openHistorySheet(configs[id] || { title: 'History', message: 'Mock detail view.' });
        return;
      }

      const editOpen = event.target.closest('button[data-history-open-edit]');
      if (editOpen) {
        const gameId = editOpen.dataset.historyOpenEdit;
        CR.historyState.editingGameId = CR.historyState.editingGameId === gameId ? null : gameId;
        CR.historyState.editTab = 'result';
        CR.renderHistory?.();
        return;
      }

      const editTab = event.target.closest('button[data-history-edit-tab]');
      if (editTab) {
        CR.historyState.editTab = editTab.dataset.historyEditTab;
        CR.renderHistory?.();
        return;
      }

      const editCancel = event.target.closest('button[data-history-edit-cancel]');
      if (editCancel) {
        CR.historyState.editingGameId = null;
        CR.historyState.editTab = 'result';
        CR.renderHistory?.();
        return;
      }

      const editSave = event.target.closest('button[data-history-edit-save]');
      if (editSave) {
        CR.historyState.editingGameId = null;
        CR.historyState.editTab = 'result';
        CR.flashSync?.();
        CR.showToast?.({ message: 'Mock history change saved', tier: 'medium' });
        CR.renderHistory?.();
        return;
      }

      const sheetClose = event.target.closest('[data-history-sheet-close]');
      if (sheetClose || event.target.id === 'historyAdminSheet') {
        CR.historyState.sheet = { open: false };
        CR.renderHistory?.();
        return;
      }

      const sheetApply = event.target.closest('[data-history-sheet-apply]');
      if (sheetApply) {
        CR.historyState.sheet = { open: false };
        CR.showToast?.({ message: 'Mock history tool opened', tier: 'light' });
        CR.renderHistory?.();
      }
    });
  }

  CR.historyEvents = { bindHistoryEvents };
})();
