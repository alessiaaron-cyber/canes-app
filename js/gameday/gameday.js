window.CR = window.CR || {};
(() => {
  const CR = window.CR;
  const model = CR.gameDayModel || {};
  const helpers = CR.gameDayHelpers || {};
  const render = CR.gameDayRender || {};
  const events = CR.gameDayEvents || {};
  const fallbackRoster = model.roster || [
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

  CR.gameDay = model.createInitialState ? model.createInitialState() : { mode: 'pregame', playoffMode: 'regular', carryover: { active: false }, pregame: { Aaron: [], Julie: [] }, live: { scores: { Aaron: 0, Julie: 0 }, period: '', users: { Aaron: [], Julie: [] }, feed: [] } };
  if (!CR.gameDay.carryover) CR.gameDay.carryover = { active: false };
  CR.gameDayRoster = CR.gameDay.roster || fallbackRoster;

  const $ = (s) => document.querySelector(s);
  const pointsFor = (pick) => model.pointsFor ? model.pointsFor(pick) : ((pick.goals * 2) + pick.assists + (pick.firstGoal ? 2 : 0));
  const clone = (value) => model.clone ? model.clone(value) : JSON.parse(JSON.stringify(value));
  const isPlayoffs = () => CR.gameDay.playoffMode === 'playoffs';
  const getRoster = () => CR.gameDay.roster || CR.gameDayRoster || fallbackRoster;
  const getPregameStructured = () => helpers.getPregameStructured ? helpers.getPregameStructured(CR.gameDay) : ({ Aaron: CR.gameDay.pregame.Aaron.map((player) => ({ player })), Julie: CR.gameDay.pregame.Julie.map((player) => ({ player })) });
  const getFinalData = () => ({ scores: clone(CR.gameDay.live.scores), users: clone(CR.gameDay.live.users) });
  const winnerText = (scores) => helpers.winnerText ? helpers.winnerText(scores) : (scores.Aaron > scores.Julie ? 'Aaron Wins' : scores.Julie > scores.Aaron ? 'Julie Wins' : 'Rivalry Tie');
  const nextDraftSide = () => helpers.nextDraftSide ? helpers.nextDraftSide(CR.gameDay, draftOrder) : draftOrder[(CR.gameDay.pregame.Aaron.length + CR.gameDay.pregame.Julie.length)] || null;
  const claimedOwner = (name) => helpers.claimedOwner ? helpers.claimedOwner(CR.gameDay, name) : (CR.gameDay.pregame.Aaron.includes(name) ? 'Aaron' : CR.gameDay.pregame.Julie.includes(name) ? 'Julie' : '');
  const totalGoals = (users) => helpers.totalGoals ? helpers.totalGoals(users) : Object.values(users).flat().reduce((n, p) => n + (p.goals || 0), 0);
  const totalAssists = (users) => helpers.totalAssists ? helpers.totalAssists(users) : Object.values(users).flat().reduce((n, p) => n + (p.assists || 0), 0);
  const firstGoalHit = (users) => helpers.firstGoalHit ? helpers.firstGoalHit(users) : Object.values(users).flat().find((p) => p.firstGoal);

  function modeLabel(mode) { return mode === 'pregame' ? 'Pregame' : mode === 'live' ? 'Live' : 'Final'; }

  function isUserEditing() {
    return Boolean(CR.gameDayEditState?.isEditing);
  }

  function applyGameDayData(nextState = {}) {
    const previousMode = CR.gameDay?.mode;
    CR.gameDay = {
      ...CR.gameDay,
      ...nextState,
      carryover: nextState.carryover || CR.gameDay?.carryover || { active: false },
      pregame: nextState.pregame || CR.gameDay?.pregame || { Aaron: [], Julie: [] },
      live: nextState.live || CR.gameDay?.live || { scores: { Aaron: 0, Julie: 0 }, period: '', users: { Aaron: [], Julie: [] }, feed: [] }
    };
    CR.gameDayRoster = nextState.roster || CR.gameDayRoster || fallbackRoster;
    CR.gameDay.roster = CR.gameDayRoster;
    CR.renderGameDayState?.(CR.gameDay.mode || previousMode || 'pregame');
  }

  async function refreshGameDayData(options = {}) {
    if (!CR.gameDayDataService?.fetchGameDayData) return CR.gameDay;

    if (options.skipIfEditing && isUserEditing()) {
      return CR.gameDay;
    }

    try {
      const nextState = await CR.gameDayDataService.fetchGameDayData();
      applyGameDayData(nextState);
      if (options.flash) CR.flashSync?.();
      if (options.toast) CR.showToast?.('Game Day refreshed');
      return CR.gameDay;
    } catch (error) {
      console.error('Game Day data refresh failed', error);
      if (options.toast) CR.showToast?.({ message: 'Could not refresh Game Day', tier: 'warning' });
      return CR.gameDay;
    }
  }

  function registerRealtime() {
    if (CR.__gameDayRealtimeRegistered || !CR.realtime?.register) return;
    CR.__gameDayRealtimeRegistered = true;
    CR.realtime.register('gameday', {
      tables: ['games', 'picks'],
      debounceMs: 250,
      onChange: async (payloads = []) => {
        const gameId = String(CR.gameDay?.currentGameId || '');
        const relevant = payloads.some((payload) => {
          const row = payload.new || payload.old || {};
          if (payload.table === 'games') return !gameId || String(row.id || '') === gameId;
          if (payload.table === 'picks') return !gameId || String(row.game_id || '') === gameId;
          return false;
        });

        if (!relevant) return;
        if (isUserEditing()) return;

        CR.ui?.markChanged?.(['gameday:sync'], { ttl: 1200, onChange: () => CR.renderGameDayState?.() });
        await refreshGameDayData({ flash: true, skipIfEditing: true });
      }
    });
    CR.realtime.start?.();
  }

  const renderPlayerCard = ({ side, picks, score, red, themeClass, isPlayoffs: playoffArg }) => render.renderPlayerCard({ side, picks, score, red, themeClass, isPlayoffs: playoffArg, pointsFor });

  function setModalOpen(isOpen) { const modal = $('#manageSheet'); if (!modal) return; modal.classList.toggle('is-open', isOpen); if (isOpen) CR.ui?.lockBodyScroll?.('manage-sheet-open'); else CR.ui?.unlockBodyScroll?.('manage-sheet-open'); }
  function updateGlobalLiveIndicator() { $('#globalLiveIndicator')?.classList.toggle('is-hidden', CR.gameDay.mode !== 'live'); }

  function renderHero() { return render.renderHeroSection({ mode: CR.gameDay.mode, pregameUsers: getPregameStructured(), live: CR.gameDay.live, final: getFinalData(), isPlayoffs: isPlayoffs(), winnerText, nextDraftSide: nextDraftSide() }); }
  function renderPregame() { return render.renderPregameSection({ users: getPregameStructured(), roster: getRoster(), claimedOwner, isPlayoffs: isPlayoffs() }); }
  function renderLive() { return render.renderLiveSection({ state: CR.gameDay.live, renderPlayerCard, carryover: CR.gameDay.carryover, isPlayoffs: isPlayoffs() }); }
  function renderFinal() { const state = getFinalData(); const bonus = firstGoalHit(state.users); return render.renderFinalSection({ state, bonusText: bonus ? `${bonus.player} hit first goal bonus` : 'First goal bonus not hit', mvpText: (() => { const all = Object.values(state.users).flat(); if (!all.length) return 'No MVP yet'; return all.slice().sort((a, b) => pointsFor(b) - pointsFor(a))[0].player + ` • ${pointsFor(all.slice().sort((a, b) => pointsFor(b) - pointsFor(a))[0])} pts`; })(), edgeText: (() => { const goals = totalGoals(state.users); const assists = totalAssists(state.users); if (goals === 0 && assists === 0) return 'No scoring events yet'; if (goals > assists) return `${goals} goal points drove the night`; if (assists > goals) return `${assists} assist points drove the night`; return 'Goals and assists landed evenly'; })(), totalEventsText: `${totalGoals(state.users)} goals • ${totalAssists(state.users)} assists`, renderPlayerCard, carryover: CR.gameDay.carryover, isPlayoffs: isPlayoffs() }); }

  function renderManageSheet() {
    const actions = $('#manageSheetActions');
    if (!actions) return;
    const allSelected = () => [...CR.gameDay.pregame.Aaron, ...CR.gameDay.pregame.Julie];
    actions.innerHTML = ['Aaron', 'Julie'].flatMap((side) => [0, 1].map((index) => {
      const selected = CR.gameDay.pregame[side][index] || '';
      const opts = [''].concat(getRoster().map((r) => r.name)).map((name) => `<option value="${name}" ${name === selected ? 'selected' : ''} ${name && allSelected().includes(name) && name !== selected ? 'disabled' : ''}>${name || 'Open slot'}</option>`).join('');
      return `<div class="gd-sheet-pick"><strong>${side} Pick ${index + 1}</strong><small>Swap locked player</small><select class="gd-sheet-select" data-side="${side}" data-index="${index}">${opts}</select></div>`;
    }).join('')).join('');
    actions.querySelectorAll('.gd-sheet-select').forEach((select) => select.addEventListener('change', (event) => { const side = event.target.dataset.side; const index = Number(event.target.dataset.index); const updated = CR.gameDay.pregame[side].slice(); updated[index] = event.target.value; CR.gameDay.pregame[side] = updated.filter(Boolean); if (CR.gameDay.carryover?.active) CR.gameDay.carryover.active = false; renderManageSheet(); }));
  }

  function bindInteractions() { events.bind?.({ claimedOwner, draftOrder, nextDraftSide, renderManageSheet, setModalOpen, rerender: CR.renderGameDayState }); }

  CR.renderGameDayState = (mode = CR.gameDay.mode) => {
    CR.gameDay.mode = mode;
    const container = $('#gameDayContent');
    const view = $('#gameDayView');
    if (!container || !view) return;
    view.classList.toggle('mode-playoffs', isPlayoffs());
    view.classList.toggle('is-realtime-changed', CR.ui?.isChanged?.('gameday:sync'));
    container.innerHTML = `${renderHero()}${mode === 'pregame' ? renderPregame() : ''}${mode === 'live' ? renderLive() : ''}${mode === 'final' ? renderFinal() : ''}`;
    $('#stateTitle').textContent = modeLabel(mode);
    $('#stateBadge').textContent = isPlayoffs() ? 'Playoffs' : (mode === 'pregame' ? 'Regular' : modeLabel(mode));
    $('#phaseSwitcher')?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.phase === mode));
    $('#modeSwitcher')?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.playoffMode === CR.gameDay.playoffMode));
    $('#carryoverSwitcher')?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', (button.dataset.carryover === 'on') === Boolean(CR.gameDay.carryover?.active)));
    updateGlobalLiveIndicator();
    bindInteractions();
  };

  CR.initGameDay = () => {
    $('#phaseSwitcher')?.addEventListener('click', (event) => { const button = event.target.closest('button[data-phase]'); if (button) CR.renderGameDayState(button.dataset.phase); });
    $('#modeSwitcher')?.addEventListener('click', (event) => { const button = event.target.closest('button[data-playoff-mode]'); if (!button) return; CR.gameDay.playoffMode = button.dataset.playoffMode; CR.renderGameDayState(); });
    $('#carryoverSwitcher')?.addEventListener('click', (event) => { const button = event.target.closest('button[data-carryover]'); if (!button) return; CR.gameDay.carryover = { active: button.dataset.carryover === 'on' }; CR.renderGameDayState(); });
    $('#refreshButton')?.addEventListener('click', () => CR.refreshGameDayData?.({ toast: true, flash: true }));
    $('#closeSheet')?.addEventListener('click', () => setModalOpen(false));
    $('#saveSheet')?.addEventListener('click', () => {
      CR.gameDayEdit?.clearEditing?.();
      setModalOpen(false);
      CR.renderGameDayState();
    });
    $('#manageSheet')?.addEventListener('click', (event) => { if (event.target.id === 'manageSheet') setModalOpen(false); });
    CR.renderGameDayState(CR.gameDay.mode || 'pregame');
    refreshGameDayData();
    registerRealtime();
  };

  CR.applyGameDayData = applyGameDayData;
  CR.refreshGameDayData = refreshGameDayData;
  CR.registerGameDayRealtime = registerRealtime;
})();