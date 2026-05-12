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

  function renderHeader(data, state) {
    return `
      <section class="panel-card history-topbar">
        <div class="history-topbar-copy">
          <div class="eyebrow">History</div>
          <h2>Rivalry archive</h2>
          <p class="history-support-copy">Current season first. Earlier seasons stay visible below as archived chapters.</p>
        </div>
        <div class="history-season-switcher" id="historySeasonSwitcher">
          ${(data.seasons || []).map((season) => `<button type="button" data-history-season="${escapeHtml(season.id)}" class="${state.seasonId === season.id ? 'active' : ''}">${escapeHtml(season.shortLabel || season.label)}</button>`).join('')}
        </div>
      </section>
    `;
  }

  function renderHero(data) {
    const season = data.selectedSeason || {};
    const summary = data.selectedSummary || {};
    const story = data.selectedMoments?.[0]?.text || season.note || 'The rivalry is still writing itself.';
    return `
      <section class="panel-card history-hero-card">
        <div class="eyebrow">${escapeHtml(season.label || 'Season')}</div>
        <h2>${escapeHtml(summary.label || season.label || 'Current season')}</h2>
        <div class="history-season-record">${escapeHtml(summary.recordText || '—')}</div>
        <p class="history-hero-copy">${escapeHtml(story)}</p>
      </section>
    `;
  }

  function renderTimeline(data) {
    return `
      <section class="panel-card history-timeline-card">
        <div class="history-block-header">
          <div class="eyebrow">Season flow</div>
          <h3>Momentum timeline</h3>
        </div>
        <div class="history-timeline">
          ${(data.selectedMomentum || []).map((item) => `
            <button class="history-timeline-node ${item.winner === 'Aaron' ? 'is-aaron' : item.winner === 'Julie' ? 'is-julie' : 'is-tie'} ${item.playoff ? 'is-playoff' : ''}" type="button" data-history-game-jump="${escapeHtml(item.id)}">
              <span class="history-timeline-dot"></span>
              <span class="history-timeline-copy">${escapeHtml(item.title)}</span>
            </button>
          `).join('')}
        </div>
        <p class="history-support-copy">Tap a point in the rivalry line to jump to that game.</p>
      </section>
    `;
  }

  function renderStories(data) {
    return `
      <section class="history-block">
        <div class="history-block-header">
          <div class="eyebrow">Key moments</div>
          <h3>What defined this season</h3>
        </div>
        <div class="history-card-stack">
          ${(data.selectedMoments || []).map((moment) => `
            <article class="panel-card history-story-card ${moment.winner === 'Aaron' ? 'is-aaron' : 'is-julie'}">
              <div class="history-moment-topline">
                <span class="panel-tag ${moment.playoff ? 'warning' : 'dark'}">${moment.playoff ? 'Playoffs' : 'Regular'}</span>
                <span class="history-date">${escapeHtml(moment.date)}</span>
              </div>
              <h3>${escapeHtml(moment.title)}</h3>
              <p>${escapeHtml(moment.text)}</p>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderGameCard(game, expanded, editing) {
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
        <div class="history-game-head">
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
            <div class="history-tag-row">${(game.tags || []).slice(0, 3).map((tag) => `<span class="history-chip">${escapeHtml(tag)}</span>`).join('')}</div>
          </button>
          <button class="history-edit-trigger" type="button" data-history-admin-action="open-tools" data-history-game="${escapeHtml(game.id)}">Commissioner tools</button>
        </div>
        ${expanded ? `
          <div class="history-game-detail">
            <div class="history-pick-columns">${picks}</div>
            <div class="history-support-copy">${escapeHtml((game.moments || []).join(' • '))}</div>
            ${editing ? `
              <div class="history-admin-row">
                <button class="mini-button" type="button" data-history-admin-action="edit-game" data-history-game="${escapeHtml(game.id)}">Edit game</button>
                <button class="mini-button" type="button" data-history-admin-action="edit-picks" data-history-game="${escapeHtml(game.id)}">Adjust picks</button>
                <button class="mini-button" type="button" data-history-admin-action="recalc" data-history-game="${escapeHtml(game.id)}">Recalculate</button>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </article>
    `;
  }

  function renderGames(data, state) {
    return `
      <section class="history-block">
        <div class="history-block-header">
          <div class="eyebrow">Game archive</div>
          <h3>How the season swung</h3>
        </div>
        <div class="history-card-stack">
          ${(data.selectedGames || []).map((game) => renderGameCard(game, state.expandedGameId === game.id, state.editing)).join('')}
        </div>
      </section>
    `;
  }

  function renderPlayers(data) {
    return `
      <section class="history-block">
        <div class="history-block-header">
          <div class="eyebrow">Player spotlight</div>
          <h3>Who shaped the season</h3>
        </div>
        <div class="history-card-stack">
          ${(data.playerSpotlights || []).map((player) => `
            <article class="panel-card history-player-card">
              <div class="history-player-topline">
                <div>
                  <div class="eyebrow">${escapeHtml(player.position)} • ${escapeHtml(player.owner)} lean</div>
                  <h3>${escapeHtml(player.name)}</h3>
                </div>
                <div class="history-player-hero-stat">${escapeHtml(String(player.totalPoints))}</div>
              </div>
              <p class="history-player-vibe">${escapeHtml(player.clutch)}. ${escapeHtml(player.vibe)}</p>
              <div class="history-support-copy">Picked ${escapeHtml(String(player.gamesPicked))} times • Record ${escapeHtml(player.recordWhenPicked)} • Best game ${escapeHtml(player.bestGame?.title || 'Still waiting')}.</div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderRecap(data) {
    const season = data.selectedSummary;
    if (!season) return '';
    return `
      <section class="panel-card history-season-card is-current">
        <div class="history-block-header">
          <div class="eyebrow">Season recap</div>
          <h3>${escapeHtml(season.label)}</h3>
        </div>
        <div class="history-season-record">${escapeHtml(season.recordText)}</div>
        <p>${escapeHtml(season.note)}</p>
        <div class="history-player-stats">
          <span>Playoffs ${escapeHtml(season.playoffText)}</span>
          <span>Best game ${escapeHtml(season.bestGameTitle)}</span>
          <span>Closest ${escapeHtml(season.closestGameTitle)}</span>
        </div>
        <div class="history-support-copy">${escapeHtml(season.bestMoment)}</div>
      </section>
    `;
  }

  function renderArchive(data) {
    return `
      <section class="history-block">
        <div class="history-block-header">
          <div class="eyebrow">Past seasons</div>
          <h3>Earlier chapters</h3>
        </div>
        <div class="history-card-stack">
          ${(data.archiveSeasons || []).map((season) => `
            <article class="panel-card history-season-card">
              <div class="history-season-topline">
                <div>
                  <div class="eyebrow">Archive</div>
                  <h3>${escapeHtml(season.label)}</h3>
                </div>
                <button class="history-season-jump" type="button" data-history-season="${escapeHtml(season.seasonId)}">Open</button>
              </div>
              <div class="history-season-record">${escapeHtml(season.recordText)}</div>
              <p>${escapeHtml(season.note)}</p>
              <div class="history-support-copy">${escapeHtml(season.bestMoment)}</div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderShell(data, state) {
    return `
      ${renderHeader(data, state)}
      <div class="history-feed">
        ${renderHero(data)}
        ${renderTimeline(data)}
        ${renderStories(data)}
        ${renderGames(data, state)}
        ${renderPlayers(data)}
        ${renderRecap(data)}
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
