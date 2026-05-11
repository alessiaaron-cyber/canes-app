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

  const sharedPregame = {
    Aaron: ['Sebastian Aho', 'Andrei Svechnikov'],
    Julie: ['Seth Jarvis', 'Jaccob Slavin']
  };

  const scenarios = {
    pregame_default: {
      mode: 'pregame',
      playoffMode: 'regular',
      pregame: sharedPregame,
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
          { icon: '🚨', title: 'Sebastian Aho goal', detail: 'Aaron scores through a picked player', points: 2 },
          { icon: '🎯', title: 'Seth Jarvis assist', detail: 'Julie adds an assist point', points: 1 },
          { icon: '👑', title: 'First goal bonus', detail: 'Aho hit the first Canes goal bonus', points: 2 }
        ]
      }
    },
    pregame_carryover: {
      mode: 'live',
      playoffMode: 'regular',
      pregame: sharedPregame,
      carryover: {
        active: true,
        sourceLabel: 'Last complete draft reused'
      },
      live: {
        scores: { Aaron: 4, Julie: 3 },
        period: '1st • 16:41',
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
          { icon: '🚨', title: 'Sebastian Aho goal', detail: 'Aaron scores through a picked player', points: 2 },
          { icon: '🎯', title: 'Seth Jarvis assist', detail: 'Julie adds an assist point', points: 1 },
          { icon: '👑', title: 'First goal bonus', detail: 'Aho hit the first Canes goal bonus', points: 2 }
        ]
      }
    },
    live_tight: {
      mode: 'live',
      playoffMode: 'regular',
      pregame: sharedPregame,
      live: {
        scores: { Aaron: 3, Julie: 3 },
        period: '3rd • 4:28',
        users: {
          Aaron: [
            { player: 'Sebastian Aho', goals: 1, assists: 0, firstGoal: false },
            { player: 'Andrei Svechnikov', goals: 0, assists: 1, firstGoal: false }
          ],
          Julie: [
            { player: 'Seth Jarvis', goals: 1, assists: 0, firstGoal: false },
            { player: 'Jaccob Slavin', goals: 0, assists: 1, firstGoal: false }
          ]
        },
        feed: [
          { icon: '🚨', title: 'Seth Jarvis goal', detail: 'Julie tied the rivalry score', points: 2 },
          { icon: '🎯', title: 'Andrei Svechnikov assist', detail: 'Aaron kept it tight', points: 1 }
        ]
      }
    },
    final_comeback: {
      mode: 'final',
      playoffMode: 'regular',
      pregame: sharedPregame,
      live: {
        scores: { Aaron: 6, Julie: 4 },
        period: 'Final',
        users: {
          Aaron: [
            { player: 'Sebastian Aho', goals: 1, assists: 2, firstGoal: false },
            { player: 'Andrei Svechnikov', goals: 1, assists: 0, firstGoal: true }
          ],
          Julie: [
            { player: 'Seth Jarvis', goals: 1, assists: 1, firstGoal: false },
            { player: 'Jaccob Slavin', goals: 0, assists: 1, firstGoal: false }
          ]
        },
        feed: [
          { icon: '👑', title: 'Svechnikov first Canes goal', detail: 'Aaron grabbed the early bonus', points: 2 },
          { icon: '🎯', title: 'Aho assist', detail: 'Aaron built the comeback push', points: 1 },
          { icon: '🚨', title: 'Svechnikov goal', detail: 'Aaron sealed the rivalry win', points: 2 }
        ]
      }
    }
  };

  CR.gameDayModel = {
    roster: baseRoster,
    draftOrder: ['Aaron', 'Julie', 'Aaron', 'Julie'],
    scenarios,
    createInitialState() {
      return JSON.parse(JSON.stringify(scenarios.pregame_default));
    },
    createScenarioState(key) {
      const scenario = scenarios[key] || scenarios.pregame_default;
      return JSON.parse(JSON.stringify(scenario));
    },
    clone(value) {
      return JSON.parse(JSON.stringify(value));
    },
    pointsFor(pick) {
      return (pick.goals * 2) + pick.assists + (pick.firstGoal ? 2 : 0);
    }
  };
})();
