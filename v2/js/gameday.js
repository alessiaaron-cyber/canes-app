window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  CR.gameDayStates = {
    pregame: {
      title: 'Pregame',
      badge: 'Regular',
      badgeClass: 'calm',
      users: {
        Aaron: ['Sebastian Aho', 'Andrei Svechnikov'],
        Julie: ['Seth Jarvis', 'Jaccob Slavin']
      }
    },
    live: {
      title: 'Live',
      badge: 'Live',
      badgeClass: 'live',
      period: '2nd • 8:14',
      scores: { Aaron: 4, Julie: 3 },
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
        { icon: '🍎', title: 'Seth Jarvis assist', detail: 'Julie adds an assist point', points: 1 },
        { icon: '⭐', title: 'First goal bonus', detail: 'Aho hit the first Canes goal bonus', points: 2 }
      ]
    },
    final: {
      title: 'Final',
      badge: 'Final',
      badgeClass: 'dark',
      scores: { Aaron: 5, Julie: 2 },
      users: {
        Aaron: [
          { player: 'Sebastian Aho', goals: 1, assists: 1, firstGoal: true },
          { player: 'Andrei Svechnikov', goals: 0, assists: 1, firstGoal: false }
        ],
        Julie: [
          { player: 'Seth Jarvis', goals: 1, assists: 0, firstGoal: false },
          { player: 'Jaccob Slavin', goals: 0, assists: 0, firstGoal: false }
        ]
      }
    }
  };

  CR.roster = [
    { name: 'Sebastian Aho', detail: 'C • Top line' },
    { name: 'Andrei Svechnikov', detail: 'RW • PP1' },
    { name: 'Seth Jarvis', detail: 'RW • Hot streak' },
    { name: 'Jaccob Slavin', detail: 'D • Defensive anchor' },
    { name: 'Jordan Staal', detail: 'C • Two-way center' },
    { name: 'Jesperi Kotkaniemi', detail: 'C • Middle six' },
    { name: 'Brent Burns', detail: 'D • PP2' },
    { name: 'Jackson Blake', detail: 'RW • Rookie spark' }
  ];

  CR.currentGameDayMode = 'pregame';
  CR.currentPlayoffMode = 'regular';
  CR.manageDraft = null;
  CR.pregameSearch = '';

  const draftOrder = ['Aaron', 'Julie', 'Aaron', 'Julie'];
  const pointsFor = (pick) => ((pick?.goals || 0) * 2) + (pick?.assists || 0) + (pick?.firstGoal ? 2 : 0);
  const cloneState = (mode) => JSON.parse(JSON.stringify(CR.gameDayStates[mode]));
  const getCurrentState = () => cloneState(CR.currentGameDayMode);
  const isPlayoffs = () => CR.currentPlayoffMode === 'playoffs';

  const ensureStructuredUsers = (state) => {
    if (CR.currentGameDayMode === 'pregame') {
      return {
        Aaron: state.users.Aaron.map((player) => ({ player })),
        Julie: state.users.Julie.map((player) => ({ player }))
      };
    }
    return state.users;
  };

  const winnerText = (scores) => {
    if (scores.Aaron > scores.Julie) return 'Aaron Wins';
    if (scores.Julie > scores.Aaron) return 'Julie Wins';
    return 'Rivalry Tie';
  };

  const totalGoals = (users) => Object.values(users).flat().reduce((n, p) => n + (p.goals || 0), 0);
  const totalAssists = (users) => Object.values(users).flat().reduce((n, p) => n + (p.assists || 0), 0);
  const firstGoalHit = (users) => Object.values(users).flat().find((p) => p.firstGoal);

  const leadingStatType = (users) => {
    const goals = totalGoals(users);
    const assists = totalAssists(users);
    if (goals === 0 && assists === 0) return 'No scoring events yet';
    if (goals > assists) return `${goals} goal points drove the night`;
    if (assists > goals) return `${assists} assist points drove the night`;
    return 'Goals and assists landed evenly';
  };

  const mvpText = (users) => {
    const all = Object.values(users).flat();
    if (!all.length) return 'No MVP yet';
    let best = all[0];
    let bestPts = pointsFor(best);
    all.forEach((pick) => {
      const pts = pointsFor(pick);
      if (pts > bestPts) {
        best = pick;
        bestPts = pts;
      }
    });
    return `${best.player} • ${bestPts} pts`;
  };

  const postgameSummaryHtml = (users) => {
    const bonus = firstGoalHit(users);
    return `
      <section class="gd-card gd-postgame-card">
        <div class="gd-postgame-top">
          <div class="gd-postgame-icon">⭐</div>
          <div>
            <div class="gd-postgame-title">Postgame Summary</div>
            <div class="gd-postgame-sub">How the night was won.</div>
          </div>
        </div>
        <div class="gd-postgame-grid">
          <div class="gd-postgame-pill"><strong>MVP</strong><span>${mvpText(users)}</span></div>
          <div class="gd-postgame-pill"><strong>Edge</strong><span>${leadingStatType(users)}</span></div>
          <div class="gd-postgame-pill"><strong>Bonus</strong><span>${bonus ? `${bonus.player} hit first goal bonus` : 'First goal bonus not hit'}</span></div>
          <div class="gd-postgame-pill"><strong>Total Events</strong><span>${totalGoals(users)} goals • ${totalAssists(users)} assists</span></div>
        </div>
      </section>
    `;
  };

  const getPregameCounts = () => {
    const pre = CR.gameDayStates.pregame.users;
    return { Aaron: pre.Aaron.length, Julie: pre.Julie.length };
  };

  const nextDraftSide = () => {
    const total = CR.gameDayStates.pregame.users.Aaron.length + CR.gameDayStates.pregame.users.Julie.length;
    return draftOrder[Math.min(total, draftOrder.length - 1)];
  };

  const claimedOwner = (name) => {
    if (CR.gameDayStates.pregame.users.Aaron.includes(name)) return 'Aaron';
    if (CR.gameDayStates.pregame.users.Julie.includes(name)) return 'Julie';
    return '';
  };

  const renderHero = (state, users) => {
    const pregame = CR.currentGameDayMode === 'pregame';
    const live = CR.currentGameDayMode === 'live';
    const final = CR.currentGameDayMode === 'final';
    const scores = state.scores || { Aaron: 0, Julie: 0 };
    const period = pregame
      ? (isPlayoffs() ? 'Playoff Night • 7:00 PM' : 'Tonight • 7:00 PM')
      : live
        ? (state.period || '2nd • 8:14')
        : '';
    const delta = (scores.Aaron || 0) - (scores.Julie || 0);
    const momentum = Math.min(Math.abs(delta) * 12, 48);
    const left = pregame
      ? `<div class="gd-pick-meta"><span class="gd-pick-chip ${users.Aaron.length === 2 ? 'active' : ''}">${users.Aaron.length} of 2 locked</span></div>`
      : `<div class="gd-side-value">${scores.Aaron}</div>`;
    const right = pregame
      ? `<div class="gd-pick-meta"><span class="gd-pick-chip ${users.Julie.length === 2 ? 'active' : ''}">${users.Julie.length} of 2 locked</span></div>`
      : `<div class="gd-side-value">${scores.Julie}</div>`;
    const subline = pregame
      ? `<div class="gd-subline">${users.Aaron.length + users.Julie.length >= 4 ? 'Picks ready for puck drop' : `${nextDraftSide()} on the clock • Pick ${users.Aaron.length + users.Julie.length + 1} of 4`}</div>`
      : live
        ? `<div class="gd-subline">${isPlayoffs() ? 'Playoff rivalry scoring live' : 'Rivalry scoring live'}</div>`
        : '';
    const finalBanner = final ? `<div class="gd-final-banner">${winnerText(scores)}</div>` : '';
    const liveMomentum = live ? `
      <div class="gd-momentum-label">Momentum</div>
      <div class="gd-track"><div class="gd-track-fill" style="left:${scores.Aaron >= scores.Julie ? '50%' : `calc(50% - ${momentum}%)`};width:${momentum}%"></div></div>
    ` : '';

    return `
      <section class="gd-hero ${final ? 'gd-hero-final' : ''}">
        <div class="gd-status-row">
          <span class="gd-pill ${final ? 'final' : 'live'}">${final ? 'Final' : state.title}</span>
          ${period ? `<span class="gd-period">${period}</span>` : ''}
          ${live ? `<span class="gd-pill synced">Synced</span>` : ''}
          ${isPlayoffs() ? `<span class="gd-pill gd-pill-playoff">Playoffs</span>` : ''}
        </div>
        <div class="gd-score-grid">
          <div class="gd-side"><div class="gd-side-label red">Aaron</div>${left}</div>
          <div class="gd-center"><img class="gd-logo" src="./assets/app-icon.png" alt="Canes Rivalry"></div>
          <div class="gd-side"><div class="gd-side-label">Julie</div>${right}</div>
        </div>
        ${subline}
        ${finalBanner}
        ${liveMomentum}
      </section>
    `;
  };

  const renderPregameCards = (users) => {
    const renderOwner = (name, picks, red) => `
      <article class="gd-panel">
        <div class="gd-panel-head ${red ? 'red' : 'dark'}"><span>${name}</span><span>${picks.length}/2</span></div>
        ${[0, 1].map((index) => {
          const pick = picks[index];
          return pick
            ? `<div class="gd-pick-row"><div class="gd-pick-icon">✓</div><div class="gd-pick-main"><strong>${pick.player}</strong><small>Locked pick</small><div class="gd-lock-actions"><button class="gd-small-action" data-side="${name}" data-player="${pick.player}" type="button">Change</button></div></div></div>`
            : `<div class="gd-pick-row is-empty"><div class="gd-pick-icon">…</div><div class="gd-pick-main"><strong>Open slot</strong><small>Waiting for next pick</small></div></div>`;
        }).join('')}
      </article>
    `;

    const rosterRows = CR.roster
      .filter((entry) => entry.name.toLowerCase().includes((CR.pregameSearch || '').toLowerCase()))
      .map((entry) => {
        const owner = claimedOwner(entry.name);
        return `
          <button class="gd-roster-row ${owner ? 'claimed' : 'clickable'}" data-player="${entry.name}" type="button">
            <div class="gd-pick-main"><strong>${entry.name}</strong><small>${entry.detail}</small></div>
            ${owner ? `<span class="gd-tag">${owner}</span>` : `<span class="gd-draft-btn">Draft</span>`}
          </button>
        `;
      }).join('');

    return `
      <div class="gd-label-row"><div class="gd-label">Live Picks</div><div class="gd-filter">Updates instantly</div></div>
      <section class="gd-picks-grid">
        ${renderOwner('Aaron', users.Aaron, true)}
        ${renderOwner('Julie', users.Julie, false)}
      </section>
      <section class="gd-search"><input class="gd-search-input" id="pregameSearch" placeholder="Search current Canes roster..." value="${CR.pregameSearch || ''}" /></section>
      <div class="gd-label-row"><div class="gd-label">Current Canes Roster</div><div class="gd-filter">Tap to draft</div></div>
      <section class="gd-panel gd-roster gd-scroll">${rosterRows}</section>
    `;
  };

  const renderStatChips = (pick) => `
    <div class="gd-player-stats">
      <span class="gd-stat ${pick.goals ? 'live' : ''}">G ${pick.goals || 0}</span>
      <span class="gd-stat ${pick.assists ? 'live' : ''}">A ${pick.assists || 0}</span>
      <span class="gd-stat ${pick.firstGoal ? 'live' : ''}">FG</span>
    </div>
  `;

  const renderPlayerBreakdownCard = (name, picks, score, red) => `
    <article class="gd-card">
      <div class="gd-pick-card-head"><strong class="${red ? 'red' : ''}">${name}</strong><span>${score} pts</span></div>
      ${picks.length ? picks.map((pick) => `
        <div class="gd-player-card">
          <div class="gd-player-main"><strong>${pick.player}</strong>${renderStatChips(pick)}</div>
          <div class="gd-player-total">+${pointsFor(pick)}</div>
        </div>
      `).join('') : `<div class="gd-player-card"><div class="gd-player-main"><strong>No pick</strong></div><div class="gd-player-total">+0</div></div>`}
    </article>
  `;

  const renderLiveSection = (state, users) => `
    <div class="gd-label-row"><div class="gd-label">Picked Players</div><button class="gd-manage-tiny" type="button" id="openManage">Manage</button></div>
    <section class="gd-picks-grid">
      ${renderPlayerBreakdownCard('Aaron', users.Aaron, state.scores.Aaron, true)}
      ${renderPlayerBreakdownCard('Julie', users.Julie, state.scores.Julie, false)}
    </section>
    <div class="gd-label-row"><div class="gd-label">Simulate Updates</div><div class="gd-filter">Goal / Assist / Bonus</div></div>
    <div class="gd-sim-grid">
      <button class="gd-sim-button red" data-side="Aaron" data-kind="goal" type="button">Aaron Goal</button>
      <button class="gd-sim-button" data-side="Julie" data-kind="goal" type="button">Julie Goal</button>
      <button class="gd-sim-button red" data-side="Aaron" data-kind="assist" type="button">Aaron Assist</button>
      <button class="gd-sim-button" data-side="Julie" data-kind="assist" type="button">Julie Assist</button>
      <button class="gd-sim-button red" data-side="Aaron" data-kind="first" type="button">Aaron First Goal</button>
      <button class="gd-sim-button" data-side="Julie" data-kind="first" type="button">Julie First Goal</button>
    </div>
    <div class="gd-label-row"><div class="gd-label">Rivalry Feed</div><div class="gd-filter">Live</div></div>
    <section class="gd-feed-list">
      ${(state.feed || []).map((item) => `
        <article class="gd-card gd-feed-item">
          <div class="gd-feed-icon">${item.icon}</div>
          <div><div><strong>${item.title}</strong></div><div class="gd-feed-sub">${item.detail}</div></div>
          <div><strong>+${item.points}</strong></div>
        </article>
      `).join('')}
    </section>
  `;

  const renderFinalSection = (state, users) => `
    ${postgameSummaryHtml(users)}
    <div class="gd-label-row"><div class="gd-label">Final Pick Breakdown</div><button class="gd-manage-tiny" type="button" id="openManage">Manage</button></div>
    <section class="gd-final-picks">
      ${renderPlayerBreakdownCard('Aaron', users.Aaron, state.scores.Aaron, true)}
      ${renderPlayerBreakdownCard('Julie', users.Julie, state.scores.Julie, false)}
    </section>
  `;

  CR.removePregamePick = (side, player) => {
    CR.gameDayStates.pregame.users[side] = CR.gameDayStates.pregame.users[side].filter((name) => name !== player);
    CR.renderGameDayState('pregame');
  };

  CR.assignPregamePick = (player) => {
    if (claimedOwner(player)) return;
    const total = CR.gameDayStates.pregame.users.Aaron.length + CR.gameDayStates.pregame.users.Julie.length;
    if (total >= 4) return;
    const side = draftOrder[total];
    CR.gameDayStates.pregame.users[side].push(player);
    CR.renderGameDayState('pregame');
  };

  CR.renderGameDayState = (mode = 'pregame') => {
    CR.currentGameDayMode = mode;
    const state = getCurrentState();
    const users = ensureStructuredUsers(state);
    const content = CR.$('#gameDayContent');
    const view = CR.$('#gameDayView');
    if (!content || !view) return;

    content.innerHTML = `
      ${renderHero(state, users)}
      ${mode === 'pregame' ? renderPregameCards(users) : ''}
      ${mode === 'live' ? renderLiveSection(state, users) : ''}
      ${mode === 'final' ? renderFinalSection(state, users) : ''}
    `;

    view.classList.toggle('mode-playoffs', isPlayoffs());
    CR.setText(CR.$('#stateTitle'), state.title);
    CR.setBadge(CR.$('#stateBadge'), CR.currentPlayoffMode === 'playoffs' ? 'Playoffs' : state.badge, CR.currentPlayoffMode === 'playoffs' ? 'live' : state.badgeClass);

    CR.$('#stateSwitcher')?.querySelectorAll('button').forEach((button) => {
      button.classList.toggle('active', button.dataset.mode === mode);
    });
    CR.$('#modeSwitcher')?.querySelectorAll('button').forEach((button) => {
      button.classList.toggle('active', button.dataset.playoffMode === CR.currentPlayoffMode);
    });

    content.querySelectorAll('.gd-sim-button').forEach((button) => {
      button.addEventListener('click', () => CR.simulateGameDayEvent(button.dataset.side, button.dataset.kind));
    });
    content.querySelector('#openManage')?.addEventListener('click', CR.openManageSheet);

    if (mode === 'pregame') {
      content.querySelectorAll('.gd-small-action').forEach((button) => {
        button.addEventListener('click', () => CR.removePregamePick(button.dataset.side, button.dataset.player));
      });
      content.querySelectorAll('.gd-roster-row.clickable').forEach((row) => {
        row.addEventListener('click', () => CR.assignPregamePick(row.dataset.player));
      });
      content.querySelector('#pregameSearch')?.addEventListener('input', (event) => {
        CR.pregameSearch = event.target.value;
        CR.renderGameDayState('pregame');
      });
    }
  };

  CR.simulateGameDayEvent = (side, kind) => {
    const state = cloneState('live');
    const key = side;
    const pick = state.users[key][0];
    if (!pick) return;
    if (kind === 'goal') {
      pick.goals += 1;
      state.scores[key] += 2;
      state.feed.unshift({ icon: '🚨', title: `${pick.player} goal`, detail: `${side} scores through a picked player`, points: 2 });
    }
    if (kind === 'assist') {
      pick.assists += 1;
      state.scores[key] += 1;
      state.feed.unshift({ icon: '🍎', title: `${pick.player} assist`, detail: `${side} adds an assist point`, points: 1 });
    }
    if (kind === 'first' && !pick.firstGoal) {
      pick.firstGoal = true;
      state.scores[key] += 2;
      state.feed.unshift({ icon: '⭐', title: `${pick.player} first Canes goal`, detail: `${side} gets the first goal bonus`, points: 2 });
    }
    CR.gameDayStates.live = state;
    if (CR.currentGameDayMode === 'final') {
      CR.gameDayStates.final = JSON.parse(JSON.stringify(state));
      CR.gameDayStates.final.title = 'Final';
    }
    CR.flashSync?.();
    CR.showToast?.(`${side} ${kind} update`);
    CR.renderGameDayState('live');
  };

  CR.openManageSheet = () => {
    const modal = document.getElementById('manageSheet');
    const actions = document.getElementById('manageSheetActions');
    const state = getCurrentState();
    const users = ensureStructuredUsers(state);
    CR.manageDraft = {
      Aaron: [...users.Aaron.map((p) => p.player)],
      Julie: [...users.Julie.map((p) => p.player)]
    };
    while (CR.manageDraft.Aaron.length < 2) CR.manageDraft.Aaron.push('');
    while (CR.manageDraft.Julie.length < 2) CR.manageDraft.Julie.push('');

    const allSelections = () => [...CR.manageDraft.Aaron, ...CR.manageDraft.Julie].filter(Boolean);
    const options = (selected) => [''].concat(CR.roster.map((r) => r.name)).map((name) => {
      const selectedElsewhere = name && allSelections().includes(name) && name !== selected;
      return `<option value="${name}" ${selected === name ? 'selected' : ''} ${selectedElsewhere ? 'disabled' : ''}>${name || 'Open slot'}</option>`;
    }).join('');

    const renderActions = () => {
      actions.innerHTML = ['Aaron', 'Julie'].flatMap((side) => [0, 1].map((index) => `
        <div class="gd-sheet-pick">
          <strong>${side} Pick ${index + 1}</strong>
          <small>Swap locked player</small>
          <select class="gd-sheet-select" data-side="${side}" data-index="${index}">${options(CR.manageDraft[side][index])}</select>
        </div>
      `)).join('');
      actions.querySelectorAll('.gd-sheet-select').forEach((select) => {
        select.addEventListener('change', (event) => {
          const { side, index } = event.target.dataset;
          CR.manageDraft[side][Number(index)] = event.target.value;
          renderActions();
        });
      });
    };

    renderActions();
    modal.classList.add('is-open');
  };

  CR.saveManageSheet = () => {
    const liveUsers = {
      Aaron: CR.manageDraft.Aaron.filter(Boolean).map((player) => ({ player, goals: 0, assists: 0, firstGoal: false })),
      Julie: CR.manageDraft.Julie.filter(Boolean).map((player) => ({ player, goals: 0, assists: 0, firstGoal: false }))
    };
    CR.gameDayStates.pregame.users = {
      Aaron: [...CR.manageDraft.Aaron.filter(Boolean)],
      Julie: [...CR.manageDraft.Julie.filter(Boolean)]
    };
    CR.gameDayStates.live.users = JSON.parse(JSON.stringify(liveUsers));
    CR.gameDayStates.live.scores = { Aaron: 0, Julie: 0 };
    CR.gameDayStates.live.feed = [];
    CR.gameDayStates.final.users = JSON.parse(JSON.stringify(liveUsers));
    CR.gameDayStates.final.scores = { Aaron: 0, Julie: 0 };
    document.getElementById('manageSheet')?.classList.remove('is-open');
    CR.renderGameDayState(CR.currentGameDayMode);
  };

  CR.initGameDay = () => {
    CR.$('#stateSwitcher')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-mode]');
      if (button) CR.renderGameDayState(button.dataset.mode);
    });
    CR.$('#modeSwitcher')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-playoff-mode]');
      if (!button) return;
      CR.currentPlayoffMode = button.dataset.playoffMode;
      CR.renderGameDayState(CR.currentGameDayMode);
    });
    CR.$('#refreshButton')?.addEventListener('click', () => {
      CR.flashSync?.();
      CR.showToast?.('Mock realtime refresh complete');
    });
    document.getElementById('closeSheet')?.addEventListener('click', () => document.getElementById('manageSheet')?.classList.remove('is-open'));
    document.getElementById('saveSheet')?.addEventListener('click', CR.saveManageSheet);
    document.getElementById('manageSheet')?.addEventListener('click', (event) => {
      if (event.target.id === 'manageSheet') event.target.classList.remove('is-open');
    });
    CR.renderGameDayState('pregame');
  };
})();