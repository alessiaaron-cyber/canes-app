window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  const DEFAULT_RULES = {
    season: {
      label: 'Season placeholder',
      goal: 1,
      assist: 1,
      firstGoalBonus: 1
    },
    postseason: {
      label: 'Postseason placeholder',
      goal: 2,
      assist: 1,
      firstGoalBonus: 1
    }
  };

  function resolve(mode) {
    const normalizedMode = mode === 'postseason' ? 'postseason' : 'season';

    // Placeholder only.
    // Manage UI will own editable scoring sets later, including:
    // - regular season rules
    // - postseason rules
    // - revaluation / recalculation settings
    // History edit should consume those rules instead of hardcoding them.
    return { ...DEFAULT_RULES[normalizedMode] };
  }

  CR.historyScoringRules = {
    resolve,
    defaults: DEFAULT_RULES
  };
})();
