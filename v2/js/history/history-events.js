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
    if (container) container.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function navigate(view, options = {}) {
    if (options.returnView) {
      CR.historyState.returnView = options.returnView;
    }

    if (options.trackPrevious !== false) {
      CR.historyState.previousView = CR.historyState.view;
    }

    CR.historyState.view = view;
    CR.renderHistory?.();
    scrollHistoryToTop();
  }

  function handleSeasonSelect(event) {
    const target = event.target;
    if (!target.matches('#historySeasonSelect, #historySeasonSelectArchive')) return;

    CR.historyState.seasonId = target.value;
    CR.renderHistory?.();
    scrollHistoryToTop();
  }

  function handleClick(event) {
    const seasonOverview = event.target.closest('[data-history-open-season]');
    if (seasonOverview) {
      CR.historyState.seasonId = seasonOverview.dataset.historyOpenSeason;
      navigate('all_games', { returnView: 'seasons' });
      return;
    }

    const seasonJump = event.target.closest('button[data-history-season]');
    if (seasonJump) {
      CR.historyState.seasonId = seasonJump.dataset.historySeason;
      CR.renderHistory?.();
      scrollHistoryToTop();
      return;
    }

    const back = event.target.closest('button[data-history-back]');
    if (back) {
      navigate(CR.historyState.returnView || 'hq', { trackPrevious: false });
      return;
    }

    const backHq = event.target.closest('button[data-history-back-hq]');
    if (backHq) {
      navigate('hq', { trackPrevious: false });
      return;
    }

    const access = event.target.closest('button[data-history-access]');
    if (access) {
      const id = access.dataset.historyAccess;

      if (id === 'all_games') {
        navigate('all_games', { returnView: 'hq' });
        return;
      }

      if (id === 'seasons') {
        navigate('seasons');
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
  }

  function bindHistoryEvents() {
    const root = document.querySelector('#historyView');
    if (!root || root.dataset.historyBound === 'true') return;

    root.addEventListener('change', handleSeasonSelect);
    root.addEventListener('click', handleClick);

    root.dataset.historyBound = 'true';
  }

  CR.historyEvents = { bindHistoryEvents };
})();
