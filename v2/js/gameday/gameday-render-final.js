window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const utils = () => CR.gameDayRenderUtils;

  function renderFinalSection({
    state,
    bonusText,
    mvpText,
    edgeText,
    totalEventsText,
    renderPlayerCard,
    carryover,
    isPlayoffs
  }) {
    const left = utils().getSideContext(0, state);
    const right = utils().getSideContext(1, state);

    return `
      <section class="gd-card gd-postgame-card ${isPlayoffs ? 'gd-postgame-card-playoff' : ''}">
        <div class="gd-postgame-top">
          <div class="gd-postgame-icon ${isPlayoffs ? 'gd-postgame-icon-playoff' : ''}">🏆</div>
          <div>
            <div class="gd-postgame-title">${isPlayoffs ? 'Playoff Summary' : 'Postgame Summary'}</div>
            <div class="gd-postgame-sub">${isPlayoffs ? 'How the playoff night swung the rivalry.' : 'How the night was won.'}</div>
          </div>
        </div>

        <div class="gd-postgame-grid">
          <div class="gd-postgame-pill"><strong>MVP</strong><span>${mvpText}</span></div>
          <div class="gd-postgame-pill"><strong>Edge</strong><span>${edgeText}</span></div>
          <div class="gd-postgame-pill"><strong>Bonus</strong><span>${bonusText}</span></div>
          <div class="gd-postgame-pill"><strong>${isPlayoffs ? 'Playoff Events' : 'Total Events'}</strong><span>${totalEventsText}</span></div>
        </div>
      </section>

      <div class="gd-label-row">
        <div class="gd-label-group">
          <div class="gd-label">${isPlayoffs ? 'Playoff Pick Breakdown' : 'Final Pick Breakdown'}</div>
          ${carryover?.active ? '<span class="gd-inline-note gd-inline-note-warning">Carryover</span>' : ''}
          ${isPlayoffs ? '<span class="gd-inline-note gd-inline-note-playoff">Playoffs</span>' : ''}
        </div>
        <button class="cr-button secondary gd-inline-action" data-action="open-manage" type="button">Manage</button>
      </div>

      <section class="gd-final-picks">
        ${renderPlayerCard({ side: left.name, picks: left.picks, score: left.score, themeClass: left.ownerClass, isPlayoffs })}
        ${renderPlayerCard({ side: right.name, picks: right.picks, score: right.score, themeClass: right.ownerClass, isPlayoffs })}
      </section>
    `;
  }

  CR.gameDayFinalRender = { renderFinalSection };
})();
