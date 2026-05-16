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

  function rollbackDraftStateToPick(pickNumber = 1) {
    const rollbackPickNumber = Math.max(1, Math.min(Number(pickNumber || 1), 4));
    const picker = draftTurnProfile(rollbackPickNumber);

    return {
      draft_status: 'open',
      current_pick_number: rollbackPickNumber,
      current_pick_user_id: picker?.id || null
    };
  }

  function rowForSlot(gameId, owner, pickSlot, playerName = '') {
    return {
      game_id: gameId,
      owner,
      owner_user_id: profileByDisplayName(owner)?.id || null,
      pick_slot: pickSlot,
      player_name: playerName || '',
      original_pick_text: playerName || null,
      goals: 0,
      assists: 0,
      points: 0,
      picked_by_user_id: playerName ? (currentUserId() || null) : null,
      updated_by_user_id: currentUserId() || null,
      updated_at: new Date().toISOString()
    };
  }

  function rowsFromPregameState(gameId, pregame = {}) {
    return OWNERS.flatMap((owner) => [0, 1].map((index) => rowForSlot(gameId, owner, index + 1, pregame[owner]?.[index] || '')));
  }

  async function savePregamePicks(gameId, pregame) {
    if (!hasScheduledGame()) throw new Error('Picks cannot be saved until a game is scheduled.');
    if (!gameId) throw new Error('No active game is available for saving picks.');

    const db = await CR.getSupabase();
    const nextRows = rowsFromPregameState(gameId, pregame);

    const upsertRes = await db
      .from('picks')
      .upsert(nextRows, { onConflict: 'game_id,owner,pick_slot' })
      .select('*');

    if (upsertRes.error) throw upsertRes.error;

    const savedRows = upsertRes.data || nextRows;
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
      .neq('player_name', '')
      .ilike('player_name', playerName)
      .limit(1);

    if (existingRes.error) throw existingRes.error;
    if ((existingRes.data || []).length) throw new Error('That player has already been picked.');

    const slot = draftPickSlot(pickNumber);
    const row = rowForSlot(gameId, ownerProfile.displayName, slot, playerName);
    row.picked_by_user_id = userId;

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

  async function undoLastDraftPick(gameId) {
    if (!hasScheduledGame()) throw new Error('Picks cannot be changed until a game is scheduled.');
    if (!gameId) throw new Error('No active game is available for undo.');

    const draft = CR.gameDay?.draft || {};
    const currentPickNumber = Number(draft.currentPickNumber || 1);
    const undoPickNumber = currentPickNumber > 4 ? 4 : currentPickNumber - 1;

    if (undoPickNumber < 1) throw new Error('There are no draft picks to undo.');

    const ownerProfile = draftTurnProfile(undoPickNumber);
    const slot = draftPickSlot(undoPickNumber);

    if (!ownerProfile?.displayName) throw new Error('Could not determine pick to undo.');

    const db = await CR.getSupabase();
    const existingRes = await db
      .from('picks')
      .select('*')
      .eq('game_id', gameId)
      .eq('owner', ownerProfile.displayName)
      .eq('pick_slot', slot)
      .maybeSingle();

    if (existingRes.error) throw existingRes.error;
    if (!existingRes.data || !String(existingRes.data.player_name || '').trim()) {
      throw new Error('There is no drafted player in the last pick slot.');
    }

    const clearPatch = rowForSlot(gameId, ownerProfile.displayName, slot, '');

    const pickUpdateRes = await db
      .from('picks')
      .update(clearPatch)
      .eq('id', existingRes.data.id)
      .select('*')
      .single();

    if (pickUpdateRes.error) throw pickUpdateRes.error;

    const gamePatch = rollbackDraftStateToPick(undoPickNumber);
    const gameUpdateRes = await db.from('games').update(gamePatch).eq('id', gameId).select('*').single();
    if (gameUpdateRes.error) throw gameUpdateRes.error;

    CR.realtime?.markLocalWrite?.('picks', pickUpdateRes.data || { id: existingRes.data.id, ...clearPatch }, 3000);
    CR.realtime?.markLocalWrite?.('games', gameUpdateRes.data || { id: gameId, ...gamePatch }, 3000);

    return { clearedRow: pickUpdateRes.data, game: gameUpdateRes.data, undonePickNumber: undoPickNumber };
  }

  CR.gameDaySaveService = {
    savePregamePicks,
    saveDraftPick,
    undoLastDraftPick,
    rowsFromPregameState,
    hasScheduledGame,
    draftTurnProfile,
    draftPickSlot,
    nextDraftStateAfterPick,
    rollbackDraftStateToPick
  };
})();