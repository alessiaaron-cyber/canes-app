window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const utils = () => CR.gameDayRenderUtils;

  function renderPickSlot({ pick, side, key, isPlayoffs, isFocus }) {
    if (!pick) {
      return `
        <div class="gd-pick-row is-empty">
          <div class="gd-pick-icon">…</div>
          <div class="gd-pick-main">
            <strong>Open slot</strong>
            <small>${isPlayoffs ? 'Waiting for the next playoff pick' : 'Waiting for next pick'}</small>
          </div>
        </div>
      `;
    }

    return `
      <div
        class="gd-pick-row ${isFocus ? 'gd-pick-row-focus' : ''}"
        data-pick-side="${key}"
        data-pick-player="${pick.player}"
      >
        <div class="gd-pick-icon">✓</div>
        <div class="gd-pick-main">
          <strong>${pick.player}</strong>
          <small>${isPlayoffs ? 'Locked for playoff night' : 'Locked pick'}</small>
          <div class="gd-lock-actions">
            <button class="gd-small-action" data-side="${key}" data-player="${pick.player}" type="button">Change</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderOwnerPanel(index, users, isPlayoffs, lastDrafted) {
    const side = utils().getSideContext(index, { users });

    return `
      <article class="gd-panel ${isPlayoffs ? 'gd-panel-playoff' : ''}">
        <div class="gd-panel-head ${side.ownerClass} ${isPlayoffs ? 'gd-panel-head-playoff' : ''}">
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
            isFocus: pick && pick.player === lastDrafted
          });
        }).join('')}
      </article>
    `;
  }

  function renderRosterRow(entry, claimedOwner, isPlayoffs) {
    const owner = claimedOwner(entry.name);
    const ownerClass = owner ? (CR.identity?.ownerClass?.(owner) || '') : '';

    return `
      <div class="gd-roster-row ${owner ? 'claimed' : ''}">
        <div class="gd-pick-main">
          <strong>${entry.name}</strong>
          <small>${entry.detail}</small>
        </div>

        ${owner
          ? `<span class="gd-tag ${ownerClass}">${owner}</span>`
          : `<button class="gd-draft-btn ${isPlayoffs ? 'gd-draft-btn-playoff' : ''}" data-player="${entry.name}" type="button">Draft</button>`}
      </div>
    `;
  }

  function renderPregameSection({ users, roster, claimedOwner, isPlayoffs }) {
    const lastDrafted = CR.gameDay?.lastDraftedPlayer || '';

    return `
      <div class="gd-label-row" id="gdPregamePicksAnchor">
        <div class="gd-label">${isPlayoffs ? 'Playoff Picks' : 'Picks'}</div>
      </div>

      <section class="gd-picks-grid" id="gdPregamePicksGrid">
        ${renderOwnerPanel(0, users, isPlayoffs, lastDrafted)}
        ${renderOwnerPanel(1, users, isPlayoffs, lastDrafted)}
      </section>

      <div class="gd-label-row">
        <div class="gd-label">Current Canes Roster</div>
      </div>

      <section class="gd-panel gd-roster ${isPlayoffs ? 'gd-panel-playoff' : ''}">
        ${roster.map((entry) => renderRosterRow(entry, claimedOwner, isPlayoffs)).join('')}
      </section>
    `;
  }

  CR.gameDayPregameRender = {
    renderPregameSection
  };
})();
