window.CR = window.CR || {};

(() => {
  const CR = window.CR;

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
            existing.bestGame = {
              title: game.title,
              points: Number(pick.points || 0)
            };
          }

          existing.owner = existing.pickedByAaron === existing.pickedByJulie
            ? 'Split'
            : existing.pickedByAaron > existing.pickedByJulie
              ? 'Aaron'
              : 'Julie';

          existing.recordWhenPicked = `${existing.winsWhenPicked}-${Math.max(0, existing.gamesPicked - existing.winsWhenPicked)}`;
          existing.clutch = existing.totalPoints >= 10
            ? 'Season-shaping chaos'
            : existing.totalPoints >= 6
              ? 'Reliable swing piece'
              : 'Quietly clutch';

          byPlayer.set(pick.playerName, existing);
        });
      });
    });

    return Array.from(byPlayer.values())
      .sort((a, b) => b.totalPoints - a.totalPoints || b.gamesPicked - a.gamesPicked)
      .slice(0, 3);
  }

  function getScopedData(model, state) {
    const selectedSeason = model.seasons.find((season) => season.id === state.seasonId) || model.seasons[0] || null;
    const selectedGames = model.seasonGames?.[state.seasonId] || [];
    const selectedSummary = model.seasonSummaries?.find((season) => season.seasonId === state.seasonId) || null;
    const selectedMomentum = selectedGames.slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).map((game, index, arr) => {
      let streak = 0;
      if (game.winner !== 'Tie') {
        for (let i = index; i >= 0; i -= 1) {
          if (arr[i].winner === game.winner) streak += 1;
          else break;
        }
      }
      return {
        id: game.id,
        winner: game.winner,
        playoff: game.playoff,
        title: game.title,
        score: `${game.aaronScore}–${game.julieScore}`,
        streak,
        date: game.date
      };
    });

    return {
      ...model,
      selectedSeason,
      selectedSummary,
      selectedGames,
      selectedMomentum,
      selectedMoments: selectedGames.slice(0, 3).map((game) => ({
        id: `${game.id}-story`,
        title: game.title,
        winner: game.winner,
        playoff: game.playoff,
        text: (game.moments || [game.summary])[0],
        date: game.date
      })),
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
      editing: false,
      expandedGameId: null,
      sheet: { open: false }
    };
    renderHistory();
  }

  CR.initHistory = initHistory;
  CR.renderHistory = renderHistory;
})();
