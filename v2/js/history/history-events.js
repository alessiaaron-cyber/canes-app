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
      CR.historyState.seasonId = event.target.value;
      CR.renderHistory?.();
    });

    root.addEventListener('click', (event) => {
      const seasonJump = event.target.closest('button[data-history-season]');
      if (seasonJump) {
        CR.historyState.seasonId = seasonJump.dataset.historySeason;
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
