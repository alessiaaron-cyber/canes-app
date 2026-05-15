window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function scoreTotal(games, key) {
    return games.reduce((total, game) => total + Number(game[key] || 0), 0);
  }

  function seasonTotals(season, seasonGames) {
    const gameAaron = scoreTotal(seasonGames, 'aaronScore');
    const gameJulie = scoreTotal(seasonGames, 'julieScore');
    const seasonAaron = Number(season?.aaronScore || 0);
    const seasonJulie = Number(season?.julieScore || 0);

    return {
      aaron: gameAaron || seasonAaron,
      julie: gameJulie || seasonJulie,
      hasGameTotals: Boolean(gameAaron || gameJulie),
      hasSeasonTotals: Boolean(seasonAaron || seasonJulie)
    };
  }

  function firstGoalScorer(game) {
    if (game.firstGoalScorer) return game.firstGoalScorer;
    for (const side of ['Aaron', 'Julie']) {
      const hit = (game.picks?.[side] || []).find((pick) => pick.firstGoal);
      if (hit) return hit.playerName;
    }
    return '—';
  }

  function gameSubtitle(game) {
    return [game.date, game.opponent].filter(Boolean).join(' • ');
  }

  function hasRealScore(game) {
    return Number(game?.aaronScore || 0) + Number(game?.julieScore || 0) > 0;
  }

  function buildSeasonPlayerSpotlights(selectedGames) {
    const byPlayer = new Map();

    selectedGames.forEach((game) => {
      ['Aaron', 'Julie'].forEach((side) => {
        (game.picks?.[side] || []).forEach((pick) => {
          const existing = byPlayer.get(pick.playerName) || {
            name: pick.playerName,
            position: pick.position,
            vibe: pick.vibe,
            owner: 'Split',
            totalPoints: 0,
            gamesPicked: 0,
            pickedByAaron: 0,
            pickedByJulie: 0,
            winsWhenPicked: 0,
            recordWhenPicked: '0-0',
            bestGame: null,
            clutch: 'Quietly clutch'
          };

          existing.totalPoints += Number(pick.points || 0);
          existing.gamesPicked += 1;
          if (side === 'Aaron') existing.pickedByAaron += 1;
          if (side === 'Julie') existing.pickedByJulie += 1;
          if (game.winner === side) existing.winsWhenPicked += 1;
          if (!existing.bestGame || Number(pick.points || 0) > Number(existing.bestGame.points || 0)) {
            existing.bestGame = { title: game.title, points: Number(pick.points || 0) };
          }

          existing.owner = existing.pickedByAaron === existing.pickedByJulie
            ? 'Split'
            : existing.pickedByAaron > existing.pickedByJulie ? 'Aaron' : 'Julie';

          existing.recordWhenPicked = `${existing.winsWhenPicked}-${Math.max(0, existing.gamesPicked - existing.winsWhenPicked)}`;
          existing.clutch = existing.totalPoints >= 10 ? 'Season-shaping chaos' : existing.totalPoints >= 6 ? 'Reliable momentum piece' : 'Quietly clutch';
          byPlayer.set(pick.playerName, existing);
        });
      });
    });

    return Array.from(byPlayer.values()).sort((a, b) => b.totalPoints - a.totalPoints || b.gamesPicked - a.gamesPicked).slice(0, 3);
  }

  function buildRecentTen(selectedGames) {
    return selectedGames.slice(0, 10);
  }

  function buildAllTimeBoard(model) {
    const bySeason = model.seasons || [];
    let aaron = 0;
    let julie = 0;

    bySeason.forEach((season) => {
      const games = model.seasonGames?.[season.id] || [];
      const totals = seasonTotals(season, games);
      aaron += totals.aaron;
      julie += totals.julie;
    });

    const lead = aaron === julie
      ? 'Rivalry tied all-time'
      : aaron > julie
        ? `Aaron leads the rivalry by ${aaron - julie}`
        : `Julie leads the rivalry by ${julie - aaron}`;

    return { aaron, julie, lead, totalGames: model.games?.length || 0 };
  }

  function buildHighlights(games) {
    const ordered = games.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
    let longest = { owner: '—', count: 0 };
    let current = { owner: '', count: 0 };
    let biggestBlowout = null;
    const firstGoalCounts = new Map();

    ordered.forEach((game) => {
      if (game.winner !== 'Tie') {
        if (current.owner === game.winner) current.count += 1;
        else current = { owner: game.winner, count: 1 };
        if (current.count > longest.count) longest = { ...current };
      }

      const margin = Number(game.margin || Math.abs(Number(game.aaronScore || 0) - Number(game.julieScore || 0)));
      if (hasRealScore(game) && (!biggestBlowout || margin > biggestBlowout.margin)) {
        biggestBlowout = { owner: game.winner, margin, title: game.title };
      }

      const scorer = firstGoalScorer(game);
      if (scorer && scorer !== '—') firstGoalCounts.set(scorer, (firstGoalCounts.get(scorer) || 0) + 1);
    });

    const firstGoalKing = Array.from(firstGoalCounts.entries()).sort((a, b) => b[1] - a[1])[0] || ['—', 0];
    const latest = ordered.filter(hasRealScore).slice(-1)[0];
    const heater = !latest || latest.winner === 'Tie'
      ? { title: 'No current heater', copy: 'Nobody owns momentum right now.' }
      : { title: `${latest.winner} heater`, copy: `${latest.winner} took the latest scored result and is holding momentum.` };

    return {
      heater,
      cards: [
        { label: 'Longest streak', value: `${longest.owner} W${longest.count}`, copy: 'The longest run from completed game data.' },
        { label: 'Biggest blowout', value: `${biggestBlowout?.owner || '—'} +${biggestBlowout?.margin || 0}`, copy: `${biggestBlowout?.title || 'No scored game yet'} had the largest margin.` },
        { label: 'First-goal king', value: firstGoalKing[0], copy: `${firstGoalKing[1]} first-goal hits logged` }
      ]
    };
  }

  function signatureNight(selectedGames) {
    if (!selectedGames.length) return 'No completed game rows yet.';

    const scoredGames = selectedGames.filter(hasRealScore).map((game) => ({
      ...game,
      marginValue: Math.abs(Number(game.aaronScore || 0) - Number(game.julieScore || 0)),
      combinedValue: Number(game.aaronScore || 0) + Number(game.julieScore || 0)
    }));

    if (!scoredGames.length) {
      return 'Completed game rows exist, but no scored results are available yet.';
    }

    const biggest = scoredGames.slice().sort((a, b) => b.marginValue - a.marginValue)[0];
    const wildest = scoredGames.slice().sort((a, b) => b.combinedValue - a.combinedValue)[0];
    const playoff = scoredGames.find((game) => game.playoff);

    if (playoff) return `${playoff.title}: playoff result with scoring logged (${playoff.aaronScore}-${playoff.julieScore}).`;
    if (biggest && biggest.marginValue >= 3) return `${biggest.title}: biggest margin (${biggest.winner} +${biggest.marginValue}).`;
    if (wildest) return `${wildest.title}: highest combined score (${wildest.combinedValue} pts).`;
    return `${scoredGames[0].title}: latest scored result.`;
  }

  function buildSeasonBoard(selectedSeason, selectedGames, selectedSummary) {
    const totals = seasonTotals(selectedSeason, selectedGames);
    const recent = buildRecentTen(selectedGames.filter(hasRealScore));
    const recentWins = recent.reduce((acc, game) => {
      if (game.winner === 'Aaron') acc.aaron += 1;
      if (game.winner === 'Julie') acc.julie += 1;
      if (game.winner === 'Tie') acc.tie += 1;
      return acc;
    }, { aaron: 0, julie: 0, tie: 0 });

    const recentText = recent.length
      ? `Last ${recent.length}: Aaron ${recentWins.aaron} • Julie ${recentWins.julie}${recentWins.tie ? ` • Tie ${recentWins.tie}` : ''}`
      : 'No scored game rows yet';

    return {
      ...totals,
      seasonLabel: selectedSeason?.label || 'Season',
      recordText: selectedSummary?.recordText || '—',
      playoffText: selectedSummary?.playoffText || '—',
      bestGameTitle: signatureNight(selectedGames),
      recentText
    };
  }

  function buildGameLog(selectedGames) {
    return selectedGames.map((game, index) => ({
      ...game,
      displayNumber: selectedGames.length - index,
      subtitle: gameSubtitle(game),
      firstGoalScorer: firstGoalScorer(game)
    }));
  }

  function buildMomentum(selectedGames) {
    return buildRecentTen(selectedGames.filter(hasRealScore)).map((game) => ({
      id: game.id,
      winner: game.winner,
      playoff: game.playoff,
      shortLabel: game.playoff ? 'P' : 'R'
    }));
  }

  function buildStaticHistoryData(model) {
    return {
      allTimeBoard: buildAllTimeBoard(model),
      highlights: buildHighlights(model.games || [])
    };
  }

  function buildSeasonScopedData(model, seasonId) {
    const selectedSeason = model.seasons.find((season) => season.id === seasonId) || model.seasons[0] || null;
    const resolvedSeasonId = selectedSeason?.id || seasonId;
    const selectedGames = model.seasonGames?.[resolvedSeasonId] || [];
    const selectedSummary = model.seasonSummaries?.find((season) => season.seasonId === resolvedSeasonId) || null;
    const playerSpotlights = buildSeasonPlayerSpotlights(selectedGames.filter(hasRealScore));
    const gameLog = buildGameLog(selectedGames);

    return {
      selectedSeason,
      selectedSummary,
      selectedGames,
      seasonBoard: buildSeasonBoard(selectedSeason, selectedGames, selectedSummary),
      momentum: buildMomentum(selectedGames),
      recentGames: gameLog.filter(hasRealScore).slice(0, 4),
      gameLog,
      playerSpotlights
    };
  }

  function getScopedData(model, state) {
    const cache = CR.historyCache || (CR.historyCache = { staticData: null, seasons: {} });
    const hqSeasonId = model.currentSeasonId || state.seasonId;

    if (!cache.staticData) {
      cache.staticData = buildStaticHistoryData(model);
    }

    if (!cache.seasons[state.seasonId]) {
      cache.seasons[state.seasonId] = buildSeasonScopedData(model, state.seasonId);
    }

    if (!cache.seasons[hqSeasonId]) {
      cache.seasons[hqSeasonId] = buildSeasonScopedData(model, hqSeasonId);
    }

    return {
      ...model,
      ...cache.staticData,
      ...cache.seasons[state.seasonId],
      hqSeasonData: cache.seasons[hqSeasonId]
    };
  }

  function ensureHistoryShell(root) {
    if (CR.historyDom?.root === root) return;

    root.innerHTML = CR.historyRender.renderRootShell();
    CR.historyDom = {
      root,
      hq: root.querySelector('#historyPanelHq'),
      seasons: root.querySelector('#historyPanelSeasons'),
      allGames: root.querySelector('#historyPanelAllGames'),
      admin: root.querySelector('#historyAdminLayer')
    };
    CR.historyPanelKeys = { hq: '', seasons: '', all_games: '', admin: '' };
  }

  function syncPanelVisibility(view) {
    if (!CR.historyDom) return;
    CR.historyDom.hq.hidden = view !== 'hq';
    CR.historyDom.seasons.hidden = view !== 'seasons';
    CR.historyDom.allGames.hidden = view !== 'all_games';
  }

  function renderPanel(name, key, html, target) {
    if (CR.historyPanelKeys[name] === key) return;
    target.innerHTML = html;
    CR.historyPanelKeys[name] = key;
  }

  function lockSheetScroll() {
    if (CR.historyScrollLock?.locked) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    CR.historyScrollLock = { locked: true, scrollY };
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('history-sheet-open');
    document.documentElement.classList.add('history-sheet-open');
  }

  function unlockSheetScroll() {
    const scrollY = CR.historyScrollLock?.scrollY || 0;
    CR.historyScrollLock = { locked: false, scrollY: 0 };
    document.body.classList.remove('history-sheet-open');
    document.documentElement.classList.remove('history-sheet-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  }

  function syncSheetScrollLock() {
    const isOpen = Boolean(CR.historyState?.sheet?.open);
    if (isOpen) lockSheetScroll();
    else if (CR.historyScrollLock?.locked) unlockSheetScroll();
  }

  function renderHistoryUnavailable(message = 'History data could not be loaded.') {
    const root = document.querySelector('#historyView');
    if (!root) return;

    root.innerHTML = `
      <section class="panel-card history-hq-card">
        <div class="history-section-head">
          <div>
            <div class="eyebrow">History</div>
            <h3>Unavailable</h3>
          </div>
        </div>
        <p class="history-support-copy">${message}</p>
      </section>
    `;
  }

  function renderHistory() {
    const root = document.querySelector('#historyView');
    if (!root || !CR.historyData || !CR.historyState) return;

    ensureHistoryShell(root);

    const scoped = getScopedData(CR.historyData, CR.historyState);
    const hqKey = `${CR.historyData.currentSeasonId}`;
    const seasonKey = `${CR.historyState.seasonId}`;

    renderPanel('hq', `hq:${hqKey}`, CR.historyRender.renderHQ(scoped), CR.historyDom.hq);
    renderPanel('seasons', 'seasons:static', CR.historyRender.renderSeasonsOverview(scoped), CR.historyDom.seasons);
    renderPanel('all_games', `all_games:${seasonKey}`, CR.historyRender.renderAllGames(scoped), CR.historyDom.allGames);

    const sheetState = CR.historyState.sheet?.open
      ? `${CR.historyState.sheet.title}|${CR.historyState.sheet.message}|${CR.historyState.sheet.primaryAction}`
      : 'closed';
    renderPanel('admin', `admin:${sheetState}`, CR.historyRender.renderAdminSheet(CR.historyState), CR.historyDom.admin);

    syncPanelVisibility(CR.historyState.view);
    syncSheetScrollLock();

    if (!CR.historyEventsBound) {
      CR.historyEvents.bindHistoryEvents();
      CR.historyEventsBound = true;
    }
  }

  async function initHistory() {
    try {
      const source = await CR.historyDataService.fetchHistoryData();

      CR.historyData = CR.historyModel.build(source);
      CR.historyCache = { staticData: null, seasons: {} };
      CR.historyDom = null;
      CR.historyEventsBound = false;
      CR.historyPanelKeys = { hq: '', seasons: '', all_games: '', admin: '' };
      CR.historyScrollLock = { locked: false, scrollY: 0 };
      CR.historyState = {
        seasonId: CR.historyData.currentSeasonId,
        view: 'hq',
        previousView: 'hq',
        returnView: 'hq',
        sheet: { open: false }
      };

      renderHistory();
    } catch (error) {
      console.error('History load failed', error);
      renderHistoryUnavailable('Real rivalry history is currently unavailable. Check Supabase access or schema mapping.');
    }
  }

  CR.initHistory = initHistory;
  CR.renderHistory = renderHistory;
})();