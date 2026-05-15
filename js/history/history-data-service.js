window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  const FALLBACK_USERS = [
    { id: 'user-aaron', username: 'Aaron', displayName: 'Aaron', themeClass: 'owner-primary', avatarClass: 'avatar-primary', scoreKey: 'Aaron' },
    { id: 'user-julie', username: 'Julie', displayName: 'Julie', themeClass: 'owner-secondary', avatarClass: 'avatar-secondary', scoreKey: 'Julie' }
  ];

  function toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function seasonLabel(row) {
    return row?.display_name || row?.label || row?.season_key || row?.name || String(row?.id || 'Season');
  }

  function seasonShortLabel(row) {
    return row?.short_label || row?.season_key || seasonLabel(row).replace(/^20/, '');
  }

  function gameTitle(row) {
    if (row?.title) return row.title;
    const number = row?.game_number ? `Game ${row.game_number}` : 'Game';
    const opponent = row?.opponent && row.opponent !== 'Next Game' ? ` vs ${row.opponent}` : '';
    return `${number}${opponent}`;
  }

  function isPlayoffGame(row) {
    return String(row?.game_type || '').toLowerCase().includes('playoff');
  }

  function isFinalGame(row) {
    return String(row?.status || '').toLowerCase() === 'final';
  }

  function playerIdForName(name) {
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function mapPlayers(rows) {
    const byId = new Map();

    (rows || []).forEach((row) => {
      const name = row.player_name || row.name;
      if (!name) return;
      const id = String(row.id || playerIdForName(name));
      byId.set(id, {
        id,
        name,
        position: row.position || row.pos || '—',
        vibe: row.vibe || ''
      });
    });

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  function buildPlayerLookup(players) {
    const lookup = new Map();
    (players || []).forEach((player) => {
      lookup.set(String(player.id), player.id);
      lookup.set(String(player.name || '').toLowerCase(), player.id);
    });
    return lookup;
  }

  function pickPoints(pick, firstGoalScorer) {
    const goals = toNumber(pick.goals);
    const assists = toNumber(pick.assists);
    const firstGoal = Boolean(firstGoalScorer && pick.player_name === firstGoalScorer && goals > 0);
    return (goals * 2) + assists + (firstGoal ? 2 : 0);
  }

  function mapPicksForGame(game, picks, playerLookup) {
    return (picks || [])
      .filter((pick) => Number(pick.game_id) === Number(game.id))
      .sort((a, b) => toNumber(a.pick_slot) - toNumber(b.pick_slot))
      .reduce((acc, pick) => {
        const owner = pick.owner || 'Unknown';
        const name = pick.player_name || '';
        const fallbackId = playerIdForName(name);
        const playerId = playerLookup.get(String(name).toLowerCase()) || playerLookup.get(String(pick.player_id || '')) || fallbackId;

        acc[owner] = acc[owner] || [];
        acc[owner].push({
          playerId,
          goals: toNumber(pick.goals),
          assists: toNumber(pick.assists),
          firstGoal: Boolean(game.first_goal_scorer && name === game.first_goal_scorer && toNumber(pick.goals) > 0),
          points: toNumber(pick.points, pickPoints(pick, game.first_goal_scorer))
        });
        return acc;
      }, {});
  }

  function mapGames(rows, picks, playerLookup) {
    return (rows || [])
      .filter((row) => row && row.status !== 'Hidden' && isFinalGame(row))
      .map((row) => {
        const aaronScore = toNumber(row.aaron_points);
        const julieScore = toNumber(row.julie_points);
        const winner = aaronScore > julieScore ? 'Aaron' : julieScore > aaronScore ? 'Julie' : 'Tie';
        const firstGoal = row.first_goal_scorer ? [`First goal: ${row.first_goal_scorer}`] : [];
        const resultTag = winner === 'Tie' ? 'Tie' : `${winner} win`;
        const gameType = row.game_type || 'Regular Season';

        return {
          id: String(row.id),
          seasonId: String(row.season_id),
          date: row.game_date || row.date || '',
          opponent: row.opponent || '',
          firstPick: row.first_picker || '',
          firstGoalScorer: row.first_goal_scorer || '',
          title: gameTitle(row),
          gameType,
          game_type: gameType,
          playoff: isPlayoffGame(row),
          aaronScore,
          julieScore,
          summary: `${gameTitle(row)} finished ${aaronScore}-${julieScore}.`,
          tags: [gameType, resultTag].filter(Boolean),
          moments: firstGoal.length ? firstGoal : [`${winner === 'Tie' ? 'Tie game' : `${winner} took the result`}`],
          picks: mapPicksForGame(row, picks, playerLookup)
        };
      });
  }

  function mapSeasons(rows, currentSeasonId) {
    return (rows || []).map((row) => ({
      id: String(row.id),
      label: seasonLabel(row),
      shortLabel: seasonShortLabel(row),
      isCurrent: String(row.id) === String(currentSeasonId),
      note: row.note || (row.is_active ? 'Current season.' : 'Completed season.'),
      aaronScore: toNumber(row.aaron_final_total ?? row.aaron_points ?? row.aaron_total),
      julieScore: toNumber(row.julie_final_total ?? row.julie_points ?? row.julie_total)
    }));
  }

  async function fetchHistoryData() {
    const db = await CR.getSupabase();

    const seasonsRes = await db.from('seasons').select('*').order('season_key');
    if (seasonsRes.error) throw seasonsRes.error;

    const seasons = seasonsRes.data || [];
    const activeSeason = seasons.find((season) => season.is_active) || seasons[seasons.length - 1] || null;
    const currentSeasonId = activeSeason?.id ? String(activeSeason.id) : '';

    const [gamesRes, playersRes] = await Promise.all([
      db.from('games').select('*').order('game_number'),
      db.from('players').select('*').order('player_name')
    ]);

    if (gamesRes.error) throw gamesRes.error;
    if (playersRes.error) throw playersRes.error;

    const gamesRows = gamesRes.data || [];
    let picksRows = [];

    if (gamesRows.length) {
      const gameIds = gamesRows.map((game) => game.id);
      const picksRes = await db.from('picks').select('*').in('game_id', gameIds).order('pick_slot');
      if (picksRes.error) throw picksRes.error;
      picksRows = picksRes.data || [];
    }

    const players = mapPlayers(playersRes.data || []);
    const playerLookup = buildPlayerLookup(players);

    return {
      source: 'supabase',
      currentSeasonId,
      users: FALLBACK_USERS,
      seasons: mapSeasons(seasons, currentSeasonId),
      players,
      games: mapGames(gamesRows, picksRows, playerLookup)
    };
  }

  CR.historyDataService = { fetchHistoryData };
})();