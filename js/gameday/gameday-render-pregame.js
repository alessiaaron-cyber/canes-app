window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const utils = () => CR.gameDayRenderUtils;

  function canEditPicks() {
    const game = CR.gameDay?.game || {};
    return Boolean(game.hasGame && game.scheduleText && game.scheduleText !== 'Schedule pending');
  }

  function renderPickSlot({ pick, side, key, isPlayoffs, isFocus, picksEnabled }) {
    if (!pick) {
      return `
        <div class="gd-pick-row is-empty ${!picksEnabled ? 'is-disabled' : ''}">
          <div class="gd-pick-icon">…</div>
          <div class="gd-pick-main">
            <strong>Open slot</strong>
            <small>${picksEnabled ? (isPlayoffs ? 'Waiting for the next playoff pick' : 'Waiting for next pick') : 'Schedule pending'}</small>
          </div>
        </div>
      `;
    }

    return `
      <div
        class="gd-pick-row ${isFocus ? 'gd-pick-row-focus' : ''} ${!picksEnabled ? 'is-disabled' : ''}"
        data-pick-side="${key}"
        data-pick-player="${pick.player}"
      >
        <div class="gd-pick-icon">✓</div>
        <div class="gd-pick-main">
          <strong>${pick.player}</strong>
          <small>${picksEnabled ? (isPlayoffs ? 'Locked for playoff night' : 'Locked pick') : 'Pick locked until a game is scheduled'}</small>
          ${picksEnabled ? `
            <div class="gd-lock-actions">
              <button class="cr-button secondary gd-inline-action" data-side="${key}" data-player="${pick.player}" type="button">Change</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderOwnerPanel(index, users, isPlayoffs, lastDrafted, picksEnabled) {
    const side = utils().getSideContext(index, { users });

    return `
      <article class="gd-panel ${isPlayoffs && picksEnabled ? 'gd-panel-playoff' : ''}">
        <div class="gd-panel-head ${side.ownerClass} ${isPlayoffs && picksEnabled ? 'gd-panel-head-playoff' : ''}">
          <span>${side.name}</span>
          <span>${side.picks.length}/2</span>
        </div>

        ${[0, 1].map((pickIndex) => {
          const pick = side.picks[pickIndex];
          return renderPickSlot({
            pick,
            side: side.name,
            key: side.key,
            isPlayoffs,
            isFocus: picksEnabled && pick && pick.player === lastDrafted,
            picksEnabled
          });
        }).join('')}
      </article>
    `;
  }

  function renderRosterRow(entry, claimedOwner, isPlayoffs, picksEnabled) {
    const owner = claimedOwner(entry.name);
    const ownerClass = owner ? (CR.identity?.ownerClass?.(owner) || '') : '';
    const displayName = entry.displayName || entry.name;

    return `
      <div class="gd-roster-row ${owner ? 'claimed' : ''} ${!picksEnabled ? 'is-disabled' : ''}">
        <div class="gd-pick-main">
          <strong>${displayName}</strong>
          <small>${entry.detail}</small>
        </div>

        ${owner
          ? `<span class="gd-tag ${ownerClass}">${owner}</span>`
          : `<button class="gd-draft-btn ${isPlayoffs && picksEnabled ? 'gd-draft-btn-playoff' : ''}" data-player="${entry.name}" type="button" ${picksEnabled ? '' : 'disabled'}>${picksEnabled ? 'Draft' : 'Pending'}</button>`}
      </div>
    `;
  }

  function renderPregameSection({ users, roster, claimedOwner, isPlayoffs }) {
    const lastDrafted = CR.gameDay?.lastDraftedPlayer || '';
    const picksEnabled = canEditPicks();

    return `
      <div class="gd-label-row" id="gdPregamePicksAnchor">
        <div class="gd-label">${isPlayoffs && picksEnabled ? 'Playoff Picks' : 'Picks'}</div>
        ${!picksEnabled ? '<span class="gd-inline-note">Pick controls unlock when a game is scheduled.</span>' : ''}
      </div>

      <section class="gd-picks-grid" id="gdPregamePicksGrid">
        ${renderOwnerPanel(0, users, isPlayoffs, lastDrafted, picksEnabled)}
        ${renderOwnerPanel(1, users, isPlayoffs, lastDrafted, picksEnabled)}
      </section>

      <div class="gd-label-row">
        <div class="gd-label">Current Canes Roster</div>
      </div>

      <section class="gd-panel gd-roster ${isPlayoffs && picksEnabled ? 'gd-panel-playoff' : ''}">
        ${roster.map((entry) => renderRosterRow(entry, claimedOwner, isPlayoffs, picksEnabled)).join('')}
      </section>
    `;
  }

  CR.gameDayPregameRender = {
    renderPregameSection
  };
})();
