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

  function scrollHistoryToTop() {
    const container = document.querySelector('#historyView');
    if (container) {
      container.scrollTop = 0;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function bindHistoryEvents() {
    const root = document.querySelector('#historyView');
    if (!root) return;

    root.querySelector('#historySeasonSelect')?.addEventListener('change', (event) => {
      CR.historyState.seasonId = event.target.value;
      CR.renderHistory?.();
      scrollHistoryToTop();
    });

    root.addEventListener('click', (event) => {
      const seasonJump = event.target.closest('button[data-history-season]');
      if (seasonJump) {
        CR.historyState.seasonId = seasonJump.dataset.historySeason;
        CR.renderHistory?.();
        scrollHistoryToTop();
        return;
      }

      const backHq = event.target.closest('button[data-history-back-hq]');
      if (backHq) {
        CR.historyState.view = 'hq';
        CR.renderHistory?.();
        scrollHistoryToTop();
        return;
      }

      const access = event.target.closest('button[data-history-access]');
      if (access) {
        const id = access.dataset.historyAccess;

        if (id === 'all_games') {
          CR.historyState.view = 'all_games';
          CR.renderHistory?.();
          scrollHistoryToTop();
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
