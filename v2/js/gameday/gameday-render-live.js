window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const utils = () => CR.gameDayRenderUtils;

  function renderLiveSection({ state, renderPlayerCard, carryover, isPlayoffs }) {
    const left = utils().getSideContext(0, state);
    const right = utils().getSideContext(1, state);

    return `
      <div class="gd-label-row">
        <div class="gd-label-group">
          <div class="gd-label">${isPlayoffs ? 'Playoff Picks' : 'Picked Players'}</div>
          ${carryover?.active ? '<span class="gd-inline-note gd-inline-note-warning">Carryover</span>' : ''}
          ${isPlayoffs ? '<span class="gd-inline-note gd-inline-note-playoff">High Stakes</span>' : ''}
        </div>
        <button class="cr-button secondary gd-inline-action" data-action="open-manage" type="button">Manage</button>
      </div>

      <section class="gd-picks-grid">
        ${renderPlayerCard({ side: left.name, picks: left.picks, score: left.score, themeClass: left.ownerClass, isPlayoffs })}
        ${renderPlayerCard({ side: right.name, picks: right.picks, score: right.score, themeClass: right.ownerClass, isPlayoffs })}
      </section>

      <div class="gd-label-row">
        <div class="gd-label">Simulate Updates</div>
        <div class="gd-filter">${isPlayoffs ? 'Playoff Moment Lab' : 'Goal / Assist / Bonus'}</div>
      </div>

      <div class="gd-sim-grid">
        ${['goal', 'assist', 'first'].map((kind) => `
          <button class="gd-sim-button ${left.ownerClass} ${isPlayoffs ? 'gd-sim-button-playoff' : ''}" data-side="${left.key}" data-kind="${kind}" type="button">${left.name} ${kind === 'first' ? 'First Goal' : kind.charAt(0).toUpperCase() + kind.slice(1)}</button>
          <button class="gd-sim-button ${right.ownerClass} ${isPlayoffs ? 'gd-sim-button-playoff' : ''}" data-side="${right.key}" data-kind="${kind}" type="button">${right.name} ${kind === 'first' ? 'First Goal' : kind.charAt(0).toUpperCase() + kind.slice(1)}</button>
        `).join('')}
      </div>

      <div class="gd-label-row">
        <div class="gd-label">${isPlayoffs ? 'Playoff Rivalry Feed' : 'Rivalry Feed'}</div>
      </div>

      <section class="gd-feed-list">
        ${state.feed.map((item, index) => `
          <article class="gd-card gd-feed-item gd-feed-tier-${item.tier || 'light'} ${index === 0 ? 'gd-feed-item-latest' : ''} ${isPlayoffs ? 'gd-feed-item-playoff' : ''}">
            <div class="gd-feed-icon">${item.icon}</div>
            <div class="gd-feed-main">
              <strong>${item.title}</strong>
              <div class="gd-feed-sub">${item.detail}</div>
            </div>
            <div class="gd-feed-points">+${item.points}</div>
          </article>
        `).join('')}
      </section>
    `;
  }

  CR.gameDayLiveRender = { renderLiveSection };
})();
