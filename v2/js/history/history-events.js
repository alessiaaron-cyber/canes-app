window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function bindHistoryEvents() {
    const root = document.querySelector('#historyView');
    if (!root) return;

    root.querySelector('#historySubviewNav')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-history-subview]');
      if (!button) return;
      CR.historyState.subview = button.dataset.historySubview;
      CR.renderHistory?.();
    });

    root.querySelector('#historySeasonSwitcher')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-history-season]');
      if (!button) return;
      CR.historyState.seasonId = button.dataset.historySeason;
      CR.historyState.expandedGameId = null;
      CR.renderHistory?.();
    });

    root.querySelector('#historyCommissionerToggle')?.addEventListener('click', () => {
      CR.historyState.commissionerMode = !CR.historyState.commissionerMode;
      CR.showToast?.({
        message: CR.historyState.commissionerMode ? 'Commissioner mode enabled' : 'Commissioner mode off',
        tier: CR.historyState.commissionerMode ? 'medium' : 'light'
      });
      CR.renderHistory?.();
    });

    root.querySelector('#historySubviewContent')?.addEventListener('click', (event) => {
      const expandButton = event.target.closest('button[data-history-expand]');
      if (expandButton) {
        const gameId = expandButton.dataset.historyExpand;
        CR.historyState.subview = 'games';
        CR.historyState.expandedGameId = CR.historyState.expandedGameId === gameId ? null : gameId;
        CR.renderHistory?.();
        return;
      }

      const jumpButton = event.target.closest('button[data-history-game-jump]');
      if (jumpButton) {
        CR.historyState.subview = 'games';
        CR.historyState.expandedGameId = jumpButton.dataset.historyGameJump;
        CR.renderHistory?.();
        requestAnimationFrame(() => {
          document.querySelector(`#history-game-${jumpButton.dataset.historyGameJump}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        return;
      }

      const adminButton = event.target.closest('button[data-history-admin-action]');
      if (adminButton) {
        const action = adminButton.dataset.historyAdminAction;
        const gameId = adminButton.dataset.historyGame;
        CR.historyState.sheet = {
          open: true,
          action,
          gameId,
          message: action === 'recalc'
            ? 'Mock recalculation preview will refresh rivalry totals and momentum.'
            : `Mock ${action.replace('-', ' ')} flow for ${gameId}.`
        };
        CR.renderHistory?.();
      }
    });

    root.querySelector('#historyAdminLayer')?.addEventListener('click', (event) => {
      if (event.target.closest('[data-history-sheet-close]')) {
        CR.historyState.sheet = { open: false };
        CR.renderHistory?.();
        return;
      }

      if (event.target.closest('[data-history-sheet-apply]')) {
        CR.historyState.sheet = { open: false };
        CR.flashSync?.();
        CR.showToast?.({ message: 'Mock history recalculated', tier: 'medium' });
        CR.renderHistory?.();
      }

      if (event.target.id === 'historyAdminSheet') {
        CR.historyState.sheet = { open: false };
        CR.renderHistory?.();
      }
    });
  }

  CR.historyEvents = {
    bindHistoryEvents
  };
})();
