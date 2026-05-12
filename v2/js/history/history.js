window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function getScopedData(model, state) {
    const scopedGames = model.seasonGames?.[state.seasonId] || [];

    return {
      ...model,
      currentGames: scopedGames,
      momentum: model.momentum?.filter((entry) => scopedGames.some((game) => game.id === entry.id)) || []
    };
  }

  function renderHistory() {
    const root = document.querySelector('#historyView');
    if (!root) return;

    const scoped = getScopedData(CR.historyData, CR.historyState);

    root.innerHTML = `
      ${CR.historyRender.renderShell(scoped, CR.historyState)}
      <div id="historyAdminLayer">
        ${CR.historyRender.renderAdminSheet(CR.historyState)}
      </div>
    `;

    CR.historyEvents.bindHistoryEvents();
  }

  function initHistory() {
    CR.historyData = CR.historyModel.build(CR.historyMockData);

    CR.historyState = {
      seasonId: CR.historyData.currentSeasonId,
      subview: 'overview',
      commissionerMode: false,
      expandedGameId: null,
      sheet: {
        open: false
      }
    };

    renderHistory();
  }

  CR.initHistory = initHistory;
  CR.renderHistory = renderHistory;
})();
