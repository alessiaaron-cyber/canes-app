window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const escapeHtml = CR.ui?.escapeHtml || ((value) => String(value ?? ''));

  function pickLine(pick) {
    const points = Number(pick.points || 0);
    return `${pick.playerName} • ${pick.goals}G ${pick.assists}A • ${points} pts`;
  }

  function getUser(data, index) {
    return CR.identity?.getUser?.(index, data) || {};
  }

  function userName(data, index) {
    return CR.identity?.getDisplayName?.(index, data) || getUser(data, index).displayName || `Player ${index + 1}`;
  }

  function userThemeClass(data, usernameOrIndex) {
    return CR.identity?.ownerClass?.(usernameOrIndex, data) || (Number(usernameOrIndex) === 1 ? 'owner-secondary' : 'owner-primary');
  }

  function userScoreKey(data, index) {
    return CR.identity?.getScoreKey?.(index, data) || getUser(data, index).scoreKey || userName(data, index);
  }

  function gameScores(data, game) {
    const firstKey = `${String(userScoreKey(data, 0)).toLowerCase()}Score`;
    const secondKey = `${String(userScoreKey(data, 1)).toLowerCase()}Score`;
    return {
      first: Number(game?.[firstKey] ?? game?.aaronScore ?? 0),
      second: Number(game?.[secondKey] ?? game?.julieScore ?? 0)
    };
  }

  function picksFor(data, game, index) {
    const user = getUser(data, index);
    const keys = [userScoreKey(data, index), user.username, user.displayName, index === 0 ? 'Aaron' : 'Julie'].filter(Boolean);
    const key = keys.find((candidate) => Array.isArray(game.picks?.[candidate]));
    return game.picks?.[key] || [];
  }

  function seasonWinner(data, summary, totals) {
    if (totals.first > totals.second) return userName(data, 0);
    if (totals.second > totals.first) return userName(data, 1);
    return 'Tie';
  }

  function leaderClassFromRecord(data, recordText = '') {
    const match = String(recordText).match(/(\d+)\s*[–-]\s*(\d+)/);
    if (!match) return 'leader-tie';
    const first = Number(match[1]);
    const second = Number(match[2]);
    if (first > second) return userThemeClass(data, 0).replace('owner-', 'leader-');
    if (second > first) return userThemeClass(data, 1).replace('owner-', 'leader-');
    return 'leader-tie';
  }

  function winnerThemeClass(data, winner) {
    if (String(winner || '').toLowerCase() === 'tie') return 'winner-tie';
    return CR.identity?.winnerClass?.(winner, data) || 'winner-tie';
  }

  function outcomeText(game) {
    if (String(game.winner || '').toLowerCase() === 'tie') return 'Even finish';
    return `${game.winner} won`;
  }

  function leaderText(winner) {
    if (String(winner || '').toLowerCase() === 'tie') return 'Tied';
    return `${winner} leads`;
  }

  function renderRootShell() {
    return `<div class="history-shell"><div id="historyPanelHq"></div><div id="historyPanelSeasons" hidden></div><div id="historyPanelAllGames" hidden></div><div id="historyAdminLayer"></div></div>`;
  }

  function renderBoard(data) {
    const board = data.allTimeBoard || {};
    return `<section class="panel-card rivalry-board-card history-legacy-card"><div class="rivalry-board-topline"><span class="eyebrow">Rivalry History</span></div><h2 class="rivalry-board-title">${escapeHtml(board.lead || 'Rivalry tied')}</h2><div class="rivalry-board-score-grid"><article class="rivalry-score-card"><div class="eyebrow ${userThemeClass(data, 0)}">${escapeHtml(userName(data, 0))}</div><div class="rivalry-score-value">${escapeHtml(String(board.aaron ?? 0))}</div></article><article class="rivalry-score-card"><div class="eyebrow ${userThemeClass(data, 1)}">${escapeHtml(userName(data, 1))}</div><div class="rivalry-score-value">${escapeHtml(String(board.julie ?? 0))}</div></article></div><div class="rivalry-board-meta-row"><span class="history-meta-pill">${escapeHtml(String(board.totalGames || 0))} games logged</span></div></section>`;
  }

  function renderSeasonSnapshot(data) {
    const board = data.seasonBoard || {};
    const leaderClass = leaderClassFromRecord(data, board.recordText);
    return `<section class="panel-card history-hq-card"><div class="history-hq-topline"><span class="eyebrow">Current Season</span><button class="cr-button secondary" type="button" data-history-access="seasons">View All</button></div><h3 class="history-hq-title">${escapeHtml(board.seasonLabel || 'Season')}</h3><div class="history-season-score-grid"><article class="rivalry-score-card"><div class="eyebrow ${userThemeClass(data, 0)}">${escapeHtml(userName(data, 0))}</div><div class="rivalry-score-value">${escapeHtml(String(board.aaron ?? 0))}</div></article><article class="rivalry-score-card"><div class="eyebrow ${userThemeClass(data, 1)}">${escapeHtml(userName(data, 1))}</div><div class="rivalry-score-value">${escapeHtml(String(board.julie ?? 0))}</div></article></div><div class="history-season-meta-row"><span class="history-meta-pill history-record-pill ${leaderClass}">Record ${escapeHtml(board.recordText || '—')}</span><span class="history-meta-pill">${escapeHtml(board.recentText || 'Form still developing')}</span></div>${board.bestGameTitle ? `<p class="history-meta-note">Signature night: ${escapeHtml(board.bestGameTitle)}</p>` : ''}</section>`;
  }

  function renderMomentum(data) {
    return `<section class="panel-card history-momentum-card"><div class="history-section-head"><div><div class="eyebrow">Momentum</div><h3>Last eight swings</h3></div></div><div class="history-momentum-strip">${(data.momentum || []).map((item) => `<div class="history-momentum-node ${winnerThemeClass(data, item.winner)} ${item.playoff ? 'is-playoff' : ''}"><span>${escapeHtml(item.winner === 'Tie' ? 'T' : String(item.winner || '').slice(0, 1))}</span></div>`).join('')}</div><p class="history-support-copy">${escapeHtml(data.highlights?.heater?.copy || 'Momentum is still shifting.')}</p></section>`;
  }

  function renderHighlights(data) {
    const cards = (data.highlights?.cards || []).slice(0, 3);
    const performers = (data.playerSpotlights || []).slice(0, 2);
    const performerCards = performers.map((player) => `<article class="rivalry-highlight-item history-highlight-performer"><div class="eyebrow ${userThemeClass(data, player.owner)}">${escapeHtml(player.position)} • ${escapeHtml(player.owner)} lean</div><div class="rivalry-highlight-value">${escapeHtml(player.name)}</div><p>${escapeHtml(player.totalPoints)} pts • ${escapeHtml(player.clutch)}</p></article>`).join('');
    return `<section class="panel-card rivalry-highlights-card"><div class="history-section-head"><div><div class="eyebrow">Highlights</div><h3>Rivalry notes</h3></div></div><div class="rivalry-highlight-grid compact-grid">${cards.map((card) => `<article class="rivalry-highlight-item panel-card"><div class="eyebrow">${escapeHtml(card.label)}</div><div class="rivalry-highlight-value">${escapeHtml(card.value)}</div><p>${escapeHtml(card.copy)}</p></article>`).join('')}${performerCards}</div></section>`;
  }

  function renderRecentGames(data) {
    return `<section class="panel-card history-recent-card"><div class="history-section-head"><div><div class="eyebrow">Recent Games</div><h3>Latest rivalry results</h3></div><button class="cr-button secondary" type="button" data-history-access="all_games">View All</button></div><div class="history-log-stack recap-log-stack">${(data.recentGames || []).map((game) => renderGameCard(data, game, false)).join('')}</div></section>`;
  }

  function renderGameCard(data, game, isArchive) {
    const scores = gameScores(data, game);
    const winnerClass = winnerThemeClass(data, game.winner);
    const context = isArchive ? 'archive' : 'recent';
    const gameTypeBadge = game.playoff ? '<span class="cr-pill playoff">Playoffs</span>' : '<span class="cr-pill regular">Regular</span>';
    return `<article class="history-log-card rivalry-recap-card ${winnerClass} ${isArchive ? 'is-archive' : ''}" id="history-game-${escapeHtml(game.id)}"><div class="history-log-topline"><div><div class="history-log-kicker-row"><span class="history-log-kicker">Game ${escapeHtml(String(game.displayNumber))}</span>${gameTypeBadge}</div><div class="history-log-subtitle">${escapeHtml(game.date)}</div></div><div class="history-log-actions history-outcome-stack"><span class="history-outcome-pill ${winnerClass}">${escapeHtml(outcomeText(game))}</span></div></div><div class="history-recap-sides"><section class="history-recap-side"><div class="history-recap-side-head"><strong class="${userThemeClass(data, 0)}">${escapeHtml(userName(data, 0))}</strong><span>${escapeHtml(String(scores.first))}</span></div><div class="history-recap-picks">${picksFor(data, game, 0).map((pick) => `<div class="history-recap-pick">${escapeHtml(pickLine(pick))}</div>`).join('')}</div></section><section class="history-recap-side"><div class="history-recap-side-head"><strong class="${userThemeClass(data, 1)}">${escapeHtml(userName(data, 1))}</strong><span>${escapeHtml(String(scores.second))}</span></div><div class="history-recap-picks">${picksFor(data, game, 1).map((pick) => `<div class="history-recap-pick">${escapeHtml(pickLine(pick))}</div>`).join('')}</div></section></div><div class="history-recap-footer"><span class="history-recap-first-goal">First goal: ${escapeHtml(game.firstGoalScorer || '—')}</span><div class="history-recap-actions"><button class="cr-button edit" type="button" data-history-edit-game="${escapeHtml(game.id)}" data-history-edit-context="${context}">Edit</button></div></div></article>`;
  }

  function renderSeasonCard(data, summary) {
    const season = (data.seasons || []).find((item) => item.id === summary.seasonId);
    const games = data.seasonGames?.[summary.seasonId] || [];
    const totals = games.reduce((acc, game) => { const scores = gameScores(data, game); acc.first += scores.first; acc.second += scores.second; return acc; }, { first: 0, second: 0 });
    const winner = seasonWinner(data, summary, totals);
    const winnerClass = winnerThemeClass(data, winner);
    const leaderClass = leaderClassFromRecord(data, summary.recordText);
    const playoffCount = games.filter((game) => game.playoff).length;
    return `<button class="history-season-overview-card ${winnerClass}" type="button" data-history-open-season="${escapeHtml(summary.seasonId)}" aria-label="View ${escapeHtml(summary.label || season?.label || summary.seasonId)} season details"><div class="history-season-overview-topline"><div><div class="eyebrow">${escapeHtml(season?.isCurrent ? 'Current season' : 'Season')}</div><h3>${escapeHtml(summary.label || season?.label || summary.seasonId)}</h3></div><span class="history-outcome-pill ${winnerClass}">${escapeHtml(leaderText(winner))}</span></div><div class="history-season-overview-score"><div class="history-season-overview-side"><span class="history-season-overview-name ${userThemeClass(data, 0)}">${escapeHtml(userName(data, 0))}</span><strong>${escapeHtml(String(totals.first))}</strong></div><div class="history-season-overview-divider" aria-hidden="true">—</div><div class="history-season-overview-side is-right"><span class="history-season-overview-name ${userThemeClass(data, 1)}">${escapeHtml(userName(data, 1))}</span><strong>${escapeHtml(String(totals.second))}</strong></div></div><div class="history-season-overview-meta"><span class="history-meta-pill history-record-pill ${leaderClass}">Record ${escapeHtml(summary.recordText || '—')}</span><span class="history-meta-pill">${escapeHtml(String(games.length))} games</span><span class="history-meta-pill">${escapeHtml(playoffCount ? `${playoffCount} playoff games` : 'No playoff games')}</span></div>${summary.bestGameTitle ? `<p class="history-meta-note">Signature night: ${escapeHtml(summary.bestGameTitle)}</p>` : ''}</button>`;
  }

  function renderSeasonsOverview(data) {
    const summaries = (data.seasonSummaries || []).slice().sort((a, b) => String(b.label || '').localeCompare(String(a.label || '')));
    return `<section class="history-seasons-view"><section class="panel-card history-all-games-header-card history-seasons-header-card"><div class="history-section-head history-all-games-head"><div><div class="eyebrow">Seasons</div><h2>All Seasons</h2></div><button class="cr-button back" type="button" data-history-back-hq="1">Back</button></div><p class="history-support-copy">Tap any season to revisit the scoreline, swings, and rivalry details.</p></section><div class="history-seasons-stack">${summaries.map((summary) => renderSeasonCard(data, summary)).join('')}</div></section>`;
  }

  function renderAllGames(data) {
    const playoffCount = (data.gameLog || []).filter((game) => game.playoff).length;
    const regularCount = Math.max(0, (data.gameLog?.length || 0) - playoffCount);
    const leaderClass = leaderClassFromRecord(data, data.seasonBoard?.recordText);
    return `<section class="history-all-games-view"><section class="panel-card history-all-games-header-card"><div class="history-section-head history-all-games-head"><div><div class="eyebrow">Season archive</div><h2>${escapeHtml(data.selectedSeason?.label || 'Season')} Games</h2></div><button class="cr-button back" type="button" data-history-back="1">Back</button></div><p class="history-support-copy">Browse every rivalry game for the active season and make commissioner edits where needed.</p><div class="history-season-meta-row history-archive-meta-row"><span class="history-meta-pill">${escapeHtml(String(data.gameLog?.length || 0))} games</span><span class="history-meta-pill">${escapeHtml(String(regularCount))} regular</span><span class="history-meta-pill">${escapeHtml(String(playoffCount))} playoff</span><span class="history-meta-pill history-record-pill ${leaderClass}">Record ${escapeHtml(data.seasonBoard?.recordText || '—')}</span></div></section><section class="panel-card history-all-games-list-card"><div class="history-section-head"><div><div class="eyebrow">Game archive</div><h3>Games</h3><p class="history-support-copy">${escapeHtml(String(data.gameLog?.length || 0))} games in this season</p></div></div><div class="history-log-stack archive-log-stack">${(data.gameLog || []).map((game) => renderGameCard(data, game, true)).join('')}</div></section></section>`;
  }

  function renderHQ(data) {
    return `<div class="history-feed rivalry-command-feed">${renderBoard(data)}${renderSeasonSnapshot(data)}${renderMomentum(data)}${renderHighlights(data)}${renderRecentGames(data)}</div>`;
  }

  function renderAdminSheet(state) {
    if (!state.sheet?.open) return '';
    const primary = state.sheet.primaryAction ? `<button class="cr-button save" type="button" data-history-sheet-apply="1">${escapeHtml(state.sheet.primaryAction)}</button>` : '';
    return `<div class="history-admin-sheet is-open" id="historyAdminSheet"><div class="history-admin-sheet-card"><div class="gd-sheet-handle"></div><div class="history-admin-sheet-head"><div class="gd-sheet-title">${escapeHtml(state.sheet.title || 'History tools')}</div><button class="cr-sheet-close" type="button" data-history-sheet-close="1" aria-label="Close">×</button></div>${state.sheet.message ? `<div class="gd-sheet-copy">${escapeHtml(state.sheet.message)}</div>` : ''}${state.sheet.detailsHtml ? `<div class="history-admin-sheet-details">${state.sheet.detailsHtml}</div>` : ''}${primary ? `<div class="cr-sheet-actions single">${primary}</div>` : ''}</div></div>`;
  }

  CR.historyRender = { renderRootShell, renderHQ, renderSeasonsOverview, renderAllGames, renderAdminSheet };
})();
