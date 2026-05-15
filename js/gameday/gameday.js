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

  CR.renderGameDayState = (mode = CR.gameDay.mode) => {
    CR.gameDay.mode = mode;

    const container = $('#gameDayContent');
    const view = $('#gameDayView');
    if (!container || !view) return;

    view.classList.toggle('mode-playoffs', isPlayoffs());

    container.innerHTML = [
      renderHero()
    ].join('');
  };
})();
