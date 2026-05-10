window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  CR.gameDayHelpers = {
    winnerText(scores) {
      if (scores.Aaron > scores.Julie) return 'Aaron Wins';
      if (scores.Julie > scores.Aaron) return 'Julie Wins';
      return 'Rivalry Tie';
    },

    getPregameStructured(state) {
      return {
        Aaron: state.pregame.Aaron.map((player) => ({ player })),
        Julie: state.pregame.Julie.map((player) => ({ player }))
      };
    },

    nextDraftSide(state, draftOrder) {
      const total = state.pregame.Aaron.length + state.pregame.Julie.length;
      return total >= 4 ? null : draftOrder[total];
    },

    claimedOwner(state, name) {
      if (state.pregame.Aaron.includes(name)) return 'Aaron';
      if (state.pregame.Julie.includes(name)) return 'Julie';
      return '';
    },

    totalGoals(users) {
      return Object.values(users).flat().reduce((n, p) => n + (p.goals || 0), 0);
    },

    totalAssists(users) {
      return Object.values(users).flat().reduce((n, p) => n + (p.assists || 0), 0);
    },

    firstGoalHit(users) {
      return Object.values(users).flat().find((p) => p.firstGoal);
    }
  };
})();