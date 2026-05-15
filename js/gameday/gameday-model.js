window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  const createBaseState = () => ({
    source: 'empty',
    currentGameId: '',
    mode: 'pregame',
    playoffMode: 'regular',
    carryover: {
      active: false
    },
    game: {
      hasGame: false,
      scheduleText: 'Schedule pending',
      opponent: '',
      headline: 'Next game not scheduled yet'
    },
    pregame: {
      Aaron: [],
      Julie: []
    },
    live: {
      scores: { Aaron: 0, Julie: 0 },
      period: 'Schedule pending',
      users: {
        Aaron: [],
        Julie: []
      },
      feed: []
    },
    roster: []
  });

  CR.gameDayModel = {
    roster: [],
    draftOrder: ['Aaron', 'Julie', 'Aaron', 'Julie'],
    createInitialState() {
      return JSON.parse(JSON.stringify(createBaseState()));
    },
    clone(value) {
      return JSON.parse(JSON.stringify(value));
    },
    pointsFor(pick = {}) {
      return (Number(pick.goals || 0) * 2) + Number(pick.assists || 0) + (pick.firstGoal ? 2 : 0);
    },
    momentTier(kind) {
      if (kind === 'assist') return 'light';
      if (kind === 'goal') return 'medium';
      if (kind === 'first') return 'heavy';
      return 'light';
    }
  };
})();
