window.CR = window.CR || {};
(() => {
  const CR = window.CR;
  const model = CR.gameDayModel || {};
  const helpers = CR.gameDayHelpers || {};
  const render = CR.gameDayRender || {};
  const events = CR.gameDayEvents || {};

  // Controller now primarily orchestrates lifecycle + state coordination.
  // Render, events, helpers, and model layers own most implementation detail.
})();