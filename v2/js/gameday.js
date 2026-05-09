window.CR = window.CR || {};

window.CR.gameDayStates = {
  missing: {
    title: 'Missing Picks', badge: 'Needs Picks', badgeClass: 'warning', gameStatus: 'Pregame', statusText: 'Needs picks', subline: 'Tonight · 7:00 PM · Picks still open', score: ['0', '0'], rivalry: ['0', '0'], picksTitle: 'Make Your Picks', picksBadge: '1 Missing', picksBadgeClass: 'warning', picksNote: 'Julie needs one more pick before this locks.', mode: 'editable', latest: 'Waiting for Julie’s second pick', impact: 'No rivalry points yet', winner: null, swingLabel: 'Picks still open', swingMeta: 'Complete both sides to start the rivalry', swingDelta: 0, swingVariant: 'neutral', moments: ['⏳ Aaron is ready with 2/2 picks', '⚠️ Julie needs one more pick', '🔓 Picks remain editable until scoring starts'], users: { Aaron: ['Sebastian Aho', 'Andrei Svechnikov'], Julie: ['Seth Jarvis', ''] }
  },
  pregame: {
    title: 'Pregame Ready', badge: 'Editable', badgeClass: 'calm', gameStatus: 'Pregame', statusText: 'Ready', subline: 'Tonight · 7:00 PM · Picks ready', score: ['0', '0'], rivalry: ['0', '0'], picksTitle: 'Make Your Picks', picksBadge: 'Editable', picksBadgeClass: 'calm', picksNote: '2 Canes each · no duplicates · locks when scoring starts.', mode: 'editable', latest: 'Picks submitted and waiting for puck drop', impact: 'No rivalry points yet', winner: null, swingLabel: 'Rivalry even', swingMeta: 'Puck drop will decide the first swing', swingDelta: 0, swingVariant: 'neutral', moments: ['✅ Aaron submitted 2/2 picks', '✅ Julie submitted 2/2 picks', '🚫 No overlapping players'], users: { Aaron: ['Sebastian Aho', 'Andrei Svechnikov'], Julie: ['Seth Jarvis', 'Jaccob Slavin'] }
  },
  live: {
    title: 'Live Game', badge: 'Locked', badgeClass: 'live', gameStatus: 'Live', statusText: 'Live sync', subline: '2nd Period · CAR leads 2-1', score: ['2', '1'], rivalry: ['4', '1'], picksTitle: 'Picks With Stats', picksBadge: 'Locked', picksBadgeClass: 'live', picksNote: 'Goals, assists, and first-goal bonus update live.', mode: 'locked', latest: 'Svechnikov assist', impact: 'Aaron +1 · lead grows to 4-1 tonight', winner: 'Aaron', swingLabel: 'Away controls the swing', swingMeta: 'Lead built on first goal bonus + assist', swingDelta: 3, swingVariant: 'away', moments: ['🚨 Sebastian Aho scored first — Aaron +3', '🍎 Andrei Svechnikov assist — Aaron +1', '🍎 Seth Jarvis assist — Julie +1'], users: { Aaron: [{ player: 'Sebastian Aho', g: 1, a: 0, first: true, pts: 3 }, { player: 'Andrei Svechnikov', g: 0, a: 1, first: false, pts: 1 }], Julie: [{ player: 'Seth Jarvis', g: 0, a: 1, first: false, pts: 1 }, { player: 'Jaccob Slavin', g: 0, a: 0, first: false, pts: 0 }] }
  },
  final: {
    title: 'Final Result', badge: 'Final', badgeClass: 'dark', gameStatus: 'Final', statusText: 'Complete', subline: 'Final · Hurricanes win 3-2', score: ['3', '2'], rivalry: ['5', '2'], picksTitle: 'Final Picks Score', picksBadge: 'Away Wins', picksBadgeClass: 'dark', picksNote: 'Final scoring locked. Away wins this game by 3 points.', mode: 'locked', latest: 'Away wins the night', impact: 'Final rivalry score: Away 5, Home 2', winner: 'Aaron', swingLabel: 'Away wins the night', swingMeta: 'Final edge held after the first-goal swing', swingDelta: 3, swingVariant: 'away', moments: ['🏁 Final: Away wins 5-2', '⭐ First-goal bonus made the difference', '📈 Rivalry edge grows'], users: { Aaron: [{ player: 'Sebastian Aho', g: 1, a: 1, first: true, pts: 4 }, { player: 'Andrei Svechnikov', g: 0, a: 1, first: false, pts: 1 }], Julie: [{ player: 'Seth Jarvis', g: 1, a: 0, first: false, pts: 2 }, { player: 'Jaccob Slavin', g: 0, a: 0, first: false, pts: 0 }] }
  }
};

window.CR.roster = ['Sebastian Aho', 'Andrei Svechnikov', 'Seth Jarvis', 'Jaccob Slavin', 'Martin Necas', 'Jordan Staal', 'Brent Burns'];
window.CR.currentGameDayMode = 'pregame';

window.CR.getUserCardClass = (userName, state, picks) => {
  const base = userName === 'Aaron' ? 'aaron-owner' : 'julie-owner';
  const missing = state.mode === 'editable' && picks.some((pick) => !pick) ? 'needs-attention-card' : '';
  const winner = state.winner === userName ? 'winner-card' : '';
  return `${base} ${missing} ${winner}`.trim();
};

window.CR.renderEditablePick = (userName, picks, taken, state) => {
  const displayName = userName === 'Aaron' ? 'Away' : 'Home';
  const rows = [0, 1].map((index) => {
    const current = picks[index] || '';
    const options = window.CR.roster.map((player) => {
      const owner = Object.entries(taken).find(([, players]) => players.includes(player))?.[0];
      const disabled = owner && owner !== userName;
      const label = disabled ? `${player} — ${owner === 'Aaron' ? 'Away' : 'Home'}` : player;
      return `<option ${player === current ? 'selected' : ''} ${disabled ? 'disabled' : ''}>${label}</option>`;
    }).join('');
    const label = current ? `Pick ${index + 1}` : 'Missing';
    return `<label class="pick-select-row ${!current ? 'missing-pick-row' : ''}"><span>${label}</span><select aria-label="${displayName} pick ${index + 1}"><option value="">Choose player</option>${options}</select></label>`;
  }).join('');
  const readyCount = picks.filter(Boolean).length;
  return `<div class="single-user-card ${window.CR.getUserCardClass(userName, state, picks)}"><div class="single-user-head"><div><strong>${displayName}</strong><span>${readyCount}/2 selected</span></div><span class="pick-lock-pill ${readyCount < 2 ? 'warning-pill' : ''}">${readyCount < 2 ? 'Needs pick' : 'Ready'}</span></div>${rows}</div>`;
};

window.CR.renderLockedPick = (userName, picks, state) => {
  const displayName = userName === 'Aaron' ? 'Away' : 'Home';
  const total = picks.reduce((sum, pick) => sum + pick.pts, 0);
  const rows = picks.map((pick) => {
    const tags = [`${pick.g} G`, `${pick.a} A`];
    if (pick.first) tags.push('1st goal');
    return `<article class="locked-pick-row ${pick.pts > 0 ? 'active-pick' : ''}" data-player="${pick.player}"><div class="locked-pick-main"><strong>${pick.player}</strong><span>${tags.join(' · ')}</span></div><span class="pick-points" aria-label="${pick.pts} points"><span>+${pick.pts}</span></span></article>`;
  }).join('');
  const winnerBadge = state.winner === userName ? '<span class="winner-chip">Winner</span>' : '';
  return `<div class="single-user-card ${window.CR.getUserCardClass(userName, state, [])}"><div class="single-user-head"><div><strong>${displayName}</strong><span>${picks.length}/2 locked</span></div><div class="score-stack">${winnerBadge}<span class="owner-score">+${total}</span></div></div>${rows}</div>`;
};

window.CR.renderPicks = (state) => {
  const picksContent = window.CR.$('#picksContent');
  if (!picksContent) return;
  picksContent.innerHTML = Object.entries(state.users)
    .map(([userName, picks]) => state.mode === 'editable' ? window.CR.renderEditablePick(userName, picks, state.users, state) : window.CR.renderLockedPick(userName, picks, state))
    .join('');
};

window.CR.renderMoments = (items) => {
  const feed = window.CR.$('#momentsFeed');
  if (!feed) return;
  feed.innerHTML = items.map((item, index) => `<div class="moment-item ${index === 0 ? 'featured-moment' : ''}">${item}</div>`).join('');
};

window.CR.renderSwing = (state) => {
  const module = window.CR.$('.rivalry-swing-module');
  const label = window.CR.$('#swingLabel');
  const meta = window.CR.$('#swingMeta');
  const fill = window.CR.$('#swingFill');
  const marker = window.CR.$('#swingMarker');
  if (!module || !label || !meta || !fill || !marker) return;

  const delta = Number(state.swingDelta || 0);
  const absDelta = Math.min(Math.abs(delta), 5);
  const percent = 50 + (delta * 10);
  const clampedPercent = Math.max(10, Math.min(90, percent));
  const fillWidth = delta === 0 ? 0 : absDelta * 10;

  label.textContent = state.swingLabel || 'Rivalry even';
  meta.textContent = state.swingMeta || 'No rivalry momentum yet';
  module.dataset.variant = state.swingVariant || 'neutral';
  module.dataset.mode = state.mode || 'editable';

  fill.style.width = `${fillWidth}%`;
  fill.style.left = delta >= 0 ? '50%' : `${50 - fillWidth}%`;
  marker.style.left = `${clampedPercent}%`;
};

window.CR.renderGameDayState = (mode) => {
  const state = window.CR.gameDayStates[mode] || window.CR.gameDayStates.pregame;
  window.CR.currentGameDayMode = mode;
  window.CR.$('#picksModule')?.setAttribute('data-mode', state.mode);
  window.CR.$('#picksModule')?.setAttribute('data-state', mode);
  window.CR.setText(window.CR.$('#stateTitle'), state.title);
  window.CR.setBadge(window.CR.$('#stateBadge'), state.badge, state.badgeClass);
  window.CR.setText(window.CR.$('#gameStatusPill'), state.gameStatus);
  window.CR.setLiveStatus(window.CR.$('#statusText'), state.statusText);
  window.CR.setText(window.CR.$('#gameSubline'), state.subline);
  window.CR.setText(window.CR.$('#canesScore'), state.score[0]);
  window.CR.setText(window.CR.$('#oppScore'), state.score[1]);
  window.CR.setText(window.CR.$('#aaronRivalryScore'), state.rivalry[0]);
  window.CR.setText(window.CR.$('#julieRivalryScore'), state.rivalry[1]);
  window.CR.setText(window.CR.$('#picksEyebrow'), state.mode === 'editable' ? 'Game picks' : 'Locked picks');
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
  window.CR.renderMoments(state.moments);
  window.CR.$('#stateSwitcher')?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
};

window.CR.addMoment = (message) => {
  const feed = window.CR.$('#momentsFeed');
  if (!feed) return;
  const row = document.createElement('div');
  row.className = 'moment-item new-moment featured-moment';
  row.textContent = message;
  feed.prepend(row);
};

window.CR.runAaronScoreSwing = () => {
  if (window.CR.currentGameDayMode === 'missing' || window.CR.currentGameDayMode === 'pregame') window.CR.renderGameDayState('live');
  window.CR.flashSync();
  window.CR.addMoment('🔥 Away swing: scoring bump lands');
  document.querySelector('[data-player="Sebastian Aho"]')?.classList.add('pick-hit');
  window.CR.showToast('Away swing · +3');
};

window.CR.runJulieAssist = () => {
  if (window.CR.currentGameDayMode === 'missing' || window.CR.currentGameDayMode === 'pregame') {
    const custom = JSON.parse(JSON.stringify(window.CR.gameDayStates.live));
    custom.rivalry = ['2', '3'];
    custom.winner = 'Julie';
    custom.swingLabel = 'Home takes the edge';
    custom.swingMeta = 'Answer swing keeps the rivalry tight';
    custom.swingDelta = -1;
    custom.swingVariant = 'home';
    custom.latest = 'Jarvis answer goal';
    custom.impact = 'Home +2 · rivalry flips 3-2';
    window.CR.gameDayStates.temp_home_swing = custom;
    window.CR.renderGameDayState('temp_home_swing');
  }
  window.CR.flashSync();
  window.CR.addMoment('👀 Home answer: rivalry stays alive');
  document.querySelector('[data-player="Seth Jarvis"]')?.classList.add('pick-hit');
  window.CR.showToast('Home assist · +1');
};

window.CR.initGameDay = () => {
  window.CR.$('#stateSwitcher')?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-mode]');
    if (button) window.CR.renderGameDayState(button.dataset.mode);
  });

  window.CR.$('#toastButton')?.addEventListener('click', window.CR.runAaronScoreSwing);
  window.CR.$('#refreshButton')?.addEventListener('click', () => { window.CR.flashSync(); window.CR.showToast('Mock realtime refresh complete'); });
  window.CR.$('#simulateAaronGoal')?.addEventListener('click', window.CR.runAaronScoreSwing);
  window.CR.$('#simulateJulieAssist')?.addEventListener('click', window.CR.runJulieAssist);
  window.CR.renderGameDayState('pregame');
};
