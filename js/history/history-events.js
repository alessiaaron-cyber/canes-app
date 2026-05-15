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
    if (options.returnView) CR.historyState.returnView = options.returnView;
    if (options.trackPrevious !== false) CR.historyState.previousView = CR.historyState.view;
    CR.historyState.view = view;
    CR.renderHistory?.();
    scrollHistoryToTop();
  }

  function ownerClass(side) {
    return side === 'Julie' ? 'owner-secondary' : 'owner-primary';
  }

  function scoringRules(isPlayoff) {
    return isPlayoff
      ? { goal: 2, assist: 1, firstGoalBonus: 1 }
      : { goal: 1, assist: 1, firstGoalBonus: 1 };
  }

  function buildFirstGoalOptions(game) {
    const names = new Set();
    ['Aaron', 'Julie'].forEach((side) => {
      (game.picks?.[side] || []).forEach((pick) => names.add(pick.playerName));
    });
    if (game.firstGoalScorer) names.add(game.firstGoalScorer);
    return Array.from(names);
  }

  function renderPickCards(picks, sideKey) {
    return (picks || []).map((pick, index) => `
      <article class="history-sheet-pick-card" data-history-pick-card="1">
        <div class="history-sheet-pick-card-topline">
          <span class="eyebrow">Pick ${index + 1}</span>
          <span class="history-sheet-ga-head">G / A</span>
        </div>
        <div class="history-sheet-pick-grid">
          <label class="history-sheet-pick-name-wrap">
            <input
              class="history-sheet-input history-sheet-pick-name"
              type="text"
              value="${escapeHtml(pick.playerName)}"
              data-history-pick-name="1"
              aria-label="${escapeHtml(sideKey)} pick ${index + 1} player"
            />
          </label>
          <label class="history-sheet-mini-stat">
            <span>G</span>
            <input
              class="history-sheet-input history-sheet-mini-input"
              type="number"
              min="0"
              step="1"
              value="${escapeHtml(String(Number(pick.goals || 0)))}"
              data-history-goals="1"
              aria-label="${escapeHtml(sideKey)} pick ${index + 1} goals"
            />
          </label>
          <label class="history-sheet-mini-stat">
            <span>A</span>
            <input
              class="history-sheet-input history-sheet-mini-input"
              type="number"
              min="0"
              step="1"
              value="${escapeHtml(String(Number(pick.assists || 0)))}"
              data-history-assists="1"
              aria-label="${escapeHtml(sideKey)} pick ${index + 1} assists"
            />
          </label>
        </div>
        <div class="history-sheet-pick-points-row">
          <span class="history-sheet-pick-points-label">Points</span>
          <strong data-history-pick-points="1">${escapeHtml(String(Number(pick.points || 0)))} pts</strong>
        </div>
      </article>
    `).join('');
  }

  function openGameEditSheet(gameId, context) {
    const games = CR.historyData?.games || [];
    const game = games.find((item) => String(item.id) === String(gameId));
    if (!game) {
      openHistorySheet({ title: 'Edit Game', message: 'Could not load this game.' });
      return;
    }

    const firstGoalOptions = buildFirstGoalOptions(game);

    const detailsHtml = `
      <form class="history-sheet-form history-sheet-form-v2" data-history-edit-form="1" data-history-game-id="${escapeHtml(game.id)}" onsubmit="return false;">
        <div class="history-sheet-summary">
          <div>
            <div class="history-sheet-summary-title">Game ${escapeHtml(String(game.displayNumber || ''))} • ${escapeHtml(game.playoff ? 'Playoffs' : 'Regular')}</div>
            <div class="history-sheet-summary-copy">${escapeHtml(game.date)} • ${escapeHtml(game.opponent || 'Opponent TBD')}</div>
            <div class="history-sheet-summary-copy">First pick: ${escapeHtml(game.firstPick || '—')}</div>
            <div class="history-sheet-summary-copy">First goal: <span data-history-first-goal-readout="1">${escapeHtml(game.firstGoalScorer || '—')}</span></div>
            <div class="history-sheet-summary-copy">Aaron: ${(game.picks?.Aaron || []).map((pick) => escapeHtml(pick.playerName)).join(' / ')}</div>
            <div class="history-sheet-summary-copy">Julie: ${(game.picks?.Julie || []).map((pick) => escapeHtml(pick.playerName)).join(' / ')}</div>
          </div>
        </div>

        <div class="history-sheet-tabs" role="tablist" aria-label="Edit game sections">
          <button class="history-sheet-tab is-active" type="button" data-history-sheet-tab="info">Info</button>
          <button class="history-sheet-tab" type="button" data-history-sheet-tab="picks">Picks</button>
          <button class="history-sheet-tab" type="button" data-history-sheet-tab="result">Result</button>
        </div>

        <section class="history-sheet-panel is-active" data-history-sheet-panel="info">
          <div class="history-sheet-field-grid">
            <label class="history-sheet-field">
              <span>Date</span>
              <input class="history-sheet-input" type="text" value="${escapeHtml(game.date)}" aria-label="Game date" />
            </label>
            <label class="history-sheet-field">
              <span>Opponent</span>
              <input class="history-sheet-input" type="text" value="${escapeHtml(game.opponent || '')}" aria-label="Opponent" />
            </label>
          </div>
          <div class="history-sheet-field-grid">
            <label class="history-sheet-field">
              <span>Type</span>
              <select class="history-sheet-select" data-history-game-type="1" aria-label="Game type">
                <option value="regular" ${game.playoff ? '' : 'selected'}>Regular Season</option>
                <option value="playoffs" ${game.playoff ? 'selected' : ''}>Playoffs</option>
              </select>
            </label>
            <label class="history-sheet-field">
              <span>First pick</span>
              <select class="history-sheet-select" aria-label="First pick">
                <option ${game.firstPick === 'Aaron' ? 'selected' : ''}>Aaron</option>
                <option ${game.firstPick === 'Julie' ? 'selected' : ''}>Julie</option>
              </select>
            </label>
          </div>
        </section>

        <section class="history-sheet-panel" data-history-sheet-panel="picks" hidden>
          <div class="history-sheet-side-section">
            <div class="history-sheet-side-section-head">
              <h3>Aaron Picks</h3>
              <span class="history-sheet-ga-head">G / A</span>
            </div>
            <div class="history-sheet-pick-stack" data-history-side="Aaron">
              ${renderPickCards(game.picks?.Aaron, 'Aaron')}
            </div>
          </div>

          <div class="history-sheet-side-section">
            <div class="history-sheet-side-section-head">
              <h3>Julie Picks</h3>
              <span class="history-sheet-ga-head">G / A</span>
            </div>
            <div class="history-sheet-pick-stack" data-history-side="Julie">
              ${renderPickCards(game.picks?.Julie, 'Julie')}
            </div>
          </div>
        </section>

        <section class="history-sheet-panel" data-history-sheet-panel="result" hidden>
          <label class="history-sheet-field">
            <span>First goal scorer</span>
            <input class="history-sheet-input" list="history-first-goal-options-${escapeHtml(game.id)}" value="${escapeHtml(game.firstGoalScorer || '')}" data-history-first-goal="1" aria-label="First goal scorer" />
            <datalist id="history-first-goal-options-${escapeHtml(game.id)}">
              ${firstGoalOptions.map((name) => `<option value="${escapeHtml(name)}"></option>`).join('')}
            </datalist>
          </label>

          <div class="history-sheet-score-preview-grid">
            <article class="history-sheet-score-preview-card">
              <div class="eyebrow ${ownerClass('Aaron')}">Aaron</div>
              <div class="history-sheet-score-preview-value" data-history-side-total="Aaron">${escapeHtml(String(game.aaronScore || 0))}</div>
            </article>
            <article class="history-sheet-score-preview-card">
              <div class="eyebrow ${ownerClass('Julie')}">Julie</div>
              <div class="history-sheet-score-preview-value" data-history-side-total="Julie">${escapeHtml(String(game.julieScore || 0))}</div>
            </article>
          </div>

          <div class="history-sheet-actions-note">Scores update automatically from goals, assists, game type, and first-goal bonus.</div>
        </section>

        <div class="history-sheet-footer-note">First goal can be any roster player. Bonus applies only if that player was picked and has a goal logged.</div>
      </form>
    `;

    openHistorySheet({
      title: `Edit Game ${game.displayNumber || ''}`.trim(),
      message: '',
      primaryAction: 'Save',
      detailsHtml
    });
  }

  function parseNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : 0;
  }

  function refreshSheetTotals(form) {
    if (!form) return;
    const isPlayoff = form.querySelector('[data-history-game-type="1"]')?.value === 'playoffs';
    const rules = scoringRules(isPlayoff);
    const firstGoalName = (form.querySelector('[data-history-first-goal="1"]')?.value || '').trim().toLowerCase();
    const totals = { Aaron: 0, Julie: 0 };

    ['Aaron', 'Julie'].forEach((side) => {
      const stack = form.querySelector(`[data-history-side="${side}"]`);
      stack?.querySelectorAll('[data-history-pick-card="1"]').forEach((card) => {
        const goals = parseNumber(card.querySelector('[data-history-goals="1"]')?.value);
        const assists = parseNumber(card.querySelector('[data-history-assists="1"]')?.value);
        const playerName = (card.querySelector('[data-history-pick-name="1"]')?.value || '').trim().toLowerCase();
        let points = goals * rules.goal + assists * rules.assist;
        if (firstGoalName && playerName === firstGoalName && goals > 0) points += rules.firstGoalBonus;
        totals[side] += points;
        const pointNode = card.querySelector('[data-history-pick-points="1"]');
        if (pointNode) pointNode.textContent = `${points} pts`;
      });
    });

    form.querySelector('[data-history-side-total="Aaron"]')?.replaceChildren(document.createTextNode(String(totals.Aaron)));
    form.querySelector('[data-history-side-total="Julie"]')?.replaceChildren(document.createTextNode(String(totals.Julie)));
    form.querySelector('[data-history-first-goal-readout="1"]')?.replaceChildren(document.createTextNode(form.querySelector('[data-history-first-goal="1"]')?.value || '—'));
  }

  function switchSheetTab(form, tabId) {
    if (!form) return;
    form.querySelectorAll('[data-history-sheet-tab]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.historySheetTab === tabId);
    });
    form.querySelectorAll('[data-history-sheet-panel]').forEach((panel) => {
      const isActive = panel.dataset.historySheetPanel === tabId;
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
    });
  }

  function handleSeasonSelect(event) {
    const target = event.target;
    if (!target.matches('#historySeasonSelect, #historySeasonSelectArchive')) return;
    CR.historyState.seasonId = target.value;
    CR.renderHistory?.();
    scrollHistoryToTop();
  }

  function handleChange(event) {
    handleSeasonSelect(event);
    const form = event.target.closest('[data-history-edit-form="1"]');
    if (form && event.target.matches('[data-history-goals="1"], [data-history-assists="1"], [data-history-pick-name="1"], [data-history-first-goal="1"], [data-history-game-type="1"]')) {
      refreshSheetTotals(form);
    }
  }

  function handleInput(event) {
    const form = event.target.closest('[data-history-edit-form="1"]');
    if (form && event.target.matches('[data-history-goals="1"], [data-history-assists="1"], [data-history-pick-name="1"], [data-history-first-goal="1"]')) {
      refreshSheetTotals(form);
    }
  }

  function handleClick(event) {
    const tab = event.target.closest('[data-history-sheet-tab]');
    if (tab) {
      switchSheetTab(tab.closest('[data-history-edit-form="1"]'), tab.dataset.historySheetTab);
      return;
    }

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
      openHistorySheet({ title: 'History', message: 'Mock detail view.' });
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
      CR.showToast?.({ message: 'Game changes saved', tier: 'light' });
      CR.renderHistory?.();
    }
  }

  function bindHistoryEvents() {
    const root = document.querySelector('#historyView');
    if (!root || root.dataset.historyBound === 'true') return;
    root.addEventListener('change', handleChange);
    root.addEventListener('input', handleInput);
    root.addEventListener('click', handleClick);
    root.dataset.historyBound = 'true';
  }

  CR.historyEvents = { bindHistoryEvents };
})();
