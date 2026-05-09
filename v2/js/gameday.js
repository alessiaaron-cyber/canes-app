window.CR = window.CR || {};

window.CR.gameDayStates = {
  missing: {
    title: 'Missing Picks', badge: 'Needs Picks', badgeClass: 'warning',
    gameStatus: 'Pregame', statusText: 'Set picks', heroPhase: 'TONIGHT · 7:00 PM',
    subline: 'Tonight · 7:00 PM · Picks open', score: ['0', '0'], rivalry: ['0', '0'],
    picksTitle: 'Draft Your Rivalry Squad', picksBadge: '1 Missing', picksBadgeClass: 'warning',
    picksNote: 'Julie still needs one pick.', mode: 'editable', latest: 'Waiting on final pick',
    impact: 'No rivalry points yet', winner: null, swingDelta: 0, swingVariant: 'neutral',
    momentumText: 'Even', heroEventTitle: 'One more pick needed', heroEventMeta: 'Locks at puck drop',
    feedTitle: 'Rivalry Notes', feed: [
      { icon: '⏳', time: 'Pregame', title: 'Aaron is set', text: '2 of 2 selected', score: '' },
      { icon: '⚠️', time: 'Pregame', title: 'Julie needs one more', text: 'Still editable', score: '' }
    ],
    users: { Aaron: ['Sebastian Aho', 'Andrei Svechnikov'], Julie: ['Seth Jarvis', ''] }
  },
  pregame: {
    title: 'Pregame Ready', badge: 'Editable', badgeClass: 'calm',
    gameStatus: 'Pregame', statusText: 'Ready', heroPhase: 'TONIGHT · 7:00 PM',
    subline: 'Tonight · 7:00 PM · Picks ready', score: ['0', '0'], rivalry: ['0', '0'],
    picksTitle: 'Draft Your Rivalry Squad', picksBadge: 'Editable', picksBadgeClass: 'calm',
    picksNote: '2 Canes each · no duplicates.', mode: 'editable', latest: 'Picks are locked in',
    impact: 'Waiting for puck drop', winner: null, swingDelta: 0, swingVariant: 'neutral',
    momentumText: 'Even', heroEventTitle: 'Rivalry ready', heroEventMeta: 'Puck drop next',
    feedTitle: 'Rivalry Notes', feed: [
      { icon: '✅', time: 'Pregame', title: 'Picks submitted', text: 'Aaron and Julie are in', score: '' },
      { icon: '🚫', time: 'Pregame', title: 'No duplicate players', text: 'Board is clean', score: '' }
    ],
    users: { Aaron: ['Sebastian Aho', 'Andrei Svechnikov'], Julie: ['Seth Jarvis', 'Jaccob Slavin'] }
  },
  live: {
    title: 'Live Game', badge: 'Live', badgeClass: 'live',
    gameStatus: 'Live', statusText: 'Synced', heroPhase: '2ND · 7:42',
    subline: '2nd Period · CAR 2-1', score: ['2', '1'], rivalry: ['4', '3'],
    picksTitle: 'Tonight’s Picks', picksBadge: 'Live', picksBadgeClass: 'live',
    picksNote: 'Live stats update instantly.', mode: 'locked', latest: 'Aho puts Aaron ahead',
    impact: 'Aaron leads 4-3', winner: 'Aaron', swingDelta: 1, swingVariant: 'away',
    momentumText: 'Aaron edge', heroEventTitle: 'Aho puts Aaron ahead', heroEventMeta: '7:42 · 2nd',
    feedTitle: 'Rivalry Feed', feed: [
      { icon: '🚨', time: '7:42 2nd', title: 'Aho goal', text: 'Aaron jumps ahead', score: '4-3', featured: true },
      { icon: '🍎', time: '6:15 2nd', title: 'Jarvis assist', text: 'Julie cuts it close', score: '3-3' },
      { icon: '📈', time: '4:02 2nd', title: 'Momentum shift', text: 'Aaron taking control', score: '' },
      { icon: '👀', time: '1:18 1st', title: 'Svechnikov point', text: 'Early swing for Aaron', score: '1-0' }
    ],
    users: { Aaron: [{ player: 'Sebastian Aho', pos: 'C', proj: '+3.2', g: 1, a: 0, first: true, pts: 3 }, { player: 'Andrei Svechnikov', pos: 'RW', proj: '+2.1', g: 0, a: 1, first: false, pts: 1 }], Julie: [{ player: 'Seth Jarvis', pos: 'RW', proj: '+2.0', g: 0, a: 1, first: false, pts: 2 }, { player: 'Jaccob Slavin', pos: 'D', proj: '+1.2', g: 0, a: 1, first: false, pts: 1 }] }
  },
  final: {
    title: 'Final Result', badge: 'Final', badgeClass: 'dark',
    gameStatus: 'Final', statusText: 'Complete', heroPhase: 'FINAL',
    subline: 'Final · Hurricanes win 3-2', score: ['3', '2'], rivalry: ['5', '2'],
    picksTitle: 'Final Picks', picksBadge: 'Aaron Wins', picksBadgeClass: 'dark',
    picksNote: 'Aho’s first goal made the difference.', mode: 'locked', latest: 'Aaron wins the night',
    impact: 'Final rivalry score 5-2', winner: 'Aaron', swingDelta: 3, swingVariant: 'away',
    momentumText: 'Aaron wins', heroEventTitle: 'Aaron wins the night', heroEventMeta: 'Aho first goal sealed it',
    feedTitle: 'Rivalry Recap', feed: [
      { icon: '🏁', time: 'Final', title: 'Aaron wins', text: 'Final rivalry score 5-2', score: '5-2', featured: true },
      { icon: '🚨', time: '2nd', title: 'Aho scores first', text: 'Bonus swing', score: '3-0' },
      { icon: '🍎', time: '2nd', title: 'Jarvis assist', text: 'Julie stays close', score: '3-1' },
      { icon: '🥅', time: '3rd', title: 'Empty-net finish', text: 'Aaron seals it', score: '5-2' }
    ],
    users: { Aaron: [{ player: 'Sebastian Aho', pos: 'C', proj: '+3.2', g: 1, a: 1, first: true, pts: 4 }, { player: 'Andrei Svechnikov', pos: 'RW', proj: '+2.1', g: 0, a: 1, first: false, pts: 1 }], Julie: [{ player: 'Seth Jarvis', pos: 'RW', proj: '+2.0', g: 1, a: 0, first: false, pts: 2 }, { player: 'Jaccob Slavin', pos: 'D', proj: '+1.2', g: 0, a: 0, first: false, pts: 0 }] }
  }
};

window.CR.roster = [
  { name: 'Sebastian Aho', pos: 'C', proj: '+3.2' },
  { name: 'Andrei Svechnikov', pos: 'RW', proj: '+2.1' },
  { name: 'Seth Jarvis', pos: 'RW', proj: '+2.0' },
  { name: 'Jaccob Slavin', pos: 'D', proj: '+1.2' },
  { name: 'Jordan Staal', pos: 'C', proj: '+1.6' },
  { name: 'Jesperi Kotkaniemi', pos: 'C', proj: '+0.8' },
  { name: 'Brent Burns', pos: 'D', proj: '+1.0' }
];
window.CR.currentGameDayMode = 'pregame';

window.CR.renderEditableOwner = (userName, picks) => {
  const isAaron = userName === 'Aaron';
  const ownerClass = isAaron ? 'owner-aaron' : 'owner-julie';
  const rows = [0, 1].map((index) => {
    const current = picks[index] || '';
    const rosterEntry = window.CR.roster.find((p) => p.name === current) || window.CR.roster[index + (isAaron ? 0 : 2)] || window.CR.roster[0];
    return `<div class="pick-row-item"><div class="pick-player-icon ${current ? 'active' : ''}">${current ? (index + 1) : '+'}</div><div class="pick-main"><strong>${current || rosterEntry.name}</strong><span>${rosterEntry.pos}</span></div><div class="pick-side-meta"><em>Proj</em><b>${rosterEntry.proj}</b><span class="pick-add-btn">+</span></div></div>`;
  }).join('');
  return `<div class="pick-owner-card ${ownerClass}"><div class="pick-owner-head"><span>${userName}</span><span class="pick-owner-count">${picks.filter(Boolean).length}/2</span></div><div class="pick-owner-list">${rows}</div><div class="pick-owner-footer"><span>${isAaron ? 'Rivalry side A' : 'Rivalry side B'}</span><span>${picks.filter(Boolean).length}/2 picks</span></div></div>`;
};

window.CR.renderLockedOwner = (userName, picks) => {
  const isAaron = userName === 'Aaron';
  const ownerClass = isAaron ? 'owner-aaron' : 'owner-julie';
  const total = picks.reduce((sum, pick) => sum + pick.pts, 0);
  const rows = picks.map((pick) => `<div class="pick-row-item"><div class="pick-player-icon active">${pick.pts > 0 ? '+' : '•'}</div><div class="pick-main"><strong>${pick.player}</strong><span>${pick.pos || ''}</span></div><div class="pick-side-meta"><em>${pick.g}G · ${pick.a}A</em><b>+${pick.pts}</b></div></div>`).join('');
  return `<div class="pick-owner-card ${ownerClass}"><div class="pick-owner-head"><span>${userName}</span><span class="pick-owner-count">${total} pts</span></div><div class="pick-owner-list">${rows}</div><div class="pick-owner-footer"><span>${userName}</span><span>Total +${total}</span></div></div>`;
};

window.CR.renderPicks = (state) => {
  const picksContent = window.CR.$('#picksContent');
  if (!picksContent) return;
  picksContent.innerHTML = Object.entries(state.users).map(([userName, picks]) => state.mode === 'editable' ? window.CR.renderEditableOwner(userName, picks) : window.CR.renderLockedOwner(userName, picks)).join('');
};

window.CR.renderMoments = (items) => {
  const feed = window.CR.$('#momentsFeed');
  if (!feed) return;
  feed.innerHTML = (items || []).map((item) => `<div class="feed-row ${item.featured ? 'featured' : ''}"><div class="feed-row-icon">${item.icon || '•'}</div><div class="feed-row-body"><div class="feed-row-top"><span>${item.time || ''}</span></div><strong>${item.title || ''}</strong><span>${item.text || ''}</span></div><div class="feed-row-score">${item.score || ''}</div></div>`).join('');
};

window.CR.renderSwing = (state) => {
  const module = window.CR.$('.rivalry-swing-module');
  const fill = window.CR.$('#swingFill');
  const marker = window.CR.$('#swingMarker');
  const momentumText = window.CR.$('#momentumText');
  if (!module || !fill || !marker) return;
  const delta = Number(state.swingDelta || 0);
  const percent = 50 + (delta * 10);
  const clampedPercent = Math.max(12, Math.min(88, percent));
  module.dataset.variant = state.swingVariant || 'neutral';
  fill.style.width = '0%';
  fill.style.left = '50%';
  marker.style.left = `${clampedPercent}%`;
  if (momentumText) momentumText.textContent = state.momentumText || 'Even';
};

window.CR.renderGameDayState = (mode) => {
  const state = window.CR.gameDayStates[mode] || window.CR.gameDayStates.pregame;
  window.CR.currentGameDayMode = mode;
  const view = window.CR.$('#gameDayView');
  if (view) view.dataset.mode = mode;
  window.CR.setText(window.CR.$('#stateTitle'), state.title);
  window.CR.setBadge(window.CR.$('#stateBadge'), state.badge, state.badgeClass);
  window.CR.setText(window.CR.$('#gameStatusPill'), state.gameStatus);
  window.CR.setText(window.CR.$('#heroPhase'), state.heroPhase || state.gameStatus);
  window.CR.setText(window.CR.$('#statusText'), state.statusText);
  window.CR.setText(window.CR.$('#gameSubline'), state.subline);
  window.CR.setText(window.CR.$('#canesScore'), state.score[0]);
  window.CR.setText(window.CR.$('#oppScore'), state.score[1]);
  window.CR.setText(window.CR.$('#aaronRivalryScore'), state.rivalry[0]);
  window.CR.setText(window.CR.$('#julieRivalryScore'), state.rivalry[1]);
  window.CR.setText(window.CR.$('#heroEventTitle'), state.heroEventTitle || state.latest);
  window.CR.setText(window.CR.$('#heroEventMeta'), state.heroEventMeta || state.impact);
  window.CR.setText(window.CR.$('#picksEyebrow'), state.mode === 'editable' ? 'Draft board' : 'Tonight’s picks');
  window.CR.setText(window.CR.$('#picksTitle'), state.picksTitle);
  window.CR.setBadge(window.CR.$('#picksBadge'), state.picksBadge, state.picksBadgeClass);
  window.CR.setText(window.CR.$('#picksNote'), state.picksNote);
  window.CR.setText(window.CR.$('#latestEvent'), state.latest);
  window.CR.setText(window.CR.$('#eventImpact'), state.impact);
  window.CR.setText(window.CR.$('#feedTitle'), state.feedTitle || 'Rivalry Feed');
  window.CR.setText(window.CR.$('#pulseBadge'), state.mode === 'editable' ? 'Preview' : state.gameStatus);
  const eventControls = window.CR.$('#eventControls');
  if (eventControls) eventControls.style.display = mode === 'live' ? 'grid' : 'none';
  window.CR.renderSwing(state);
  window.CR.renderPicks(state);
  window.CR.renderMoments(state.feed);
  window.CR.$('#stateSwitcher')?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
};

window.CR.addMoment = (message) => {
  const feed = window.CR.$('#momentsFeed');
  if (!feed) return;
  const row = document.createElement('div');
  row.className = 'feed-row featured new-moment';
  row.innerHTML = `<div class="feed-row-icon">🔥</div><div class="feed-row-body"><div class="feed-row-top"><span>Now</span></div><strong>${message}</strong><span>Live rivalry update</span></div><div class="feed-row-score"></div>`;
  feed.prepend(row);
};

window.CR.runAaronScoreSwing = () => {
  if (window.CR.currentGameDayMode === 'missing' || window.CR.currentGameDayMode === 'pregame') window.CR.renderGameDayState('live');
  window.CR.flashSync();
  window.CR.addMoment('Aaron swing lands');
  window.CR.showToast('Aaron swing · +3');
};

window.CR.runJulieAssist = () => {
  if (window.CR.currentGameDayMode === 'missing' || window.CR.currentGameDayMode === 'pregame') {
    const custom = JSON.parse(JSON.stringify(window.CR.gameDayStates.live));
    custom.rivalry = ['3', '4'];
    custom.winner = 'Julie';
    custom.swingDelta = -1;
    custom.swingVariant = 'home';
    custom.momentumText = 'Julie edge';
    custom.latest = 'Jarvis keeps Julie ahead';
    custom.impact = 'Julie leads 4-3';
    custom.heroEventTitle = 'Jarvis keeps Julie ahead';
    custom.heroEventMeta = '6:15 · 2nd';
    custom.feed[0] = { icon: '🍎', time: '6:15 2nd', title: 'Jarvis assist', text: 'Julie moves ahead', score: '3-4', featured: true };
    window.CR.gameDayStates.temp_home_swing = custom;
    window.CR.renderGameDayState('temp_home_swing');
  }
  window.CR.flashSync();
  window.CR.addMoment('Julie answer keeps it tight');
  window.CR.showToast('Julie assist · +1');
};

window.CR.initGameDay = () => {
  window.CR.$('#stateSwitcher')?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-mode]');
    if (button) window.CR.renderGameDayState(button.dataset.mode);
  });
  window.CR.$('#refreshButton')?.addEventListener('click', () => { window.CR.flashSync(); window.CR.showToast('Mock realtime refresh complete'); });
  window.CR.$('#simulateAaronGoal')?.addEventListener('click', window.CR.runAaronScoreSwing);
  window.CR.$('#simulateJulieAssist')?.addEventListener('click', window.CR.runJulieAssist);
  window.CR.renderGameDayState('pregame');
};
