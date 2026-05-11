window.CR = window.CR || {};
(() => {
  const CR = window.CR;
  const model = CR.gameDayModel || {};
  const helpers = CR.gameDayHelpers || {};
  const render = CR.gameDayRender || {};
  const events = CR.gameDayEvents || {};
  const roster = model.roster || [
    { name: 'Sebastian Aho', detail: 'C • Top line' },
    { name: 'Andrei Svechnikov', detail: 'RW • PP1' },
    { name: 'Seth Jarvis', detail: 'RW • Hot streak' },
    { name: 'Jaccob Slavin', detail: 'D • Defensive anchor' },
    { name: 'Jordan Staal', detail: 'C • Two-way center' },
    { name: 'Jesperi Kotkaniemi', detail: 'C • Middle six' },
    { name: 'Brent Burns', detail: 'D • PP2' },
    { name: 'Jackson Blake', detail: 'RW • Rookie spark' }
  ];
  const draftOrder = model.draftOrder || ['Aaron', 'Julie', 'Aaron', 'Julie'];

  CR.gameDay = model.createInitialState ? model.createInitialState() : {
    mode: 'pregame',
    playoffMode: 'regular',
    carryover: { active: false },
    pregame: {
      Aaron: ['Sebastian Aho', 'Andrei Svechnikov'],
      Julie: ['Seth Jarvis', 'Jaccob Slavin']
    },
    live: {
      scores: { Aaron: 4, Julie: 3 },
      period: '2nd • 8:14',
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
        { icon: '🎯', title: 'Seth Jarvis assist', detail: 'Julie adds an assist point', points: 1 },
        { icon: '👑', title: 'First goal bonus', detail: 'Aho hit the first Canes goal bonus', points: 2 }
      ]
    }
  };

  if (!CR.gameDay.carryover) {
    CR.gameDay.carryover = { active: false };
  }

  const $ = (s) => document.querySelector(s);
  const pointsFor = (pick) => model.pointsFor ? model.pointsFor(pick) : ((pick.goals * 2) + pick.assists + (pick.firstGoal ? 2 : 0));
  const clone = (value) => model.clone ? model.clone(value) : JSON.parse(JSON.stringify(value));
  const isPlayoffs = () => CR.gameDay.playoffMode === 'playoffs';
  const getPregameStructured = () => helpers.getPregameStructured ? helpers.getPregameStructured(CR.gameDay) : ({
    Aaron: CR.gameDay.pregame.Aaron.map((player) => ({ player })),
    Julie: CR.gameDay.pregame.Julie.map((player) => ({ player }))
  });
  const getFinalData = () => ({
    scores: clone(CR.gameDay.live.scores),
    users: clone(CR.gameDay.live.users)
  });
  const winnerText = (scores) => helpers.winnerText ? helpers.winnerText(scores) : (scores.Aaron > scores.Julie ? 'Aaron Wins' : scores.Julie > scores.Aaron ? 'Julie Wins' : 'Rivalry Tie');
  const nextDraftSide = () => helpers.nextDraftSide ? helpers.nextDraftSide(CR.gameDay, draftOrder) : (() => {
    const total = CR.gameDay.pregame.Aaron.length + CR.gameDay.pregame.Julie.length;
    return total >= 4 ? null : draftOrder[total];
  })();
  const claimedOwner = (name) => helpers.claimedOwner ? helpers.claimedOwner(CR.gameDay, name) : (CR.gameDay.pregame.Aaron.includes(name) ? 'Aaron' : CR.gameDay.pregame.Julie.includes(name) ? 'Julie' : '');
  const totalGoals = (users) => helpers.totalGoals ? helpers.totalGoals(users) : Object.values(users).flat().reduce((n, p) => n + (p.goals || 0), 0);
  const totalAssists = (users) => helpers.totalAssists ? helpers.totalAssists(users) : Object.values(users).flat().reduce((n, p) => n + (p.assists || 0), 0);
  const firstGoalHit = (users) => helpers.firstGoalHit ? helpers.firstGoalHit(users) : Object.values(users).flat().find((p) => p.firstGoal);

  const liveEventCatalog = {
    goal: { icon: '🚨', points: 2, summary: (pick) => `${pick.player} scored` },
    assist: { icon: '🎯', points: 1, summary: (pick) => `${pick.player} assisted` },
    first: { icon: '👑', points: 2, summary: (pick) => `${pick.player} hit the first-goal bonus` }
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

  const leadingStatType = (users) => {
    const goals = totalGoals(users);
    const assists = totalAssists(users);
    if (goals === 0 && assists === 0) return 'No scoring events yet';
    if (goals > assists) return `${goals} goal points drove the night`;
    if (assists > goals) return `${assists} assist points drove the night`;
    return 'Goals and assists landed evenly';
  };

  const calculateSideScore = (side) => {
    const picks = CR.gameDay.live.users[side] || [];
    return picks.reduce((sum, pick) => sum + pointsFor(pick), 0);
  };

  const recalculateLiveScores = () => {
    CR.gameDay.live.scores = {
      Aaron: calculateSideScore('Aaron'),
      Julie: calculateSideScore('Julie')
    };
  };

  const buildBatchToast = (appliedEvents) => {
    if (!appliedEvents.length) return '';
    const summaries = appliedEvents.map((event) => event.summary);
    if (summaries.length === 1) return summaries[0];
    if (summaries.length === 2) return `${summaries[0]} and ${summaries[1]}`;
    return `${summaries.slice(0, -1).join(', ')}, and ${summaries[summaries.length - 1]}`;
  };

  CR.applyMockLiveBatch = (batch = []) => {
    const appliedEvents = [];

    batch.forEach((entry) => {
      const { side, kind, pickIndex = 0 } = entry;
      const pick = CR.gameDay.live.users?.[side]?.[pickIndex];
      const meta = liveEventCatalog[kind];
      if (!pick || !meta) return;

      if (kind === 'goal') pick.goals += 1;
      if (kind === 'assist') pick.assists += 1;
      if (kind === 'first') {
        if (pick.firstGoal) return;
        pick.firstGoal = true;
      }

      CR.gameDay.live.feed.unshift({
        icon: meta.icon,
        title: kind === 'first' ? `${pick.player} first Canes goal` : `${pick.player} ${kind}`,
        detail: kind === 'first' ? `${side} gets the first goal bonus` : `${side} ${kind === 'goal' ? 'scores through a picked player' : 'adds an assist point'}`,
        points: meta.points
      });

      appliedEvents.push({
        side,
        kind,
        summary: `${side}: ${meta.summary(pick)}`
      });
    });

    if (!appliedEvents.length) return;

    recalculateLiveScores();
    CR.flashSync?.();
    CR.showToast?.(buildBatchToast(appliedEvents));
    CR.renderGameDayState('live');
  };

  const renderPlayerCard = ({ side, picks, score, red }) => render.renderPlayerCard({ side, picks, score, red, pointsFor });

  function setModalOpen(isOpen) {
    const modal = $('#manageSheet');
    if (!modal) return;
    modal.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('modal-open', isOpen);
    document.documentElement.classList.toggle('modal-open', isOpen);
  }

  function updateGlobalLiveIndicator() {
    const indicator = $('#globalLiveIndicator');
    if (!indicator) return;
    indicator.classList.toggle('is-hidden', CR.gameDay.mode !== 'live');
  }

  function renderHero() {
    const mode = CR.gameDay.mode;
    const pregameUsers = getPregameStructured();
    const live = CR.gameDay.live;
    const final = getFinalData();
    return render.renderHeroSection({
      mode,
      pregameUsers,
      live,
      final,
      isPlayoffs: isPlayoffs(),
      winnerText,
      nextDraftSide: nextDraftSide()
    });
  }

  function renderPregame() {
    return render.renderPregameSection({
      users: getPregameStructured(),
      roster,
      claimedOwner
    });
  }

  function renderLive() {
    return render.renderLiveSection({
      state: CR.gameDay.live,
      renderPlayerCard,
      carryover: CR.gameDay.carryover
    });
  }

  function renderFinal() {
    const state = getFinalData();
    const bonus = firstGoalHit(state.users);
    return render.renderFinalSection({
      state,
      bonusText: bonus ? `${bonus.player} hit first goal bonus` : 'First goal bonus not hit',
      mvpText: mvpText(state.users),
      edgeText: leadingStatType(state.users),
      totalEventsText: `${totalGoals(state.users)} goals • ${totalAssists(state.users)} assists`,
      renderPlayerCard,
      carryover: CR.gameDay.carryover
    });
  }

  function renderManageSheet() {
    const actions = $('#manageSheetActions');
    if (!actions) return;
    const allSelected = () => [...CR.gameDay.pregame.Aaron, ...CR.gameDay.pregame.Julie];
    actions.innerHTML = ['Aaron', 'Julie'].flatMap((side) => [0, 1].map((index) => {
      const selected = CR.gameDay.pregame[side][index] || '';
      const opts = [''].concat(roster.map((r) => r.name)).map((name) => {
        const disabled = name && allSelected().includes(name) && name !== selected;
        return `<option value="${name}" ${name === selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}>${name || 'Open slot'}</option>`;
      }).join('');
      return `<div class="gd-sheet-pick"><strong>${side} Pick ${index + 1}</strong><small>Swap locked player</small><select class="gd-sheet-select" data-side="${side}" data-index="${index}">${opts}</select></div>`;
    }).join('')).join('');
    actions.querySelectorAll('.gd-sheet-select').forEach((select) => {
      select.addEventListener('change', (event) => {
        const side = event.target.dataset.side;
        const index = Number(event.target.dataset.index);
        const next = event.target.value;
        const updated = CR.gameDay.pregame[side].slice();
        updated[index] = next;
        CR.gameDay.pregame[side] = updated.filter(Boolean);
        if (CR.gameDay.carryover?.active) CR.gameDay.carryover.active = false;
        renderManageSheet();
      });
    });
  }

  function bindInteractions() {
    if (events.bind) {
      events.bind({ claimedOwner, draftOrder, nextDraftSide, renderManageSheet, setModalOpen, rerender: CR.renderGameDayState });
    }
  }

  CR.renderGameDayState = (mode = CR.gameDay.mode) => {
    CR.gameDay.mode = mode;
    const container = $('#gameDayContent');
    const view = $('#gameDayView');
    if (!container || !view) return;
    view.classList.toggle('mode-playoffs', isPlayoffs());
    container.innerHTML = `${renderHero()}${mode === 'pregame' ? renderPregame() : ''}${mode === 'live' ? renderLive() : ''}${mode === 'final' ? renderFinal() : ''}`;
    $('#stateTitle').textContent = mode === 'pregame' ? 'Pregame' : mode === 'live' ? 'Live' : 'Final';
    $('#stateBadge').textContent = isPlayoffs() ? 'Playoffs' : (mode === 'pregame' ? 'Regular' : mode === 'live' ? 'Live' : 'Final');
    $('#phaseSwitcher')?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.phase === mode));
    $('#modeSwitcher')?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.playoffMode === CR.gameDay.playoffMode));
    $('#carryoverSwitcher')?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', (button.dataset.carryover === 'on') === Boolean(CR.gameDay.carryover?.active)));
    updateGlobalLiveIndicator();
    bindInteractions();
  };

  CR.initGameDay = () => {
    recalculateLiveScores();
    $('#phaseSwitcher')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-phase]');
      if (!button) return;
      CR.renderGameDayState(button.dataset.phase);
    });
    $('#modeSwitcher')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-playoff-mode]');
      if (!button) return;
      CR.gameDay.playoffMode = button.dataset.playoffMode;
      CR.renderGameDayState();
    });
    $('#carryoverSwitcher')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-carryover]');
      if (!button) return;
      CR.gameDay.carryover = { active: button.dataset.carryover === 'on' };
      CR.renderGameDayState();
    });
    $('#refreshButton')?.addEventListener('click', () => {
      CR.flashSync?.();
      CR.showToast?.('Mock realtime refresh complete');
    });
    $('#closeSheet')?.addEventListener('click', () => setModalOpen(false));
    $('#saveSheet')?.addEventListener('click', () => {
      setModalOpen(false);
      CR.renderGameDayState();
    });
    $('#manageSheet')?.addEventListener('click', (event) => {
      if (event.target.id === 'manageSheet') setModalOpen(false);
    });
    CR.renderGameDayState(CR.gameDay.mode || 'pregame');
  };
})();
