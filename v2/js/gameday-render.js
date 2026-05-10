window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  CR.gameDayRender = {
    renderStatChips(pick) {
      return `<div class="gd-player-stats"><span class="gd-stat ${pick.goals ? 'live' : ''}">G ${pick.goals}</span><span class="gd-stat ${pick.assists ? 'live' : ''}">A ${pick.assists}</span><span class="gd-stat ${pick.firstGoal ? 'live' : ''}">FG</span></div>`;
    },

    renderPlayerCard({ side, picks, score, red, pointsFor }) {
      return `<article class="gd-card"><div class="gd-pick-card-head"><strong class="${red ? 'red' : ''}">${side}</strong><span>${score} pts</span></div>${picks.map((pick) => `<div class="gd-player-card"><div class="gd-player-main"><strong>${pick.player}</strong>${CR.gameDayRender.renderStatChips(pick)}</div><div class="gd-player-total">+${pointsFor(pick)}</div></div>`).join('')}</article>`;
    },

    renderLiveSection({ state, renderPlayerCard }) {
      return `<div class="gd-label-row"><div class="gd-label">Picked Players</div><button class="gd-manage-tiny" data-action="open-manage" type="button">Manage</button></div><section class="gd-picks-grid">${renderPlayerCard({ side: 'Aaron', picks: state.users.Aaron, score: state.scores.Aaron, red: true })}${renderPlayerCard({ side: 'Julie', picks: state.users.Julie, score: state.scores.Julie, red: false })}</section><div class="gd-label-row"><div class="gd-label">Simulate Updates</div><div class="gd-filter">Goal / Assist / Bonus</div></div><div class="gd-sim-grid"><button class="gd-sim-button red" data-side="Aaron" data-kind="goal" type="button">Aaron Goal</button><button class="gd-sim-button" data-side="Julie" data-kind="goal" type="button">Julie Goal</button><button class="gd-sim-button red" data-side="Aaron" data-kind="assist" type="button">Aaron Assist</button><button class="gd-sim-button" data-side="Julie" data-kind="assist" type="button">Julie Assist</button><button class="gd-sim-button red" data-side="Aaron" data-kind="first" type="button">Aaron First Goal</button><button class="gd-sim-button" data-side="Julie" data-kind="first" type="button">Julie First Goal</button></div><div class="gd-label-row"><div class="gd-label">Rivalry Feed</div><div class="gd-filter">Live</div></div><section class="gd-feed-list">${state.feed.map((item) => `<article class="gd-card gd-feed-item"><div class="gd-feed-icon">${item.icon}</div><div><div><strong>${item.title}</strong></div><div class="gd-feed-sub">${item.detail}</div></div><div><strong>+${item.points}</strong></div></article>`).join('')}</section>`;
    },

    renderFinalSection({ state, bonusText, mvpText, edgeText, totalEventsText, renderPlayerCard }) {
      return `<section class="gd-card gd-postgame-card"><div class="gd-postgame-top"><div class="gd-postgame-icon">⭐</div><div><div class="gd-postgame-title">Postgame Summary</div><div class="gd-postgame-sub">How the night was won.</div></div></div><div class="gd-postgame-grid"><div class="gd-postgame-pill"><strong>MVP</strong><span>${mvpText}</span></div><div class="gd-postgame-pill"><strong>Edge</strong><span>${edgeText}</span></div><div class="gd-postgame-pill"><strong>Bonus</strong><span>${bonusText}</span></div><div class="gd-postgame-pill"><strong>Total Events</strong><span>${totalEventsText}</span></div></div></section><div class="gd-label-row"><div class="gd-label">Final Pick Breakdown</div><button class="gd-manage-tiny" data-action="open-manage" type="button">Manage</button></div><section class="gd-final-picks">${renderPlayerCard({ side: 'Aaron', picks: state.users.Aaron, score: state.scores.Aaron, red: true })}${renderPlayerCard({ side: 'Julie', picks: state.users.Julie, score: state.scores.Julie, red: false })}</section>`;
    }
  };
})();