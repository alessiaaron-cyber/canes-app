window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  const baseRoster = [
    { name: 'Sebastian Aho', detail: 'C • Top line' },
    { name: 'Andrei Svechnikov', detail: 'RW • PP1' },
    { name: 'Seth Jarvis', detail: 'RW • Hot streak' },
    { name: 'Jaccob Slavin', detail: 'D • Defensive anchor' },
    { name: 'Jordan Staal', detail: 'C • Two-way center' },
    { name: 'Jesperi Kotkaniemi', detail: 'C • Middle six' },
    { name: 'Brent Burns', detail: 'D • PP2' },
    { name: 'Jackson Blake', detail: 'RW • Rookie spark' }
  ];

  const createBaseState = () => ({
    mode: 'pregame',
    playoffMode: 'regular',
    carryover: {
      active: false
    },
    pregame: {
      Aaron: ['Sebastian Aho', 'Andrei Svechnikov'],
      Julie: ['Seth Jarvis', 'Jaccob Slavin']
    },
    live: {
      scores: { Aaron: 4, Julie: 3 },
      period: '2nd • 8:14',
      users: {
        Aaron: [
          { player: 'Sebastian Aho', goals: 1, assists: 0, firstGoal: true },
          { player: 'Andrei Svechnikov', goals: 0, assists: 1, firstGoal: false }
        ],
        Julie: [
          { player: 'Seth Jarvis', goals: 0, assists: 1, firstGoal: false },
          { player: 'Jaccob Slavin', goals: 0, assists: 1, firstGoal: false }
        ]
      },
      feed: [
        { icon: '🚨', title: 'Sebastian Aho goal', detail: 'Aaron scores through a picked player', points: 2, tier: 'medium' },
        { icon: '🎯', title: 'Seth Jarvis assist', detail: 'Julie adds an assist point', points: 1, tier: 'light' },
        { icon: '👑', title: 'First goal bonus', detail: 'Aho hit the first Canes goal bonus', points: 2, tier: 'heavy' }
      ]
    }
  });

  CR.gameDayModel = {
    roster: baseRoster,
    draftOrder: ['Aaron', 'Julie', 'Aaron', 'Julie'],
    createInitialState() {
      return JSON.parse(JSON.stringify(createBaseState()));
    },
    clone(value) {
      return JSON.parse(JSON.stringify(value));
    },
    pointsFor(pick) {
      return (pick.goals * 2) + pick.assists + (pick.firstGoal ? 2 : 0);
    },
    momentTier(kind) {
      if (kind === 'assist') return 'light';
      if (kind === 'goal') return 'medium';
      if (kind === 'first') return 'heavy';
      return 'light';
    }
  };
})();
