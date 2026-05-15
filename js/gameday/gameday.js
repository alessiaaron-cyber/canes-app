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

  function firstGoalSummary(users = {}, mode = CR.gameDay.mode) {
    const bonus = firstGoalHit(users);

    if (bonus) return `${bonus.player} hit the first goal bonus`;
    if (mode === 'live') return 'First goal bonus still open';
    if (mode === 'final') return 'No picked player hit first goal';

    return 'First goal bonus pending';
  }
})();