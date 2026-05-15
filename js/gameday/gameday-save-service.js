window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const OWNERS = ['Aaron', 'Julie'];

  function hasScheduledGame() {
    const game = CR.gameDay?.game || {};
    return Boolean(game.hasGame && game.scheduleText && game.scheduleText !== 'Schedule pending');
  }

  function currentUserId() {
    return String(CR.currentUser?.id || CR.currentProfile?.id || '').trim();
  }

  function currentProfile() {
    return CR.currentProfile || null;
  }

  function normalizeName(value) {
    return String(value || '').trim().toLowerCase();
  }

  function users() {
    return Array.isArray(CR.gameDay?.users) && CR.gameDay.users.length
      ? CR.gameDay.users
      : OWNERS.map((name) => ({ id: '', displayName: name, username: name.toLowerCase() }));
  }

  function profileByDisplayName(name) {
    return users().find((user) => normalizeName(user.displayName) === normalizeName(name));
  }

  function firstPickerProfile() {
    const firstPicker = CR.gameDay?.draft?.firstPicker || CR.gameDay?.draft?.currentPicker?.displayName || OWNERS[0];
    return profileByDisplayName(firstPicker) || users()[0] || null;
  }

  function otherProfile(firstProfile) {
    return users().find((user) => user.displayName !== firstProfile?.displayName) || users()[1] || null;
  }

  function draftTurnProfile(pickNumber = 1) {
    const first = firstPickerProfile();
    const second = otherProfile(first);
    return Number(pickNumber || 1) % 2 === 1 ? first : second;
  }

  function draftPickSlot(pickNumber = 1) {
    return Number(pickNumber || 1) <= 2 ? 1 : 2;
  }

  function nextDraftStateAfterPick(pickNumber = 1) {
    const nextPickNumber = Number(pickNumber || 1) + 1;

    if (nextPickNumber > 4) {
      return {
        draft_status: 'complete',
        current_pick_number: 5,
        current_pick_user_id: null
      };
    }

    const nextProfile = draftTurnProfile(nextPickNumber);
    return {
      draft_status: 'open',
      current_pick_number: nextPickNumber,
      current_pick_user_id: nextProfile?.id || null
    };
  }

  function rowsFromPregameState(gameId, pregame = {}) {
    return OWNERS.flatMap((owner) => (pregame[owner] || []).map((playerName, index) => ({
      game_id: gameId,
      owner,
      owner_user_id: profileByDisplayName(owner)?.id || null,
      pick_slot: index + 1,
      player_name: playerName,
      goals: 0,
      assists: 0,
      points: 0,
      picked_by_user_id: currentUserId() || null,
      updated_by_user_id: currentUserId() || null,
      updated_at: new Date().toISOString()
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

  async function saveDraftPick(gameId, playerName) {
    if (!hasScheduledGame()) throw new Error('Picks cannot be made until a game is scheduled.');
    if (!gameId) throw new Error('No active game is available for saving picks.');
    if (!playerName) throw new Error('Choose a player first.');

    const draft = CR.gameDay?.draft || {};
    const pickNumber = Number(draft.currentPickNumber || 1);
    const ownerProfile = draftTurnProfile(pickNumber);
    const userId = currentUserId();

    if (!ownerProfile?.displayName) throw new Error('Could not determine current picker.');
    if (!userId || ownerProfile.id !== userId) throw new Error(`It is ${ownerProfile.displayName}'s turn to pick.`);

    const db = await CR.getSupabase();

    const existingRes = await db
      .from('picks')
      .select('id')
      .eq('game_id', gameId)
      .ilike('player_name', playerName)
      .limit(1);

    if (existingRes.error) throw existingRes.error;
    if ((existingRes.data || []).length) throw new Error('That player has already been picked.');

    const slot = draftPickSlot(pickNumber);
    const row = {
      game_id: gameId,
      owner: ownerProfile.displayName,
      owner_user_id: ownerProfile.id || null,
      pick_slot: slot,
      player_name: playerName,
      goals: 0,
      assists: 0,
      points: 0,
      picked_by_user_id: userId,
      updated_by_user_id: userId,
      updated_at: new Date().toISOString()
    };

    const upsertRes = await db
      .from('picks')
      .upsert(row, { onConflict: 'game_id,owner,pick_slot' })
      .select('*')
      .single();

    if (upsertRes.error) throw upsertRes.error;

    const gamePatch = nextDraftStateAfterPick(pickNumber);
    const gameUpdateRes = await db.from('games').update(gamePatch).eq('id', gameId).select('*').single();
    if (gameUpdateRes.error) throw gameUpdateRes.error;

    CR.realtime?.markLocalWrite?.('picks', upsertRes.data || row, 3000);
    CR.realtime?.markLocalWrite?.('games', gameUpdateRes.data || { id: gameId, ...gamePatch }, 3000);

    return { savedRow: upsertRes.data || row, game: gameUpdateRes.data || gamePatch };
  }

  CR.gameDaySaveService = {
    savePregamePicks,
    saveDraftPick,
    rowsFromPregameState,
    hasScheduledGame,
    draftTurnProfile,
    draftPickSlot,
    nextDraftStateAfterPick
  };
})();