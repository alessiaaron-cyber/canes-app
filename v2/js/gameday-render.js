window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  CR.gameDayRender = {
    renderStatChips(pick) {
      return `<div class="gd-player-stats"><span class="gd-stat ${pick.goals ? 'live' : ''}">G ${pick.goals}</span><span class="gd-stat ${pick.assists ? 'live' : ''}">A ${pick.assists}</span><span class="gd-stat ${pick.firstGoal ? 'live' : ''}">FG</span></div>`;
    },

    renderPlayerCard({ side, picks, score, red, pointsFor }) {
      return `<article class="gd-card"><div class="gd-pick-card-head"><strong class="${red ? 'red' : ''}">${side}</strong><span>${score} pts</span></div>${picks.map((pick) => `<div class="gd-player-card"><div class="gd-player-main"><strong>${pick.player}</strong>${CR.gameDayRender.renderStatChips(pick)}</div><div class="gd-player-total">+${pointsFor(pick)}</div></div>`).join('')}</article>`;
    }
  };
})();