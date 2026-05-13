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
          <span class="eyebrow">All-time rivalry</span>
          <span class="panel-tag live">HQ</span>
        </div>
        <h2 class="rivalry-board-title">${escapeHtml(board.lead || 'Rivalry tied')}</h2>
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
        <div class="rivalry-board-meta-row">
          <span class="rivalry-board-meta-pill">${escapeHtml(String(board.totalGames || 0))} total games</span>
          <span class="rivalry-board-meta-pill">Viewing ${escapeHtml(data.selectedSeason?.label || 'season')}</span>
        </div>
      </section>
    `;
  }

  function renderSeasonSnapshot(data) {
    const board = data.seasonBoard || {};
    return `
      <section class="panel-card history-hq-card">
        <div class="history-hq-topline">
          <span class="eyebrow">Current season view</span>
          <span class="panel-tag dark">Snapshot</span>
        </div>
        <h3 class="history-hq-title">${escapeHtml(board.seasonLabel || 'Season')}</h3>
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
        <div class="history-season-meta-row">
          <span class="history-season-meta-pill">Record ${escapeHtml(board.recordText || '—')}</span>
          <span class="history-season-meta-pill">${escapeHtml(board.recentText || 'Recent form unavailable')}</span>
          <span class="history-season-meta-pill">Best game ${escapeHtml(board.bestGameTitle || '—')}</span>
        </div>
      </section>
    `;
  }

  function renderMomentum(data) {
    return `
      <section class="panel-card history-momentum-card">
        <div class="history-section-head">
          <div>
            <div class="eyebrow">Momentum</div>
            <h3>Last eight rivalry swings</h3>
          </div>
        </div>
        <div class="history-momentum-strip">
          ${(data.momentum || []).map((item) => `
            <div class="history-momentum-node ${item.winner === 'Aaron' ? 'is-aaron' : item.winner === 'Julie' ? 'is-julie' : 'is-tie'} ${item.playoff ? 'is-playoff' : ''}">
              <span>${escapeHtml(item.winner === 'Tie' ? 'T' : item.winner === 'Aaron' ? 'A' : 'J')}</span>
            </div>
          `).join('')}
        </div>
        <p class="history-support-copy">${escapeHtml(data.highlights?.heater?.copy || 'Momentum is still shifting.')}</p>
      </section>
    `;
  }

  function renderHighlights(data) {
    const cards = (data.highlights?.cards || []).slice(0, 3);
    return `
      <section class="panel-card rivalry-highlights-card">
        <div class="history-section-head">
          <div>
            <div class="eyebrow">Highlights</div>
            <h3>Quick rivalry notes</h3>
          </div>
        </div>
        <div class="rivalry-highlight-grid compact-grid">
          ${cards.map((card) => `
            <article class="rivalry-highlight-item panel-card">
              <div class="eyebrow">${escapeHtml(card.label)}</div>
              <div class="rivalry-highlight-value">${escapeHtml(card.value)}</div>
              <p>${escapeHtml(card.copy)}</p>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderRecentGames(data, state) {
    return `
      <section class="panel-card history-recent-card">
        <div class="history-section-head">
          <div>
            <div class="eyebrow">Recent games</div>
            <h3>Latest rivalry results</h3>
          </div>
        </div>
        <div class="history-log-stack compact-log-stack">
          ${(data.recentGames || []).map((game) => renderGameCard(game, state)).join('')}
        </div>
      </section>
    `;
  }

  function renderGameCard(game, state) {
    const isEditing = state.editingGameId === game.id;
    const scorePill = `${game.aaronScore}-${game.julieScore}`;
    return `
      <article class="history-log-card compact-log-card" id="history-game-${escapeHtml(game.id)}">
        <div class="history-log-topline">
          <div>
            <h3>Game ${escapeHtml(String(game.displayNumber))}</h3>
            <div class="history-log-subtitle">${escapeHtml(game.playoff ? 'Playoffs' : 'Regular')}</div>
          </div>
          <div class="history-log-actions">
            <span class="history-score-pill">${escapeHtml(scorePill)}</span>
            <button class="history-edit-trigger" type="button" data-history-open-edit="${escapeHtml(game.id)}">Edit</button>
          </div>
        </div>
        <div class="history-log-body">
          <div class="history-log-row"><span class="history-log-label">Date</span><span>${escapeHtml(game.date)}</span></div>
          <div class="history-log-row"><span class="history-log-label">First goal</span><span>${escapeHtml(game.firstGoalScorer || '—')}</span></div>
        </div>
        ${isEditing ? renderEditor(game, state) : ''}
      </article>
    `;
  }

  function renderQuickAccess(data) {
    return `
      <section class="panel-card history-quick-access-card">
        <div class="history-section-head">
          <div>
            <div class="eyebrow">Quick access</div>
            <h3>Go deeper without clutter</h3>
          </div>
        </div>
        <div class="history-quick-access-grid">
          ${(data.quickAccess || []).map((item) => `
            <button class="history-access-card" type="button" data-history-access="${escapeHtml(item.id)}">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.meta)}</span>
            </button>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderPlayerSpotlights(data) {
    if (!(data.playerSpotlights || []).length) return '';
    return `
      <section class="panel-card history-player-wrap-card">
        <div class="history-section-head">
          <div>
            <div class="eyebrow">Top performers</div>
            <h3>Season impact picks</h3>
          </div>
        </div>
        <div class="history-player-spotlights">
          ${(data.playerSpotlights || []).map((player) => `
            <article class="history-player-spotlight-card">
              <div class="history-player-spotlight-topline">
                <div>
                  <div class="eyebrow">${escapeHtml(player.position)} • ${escapeHtml(player.owner)} lean</div>
                  <h3>${escapeHtml(player.name)}</h3>
                </div>
                <div class="history-player-hero-stat">${escapeHtml(String(player.totalPoints))}</div>
              </div>
              <p class="history-support-copy">${escapeHtml(player.clutch)}. ${escapeHtml(player.vibe)}.</p>
            </article>
          `).join('')}
        </div>
      </section>
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
      </div>
    `;
  }

  function renderEditTabs(state) {
    const tabs = [
      { id: 'result', label: 'Result' },
      { id: 'picks', label: 'Picks' },
      { id: 'info', label: 'Info' }
    ];
    return `<div class="history-edit-tabs">${tabs.map((tab) => `<button type="button" class="${state.editTab === tab.id ? 'active' : ''}" data-history-edit-tab="${tab.id}">${tab.label}</button>`).join('')}</div>`;
  }

  function renderResultEditor(game) {
    return `
      <div class="history-edit-panel">
        <label class="eyebrow">First Goal Scorer</label>
        <div class="history-edit-field">${escapeHtml(game.firstGoalScorer || '—')}</div>
        <label class="eyebrow">Status</label>
        <div class="history-edit-field">Final</div>
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
            ${(game.picks?.[side] || []).map((pick) => `
              <div class="history-pick-edit-card">
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
      </div>
    `;
  }

  function renderShell(data, state) {
    return `
      <div class="history-feed rivalry-command-feed">
        ${renderBoard(data)}
        ${renderSeasonSnapshot(data)}
        ${renderMomentum(data)}
        ${renderHighlights(data)}
        ${renderRecentGames(data, state)}
        ${renderPlayerSpotlights(data)}
        ${renderQuickAccess(data)}
      </div>
    `;
  }

  function renderAdminSheet(state) {
    if (!state.sheet?.open) return '';
    return `
      <div class="history-admin-sheet is-open" id="historyAdminSheet">
        <div class="history-admin-sheet-card">
          <div class="gd-sheet-handle"></div>
          <div class="gd-sheet-title">${escapeHtml(state.sheet.title || 'History tools')}</div>
          <div class="gd-sheet-copy">${escapeHtml(state.sheet.message || 'Mock history detail view.')}</div>
          <div class="gd-sheet-footer">
            <button class="gd-sheet-close" type="button" data-history-sheet-close="1">Close</button>
            ${state.sheet.primaryAction ? `<button class="gd-sheet-save" type="button" data-history-sheet-apply="1">${escapeHtml(state.sheet.primaryAction)}</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  CR.historyRender = { renderShell, renderAdminSheet };
})();
