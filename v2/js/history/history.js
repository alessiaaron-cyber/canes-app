window.CR = window.CR || {};

(() => {
  const CR = window.CR;

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
      playerSpotlights: (model.playerSummaries || []).slice(0, 3),
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
