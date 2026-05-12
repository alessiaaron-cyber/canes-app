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

  function renderOverview(data) {
    const statCards = (data.overview.quickStats || []).map((item) => `
      <article class="panel-card history-stat-card">
        <div class="eyebrow">${escapeHtml(item.label)}</div>
        <div class="history-stat-value">${escapeHtml(item.value)}</div>
      </article>
    `).join('');

    const momentum = (data.momentum || []).map((item) => `
      <button class="history-momentum-node ${item.winner === 'Aaron' ? 'is-aaron' : item.winner === 'Julie' ? 'is-julie' : 'is-tie'} ${item.playoff ? 'is-playoff' : ''}" type="button" data-history-game-jump="${escapeHtml(item.id)}">
        <span class="history-momentum-mark">${item.winner === 'Aaron' ? 'A' : item.winner === 'Julie' ? 'J' : '•'}</span>
        <span class="history-momentum-streak">${item.streak > 1 ? escapeHtml(String(item.streak)) : ''}</span>
      </button>
    `).join('');

    const moments = (data.moments || []).map((moment) => `
      <article class="history-moment-card ${moment.winner === 'Aaron' ? 'is-aaron' : 'is-julie'}">
        <div class="history-moment-topline">
          <span class="panel-tag ${moment.playoff ? 'warning' : 'calm'}">${moment.playoff ? 'Playoffs' : 'Regular'}</span>
          <span class="history-date">${escapeHtml(moment.date)}</span>
        </div>
        <h3>${escapeHtml(moment.title)}</h3>
        <p>${escapeHtml(moment.text)}</p>
      </article>
    `).join('');

    return `
      <section class="panel-card history-hero-card">
        <div class="eyebrow">Overview</div>
        <h2>${escapeHtml(data.overview.hero)}</h2>
        <p class="history-hero-copy">${escapeHtml(data.overview.subhero)} • ${escapeHtml(data.overview.currentSeasonText)}</p>
      </section>
      <section class="history-stat-grid">${statCards}</section>
      <section class="panel-card history-panel">
        <div class="panel-header compact-header">
          <div>
            <div class="eyebrow">Momentum</div>
            <h2>Rivalry pulse</h2>
          </div>
          <span class="panel-tag dark">Current season</span>
        </div>
        <div class="history-momentum-strip">${momentum}</div>
        <p class="history-support-copy">Playoff games glow louder. Tap a rivalry node to jump into the archive.</p>
      </section>
      <section class="panel-card history-panel">
        <div class="panel-header compact-header">
          <div>
            <div class="eyebrow">Latest rivalry moments</div>
            <h2>The loudest recent stuff</h2>
          </div>
        </div>
        <div class="history-moment-list">${moments}</div>
      </section>
    `;
  }

  function renderGames(data, state) {
    return `
      <section class="history-section-stack">
        ${(data.currentGames || []).map((game) => {
          const expanded = state.expandedGameId === game.id;
          const picks = ['Aaron', 'Julie'].map((side) => `
            <section class="history-pick-column">
              <div class="eyebrow">${escapeHtml(side)}</div>
              ${(game.picks?.[side] || []).map((pick) => `
                <div class="history-pick-row">
                  <div>
                    <strong>${escapeHtml(pick.playerName)}</strong>
                    <span>${escapeHtml(`${pick.goals}G • ${pick.assists}A${pick.firstGoal ? ' • First goal' : ''}`)}</span>
                  </div>
                  <div class="history-pick-points">${escapeHtml(String(pick.points))}</div>
                </div>
              `).join('')}
            </section>
          `).join('');

          return `
            <article class="panel-card history-game-card ${game.winner === 'Aaron' ? 'is-aaron' : game.winner === 'Julie' ? 'is-julie' : ''}" id="history-game-${escapeHtml(game.id)}">
              <button class="history-game-button" type="button" data-history-expand="${escapeHtml(game.id)}">
                <div class="history-game-topline">
                  <span class="panel-tag ${game.playoff ? 'warning' : 'dark'}">${game.playoff ? 'Playoffs' : 'Regular'}</span>
                  <span class="history-date">${escapeHtml(game.date)}</span>
                </div>
                <div class="history-game-mainline">
                  <div>
                    <h3>${escapeHtml(game.title)}</h3>
                    <p>${escapeHtml(game.summary)}</p>
                  </div>
                  <div class="history-game-score">${escapeHtml(`${game.aaronScore}–${game.julieScore}`)}</div>
                </div>
                <div class="history-tag-row">${(game.tags || []).map((tag) => `<span class="history-chip">${escapeHtml(tag)}</span>`).join('')}</div>
              </button>
              ${expanded ? `
                <div class="history-game-detail">
                  <div class="history-pick-columns">${picks}</div>
                  <div class="history-support-copy">${escapeHtml((game.moments || []).join(' • '))}</div>
                  ${state.commissionerMode ? `
                    <div class="history-admin-row">
                      <button class="mini-button" type="button" data-history-admin-action="edit-game" data-history-game="${escapeHtml(game.id)}">Edit game</button>
                      <button class="mini-button" type="button" data-history-admin-action="edit-picks" data-history-game="${escapeHtml(game.id)}">Edit picks</button>
                      <button class="mini-button" type="button" data-history-admin-action="recalc" data-history-game="${escapeHtml(game.id)}">Recalculate</button>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </article>
          `;
        }).join('')}
      </section>
    `;
  }

  function renderTrends(data) {
    return `
      <section class="history-section-stack">
        ${(data.trends?.trendCards || []).map((card) => `
          <article class="panel-card history-trend-card">
            <div class="eyebrow">${escapeHtml(card.label)}</div>
            <div class="history-stat-value">${escapeHtml(card.value)}</div>
            <p>${escapeHtml(card.copy)}</p>
          </article>
        `).join('')}
      </section>
    `;
  }

  function renderPlayers(data) {
    return `
      <section class="history-section-stack">
        ${(data.playerSummaries || []).map((player) => `
          <article class="panel-card history-player-card">
            <div class="history-player-topline">
              <div>
                <div class="eyebrow">${escapeHtml(player.position)} • ${escapeHtml(player.owner)} lean</div>
                <h3>${escapeHtml(player.name)}</h3>
              </div>
              <span class="panel-tag dark">${escapeHtml(String(player.totalPoints))} pts</span>
            </div>
            <p class="history-player-vibe">${escapeHtml(player.clutch)} • ${escapeHtml(player.vibe)}</p>
            <div class="history-player-stats">
              <span>Picked ${escapeHtml(String(player.gamesPicked))} times</span>
              <span>Record ${escapeHtml(player.recordWhenPicked)}</span>
              <span>Playoffs ${escapeHtml(String(player.playoffAppearances))}</span>
            </div>
            <div class="history-support-copy">Best game: ${escapeHtml(player.bestGame?.title || 'Still waiting')}.</div>
          </article>
        `).join('')}
      </section>
    `;
  }

  function renderSeasons(data) {
    return `
      <section class="history-section-stack">
        ${(data.seasonSummaries || []).map((season) => `
          <article class="panel-card history-season-card ${season.isCurrent ? 'is-current' : ''}">
            <div class="history-season-topline">
              <div>
                <div class="eyebrow">Season recap</div>
                <h3>${escapeHtml(season.label)}</h3>
              </div>
              <span class="panel-tag ${season.isCurrent ? 'dark' : 'calm'}">${season.isCurrent ? 'Current' : 'Archive'}</span>
            </div>
            <div class="history-season-record">${escapeHtml(season.recordText)}</div>
            <p>${escapeHtml(season.note)}</p>
            <div class="history-player-stats">
              <span>Playoffs ${escapeHtml(season.playoffText)}</span>
              <span>Best game ${escapeHtml(season.bestGameTitle)}</span>
              <span>Closest ${escapeHtml(season.closestGameTitle)}</span>
            </div>
            <div class="history-support-copy">${escapeHtml(season.bestMoment)}</div>
          </article>
        `).join('')}
      </section>
    `;
  }

  function renderShell(data, state) {
    const subview = state.subview || 'overview';
    return `
      <div class="history-topbar panel-card">
        <div class="history-topbar-row">
          <div>
            <div class="eyebrow">History</div>
            <h2>Rivalry archive</h2>
          </div>
          <button class="icon-button icon-button-soft ${state.commissionerMode ? 'is-active' : ''}" id="historyCommissionerToggle" type="button">✦</button>
        </div>
        <div class="history-topbar-row history-controls-row">
          <div class="history-season-switcher" id="historySeasonSwitcher">
            ${(data.seasons || []).map((season) => `<button type="button" data-history-season="${escapeHtml(season.id)}" class="${state.seasonId === season.id ? 'active' : ''}">${escapeHtml(season.shortLabel || season.label)}</button>`).join('')}
          </div>
        </div>
        <div class="history-subnav" id="historySubviewNav">
          ${['overview', 'games', 'trends', 'players', 'seasons'].map((name) => `<button type="button" data-history-subview="${name}" class="${subview === name ? 'active' : ''}">${escapeHtml(name.charAt(0).toUpperCase() + name.slice(1))}</button>`).join('')}
        </div>
      </div>
      <div id="historySubviewContent">
        ${subview === 'overview' ? renderOverview(data) : ''}
        ${subview === 'games' ? renderGames(data, state) : ''}
        ${subview === 'trends' ? renderTrends(data) : ''}
        ${subview === 'players' ? renderPlayers(data) : ''}
        ${subview === 'seasons' ? renderSeasons(data) : ''}
      </div>
    `;
  }

  function renderAdminSheet(state) {
    if (!state.sheet?.open) return '';
    return `
      <div class="history-admin-sheet is-open" id="historyAdminSheet">
        <div class="history-admin-sheet-card">
          <div class="gd-sheet-handle"></div>
          <div class="gd-sheet-title">Commissioner action</div>
          <div class="gd-sheet-copy">${escapeHtml(state.sheet.message || 'Mock-only for now. Real data hookup comes later.')}</div>
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
