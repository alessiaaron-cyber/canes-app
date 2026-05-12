window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function bindHistoryEvents() {
    const root = document.querySelector('#historyView');
    if (!root) return;

    root.querySelector('#historySeasonSwitcher')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-history-season]');
      if (!button) return;
      CR.historyState.seasonId = button.dataset.historySeason;
      CR.historyState.expandedGameId = null;
      CR.historyState.editing = false;
      CR.renderHistory?.();
    });

    root.addEventListener('click', (event) => {
      const expandButton = event.target.closest('button[data-history-expand]');
      if (expandButton) {
        const gameId = expandButton.dataset.historyExpand;
        CR.historyState.expandedGameId = CR.historyState.expandedGameId === gameId ? null : gameId;
        CR.renderHistory?.();
        return;
      }

      const jumpButton = event.target.closest('button[data-history-game-jump]');
      if (jumpButton) {
        CR.historyState.expandedGameId = jumpButton.dataset.historyGameJump;
        CR.renderHistory?.();
        requestAnimationFrame(() => {
          document.querySelector(`#history-game-${jumpButton.dataset.historyGameJump}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        return;
      }

      const toolsButton = event.target.closest('button[data-history-admin-action]');
      if (toolsButton) {
        const action = toolsButton.dataset.historyAdminAction;
        const gameId = toolsButton.dataset.historyGame;

        if (action === 'open-tools') {
          CR.historyState.editing = true;
          CR.historyState.expandedGameId = gameId;
          CR.showToast?.({ message: 'Commissioner tools ready', tier: 'light' });
          CR.renderHistory?.();
          return;
        }

        CR.historyState.sheet = {
          open: true,
          action,
          gameId,
          message: action === 'recalc'
            ? 'Mock recalculation preview will refresh rivalry totals and season flow.'
            : `Mock ${action.replace('-', ' ')} flow for ${gameId}.`
        };
        CR.renderHistory?.();
        return;
      }

      const closeButton = event.target.closest('[data-history-sheet-close]');
      if (closeButton) {
        CR.historyState.sheet = { open: false };
        CR.renderHistory?.();
        return;
      }

      const applyButton = event.target.closest('[data-history-sheet-apply]');
      if (applyButton) {
        CR.historyState.sheet = { open: false };
        CR.flashSync?.();
        CR.showToast?.({ message: 'Mock history recalculated', tier: 'medium' });
        CR.renderHistory?.();
        return;
      }

      if (event.target.id === 'historyAdminSheet') {
        CR.historyState.sheet = { open: false };
        CR.renderHistory?.();
      }
    });
  }

  CR.historyEvents = { bindHistoryEvents };
})();
