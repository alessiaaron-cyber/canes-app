window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function firstGoalScorer(game) {
    for (const side of ['Aaron', 'Julie']) {
      const hit = (game.picks?.[side] || []).find((pick) => pick.firstGoal);
      if (hit) return hit.playerName;
    }
    return '—';
  }

  function buildSeasonPlayerSpotlights(selectedGames) {
    const byPlayer = new Map();

    selectedGames.forEach((game) => {
      ['Aaron', 'Julie'].forEach((side) => {
        (game.picks?.[side] || []).forEach((pick) => {
          const existing = byPlayer.get(pick.playerName) || {
            name: pick.playerName,
            position: pick.position,
            vibe: pick.vibe,
            owner: 'Split',
            totalPoints: 0,
            gamesPicked: 0,
            pickedByAaron: 0,
            pickedByJulie: 0,
            winsWhenPicked: 0,
            recordWhenPicked: '0-0',
            bestGame: null,
            clutch: 'Quietly clutch'
          };

          existing.totalPoints += Number(pick.points || 0);
          existing.gamesPicked += 1;
          if (side === 'Aaron') existing.pickedByAaron += 1;
          if (side === 'Julie') existing.pickedByJulie += 1;
          if (game.winner === side) existing.winsWhenPicked += 1;
          if (!existing.bestGame || Number(pick.points || 0) > Number(existing.bestGame.points || 0)) {
            existing.bestGame = { title: game.title, points: Number(pick.points || 0) };
          }

          existing.owner = existing.pickedByAaron === existing.pickedByJulie
            ? 'Split'
            : existing.pickedByAaron > existing.pickedByJulie ? 'Aaron' : 'Julie';

          existing.recordWhenPicked = `${existing.winsWhenPicked}-${Math.max(0, existing.gamesPicked - existing.winsWhenPicked)}`;
          existing.clutch = existing.totalPoints >= 10 ? 'Season-shaping chaos' : existing.totalPoints >= 6 ? 'Reliable swing piece' : 'Quietly clutch';
          byPlayer.set(pick.playerName, existing);
        });
      });
    });

    return Array.from(byPlayer.values()).sort((a, b) => b.totalPoints - a.totalPoints || b.gamesPicked - a.gamesPicked).slice(0, 3);
  }

  function buildAllTimeBoard(games) {
    const totals = games.reduce((acc, game) => {
      acc.aaron += Number(game.aaronScore || 0);
      acc.julie += Number(game.julieScore || 0);
      return acc;
    }, { aaron: 0, julie: 0 });

    const lead = totals.aaron === totals.julie
      ? 'Rivalry tied all-time'
      : totals.aaron > totals.julie
        ? `Aaron all-time lead by ${totals.aaron - totals.julie}`
        : `Julie all-time lead by ${totals.julie - totals.aaron}`;

    return { ...totals, lead, totalGames: games.length };
  }

  function buildHighlights(games) {
    const ordered = games.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
    let longest = { owner: '—', count: 0 };
    let current = { owner: '', count: 0 };
    let biggestBlowout = null;
    let highestScore = { owner: '—', score: 0, title: '—' };
    const playerCounts = new Map();
    const firstGoalCounts = new Map();
    const playerPoints = new Map();

    ordered.forEach((game) => {
      if (game.winner !== 'Tie') {
        if (current.owner === game.winner) current.count += 1;
        else current = { owner: game.winner, count: 1 };
        if (current.count > longest.count) longest = { ...current };
      }

      if (!biggestBlowout || game.margin > biggestBlowout.margin) {
        biggestBlowout = { owner: game.winner, margin: game.margin, title: game.title };
      }

      if (Number(game.aaronScore || 0) > highestScore.score) {
        highestScore = { owner: 'Aaron', score: Number(game.aaronScore || 0), title: game.title };
      }
      if (Number(game.julieScore || 0) > highestScore.score) {
        highestScore = { owner: 'Julie', score: Number(game.julieScore || 0), title: game.title };
      }

      ['Aaron', 'Julie'].forEach((side) => {
        (game.picks?.[side] || []).forEach((pick) => {
          playerCounts.set(pick.playerName, (playerCounts.get(pick.playerName) || 0) + 1);
          playerPoints.set(pick.playerName, [...(playerPoints.get(pick.playerName) || []), Number(pick.points || 0)]);
          if (pick.firstGoal) firstGoalCounts.set(pick.playerName, (firstGoalCounts.get(pick.playerName) || 0) + 1);
        });
      });
    });

    const mostPicked = Array.from(playerCounts.entries()).sort((a, b) => b[1] - a[1])[0] || ['—', 0];
    const firstGoalKing = Array.from(firstGoalCounts.entries()).sort((a, b) => b[1] - a[1])[0] || ['—', 0];
    const bestAvgPick = Array.from(playerPoints.entries())
      .map(([name, values]) => ({ name, avg: values.reduce((sum, value) => sum + value, 0) / values.length, picks: values.length }))
      .filter((entry) => entry.picks >= 2)
      .sort((a, b) => b.avg - a.avg)[0] || { name: '—', avg: 0, picks: 0 };

    const latest = ordered[ordered.length - 1];
    const heater = !latest || latest.winner === 'Tie'
      ? { title: 'No streak', copy: 'Nobody owns momentum. The booth is calling this one chaos.' }
      : { title: `${latest.winner} heater`, copy: `${latest.winner} took the latest swing and is holding the mic for now.` };

    return {
      heater,
      cards: [
        { label: 'Longest win streak', value: `${longest.owner} W${longest.count}`, copy: 'The run everyone hears about forever.' },
        { label: 'Biggest blowout', value: `${biggestBlowout?.owner || '—'} +${biggestBlowout?.margin || 0}`, copy: `${biggestBlowout?.title || 'No game yet'} was a statement.` },
        { label: 'Highest score', value: `${highestScore.owner} ${highestScore.score}`, copy: `${highestScore.title} went nuclear.` },
        { label: 'Most picked player', value: mostPicked[0], copy: `${mostPicked[1]} total picks` },
        { label: 'Best avg pick', value: bestAvgPick.name, copy: `${bestAvgPick.avg.toFixed(1)} pts/pick over ${bestAvgPick.picks} picks` },
        { label: 'First goal king', value: firstGoalKing[0], copy: `${firstGoalKing[1]} first-goal hits` }
      ],
      boothNote: `${biggestBlowout?.owner || 'Nobody'} owns the biggest statement win so far, while ${mostPicked[0]} keeps showing up in the strategy room.`
    };
  }

  function buildSeasonBoard(selectedSeason, selectedGames) {
    const totals = selectedGames.reduce((acc, game) => {
      acc.aaron += Number(game.aaronScore || 0);
      acc.julie += Number(game.julieScore || 0);
      return acc;
    }, { aaron: 0, julie: 0 });

    const winnerLabel = totals.aaron === totals.julie
      ? `${selectedSeason?.label || 'Season'} tied`
      : totals.aaron > totals.julie
        ? `Aaron season lead`
        : `Julie season lead`;

    return { ...totals, winnerLabel };
  }

  function buildGameLog(selectedGames) {
    return selectedGames.map((game, index) => ({
      ...game,
      displayNumber: selectedGames.length - index,
      firstGoalScorer: firstGoalScorer(game)
    }));
  }

  function getScopedData(model, state) {
    const selectedSeason = model.seasons.find((season) => season.id === state.seasonId) || model.seasons[0] || null;
    const selectedGames = model.seasonGames?.[state.seasonId] || [];
    const selectedSummary = model.seasonSummaries?.find((season) => season.seasonId === state.seasonId) || null;

    return {
      ...model,
      selectedSeason,
      selectedSummary,
      selectedGames,
      seasonBoard: buildSeasonBoard(selectedSeason, selectedGames),
      allTimeBoard: buildAllTimeBoard(model.games || []),
      highlights: buildHighlights(model.games || []),
      gameLog: buildGameLog(selectedGames),
      playerSpotlights: buildSeasonPlayerSpotlights(selectedGames),
      archiveSeasons: (model.seasonSummaries || []).filter((season) => season.seasonId !== state.seasonId)
    };
  }

  function renderHistory() {
    const root = document.querySelector('#historyView');
    if (!root) return;

    const scoped = getScopedData(CR.historyData, CR.historyState);
    root.innerHTML = `${CR.historyRender.renderShell(scoped, CR.historyState)}<div id="historyAdminLayer">${CR.historyRender.renderAdminSheet(CR.historyState)}</div>`;
    CR.historyEvents.bindHistoryEvents();
  }

  function initHistory() {
    CR.historyData = CR.historyModel.build(CR.historyMockData);
    CR.historyState = {
      seasonId: CR.historyData.currentSeasonId,
      expandedGameId: null,
      editingGameId: null,
      editTab: 'result',
      sheet: { open: false }
    };
    renderHistory();
  }

  CR.initHistory = initHistory;
  CR.renderHistory = renderHistory;
})();
