window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function openHistorySheet(config) {
    CR.historyState.sheet = {
      open: true,
      title: config.title,
      message: config.message,
      primaryAction: config.primaryAction || '',
      detailsHtml: config.detailsHtml || ''
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

  function renderPickRows(picks, sideKey) {
    return (picks || []).map((pick, index) => `
      <div class="history-sheet-pick-row is-editable">
        <input class="history-sheet-inline-input" type="text" value="${escapeHtml(pick.playerName)}" aria-label="${escapeHtml(sideKey)} pick ${index + 1} player" />
        <input class="history-sheet-inline-input is-compact" type="text" value="${escapeHtml(`${pick.goals}G ${pick.assists}A • ${pick.points} pts`)}" aria-label="${escapeHtml(sideKey)} pick ${index + 1} stat line" />
      </div>
    `).join('');
  }

  function openGameEditSheet(gameId, context) {
    const games = CR.historyData?.games || [];
    const game = games.find((item) => String(item.id) === String(gameId));
    if (!game) {
      openHistorySheet({
        title: 'Game edit',
        message: 'Could not load this game.',
        primaryAction: ''
      });
      return;
    }

    const detailsHtml = `
      <form class="history-sheet-form" onsubmit="return false;">
        <div class="history-sheet-meta-row">
          <span class="history-sheet-meta-pill">${escapeHtml(game.date)}</span>
          <span class="history-sheet-meta-pill">${escapeHtml(context === 'archive' ? 'Archive edit' : 'Recent game edit')}</span>
        </div>

        <div class="history-sheet-field-grid">
          <label class="history-sheet-field">
            <span>Game type</span>
            <select class="history-sheet-select" aria-label="Game type">
              <option ${game.playoff ? '' : 'selected'}>Regular Season</option>
              <option ${game.playoff ? 'selected' : ''}>Playoffs</option>
            </select>
          </label>
          <label class="history-sheet-field">
            <span>First goal scorer</span>
            <input class="history-sheet-input" type="text" value="${escapeHtml(game.firstGoalScorer || '—')}" aria-label="First goal scorer" />
          </label>
        </div>

        <div class="history-sheet-score-grid">
          <label class="history-sheet-field history-sheet-score-field">
            <span>Aaron score</span>
            <input class="history-sheet-input" type="number" value="${escapeHtml(String(game.aaronScore))}" aria-label="Aaron score" />
          </label>
          <label class="history-sheet-field history-sheet-score-field">
            <span>Julie score</span>
            <input class="history-sheet-input" type="number" value="${escapeHtml(String(game.julieScore))}" aria-label="Julie score" />
          </label>
        </div>

        <div class="history-sheet-sides">
          <section class="history-sheet-side">
            <div class="history-sheet-side-head">
              <strong>Aaron picks</strong>
              <span>${escapeHtml(String(game.aaronScore))}</span>
            </div>
            ${renderPickRows(game.picks?.Aaron, 'Aaron')}
          </section>
          <section class="history-sheet-side">
            <div class="history-sheet-side-head">
              <strong>Julie picks</strong>
              <span>${escapeHtml(String(game.julieScore))}</span>
            </div>
            ${renderPickRows(game.picks?.Julie, 'Julie')}
          </section>
        </div>

        <div class="history-sheet-actions-note">Commissioner workspace for score corrections, first-goal fixes, and pick/stat cleanup. This is the final staging surface before real persistence is wired in.</div>
      </form>
    `;

    openHistorySheet({
      title: `Edit Game ${game.displayNumber || ''}`.trim(),
      message: 'Commissioner edit workspace',
      primaryAction: 'Save Changes',
      detailsHtml
    });
  }

  function handleSeasonSelect(event) {
    const target = event.target;
    if (!target.matches('#historySeasonSelect, #historySeasonSelectArchive')) return;

    CR.historyState.seasonId = target.value;
    CR.renderHistory?.();
    scrollHistoryToTop();
  }

  function handleClick(event) {
    const editGame = event.target.closest('[data-history-edit-game]');
    if (editGame) {
      openGameEditSheet(editGame.dataset.historyEditGame, editGame.dataset.historyEditContext || 'recent');
      return;
    }

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
      CR.showToast?.({ message: 'Mock commissioner save complete', tier: 'light' });
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
