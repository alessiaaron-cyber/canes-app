window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const model = CR.gameDayModel || {};
  const helpers = CR.gameDayHelpers || {};
  const render = CR.gameDayRender || {};
  const events = CR.gameDayEvents || {};

  const fallbackRoster = model.roster || [];
  const draftOrder = model.draftOrder || ['Aaron', 'Julie', 'Aaron', 'Julie'];

  CR.gameDay = model.createInitialState
    ? model.createInitialState()
    : {
        source: 'empty',
        currentGameId: '',
        mode: 'pregame',
        playoffMode: 'regular',
        carryover: { active: false },
        game: {
          hasGame: false,
          scheduleText: 'Schedule pending',
          opponent: '',
          headline: 'Next game not scheduled yet'
        },
        pregame: { Aaron: [], Julie: [] },
        live: {
          scores: { Aaron: 0, Julie: 0 },
          period: 'Schedule pending',
          users: { Aaron: [], Julie: [] },
          feed: []
        },
        roster: []
      };

  if (!CR.gameDay.carryover) CR.gameDay.carryover = { active: false };
  CR.gameDayRoster = CR.gameDay.roster || fallbackRoster;

  const $ = (selector) => document.querySelector(selector);
  const clone = (value) => model.clone ? model.clone(value) : JSON.parse(JSON.stringify(value));

  function pointsFor(pick = {}) {
    if (model.pointsFor) return model.pointsFor(pick);
    return (Number(pick.goals || 0) * 2) + Number(pick.assists || 0) + (pick.firstGoal ? 2 : 0);
  }

  function isPlayoffs() {
    return CR.gameDay.playoffMode === 'playoffs';
  }

  function isUserEditing() {
    return Boolean(CR.gameDayEditState?.isEditing);
  }

  function hasScheduledGame() {
    const game = CR.gameDay?.game || {};
    return Boolean(game.hasGame && game.scheduleText && game.scheduleText !== 'Schedule pending');
  }

  function canManagePicks() {
    return hasScheduledGame() && CR.gameDay.mode !== 'final';
  }

  function getRoster() {
    return CR.gameDay.roster || CR.gameDayRoster || fallbackRoster;
  }

  function modeLabel(mode) {
    if (mode === 'pregame') return 'Pregame';
    if (mode === 'live') return 'Live';
    return 'Final';
  }

  function getPregameStructured() {
    if (helpers.getPregameStructured) return helpers.getPregameStructured(CR.gameDay);

    return {
      Aaron: (CR.gameDay.pregame.Aaron || []).map((player) => ({ player })),
      Julie: (CR.gameDay.pregame.Julie || []).map((player) => ({ player }))
    };
  }

  function getFinalData() {
    return {
      scores: clone(CR.gameDay.live.scores),
      users: clone(CR.gameDay.live.users)
    };
  }

  function winnerText(scores = {}) {
    if (helpers.winnerText) return helpers.winnerText(scores);
    if (scores.Aaron > scores.Julie) return 'Aaron Wins';
    if (scores.Julie > scores.Aaron) return 'Julie Wins';
    return 'Rivalry Tie';
  }

  function nextDraftSide() {
    if (!hasScheduledGame()) return null;
    if (helpers.nextDraftSide) return helpers.nextDraftSide(CR.gameDay, draftOrder);

    const total = (CR.gameDay.pregame.Aaron || []).length + (CR.gameDay.pregame.Julie || []).length;
    return draftOrder[total] || null;
  }

  function claimedOwner(name) {
    if (helpers.claimedOwner) return helpers.claimedOwner(CR.gameDay, name);
    if ((CR.gameDay.pregame.Aaron || []).includes(name)) return 'Aaron';
    if ((CR.gameDay.pregame.Julie || []).includes(name)) return 'Julie';
    return '';
  }

  function allLivePicks(users = {}) {
    return Object.values(users).flat();
  }

  function totalGoals(users = {}) {
    if (helpers.totalGoals) return helpers.totalGoals(users);
    return allLivePicks(users).reduce((total, pick) => total + Number(pick.goals || 0), 0);
  }

  function totalAssists(users = {}) {
    if (helpers.totalAssists) return helpers.totalAssists(users);
    return allLivePicks(users).reduce((total, pick) => total + Number(pick.assists || 0), 0);
  }

  function firstGoalHit(users = {}) {
    if (helpers.firstGoalHit) return helpers.firstGoalHit(users);
    return allLivePicks(users).find((pick) => pick.firstGoal);
  }

  function mvpText(users = {}) {
    const picks = allLivePicks(users);
    if (!picks.length) return 'No MVP yet';

    const best = picks.slice().sort((a, b) => pointsFor(b) - pointsFor(a))[0];
    return `${best.player} • ${pointsFor(best)} pts`;
  }

  function leadingStatType(users = {}) {
    const goals = totalGoals(users);
    const assists = totalAssists(users);

    if (goals === 0 && assists === 0) return 'No scoring events yet';
    if (goals > assists) return `${goals} goal points drove the night`;
    if (assists > goals) return `${assists} assist points drove the night`;
    return 'Goals and assists landed evenly';
  }

  function totalEventsText(users = {}) {
    return `${totalGoals(users)} goals • ${totalAssists(users)} assists`;
  }

  function payloadBelongsToCurrentGame(payload) {
    const gameId = String(CR.gameDay?.currentGameId || '');
    const row = payload?.new || payload?.old || {};

    if (payload?.table === 'games') return !gameId || String(row.id || '') === gameId;
    if (payload?.table === 'picks') return !gameId || String(row.game_id || '') === gameId;
    return false;
  }

  function applyGameDayData(nextState = {}) {
    const previousMode = CR.gameDay?.mode;

    CR.gameDay = {
      ...CR.gameDay,
      ...nextState,
      carryover: nextState.carryover || CR.gameDay?.carryover || { active: false },
      game: nextState.game || CR.gameDay?.game,
      pregame: nextState.pregame || CR.gameDay?.pregame || { Aaron: [], Julie: [] },
      live: nextState.live || CR.gameDay?.live || {
        scores: { Aaron: 0, Julie: 0 },
        period: '',
        users: { Aaron: [], Julie: [] },
        feed: []
      }
    };

    CR.gameDayRoster = nextState.roster || CR.gameDayRoster || fallbackRoster;
    CR.gameDay.roster = CR.gameDayRoster;
    CR.renderGameDayState?.(CR.gameDay.mode || previousMode || 'pregame');
  }

  async function refreshGameDayData(options = {}) {
    if (!CR.gameDayDataService?.fetchGameDayData) return CR.gameDay;
    if (options.skipIfEditing && isUserEditing()) return CR.gameDay;

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

  async function saveGameDayPicks() {
    const button = $('#saveSheet');

    try {
      if (!hasScheduledGame()) throw new Error('Picks cannot be saved until a game is scheduled.');
      if (CR.gameDay.mode === 'final') throw new Error('Final games are locked. Use History to correct finalized stats.');

      CR.ui?.setActionBusy?.(button, true, { label: 'Saving…' });
      await CR.gameDaySaveService?.savePregamePicks?.(CR.gameDay.currentGameId, CR.gameDay.pregame);
      CR.gameDayEdit?.clearEditing?.();
      setModalOpen(false);
      await refreshGameDayData({ flash: true });
      CR.showToast?.('Picks saved');
    } catch (error) {
      console.error('Game Day pick save failed', error);
      CR.showToast?.({ message: error?.message || 'Could not save picks', tier: 'warning' });
    } finally {
      CR.ui?.setActionBusy?.(button, false);
    }
  }

  function registerRealtime() {
    if (CR.__gameDayRealtimeRegistered || !CR.realtime?.register) return;

    CR.__gameDayRealtimeRegistered = true;
    CR.realtime.register('gameday', {
      tables: ['games', 'picks'],
      debounceMs: 250,
      onChange: async (payloads = []) => {
        if (!payloads.some(payloadBelongsToCurrentGame)) return;
        if (isUserEditing()) return;

        CR.ui?.markChanged?.(['gameday:sync'], {
          ttl: 1200,
          onChange: () => CR.renderGameDayState?.()
        });

        await refreshGameDayData({ flash: true, skipIfEditing: true });
      }
    });

    CR.realtime.start?.();
  }

  function renderPlayerCard(args = {}) {
    return render.renderPlayerCard({ ...args, pointsFor });
  }

  function setModalOpen(isOpen) {
    const modal = $('#manageSheet');
    if (!modal) return;

    modal.classList.toggle('is-open', isOpen);

    if (isOpen) {
      CR.ui?.lockBodyScroll?.('manage-sheet-open');
    } else {
      CR.ui?.unlockBodyScroll?.('manage-sheet-open');
    }
  }

  function updateGlobalLiveIndicator() {
    $('#globalLiveIndicator')?.classList.toggle('is-hidden', CR.gameDay.mode !== 'live');
  }

  function renderHero() {
    return render.renderHeroSection({
      mode: CR.gameDay.mode,
      game: CR.gameDay.game,
      pregameUsers: getPregameStructured(),
      live: CR.gameDay.live,
      final: getFinalData(),
      isPlayoffs: isPlayoffs(),
      winnerText,
      nextDraftSide: nextDraftSide()
    });
  }

  function renderPregame() {
    return render.renderPregameSection({
      users: getPregameStructured(),
      roster: getRoster(),
      claimedOwner,
      isPlayoffs: isPlayoffs()
    });
  }

  function renderLive() {
    return render.renderLiveSection({
      state: CR.gameDay.live,
      renderPlayerCard,
      carryover: CR.gameDay.carryover,
      isPlayoffs: isPlayoffs()
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
      totalEventsText: totalEventsText(state.users),
      renderPlayerCard,
      carryover: CR.gameDay.carryover,
      isPlayoffs: isPlayoffs()
    });
  }

  function allSelectedPregamePlayers() {
    return [
      ...(CR.gameDay.pregame.Aaron || []),
      ...(CR.gameDay.pregame.Julie || [])
    ];
  }

  function manageSheetStatusCopy(picksEnabled) {
    if (!hasScheduledGame()) {
      return {
        title: 'Schedule pending',
        detail: 'Picks can be managed after the next game is scheduled.',
        saveLabel: 'Schedule Pending'
      };
    }

    if (CR.gameDay.mode === 'live') {
      return {
        title: 'Live game pick management',
        detail: 'Pick swaps are allowed here; live stats remain read-only and come from NHL sync.',
        saveLabel: picksEnabled ? 'Save Live Picks' : 'Locked'
      };
    }

    if (CR.gameDay.mode === 'final') {
      return {
        title: 'Final game locked',
        detail: 'Finalized games are read-only on Game Day. Use History for stat corrections.',
        saveLabel: 'Final Locked'
      };
    }

    return {
      title: 'Pregame pick management',
      detail: 'Draft or swap picks before puck drop.',
      saveLabel: picksEnabled ? 'Save Picks' : 'Locked'
    };
  }

  function renderManageSheet() {
    const actions = $('#manageSheetActions');
    const saveButton = $('#saveSheet');
    if (!actions) return;

    const picksEnabled = canManagePicks();
    const selectedPlayers = allSelectedPregamePlayers();
    const status = manageSheetStatusCopy(picksEnabled);

    if (saveButton) {
      saveButton.disabled = !picksEnabled;
      saveButton.textContent = status.saveLabel;
    }

    const statusCopy = `
      <div class="gd-sheet-pick ${!picksEnabled ? 'is-disabled' : ''}">
        <strong>${status.title}</strong>
        <small>${status.detail}</small>
      </div>
    `;

    const pickControls = ['Aaron', 'Julie'].flatMap((side) => [0, 1].map((index) => {
      const selected = CR.gameDay.pregame[side]?.[index] || '';
      const options = [''].concat(getRoster().map((player) => player.name)).map((name) => {
        const disabled = !picksEnabled || (name && selectedPlayers.includes(name) && name !== selected);
        return `<option value="${name}" ${name === selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}>${name || 'Open slot'}</option>`;
      }).join('');

      return `
        <div class="gd-sheet-pick ${!picksEnabled ? 'is-disabled' : ''}">
          <strong>${side} Pick ${index + 1}</strong>
          <small>${picksEnabled ? (CR.gameDay.mode === 'live' ? 'Swap picked player only' : 'Swap locked player') : 'Locked'}</small>
          <select class="gd-sheet-select" data-side="${side}" data-index="${index}" ${picksEnabled ? '' : 'disabled'}>${options}</select>
        </div>
      `;
    }).join('')).join('');

    actions.innerHTML = statusCopy + pickControls;

    actions.querySelectorAll('.gd-sheet-select').forEach((select) => {
      select.addEventListener('change', (event) => {
        if (!canManagePicks()) return;

        const side = event.target.dataset.side;
        const index = Number(event.target.dataset.index);
        const updated = (CR.gameDay.pregame[side] || []).slice();

        updated[index] = event.target.value;
        CR.gameDay.pregame[side] = updated.filter(Boolean);

        if (CR.gameDay.carryover?.active) CR.gameDay.carryover.active = false;
        CR.gameDayEdit?.markEditing?.();
        renderManageSheet();
      });
    });
  }

  function bindInteractions() {
    events.bind?.({
      claimedOwner,
      draftOrder,
      nextDraftSide,
      renderManageSheet,
      setModalOpen,
      rerender: CR.renderGameDayState
    });
  }

  CR.renderGameDayState = (mode = CR.gameDay.mode) => {
    CR.gameDay.mode = mode;

    const container = $('#gameDayContent');
    const view = $('#gameDayView');
    if (!container || !view) return;

    view.classList.toggle('mode-playoffs', isPlayoffs());
    view.classList.toggle('is-realtime-changed', CR.ui?.isChanged?.('gameday:sync'));

    container.innerHTML = [
      renderHero(),
      mode === 'pregame' ? renderPregame() : '',
      mode === 'live' ? renderLive() : '',
      mode === 'final' ? renderFinal() : ''
    ].join('');

    const stateTitle = $('#stateTitle');
    const stateBadge = $('#stateBadge');
    if (stateTitle) stateTitle.textContent = modeLabel(mode);
    if (stateBadge) stateBadge.textContent = isPlayoffs() ? 'Playoffs' : (mode === 'pregame' ? 'Regular' : modeLabel(mode));

    $('#phaseSwitcher')?.querySelectorAll('button').forEach((button) => {
      button.classList.toggle('active', button.dataset.phase === mode);
    });

    $('#modeSwitcher')?.querySelectorAll('button').forEach((button) => {
      button.classList.toggle('active', button.dataset.playoffMode === CR.gameDay.playoffMode);
    });

    $('#carryoverSwitcher')?.querySelectorAll('button').forEach((button) => {
      button.classList.toggle('active', (button.dataset.carryover === 'on') === Boolean(CR.gameDay.carryover?.active));
    });

    updateGlobalLiveIndicator();
    bindInteractions();
  };

  CR.initGameDay = () => {
    $('#phaseSwitcher')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-phase]');
      if (button) CR.renderGameDayState(button.dataset.phase);
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
      CR.refreshGameDayData?.({ toast: true, flash: true });
    });

    $('#closeSheet')?.addEventListener('click', () => setModalOpen(false));
    $('#saveSheet')?.addEventListener('click', saveGameDayPicks);
    $('#manageSheet')?.addEventListener('click', (event) => {
      if (event.target.id === 'manageSheet') setModalOpen(false);
    });

    CR.renderGameDayState(CR.gameDay.mode || 'pregame');
    refreshGameDayData();
    registerRealtime();
  };

  CR.applyGameDayData = applyGameDayData;
  CR.refreshGameDayData = refreshGameDayData;
  CR.registerGameDayRealtime = registerRealtime;
})();