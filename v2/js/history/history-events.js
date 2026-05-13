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

      const backHq = event.target.closest('button[data-history-back-hq]');
      if (backHq) {
        CR.historyState.view = 'hq';
        CR.renderHistory?.();
        return;
      }

      const openGame = event.target.closest('button[data-history-open-game]');
      if (openGame) {
        const gameId = openGame.dataset.historyOpenGame;
        const game = (CR.historyData?.seasonGames?.[CR.historyState.seasonId] || []).find((item) => item.id === gameId);
        openHistorySheet({
          title: game ? game.title : 'Game detail',
          message: game
            ? `${game.playoff ? 'Playoff' : 'Regular'} game on ${game.date}. Aaron ${game.aaronScore}, Julie ${game.julieScore}. First goal: ${game.picks?.Aaron?.find((pick) => pick.firstGoal)?.playerName || game.picks?.Julie?.find((pick) => pick.firstGoal)?.playerName || '—'}.`
            : 'Game detail mock view coming next.',
          primaryAction: 'Open full game view'
        });
        return;
      }

      const access = event.target.closest('button[data-history-access]');
      if (access) {
        const id = access.dataset.historyAccess;

        if (id === 'all_games') {
          CR.historyState.view = 'all_games';
          CR.renderHistory?.();
          return;
        }

        const configs = {
          commissioner: {
            title: 'Commissioner tools',
            message: 'Admin history tools will live behind this entry point for editing, corrections, and recalculation.',
            primaryAction: 'Open tools'
          }
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
