window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const OWNERS = ['Aaron', 'Julie'];

  function hasScheduledGame() {
    const game = CR.gameDay?.game || {};
    return Boolean(game.hasGame && game.scheduleText && game.scheduleText !== 'Schedule pending');
  }

  function rowsFromPregameState(gameId, pregame = {}) {
    return OWNERS.flatMap((owner) => (pregame[owner] || []).map((playerName, index) => ({
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
    if (!hasScheduledGame()) throw new Error('Picks cannot be saved until a game is scheduled.');
    if (!gameId) throw new Error('No active game is available for saving picks.');

    const db = await CR.getSupabase();
    const existingRes = await db.from('picks').select('*').eq('game_id', gameId);
    if (existingRes.error) throw existingRes.error;

    const existingRows = existingRes.data || [];
    const nextRows = rowsFromPregameState(gameId, pregame);

    existingRows.forEach((row) => {
      CR.realtime?.markLocalWrite?.('picks', row, 3000);
    });

    const deleteRes = await db.from('picks').delete().eq('game_id', gameId);
    if (deleteRes.error) throw deleteRes.error;

    let savedRows = [];
    if (nextRows.length) {
      const insertRes = await db.from('picks').insert(nextRows).select('*');
      if (insertRes.error) throw insertRes.error;
      savedRows = insertRes.data || nextRows;
    }

    savedRows.forEach((row) => {
      CR.realtime?.markLocalWrite?.('picks', row, 3000);
    });

    return { savedRows };
  }

  CR.gameDaySaveService = {
    savePregamePicks,
    rowsFromPregameState,
    hasScheduledGame
  };
})();
