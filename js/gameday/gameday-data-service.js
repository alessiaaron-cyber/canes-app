window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  const FALLBACK_USERS = ['Aaron', 'Julie'];

  function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizeStatus(value) {
    return String(value || '').trim().toLowerCase();
  }

  function modeForGame(game) {
    const status = normalizeStatus(game?.status);
    if (status === 'final') return 'final';
    if (['live', 'in_progress', 'in progress', 'active', 'crit'].includes(status)) return 'live';
    return 'pregame';
  }

  function isPlayoffGame(game) {
    return String(game?.game_type || game?.gameType || '').toLowerCase().includes('playoff');
  }

  function playerIdForName(name) {
    return String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function rosterDisplayName(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return String(name || '').trim();
    return `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}`;
  }

  function rosterSortKey(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return String(name || '').trim().toLowerCase();
    return `${parts[parts.length - 1]} ${parts.slice(0, -1).join(' ')}`.toLowerCase();
  }

  function mapRoster(rows = []) {
    return rows.map((row) => {
      const name = row.player_name || row.name || '';
      if (!name) return null;
      const position = row.position || row.pos || '';
      return { id: String(row.id || playerIdForName(name)), name, displayName: rosterDisplayName(name), sortKey: rosterSortKey(name), detail: position || 'Canes roster' };
    }).filter(Boolean).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }

  function ownerBuckets() {
    return FALLBACK_USERS.reduce((acc, owner) => { acc[owner] = []; return acc; }, {});
  }

  function pointsForPick(pick, firstGoalScorer) {
    const goals = toNumber(pick.goals);
    const assists = toNumber(pick.assists);
    const isFirstGoal = Boolean(firstGoalScorer && pick.player_name === firstGoalScorer && goals > 0);
    return (goals * 2) + assists + (isFirstGoal ? 2 : 0);
  }

  function mapPregamePicks(picks = []) {
    const buckets = ownerBuckets();
    picks.slice().sort((a, b) => toNumber(a.pick_slot) - toNumber(b.pick_slot)).forEach((pick) => {
      const owner = pick.owner || '';
      const name = pick.player_name || '';
      if (!owner || !name) return;
      buckets[owner] = buckets[owner] || [];
      buckets[owner].push(name);
    });
    return buckets;
  }

  function mapLiveUsers(game, picks = []) {
    const buckets = ownerBuckets();
    const firstGoalScorer = game?.first_goal_scorer || '';
    picks.slice().sort((a, b) => toNumber(a.pick_slot) - toNumber(b.pick_slot)).forEach((pick) => {
      const owner = pick.owner || '';
      const player = pick.player_name || '';
      if (!owner || !player) return;
      const goals = toNumber(pick.goals);
      const assists = toNumber(pick.assists);
      const firstGoal = Boolean(firstGoalScorer && player === firstGoalScorer && goals > 0);
      buckets[owner] = buckets[owner] || [];
      buckets[owner].push({ player, goals, assists, firstGoal, points: toNumber(pick.points, pointsForPick(pick, firstGoalScorer)) });
    });
    return buckets;
  }

  function buildFeed(game, users) {
    const feed = [];
    const firstGoalScorer = game?.first_goal_scorer || '';
    Object.entries(users || {}).forEach(([owner, picks]) => {
      (picks || []).forEach((pick) => {
        if (pick.firstGoal || pick.player === firstGoalScorer) feed.push({ icon: '👑', title: `${pick.player} first Canes goal`, detail: `${owner} gets the first goal bonus`, points: 2, tier: 'heavy' });
        if (toNumber(pick.goals) > 0) feed.push({ icon: '🚨', title: `${pick.player} goal${toNumber(pick.goals) > 1 ? 's' : ''}`, detail: `${owner} scores through a picked player`, points: toNumber(pick.goals) * 2, tier: 'medium' });
        if (toNumber(pick.assists) > 0) feed.push({ icon: '🎯', title: `${pick.player} assist${toNumber(pick.assists) > 1 ? 's' : ''}`, detail: `${owner} adds assist points`, points: toNumber(pick.assists), tier: 'light' });
      });
    });
    return feed.length ? feed : [{ icon: '🏒', title: 'Waiting for rivalry moments', detail: 'Live scoring updates will appear here.', points: 0, tier: 'light' }];
  }

  function scoreFromUsers(users, owner) {
    return (users?.[owner] || []).reduce((sum, pick) => Number.isFinite(Number(pick.points)) ? sum + Number(pick.points) : sum + (toNumber(pick.goals) * 2) + toNumber(pick.assists) + (pick.firstGoal ? 2 : 0), 0);
  }

  function periodText(game) {
    return game?.game_clock || game?.clock || game?.period || game?.game_state || 'Live';
  }

  function gameDateValue(game) {
    return game?.game_date || game?.game_time || game?.start_time || game?.scheduled_at || game?.gameDate || '';
  }

  function formatScheduleText(game) {
    const value = gameDateValue(game);
    if (!value) return 'Schedule pending';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Schedule pending';
    return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  function gameMeta(game) {
    if (!game) return { hasGame: false, scheduleText: 'Schedule pending', opponent: '', headline: 'Next game not scheduled yet' };
    return { hasGame: true, scheduleText: formatScheduleText(game), opponent: game.opponent || game.away_team || game.home_team || '', headline: game.opponent ? `Canes vs ${game.opponent}` : 'Canes game' };
  }

  function normalizeGameDayState({ game, picks, roster }) {
    const mode = modeForGame(game);
    const liveUsers = mapLiveUsers(game, picks);
    const scores = { Aaron: toNumber(game?.aaron_points, scoreFromUsers(liveUsers, 'Aaron')), Julie: toNumber(game?.julie_points, scoreFromUsers(liveUsers, 'Julie')) };
    return { source: 'supabase', currentGameId: game?.id ? String(game.id) : '', mode, game: gameMeta(game), playoffMode: isPlayoffGame(game) ? 'playoffs' : 'regular', carryover: { active: Boolean(game?.carryover_active || game?.is_carryover) }, pregame: mapPregamePicks(picks), live: { scores, period: mode === 'pregame' ? formatScheduleText(game) : periodText(game), users: liveUsers, feed: buildFeed(game, liveUsers) }, roster: roster?.length ? roster : [] };
  }

  async function fetchCurrentGame() {
    const db = await CR.getSupabase();
    const seasonsRes = await db.from('seasons').select('*').eq('is_active', true).limit(1).maybeSingle();
    if (seasonsRes.error) throw seasonsRes.error;
    let query = db.from('games').select('*').neq('status', 'Hidden');
    if (seasonsRes.data?.id) query = query.eq('season_id', seasonsRes.data.id);
    const gamesRes = await query.order('game_number', { ascending: true });
    if (gamesRes.error) throw gamesRes.error;
    const games = gamesRes.data || [];
    return games.find((game) => !['final', 'hidden'].includes(normalizeStatus(game.status))) || null;
  }

  async function fetchGameDayData() {
    const db = await CR.getSupabase();
    const game = await fetchCurrentGame();
    const playersPromise = db.from('players').select('*').order('player_name');
    const picksPromise = game?.id ? db.from('picks').select('*').eq('game_id', game.id).order('pick_slot') : Promise.resolve({ data: [], error: null });
    const [playersRes, picksRes] = await Promise.all([playersPromise, picksPromise]);
    if (playersRes.error) throw playersRes.error;
    if (picksRes.error) throw picksRes.error;
    const roster = mapRoster(playersRes.data || []);
    if (!game) return { source: 'supabase', currentGameId: '', mode: 'pregame', game: gameMeta(null), playoffMode: 'regular', carryover: { active: false }, pregame: ownerBuckets(), live: { scores: { Aaron: 0, Julie: 0 }, period: 'Schedule pending', users: ownerBuckets(), feed: [] }, roster };
    return normalizeGameDayState({ game, picks: picksRes.data || [], roster });
  }

  CR.gameDayDataService = { fetchGameDayData, normalizeGameDayState, rosterDisplayName };
})();
