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

  CR.historyModel = {
    build(rawInput) {
      const raw = clone(rawInput || CR.historyMockData || {});
      const seasons = raw.seasons || [];
      const players = raw.players || [];
      const map = playerMap(players);
      const games = (raw.games || []).map((game) => enrichGame(game, map)).sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const currentSeasonId = raw.currentSeasonId || seasons.find((season) => season.isCurrent)?.id || seasons[0]?.id || '';
      const seasonGames = Object.fromEntries(seasons.map((season) => [season.id, games.filter((game) => game.seasonId === season.id)]));
      const seasonSummaries = seasons.map((season) => buildSeasonSummary(season, seasonGames[season.id] || []));

      return {
        currentSeasonId,
        seasons,
        games,
        seasonGames,
        seasonSummaries
      };
    }
  };
})();
