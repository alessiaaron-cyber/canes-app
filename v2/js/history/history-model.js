window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const pointsForPick = (pick) => ((pick.goals || 0) * 2) + (pick.assists || 0) + (pick.firstGoal ? 2 : 0);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function winner(game) {
    if (game.aaronScore > game.julieScore) return 'Aaron';
    if (game.julieScore > game.aaronScore) return 'Julie';
    return 'Tie';
  }

  function playerMap(players) {
    return new Map((players || []).map((player) => [player.id, player]));
  }

  function enrichGame(game, map) {
    const picks = ['Aaron', 'Julie'].reduce((acc, side) => {
      acc[side] = (game.picks?.[side] || []).map((pick) => {
        const player = map.get(pick.playerId) || { name: pick.playerId, position: '—', vibe: '' };
        return {
          ...pick,
          playerName: player.name,
          position: player.position,
          vibe: player.vibe,
          points: pointsForPick(pick)
        };
      });
      return acc;
    }, {});

    return {
      ...game,
      winner: winner(game),
      margin: Math.abs((game.aaronScore || 0) - (game.julieScore || 0)),
      picks,
      isOneGoal: Math.abs((game.aaronScore || 0) - (game.julieScore || 0)) <= 1,
      resultLabel: winner(game) === 'Tie' ? 'Tie' : `${winner(game)} wins`,
      tagSummary: (game.tags || []).slice(0, 3).join(' • ')
    };
  }

  function buildMomentum(games) {
    let aaronRunning = 0;
    let julieRunning = 0;

    return games.map((game) => {
      const gameWinner = game.winner;
      if (gameWinner === 'Aaron') {
        aaronRunning += 1;
        julieRunning = 0;
      } else if (gameWinner === 'Julie') {
        julieRunning += 1;
        aaronRunning = 0;
      } else {
        aaronRunning = 0;
        julieRunning = 0;
      }

      return {
        id: game.id,
        winner: gameWinner,
        playoff: Boolean(game.playoff),
        title: game.title,
        score: `${game.aaronScore}–${game.julieScore}`,
        streak: gameWinner === 'Aaron' ? aaronRunning : gameWinner === 'Julie' ? julieRunning : 0,
        date: game.date
      };
    });
  }

  function buildSeasonSummary(season, seasonGames) {
    const totals = { Aaron: 0, Julie: 0, playoffAaron: 0, playoffJulie: 0 };
    const moments = [];

    seasonGames.forEach((game) => {
      const gameWinner = winner(game);
      if (gameWinner === 'Aaron') totals.Aaron += 1;
      if (gameWinner === 'Julie') totals.Julie += 1;
      if (game.playoff && gameWinner === 'Aaron') totals.playoffAaron += 1;
      if (game.playoff && gameWinner === 'Julie') totals.playoffJulie += 1;
      (game.moments || []).slice(0, 1).forEach((moment) => moments.push(moment));
    });

    const bestGame = seasonGames.slice().sort((a, b) => Math.abs((b.aaronScore - b.julieScore)) - Math.abs((a.aaronScore - a.julieScore)))[0] || null;
    const closestGame = seasonGames.slice().sort((a, b) => Math.abs((a.aaronScore - a.julieScore)) - Math.abs((b.aaronScore - b.julieScore)))[0] || null;

    return {
      seasonId: season.id,
      label: season.label,
      isCurrent: season.isCurrent,
      note: season.note,
      totals,
      recordText: `${totals.Aaron}–${totals.Julie}`,
      playoffText: `${totals.playoffAaron}–${totals.playoffJulie}`,
      bestMoment: moments[0] || 'Season still writing itself.',
      bestGameTitle: bestGame?.title || '—',
      closestGameTitle: closestGame?.title || '—'
    };
  }

  function buildPlayerSummaries(players, games) {
    return players.map((player) => {
      let totalPoints = 0;
      let gamesPicked = 0;
      let pickedByAaron = 0;
      let pickedByJulie = 0;
      let winsWhenPicked = 0;
      let playoffAppearances = 0;
      let bestGame = null;
      let currentStreak = 0;

      games.forEach((game) => {
        ['Aaron', 'Julie'].forEach((side) => {
          (game.picks?.[side] || []).forEach((pick) => {
            if (pick.playerId !== player.id) return;
            const pts = pointsForPick(pick);
            gamesPicked += 1;
            totalPoints += pts;
            if (side === 'Aaron') pickedByAaron += 1;
            if (side === 'Julie') pickedByJulie += 1;
            if (game.playoff) playoffAppearances += 1;
            if (winner(game) === side) winsWhenPicked += 1;
            if (!bestGame || pts > bestGame.points) {
              bestGame = {
                title: game.title,
                points: pts,
                date: game.date
              };
            }
          });
        });
      });

      const recentGames = games.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
      recentGames.forEach((game) => {
        if (currentStreak !== 0 && !(['Aaron', 'Julie'].some((side) => (game.picks?.[side] || []).some((pick) => pick.playerId === player.id)))) {
          return;
        }
        const side = ['Aaron', 'Julie'].find((candidate) => (game.picks?.[candidate] || []).some((pick) => pick.playerId === player.id));
        if (!side) return;
        const gameWinner = winner(game);
        if (gameWinner === side) currentStreak += 1;
      });

      const owner = pickedByAaron === pickedByJulie ? 'Split' : pickedByAaron > pickedByJulie ? 'Aaron' : 'Julie';
      const clutch = totalPoints >= 15 ? 'Playoff problem' : totalPoints >= 11 ? 'Reliable chaos' : 'Quietly clutch';

      return {
        ...player,
        gamesPicked,
        totalPoints,
        pickedByAaron,
        pickedByJulie,
        recordWhenPicked: `${winsWhenPicked}-${Math.max(0, gamesPicked - winsWhenPicked)}`,
        owner,
        playoffAppearances,
        bestGame,
        currentStreak,
        clutch
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints || b.gamesPicked - a.gamesPicked);
  }

  function buildMoments(games) {
    return games.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6).map((game) => ({
      id: `${game.id}-moment`,
      title: game.title,
      winner: game.winner,
      playoff: game.playoff,
      text: (game.moments || [game.summary])[0],
      date: game.date
    }));
  }

  function longestStreak(games, side) {
    let best = 0;
    let current = 0;
    games.forEach((game) => {
      if (game.winner === side) {
        current += 1;
        best = Math.max(best, current);
      } else if (game.winner !== 'Tie') {
        current = 0;
      }
    });
    return best;
  }

  function currentStreakLabel(games) {
    const recent = games.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const leader = recent[0]?.winner;
    if (!leader || leader === 'Tie') return 'No active streak';
    let count = 0;
    for (const game of recent) {
      if (game.winner === leader) count += 1;
      else break;
    }
    return `${leader} ${count} straight`;
  }

  CR.historyModel = {
    build(rawInput) {
      const raw = clone(rawInput || CR.historyMockData || {});
      const seasons = raw.seasons || [];
      const players = raw.players || [];
      const map = playerMap(players);
      const enrichedGames = (raw.games || []).map((game) => enrichGame(game, map)).sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const currentSeasonId = raw.currentSeasonId || seasons.find((season) => season.isCurrent)?.id || seasons[0]?.id || '';
      const seasonGames = Object.fromEntries(seasons.map((season) => [season.id, enrichedGames.filter((game) => game.seasonId === season.id)]));
      const currentGames = seasonGames[currentSeasonId] || [];

      const allTime = enrichedGames.reduce((acc, game) => {
        if (game.winner === 'Aaron') acc.Aaron += 1;
        if (game.winner === 'Julie') acc.Julie += 1;
        return acc;
      }, { Aaron: 0, Julie: 0 });

      const currentRecord = currentGames.reduce((acc, game) => {
        if (game.winner === 'Aaron') acc.Aaron += 1;
        if (game.winner === 'Julie') acc.Julie += 1;
        return acc;
      }, { Aaron: 0, Julie: 0 });

      return {
        currentSeasonId,
        seasons,
        games: enrichedGames,
        seasonGames,
        currentGames,
        momentum: buildMomentum(currentGames.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)))),
        allTime,
        currentRecord,
        overview: {
          hero: allTime.Aaron === allTime.Julie ? `Rivalry tied ${allTime.Aaron}-${allTime.Julie}` : allTime.Aaron > allTime.Julie ? `Aaron leads ${allTime.Aaron}-${allTime.Julie}` : `Julie leads ${allTime.Julie}-${allTime.Aaron}`,
          subhero: currentStreakLabel(enrichedGames),
          currentSeasonText: `${currentRecord.Aaron}-${currentRecord.Julie} this season`,
          quickStats: [
            { label: 'Current Season', value: `${currentRecord.Aaron}-${currentRecord.Julie}` },
            { label: 'Longest Aaron Streak', value: String(longestStreak(enrichedGames.slice().reverse(), 'Aaron')) },
            { label: 'Longest Julie Streak', value: String(longestStreak(enrichedGames.slice().reverse(), 'Julie')) },
            { label: 'Playoff Games', value: String(enrichedGames.filter((game) => game.playoff).length) }
          ]
        },
        moments: buildMoments(enrichedGames),
        playerSummaries: buildPlayerSummaries(players, enrichedGames),
        seasonSummaries: seasons.map((season) => buildSeasonSummary(season, seasonGames[season.id] || [])),
        trends: {
          oneGoalGames: enrichedGames.filter((game) => game.isOneGoal).length,
          playoffGames: enrichedGames.filter((game) => game.playoff).length,
          comebackStyle: 'Swing-heavy rivalry nights still decide everything.',
          trendCards: [
            { label: 'One-goal games', value: String(enrichedGames.filter((game) => game.isOneGoal).length), copy: 'Usually the best kind of pain.' },
            { label: 'Playoff split', value: `${enrichedGames.filter((game) => game.playoff && game.winner === 'Aaron').length}-${enrichedGames.filter((game) => game.playoff && game.winner === 'Julie').length}`, copy: 'Postseason still feels personal.' },
            { label: 'Latest swing', value: currentStreakLabel(currentGames), copy: 'The most recent chapter is still loud.' }
          ]
        }
      };
    }
  };
})();
