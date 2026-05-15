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
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function mapRoster(rows = []) {
    return rows
      .map((row) => {
        const name = row.player_name || row.name || '';
        if (!name) return null;
        const position = row.position || row.pos || '';
        const vibe = row.vibe || row.detail || '';
        return {
          id: String(row.id || playerIdForName(name)),
          name,
          detail: [position, vibe].filter(Boolean).join(' • ') || position || 'Canes roster'
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function ownerBuckets() {
    return FALLBACK_USERS.reduce((acc, owner) => {
      acc[owner] = [];
      return acc;
    }, {});
  }

  function pointsForPick(pick, firstGoalScorer) {
    const goals = toNumber(pick.goals);
    const assists = toNumber(pick.assists);
    const isFirstGoal = Boolean(firstGoalScorer && pick.player_name === firstGoalScorer && goals > 0);
    return (goals * 2) + assists + (isFirstGoal ? 2 : 0);
  }

  function mapPregamePicks(picks = []) {
    const buckets = ownerBuckets();

    picks
      .slice()
      .sort((a, b) => toNumber(a.pick_slot) - toNumber(b.pick_slot))
      .forEach((pick) => {
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

    picks
      .slice()
      .sort((a, b) => toNumber(a.pick_slot) - toNumber(b.pick_slot))
      .forEach((pick) => {
        const owner = pick.owner || '';
        const player = pick.player_name || '';
        if (!owner || !player) return;

        const goals = toNumber(pick.goals);
        const assists = toNumber(pick.assists);
        const firstGoal = Boolean(firstGoalScorer && player === firstGoalScorer && goals > 0);

        buckets[owner] = buckets[owner] || [];
        buckets[owner].push({
          player,
          goals,
          assists,
          firstGoal,
          points: toNumber(pick.points, pointsForPick(pick, firstGoalScorer))
        });
      });

    return buckets;
  }

  function buildFeed(game, users) {
    const feed = [];
    const firstGoalScorer = game?.first_goal_scorer || '';

    Object.entries(users || {}).forEach(([owner, picks]) => {
      (picks || []).forEach((pick) => {
        if (pick.firstGoal || pick.player === firstGoalScorer) {
          feed.push({ icon: '👑', title: `${pick.player} first Canes goal`, detail: `${owner} gets the first goal bonus`, points: 2, tier: 'heavy' });
        }

        if (toNumber(pick.goals) > 0) {
          feed.push({ icon: '🚨', title: `${pick.player} goal${toNumber(pick.goals) > 1 ? 's' : ''}`, detail: `${owner} scores through a picked player`, points: toNumber(pick.goals) * 2, tier: 'medium' });
        }

        if (toNumber(pick.assists) > 0) {
          feed.push({ icon: '🎯', title: `${pick.player} assist${toNumber(pick.assists) > 1 ? 's' : ''}`, detail: `${owner} adds assist points`, points: toNumber(pick.assists), tier: 'light' });
        }
      });
    });

    return feed.length ? feed : [{ icon: '🏒', title: 'Waiting for rivalry moments', detail: 'Live scoring updates will appear here.', points: 0, tier: 'light' }];
  }

  function scoreFromUsers(users, owner) {
    return (users?.[owner] || []).reduce((sum, pick) => {
      if (Number.isFinite(Number(pick.points))) return sum + Number(pick.points);
      return sum + (toNumber(pick.goals) * 2) + toNumber(pick.assists) + (pick.firstGoal ? 2 : 0);
    }, 0);
  }

  function periodText(game) {
    return game?.game_clock || game?.clock || game?.period || game?.game_state || 'Live';
  }

  function normalizeGameDayState({ game, picks, roster }) {
    const mode = modeForGame(game);
    const liveUsers = mapLiveUsers(game, picks);
    const scores = {
      Aaron: toNumber(game?.aaron_points, scoreFromUsers(liveUsers, 'Aaron')),
      Julie: toNumber(game?.julie_points, scoreFromUsers(liveUsers, 'Julie'))
    };

    return {
      source: 'supabase',
      currentGameId: game?.id ? String(game.id) : '',
      mode,
      playoffMode: isPlayoffGame(game) ? 'playoffs' : 'regular',
      carryover: { active: Boolean(game?.carryover_active || game?.is_carryover) },
      pregame: mapPregamePicks(picks),
      live: { scores, period: mode === 'pregame' ? 'Pregame' : periodText(game), users: liveUsers, feed: buildFeed(game, liveUsers) },
      roster: roster?.length ? roster : CR.gameDayModel?.roster || []
    };
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
    return games.find((game) => !['final', 'hidden'].includes(normalizeStatus(game.status))) || games[games.length - 1] || null;
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

    if (!game) {
      return { source: 'supabase', currentGameId: '', mode: 'pregame', playoffMode: 'regular', carryover: { active: false }, pregame: ownerBuckets(), live: { scores: { Aaron: 0, Julie: 0 }, period: 'No active game', users: ownerBuckets(), feed: [] }, roster };
    }

    return normalizeGameDayState({ game, picks: picksRes.data || [], roster });
  }

  function rowsFromPregameState(gameId, pregame = {}) {
    return FALLBACK_USERS.flatMap((owner) => (pregame[owner] || []).map((playerName, index) => ({
      game_id: gameId,
      owner,
      pick_slot: index + 1,
      player_name: playerName,
      goals: 0,
      assists: 0,
      points: 0
    })));
  }

  async function savePregamePicks(gameId, pregame) {
    if (!gameId) throw new Error('No active game is available for saving picks.');

    const db = await CR.getSupabase();
    const existingRes = await db.from('picks').select('*').eq('game_id', gameId);
    if (existingRes.error) throw existingRes.error;

    const existingRows = existingRes.data || [];
    const nextRows = rowsFromPregameState(gameId, pregame);
    const touchedRows = [];

    for (const existing of existingRows) {
      CR.realtime?.markLocalWrite?.('picks', existing, 3000);
    }

    const deleteRes = await db.from('picks').delete().eq('game_id', gameId);
    if (deleteRes.error) throw deleteRes.error;

    if (nextRows.length) {
      const insertRes = await db.from('picks').insert(nextRows).select('*');
      if (insertRes.error) throw insertRes.error;
      touchedRows.push(...(insertRes.data || nextRows));
    }

    touchedRows.forEach((row) => CR.realtime?.markLocalWrite?.('picks', row, 3000));
    return { savedRows: touchedRows };
  }

  CR.gameDayDataService = { fetchGameDayData, normalizeGameDayState, savePregamePicks };
})();
