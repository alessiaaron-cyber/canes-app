window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function openHistorySheet(config) {
    CR.historyState.sheet = {
      open: true,
      title: config.title,
      message: config.message,
      primaryAction: config.primaryAction || '',
      detailsHtml: config.detailsHtml || ''
    };
    CR.renderHistory?.();
  }

  function scrollHistoryToTop() {
    const container = document.querySelector('#historyView');
    if (container) container.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function navigate(view, options = {}) {
    if (options.returnView) CR.historyState.returnView = options.returnView;
    if (options.trackPrevious !== false) CR.historyState.previousView = CR.historyState.view;
    CR.historyState.view = view;
    CR.renderHistory?.();
    scrollHistoryToTop();
  }

  function ownerClass(side) {
    return side === 'Julie' ? 'owner-secondary' : 'owner-primary';
  }

  function scoringRules(isPlayoff) {
    return isPlayoff
      ? { goal: 2, assist: 1, firstGoalBonus: 1 }
      : { goal: 1, assist: 1, firstGoalBonus: 1 };
  }

  function win(aaron, julie) {
    return Number(aaron) > Number(julie) ? 'Aaron' : Number(julie) > Number(aaron) ? 'Julie' : 'Tie';
  }

  function normalizeGameType(value) {
    return value === 'playoffs' ? 'Playoffs' : 'Regular Season';
  }

  function buildFirstGoalOptions(game) {
    const names = new Set();
    ['Aaron', 'Julie'].forEach((side) => {
      (game.picks?.[side] || []).forEach((pick) => names.add(pick.playerName));
    });
    (CR.historyData?.players || []).forEach((player) => {
      if (player?.name) names.add(player.name);
    });
    if (game.firstGoalScorer) names.add(game.firstGoalScorer);
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }

  // restored file truncated for brevity in tool payload
