window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const utils = () => CR.gameDayRenderUtils;

  function renderHeroSection({
    mode,
    game,
    pregameUsers,
    live,
    final,
    isPlayoffs,
    winnerText,
    nextDraftSide
  }) {
    const pregame = mode === 'pregame';
    const liveMode = mode === 'live';
    const finalMode = mode === 'final';
    const hasGame = Boolean(game?.hasGame);

    const scoreSource = pregame ? {} : (finalMode ? final.scores : live.scores);

    const left = utils().getSideContext(0, {
      users: pregameUsers,
      scores: scoreSource
    });

    const right = utils().getSideContext(1, {
      users: pregameUsers,
      scores: scoreSource
    });

    const period = pregame
      ? (game?.scheduleText || 'Schedule pending')
      : (liveMode ? live.period : '');

    const delta = left.score - right.score;
    const momentum = Math.min(Math.abs(delta) * 12, 48);
    const momentumLeft = delta > 0 ? `calc(50% - ${momentum}%)` : '50%';
    const totalPicks = left.picks.length + right.picks.length;

    const subline = pregame
      ? (!hasGame
          ? (game?.headline || 'Next game not scheduled yet')
          : (nextDraftSide
              ? `${nextDraftSide} drafting next • Pick ${totalPicks + 1} of 4`
              : 'Picks ready for puck drop'))
      : '';

    const leftBadge = finalMode ? 'Final' : (liveMode ? 'Live' : (hasGame ? 'Pregame' : 'Pending'));
    const playoffPill = isPlayoffs ? '<span class="gd-pill gd-pill-playoff">Playoff Mode</span>' : '';
    const playoffSubline = isPlayoffs && pregame && hasGame ? '<div class="gd-playoff-copy">Postseason stakes are up tonight.</div>' : '';
    const finalBanner = finalMode ? `<div class="gd-final-banner ${isPlayoffs ? 'gd-final-banner-playoff' : ''}">${winnerText(scoreSource)}</div>` : '';

    return `
      <section class="gd-hero ${finalMode ? 'gd-hero-final' : ''} ${isPlayoffs ? 'gd-hero-playoff' : ''}">
        <div class="gd-hero-topline">
          <div class="gd-hero-top-left">
            <span class="gd-pill gd-pill-state ${liveMode ? 'live' : finalMode ? 'final' : 'pregame'}">
              ${leftBadge}
            </span>
          </div>

          <div class="gd-hero-top-right">
            ${playoffPill}
          </div>
        </div>

        ${period ? `
          <div class="gd-hero-time-row">
            <span class="gd-period">${period}</span>
          </div>
        ` : ''}

        <div class="gd-score-grid">
          <div class="gd-side">
            <div class="gd-side-label ${left.ownerClass}">${left.name}</div>

            ${pregame
              ? `
                <div class="gd-pregame-count">
                  ${left.picks.length}
                  <span class="gd-pregame-total">/2</span>
                </div>
                <div class="gd-pregame-meta">Picks Locked</div>
              `
              : `<div class="gd-side-value gd-score-pop">${left.score}</div>`}
          </div>

          <div class="gd-center">
            <img class="gd-logo ${isPlayoffs ? 'gd-logo-playoff' : ''}" src="./assets/app-icon.png" alt="Canes Rivalry">
          </div>

          <div class="gd-side">
            <div class="gd-side-label ${right.ownerClass}">${right.name}</div>

            ${pregame
              ? `
                <div class="gd-pregame-count">
                  ${right.picks.length}
                  <span class="gd-pregame-total">/2</span>
                </div>
                <div class="gd-pregame-meta">Picks Locked</div>
              `
              : `<div class="gd-side-value gd-score-pop">${right.score}</div>`}
          </div>
        </div>

        ${subline ? `<div class="gd-subline ${isPlayoffs ? 'gd-subline-playoff' : ''}">${subline}</div>` : ''}
        ${playoffSubline}
        ${finalBanner}

        ${liveMode
          ? `
            <div class="gd-momentum-label ${isPlayoffs ? 'gd-momentum-label-playoff' : ''}">Momentum</div>
            <div class="gd-track ${isPlayoffs ? 'gd-track-playoff' : ''}">
              <div class="gd-track-fill gd-momentum-fill ${isPlayoffs ? 'gd-track-fill-playoff' : ''}" style="left:${momentumLeft};width:${momentum}%"></div>
            </div>
          `
          : ''}
      </section>
    `;
  }

  CR.gameDayHeroRender = {
    renderHeroSection
  };
})();
