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
    return CR.identity?.getScoreKey?.(index, data) || getUser(data, index).scoreKey || legacyOwner(data, index) || userName(data, index);
  }

  function legacyOwner(data, index) {
    const user = getUser(data, index);
    return user.legacyOwner || user.legacy_owner || (index === 0 ? 'Aaron' : 'Julie');
  }

  function lookupKeys(data, index) {
    const user = getUser(data, index);
    return [
      userScoreKey(data, index),
      legacyOwner(data, index),
      user.username,
      user.display_name,
      user.displayName,
      index === 0 ? 'Aaron' : 'Julie'
    ].filter(Boolean);
  }

  function gameScores(data, game) {
    const firstKeys = lookupKeys(data, 0).map((key) => `${String(key).toLowerCase()}Score`);
    const secondKeys = lookupKeys(data, 1).map((key) => `${String(key).toLowerCase()}Score`);

    const firstKey = firstKeys.find((key) => game?.[key] !== undefined && game?.[key] !== null);
    const secondKey = secondKeys.find((key) => game?.[key] !== undefined && game?.[key] !== null);

    return {
      first: Number(game?.[firstKey] ?? game?.aaronScore ?? 0),
      second: Number(game?.[secondKey] ?? game?.julieScore ?? 0)
    };
  }

  function picksFor(data, game, index) {
    const keys = lookupKeys(data, index);
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

  function seasonOutcomeText(winner, isCurrent) {
    if (String(winner || '').toLowerCase() === 'tie') return isCurrent ? 'Tied' : 'Season tied';
    return isCurrent ? `${winner} leads` : `${winner} won`;
  }

  function gameLabel(game) {
    return [game?.date, game?.opponent ? `vs ${game.opponent}` : ''].filter(Boolean).join(' • ') || game?.title || 'Game';
  }

  function hasScoredResult(game) {
    const scores = gameScores({}, game);
    return scores.first + scores.second > 0;
  }

  function seasonFeaturedResult(data, summary, games) {
    const scoredGames = (games || []).filter(hasScoredResult).map((game) => {
      const scores = gameScores(data, game);
      return {
        ...game,
        scores,
        label: gameLabel(game),
        margin: Math.abs(scores.first - scores.second),
        combined: scores.first + scores.second
      };
    });

    if (!scoredGames.length) return '';

    const playoff = scoredGames.find((game) => game.playoff);
    if (playoff) return `${playoff.label}: playoff result (${playoff.scores.first}-${playoff.scores.second}).`;

    const biggest = scoredGames.slice().sort((a, b) => b.margin - a.margin)[0];
    if (biggest && biggest.margin >= 3) {
      const winner = biggest.scores.first === biggest.scores.second ? 'Tie' : biggest.scores.first > biggest.scores.second ? userName(data, 0) : userName(data, 1);
      return `${biggest.label}: biggest margin (${winner} +${biggest.margin}).`;
    }

    const wildest = scoredGames.slice().sort((a, b) => b.combined - a.combined)[0];
    return `${wildest.label}: highest combined score (${wildest.combined} pts).`;
  }

  function renderRootShell() {
    return `<div class="history-shell"><div id="historyPanelHq"></div><div id="historyPanelSeasons" hidden></div><div id="historyPanelAllGames" hidden></div><div id="historyAdminLayer"></div></div>`;
  }

  function renderBoard(data) {
    const board = data.allTimeBoard || {};
    return `<section class="panel-card rivalry-board-card history-legacy-card"><div class="rivalry-board-topline"><span class="eyebrow">All-Time Rivalry</span></div><h2 class="rivalry-board-title">${escapeHtml(board.lead || 'Rivalry tied')}</h2><div class="history-scoreboard-banner"><div class="history-scoreboard-grid"><div class="history-scoreboard-team"><span class="history-scoreboard-name ${userThemeClass(data, 0)}">${escapeHtml(userName(data, 0))}</span><strong>${escapeHtml(String(board.aaron ?? 0))}</strong></div><span class="history-scoreboard-divider" aria-hidden="true">—</span><div class="history-scoreboard-team is-right"><span class="history-scoreboard-name ${userThemeClass(data, 1)}">${escapeHtml(userName(data, 1))}</span><strong>${escapeHtml(String(board.julie ?? 0))}</strong></div></div></div><p class="history-hero-copy">All completed season and game totals feed this card.</p></section>`;
  }

  /* remainder unchanged intentionally */

  CR.historyRender = { renderRootShell, renderHQ, renderSeasonsOverview, renderAllGames, renderAdminSheet };
})();