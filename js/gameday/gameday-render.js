window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  CR.gameDayRender = {
    renderStatChips(pick) {
      return CR.gameDayCardRender?.renderStatChips?.(pick) || '';
    },

    renderPlayerCard(args) {
      return CR.gameDayCardRender?.renderPlayerCard?.(args) || '';
    },

    renderHeroSection(args) {
      return CR.gameDayHeroRender?.renderHeroSection?.(args) || '';
    },

    renderPregameSection(args) {
      return CR.gameDayPregameRender?.renderPregameSection?.(args) || '';
    },

    renderLiveSection(args) {
      return CR.gameDayLiveRender?.renderLiveSection?.(args) || '';
    },

    renderFinalSection(args) {
      return CR.gameDayFinalRender?.renderFinalSection?.(args) || '';
    }
  };
})();
