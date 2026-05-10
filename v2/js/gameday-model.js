window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  CR.gameDayModel = {
    roster: [
      { name: 'Sebastian Aho', detail: 'C • Top line' },
      { name: 'Andrei Svechnikov', detail: 'RW • PP1' },
      { name: 'Seth Jarvis', detail: 'RW • Hot streak' },
      { name: 'Jaccob Slavin', detail: 'D • Defensive anchor' },
      { name: 'Jordan Staal', detail: 'C • Two-way center' },
      { name: 'Jesperi Kotkaniemi', detail: 'C • Middle six' },
      { name: 'Brent Burns', detail: 'D • PP2' },
      { name: 'Jackson Blake', detail: 'RW • Rookie spark' }
    ],
    draftOrder: ['Aaron', 'Julie', 'Aaron', 'Julie'],
    clone(value) {
      return JSON.parse(JSON.stringify(value));
    },
    pointsFor(pick) {
      return (pick.goals * 2) + pick.assists + (pick.firstGoal ? 2 : 0);
    }
  };
})();