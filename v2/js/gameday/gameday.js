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
      renderPlayerCard
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
      renderPlayerCard
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
        renderManageSheet();
      });
    });
  }

  function bindInteractions() {
    if (events.bind) {
      events.bind({ claimedOwner, draftOrder, renderManageSheet, setModalOpen, rerender: CR.renderGameDayState });
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
    $('#stateSwitcher')?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
    $('#modeSwitcher')?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.playoffMode === CR.gameDay.playoffMode));
    updateGlobalLiveIndicator();
    bindInteractions();
  };

  CR.initGameDay = () => {
    $('#stateSwitcher')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-mode]');
      if (button) CR.renderGameDayState(button.dataset.mode);
    });
    $('#modeSwitcher')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-playoff-mode]');
      if (!button) return;
      CR.gameDay.playoffMode = button.dataset.playoffMode;
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
    CR.renderGameDayState('pregame');
  };
})();
