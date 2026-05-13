window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function bindHistoryEvents() {
    const root = document.querySelector('#historyView');
    if (!root) return;

    root.querySelector('#historySeasonSelect')?.addEventListener('change', (event) => {
      const nextSeasonId = event.target.value;
      CR.historyState.seasonId = nextSeasonId;
      CR.historyState.expandedGameId = null;
      CR.historyState.editingGameId = null;
      CR.historyState.editTab = 'result';
      CR.renderHistory?.();
    });

    root.addEventListener('click', (event) => {
      const seasonJump = event.target.closest('button[data-history-season]');
      if (seasonJump) {
        CR.historyState.seasonId = seasonJump.dataset.historySeason;
        CR.historyState.expandedGameId = null;
        CR.historyState.editingGameId = null;
        CR.historyState.editTab = 'result';
        CR.renderHistory?.();
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
    });
  }

  CR.historyEvents = { bindHistoryEvents };
})();
