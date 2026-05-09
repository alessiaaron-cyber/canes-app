window.CR = window.CR || {};

window.CR.gameDayStates = {
  missing: {
    title: 'Missing Picks', badge: 'Needs Picks', badgeClass: 'warning', gameStatus: 'Pregame', statusText: 'Needs picks', heroPhase: 'TONIGHT 7:00 PM', subline: 'Tonight · 7:00 PM · Picks still open', score: ['0', '0'], rivalry: ['0', '0'], picksTitle: 'Select 2 Players Each', picksBadge: '1 Missing', picksBadgeClass: 'warning', picksNote: 'Julie needs one more pick before this locks.', mode: 'editable', latest: 'Waiting for Julie’s second pick', impact: 'No rivalry points yet', winner: null, swingDelta: 0, swingVariant: 'neutral', heroEventTitle: 'Waiting on picks', heroEventMeta: 'Need one more player before rivalry lock', feed: [
      { icon: '⏳', time: 'Pregame', title: 'Aaron is ready', text: '2 of 2 players selected', score: '' },
      { icon: '⚠️', time: 'Pregame', title: 'Julie needs one more', text: 'Picks remain editable', score: '' }
    ], users: { Aaron: ['Sebastian Aho', 'Andrei Svechnikov'], Julie: ['Seth Jarvis', ''] }
  },
  pregame: {
    title: 'Pregame Ready', badge: 'Editable', badgeClass: 'calm', gameStatus: 'Pregame', statusText: 'Ready', heroPhase: 'TONIGHT 7:00 PM', subline: 'Tonight · 7:00 PM · Picks ready', score: ['0', '0'], rivalry: ['0', '0'], picksTitle: 'Select 2 Players Each', picksBadge: 'Editable', picksBadgeClass: 'calm', picksNote: '2 Canes each · no duplicates · locks when scoring starts.', mode: 'editable', latest: 'Picks submitted and waiting for puck drop', impact: 'No rivalry points yet', winner: null, swingDelta: 0, swingVariant: 'neutral', heroEventTitle: 'Rivalry ready', heroEventMeta: 'Waiting for puck drop', feed: [
      { icon: '✅', time: 'Pregame', title: 'Picks submitted', text: 'Aaron and Julie are locked in', score: '' },
      { icon: '🚫', time: 'Pregame', title: 'No duplicate players', text: 'The rivalry board is clean', score: '' }
    ], users: { Aaron: ['Sebastian Aho', 'Andrei Svechnikov'], Julie: ['Seth Jarvis', 'Jaccob Slavin'] }
  },
  live: {
    title: 'Live Game', badge: 'Locked', badgeClass: 'live', gameStatus: 'Live', statusText: 'Synced', heroPhase: '2ND PERIOD · 7:42', subline: '2nd Period · CAR leads 2-1', score: ['2', '1'], rivalry: ['4', '3'], picksTitle: 'Your Picks', picksBadge: 'Locked', picksBadgeClass: 'live', picksNote: 'Goals, assists, and first-goal bonus update live.', mode: 'locked', latest: 'Aho goal swings Aaron ahead', impact: 'Aaron +3 · rivalry score 4-3', winner: 'Aaron', swingDelta: 1, swingVariant: 'away', heroEventTitle: 'Aho goal swings Aaron ahead', heroEventMeta: '7:42 · 2nd', feed: [
      { icon: '🚨', time: '7:42 2nd', title: 'Aho goal', text: 'Aaron +3 • 4-3', score: '4-3', featured: true },
      { icon: '🍎', time: '6:15 2nd', title: 'Jarvis assist', text: 'Julie cuts the lead to one', score: '3-3' },
      { icon: '📈', time: '4:02 2nd', title: 'Momentum shift', text: 'Aaron taking control', score: '' },
      { icon: '👀', time: '1:18 1st', title: 'Svechnikov goal', text: 'Julie takes the lead', score: '2-3' }
    ], users: { Aaron: [{ player: 'Sebastian Aho', pos: 'C', proj: '+3.2', g: 1, a: 0, first: true, pts: 3 }, { player: 'Andrei Svechnikov', pos: 'RW', proj: '+2.1', g: 0, a: 1, first: false, pts: 1 }], Julie: [{ player: 'Seth Jarvis', pos: 'RW', proj: '+2.0', g: 0, a: 1, first: false, pts: 2 }, { player: 'Jaccob Slavin', pos: 'D', proj: '+1.2', g: 0, a: 1, first: false, pts: 1 }] }
  },
  final: {
    title: 'Final Result', badge: 'Final', badgeClass: 'dark', gameStatus: 'Final', statusText: 'Complete', heroPhase: 'FINAL', subline: 'Final · Hurricanes win 3-2', score: ['3', '2'], rivalry: ['5', '2'], picksTitle: 'Final Picks', picksBadge: 'Aaron Wins', picksBadgeClass: 'dark', picksNote: 'Final scoring locked. Aaron wins by 3.', mode: 'locked', latest: 'Aaron wins the night', impact: 'Final rivalry score: 5-2', winner: 'Aaron', swingDelta: 3, swingVariant: 'away', heroEventTitle: 'Aaron wins the night', heroEventMeta: 'Aho first goal made the difference', feed: [
      { icon: '🚨', time: '7:42 2nd', title: 'Aho scores first', text: 'Aaron earns first-goal bonus', score: '3-0', featured: true },
      { icon: '🍎', time: '6:15 2nd', title: 'Jarvis assist', text: 'Julie cuts the lead', score: '3-1' },
      { icon: '📈', time: '4:02 2nd', title: 'Momentum shift', text: 'Aaron takes control', score: '4-1' },
      { icon: '🥅', time: '18:47 3rd', title: 'Empty net goal', text: 'Aaron seals it', score: '5-2' }
    ], users: { Aaron: [{ player: 'Sebastian Aho', pos: 'C', proj: '+3.2', g: 1, a: 1, first: true, pts: 4 }, { player: 'Andrei Svechnikov', pos: 'RW', proj: '+2.1', g: 0, a: 1, first: false, pts: 1 }], Julie: [{ player: 'Seth Jarvis', pos: 'RW', proj: '+2.0', g: 1, a: 0, first: false, pts: 2 }, { player: 'Jaccob Slavin', pos: 'D', proj: '+1.2', g: 0, a: 0, first: false, pts: 0 }] }
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
  return `<div class="pick-owner-card ${ownerClass}"><div class="pick-owner-head"><span>${userName}'s Picks</span><span class="pick-owner-count">${picks.filter(Boolean).length}/2</span></div><div class="pick-owner-list">${rows}</div><div class="pick-owner-footer"><span>${isAaron ? 'Aaron' : 'Julie'}</span><span>${picks.filter(Boolean).length}/2 picks</span></div></div>`;
};

window.CR.renderLockedOwner = (userName, picks) => {
  const isAaron = userName === 'Aaron';
  const ownerClass = isAaron ? 'owner-aaron' : 'owner-julie';
  const total = picks.reduce((sum, pick) => sum + pick.pts, 0);
  const rows = picks.map((pick) => `<div class="pick-row-item"><div class="pick-player-icon active">${pick.pts > 0 ? '+' : '•'}</div><div class="pick-main"><strong>${pick.player}</strong><span>${pick.pos || ''}</span></div><div class="pick-side-meta"><em>${pick.g}G · ${pick.a}A</em><b>+${pick.pts}</b></div></div>`).join('');
  return `<div class="pick-owner-card ${ownerClass}"><div class="pick-owner-head"><span>${userName}'s Picks</span><span class="pick-owner-count">${total} pts</span></div><div class="pick-owner-list">${rows}</div><div class="pick-owner-footer"><span>${userName}</span><span>Total +${total}</span></div></div>`;
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
  const leftDelta = window.CR.$('#swingDeltaLeft');
  const rightDelta = window.CR.$('#swingDeltaRight');
  if (!module || !fill || !marker) return;
  const delta = Number(state.swingDelta || 0);
  const absDelta = Math.min(Math.abs(delta), 5);
  const percent = 50 + (delta * 10);
  const clampedPercent = Math.max(10, Math.min(90, percent));
  const fillWidth = delta === 0 ? 0 : absDelta * 10;
  module.dataset.variant = state.swingVariant || 'neutral';
  fill.style.width = `${fillWidth}%`;
  fill.style.left = delta >= 0 ? '50%' : `${50 - fillWidth}%`;
  marker.style.left = `${clampedPercent}%`;
  if (leftDelta && rightDelta) {
    leftDelta.textContent = delta > 0 ? `+${delta}` : '0';
    rightDelta.textContent = delta < 0 ? `+${Math.abs(delta)}` : '0';
  }
};

window.CR.renderGameDayState = (mode) => {
  const state = window.CR.gameDayStates[mode] || window.CR.gameDayStates.pregame;
  window.CR.currentGameDayMode = mode;
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
  window.CR.setText(window.CR.$('#picksEyebrow'), state.mode === 'editable' ? 'Game picks' : 'Your picks');
  window.CR.setText(window.CR.$('#picksTitle'), state.picksTitle);
  window.CR.setBadge(window.CR.$('#picksBadge'), state.picksBadge, state.picksBadgeClass);
  window.CR.setText(window.CR.$('#picksNote'), state.picksNote);
  window.CR.setText(window.CR.$('#latestEvent'), state.latest);
  window.CR.setText(window.CR.$('#eventImpact'), state.impact);
  window.CR.setText(window.CR.$('#pulseBadge'), state.mode === 'editable' ? 'Preview' : state.gameStatus);
  const eventControls = window.CR.$('#eventControls');
  if (eventControls) eventControls.style.display = state.mode === 'editable' ? 'none' : 'grid';
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
    custom.latest = 'Jarvis assist keeps Julie ahead';
    custom.impact = 'Julie +1 · rivalry flips 4-3';
    custom.heroEventTitle = 'Jarvis assist keeps Julie ahead';
    custom.heroEventMeta = '6:15 · 2nd';
    custom.feed[0] = { icon: '🍎', time: '6:15 2nd', title: 'Jarvis assist', text: 'Julie moves ahead 4-3', score: '3-4', featured: true };
    window.CR.gameDayStates.temp_home_swing = custom;
    window.CR.renderGameDayState('temp_home_swing');
  }
  window.CR.flashSync();
  window.CR.addMoment('Julie answer keeps the rivalry alive');
  window.CR.showToast('Julie assist · +1');
};

window.CR.initGameDay = () => {
  window.CR.$('#stateSwitcher')?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-mode]');
    if (button) window.CR.renderGameDayState(button.dataset.mode);
  });
  window.CR.$('#refreshButton')?.addEventListener('click', () => { window.CR.flashSync(); window.CR.showToast('Mock realtime refresh complete'); });
  window.CR.$('#toastButton')?.addEventListener('click', window.CR.runAaronScoreSwing);
  window.CR.$('#simulateAaronGoal')?.addEventListener('click', window.CR.runAaronScoreSwing);
  window.CR.$('#simulateJulieAssist')?.addEventListener('click', window.CR.runJulieAssist);
  window.CR.renderGameDayState('pregame');
};
