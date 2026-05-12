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

  function renderBoard(data) {
    const board = data.allTimeBoard || {};
    return `
      <section class="panel-card rivalry-board-card">
        <div class="rivalry-board-topline">
          <span class="eyebrow">All-time</span>
          <span class="panel-tag live">Rivalry</span>
        </div>
        <h2 class="rivalry-board-title">Rivalry Board</h2>
        <div class="rivalry-board-score-grid">
          <article class="rivalry-score-card">
            <div class="eyebrow">Aaron</div>
            <div class="rivalry-score-value">${escapeHtml(String(board.aaron ?? 0))}</div>
          </article>
          <article class="rivalry-score-card">
            <div class="eyebrow">Julie</div>
            <div class="rivalry-score-value">${escapeHtml(String(board.julie ?? 0))}</div>
          </article>
        </div>
        <div class="rivalry-board-banner">${escapeHtml(board.lead || 'Rivalry tied')}</div>
      </section>
    `;
  }

  function renderHighlights(data) {
    const highlights = data.highlights || { heater: {}, cards: [], boothNote: '' };
    return `
      <section class="panel-card rivalry-highlights-card">
        <div class="rivalry-highlights-header">
          <h3>Rivalry Highlights</h3>
          <span class="panel-tag dark">Broadcast Booth</span>
        </div>
        <article class="rivalry-heater-card">
          <div class="eyebrow">Current heater</div>
          <div class="rivalry-heater-title">${escapeHtml(highlights.heater?.title || 'No streak')}</div>
          <p>${escapeHtml(highlights.heater?.copy || 'Nobody owns momentum. The booth is calling this one chaos.')}</p>
        </article>
        <div class="rivalry-highlight-grid">
          ${(highlights.cards || []).map((card) => `
            <article class="rivalry-highlight-item panel-card">
              <div class="eyebrow">${escapeHtml(card.label)}</div>
              <div class="rivalry-highlight-value">${escapeHtml(card.value)}</div>
              <p>${escapeHtml(card.copy)}</p>
            </article>
          `).join('')}
        </div>
        <div class="rivalry-booth-note">Booth note: ${escapeHtml(highlights.boothNote || 'The rivalry still has range.')}</div>
      </section>
    `;
  }

  function renderHistoryHeader(data) {
    const board = data.seasonBoard || {};
    return `
      <section class="panel-card history-hq-card">
        <div class="history-hq-topline">
          <span class="eyebrow">History</span>
          <span class="panel-tag live">${escapeHtml(String(data.allTimeBoard?.totalGames || 0))} Games</span>
        </div>
        <h2 class="history-hq-title">Game Log</h2>
        <p class="history-hq-copy">Browse seasons, review picks, and fix past records.</p>
        <div class="history-season-field">
          <label class="eyebrow" for="historySeasonSelect">Season</label>
          <select id="historySeasonSelect" class="history-season-select">
            ${(data.seasons || []).map((season) => `<option value="${escapeHtml(season.id)}" ${data.selectedSeason?.id === season.id ? 'selected' : ''}>${escapeHtml(season.label)}</option>`).join('')}
          </select>
        </div>
        <div class="history-season-score-grid">
          <article class="rivalry-score-card">
            <div class="eyebrow">Aaron</div>
            <div class="rivalry-score-value">${escapeHtml(String(board.aaron ?? 0))}</div>
          </article>
          <article class="rivalry-score-card">
            <div class="eyebrow">Julie</div>
            <div class="rivalry-score-value">${escapeHtml(String(board.julie ?? 0))}</div>
          </article>
        </div>
      </section>
    `;
  }

  function renderEditTabs(state) {
    const tabs = [
      { id: 'result', label: 'Result' },
      { id: 'picks', label: 'Picks' },
      { id: 'info', label: 'Info' }
    ];
    return `
      <div class="history-edit-tabs">
        ${tabs.map((tab) => `<button type="button" class="${state.editTab === tab.id ? 'active' : ''}" data-history-edit-tab="${tab.id}">${tab.label}</button>`).join('')}
      </div>
    `;
  }

  function renderResultEditor(game) {
    return `
      <div class="history-edit-panel">
        <label class="eyebrow">First Goal Scorer</label>
        <div class="history-edit-field">${escapeHtml(game.firstGoalScorer || '—')}</div>
        <label class="eyebrow">Status</label>
        <div class="history-edit-field">Final</div>
        <p class="history-support-copy">Scores are recalculated from the pick goals and assists. Go to Picks to change the numbers.</p>
      </div>
    `;
  }

  function renderPicksEditor(game) {
    return `
      <div class="history-edit-panel history-picks-editor">
        ${['Aaron', 'Julie'].map((side) => `
          <section class="history-edit-side">
            <div class="history-edit-side-header">
              <h3>${escapeHtml(side)} Picks</h3>
              <span class="eyebrow">G / A</span>
            </div>
            ${(game.picks?.[side] || []).map((pick, index) => `
              <div class="history-pick-edit-card">
                <div class="eyebrow">Pick ${index + 1}</div>
                <div class="history-pick-edit-grid">
                  <div class="history-edit-field history-edit-player">${escapeHtml(pick.playerName)}</div>
                  <div class="history-edit-mini-field">${escapeHtml(String(pick.goals))}</div>
                  <div class="history-edit-mini-field">${escapeHtml(String(pick.assists))}</div>
                </div>
              </div>
            `).join('')}
          </section>
        `).join('')}
      </div>
    `;
  }

  function renderInfoEditor(game) {
    return `
      <div class="history-edit-panel">
        <label class="eyebrow">Date</label>
        <div class="history-edit-field">${escapeHtml(game.date)}</div>
        <label class="eyebrow">Type</label>
        <div class="history-edit-field">${escapeHtml(game.playoff ? 'Playoffs' : 'Regular')}</div>
        <label class="eyebrow">First Pick</label>
        <div class="history-edit-field">${escapeHtml(game.aaronScore >= game.julieScore ? 'Aaron' : 'Julie')}</div>
      </div>
    `;
  }

  function renderEditor(game, state) {
    const tab = state.editTab || 'result';
    return `
      <div class="history-game-edit-shell">
        ${renderEditTabs(state)}
        ${tab === 'result' ? renderResultEditor(game) : ''}
        ${tab === 'picks' ? renderPicksEditor(game) : ''}
        ${tab === 'info' ? renderInfoEditor(game) : ''}
        <div class="history-edit-actions">
          <button class="history-edit-cancel" type="button" data-history-edit-cancel="1">Cancel</button>
          <button class="history-edit-save" type="button" data-history-edit-save="1">Save</button>
        </div>
        <p class="history-support-copy">First goal can be any roster player. Bonus applies only if that player was picked and has a goal logged.</p>
      </div>
    `;
  }

  function renderGameCard(game, state) {
    const isEditing = state.editingGameId === game.id;
    const scorePill = `${game.aaronScore}-${game.julieScore}`;
    return `
      <article class="panel-card history-log-card" id="history-game-${escapeHtml(game.id)}">
        <div class="history-log-topline">
          <div>
            <h3>Game ${escapeHtml(String(game.displayNumber))} • ${escapeHtml(game.playoff ? 'Playoffs' : 'Regular')}</h3>
          </div>
          <div class="history-log-actions">
            <span class="history-score-pill">${escapeHtml(scorePill)}</span>
            <button class="history-edit-trigger" type="button" data-history-open-edit="${escapeHtml(game.id)}">Edit</button>
          </div>
        </div>
        <div class="history-log-body">
          <div>${escapeHtml(game.date)}</div>
          <div>First goal: ${escapeHtml(game.firstGoalScorer || '—')}</div>
          <div>Aaron: ${escapeHtml((game.picks?.Aaron || []).map((pick) => pick.playerName).join(' / ') || '—')}</div>
          <div>Julie: ${escapeHtml((game.picks?.Julie || []).map((pick) => pick.playerName).join(' / ') || '—')}</div>
        </div>
        ${isEditing ? renderEditor(game, state) : ''}
      </article>
    `;
  }

  function renderGameLog(data, state) {
    return `
      <section class="history-log-stack">
        ${(data.gameLog || []).map((game) => renderGameCard(game, state)).join('')}
      </section>
    `;
  }

  function renderArchive(data) {
    return `
      <section class="history-archive-stack">
        ${(data.archiveSeasons || []).map((season) => `
          <article class="panel-card history-archive-card">
            <div class="history-season-topline">
              <h3>${escapeHtml(season.label)}</h3>
              <div class="history-archive-record">${escapeHtml(season.recordText)}</div>
            </div>
            <p>${escapeHtml(season.note)}</p>
          </article>
        `).join('')}
      </section>
    `;
  }

  function renderShell(data, state) {
    return `
      <div class="history-feed rivalry-hq-feed">
        ${renderBoard(data)}
        ${renderHighlights(data)}
        ${renderHistoryHeader(data)}
        ${renderGameLog(data, state)}
        ${renderArchive(data)}
      </div>
    `;
  }

  function renderAdminSheet(state) {
    if (!state.sheet?.open) return '';
    return `
      <div class="history-admin-sheet is-open" id="historyAdminSheet">
        <div class="history-admin-sheet-card">
          <div class="gd-sheet-handle"></div>
          <div class="gd-sheet-title">Commissioner tools</div>
          <div class="gd-sheet-copy">${escapeHtml(state.sheet.message || 'Use these tools to correct archived rivalry data.')}</div>
          <div class="gd-sheet-footer">
            <button class="gd-sheet-close" type="button" data-history-sheet-close="1">Close</button>
            <button class="gd-sheet-save" type="button" data-history-sheet-apply="1">Apply mock change</button>
          </div>
        </div>
      </div>
    `;
  }

  CR.historyRender = { renderShell, renderAdminSheet };
})();
