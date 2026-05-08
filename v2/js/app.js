const $ = (selector) => document.querySelector(selector);
const setText = (element, value) => {
  if (element) element.textContent = value;
};
const setLiveStatus = (element, value) => {
  if (!element) return;
  element.innerHTML = `<span aria-hidden="true"></span>${value}`;
};

const feed = $('#momentsFeed');
const toast = $('#toast');
const toastButton = $('#toastButton');
const refreshButton = $('#refreshButton');
const syncFlash = $('#syncFlash');
const stateSwitcher = $('#stateSwitcher');
const picksContent = $('#picksContent');
const picksTitle = $('#picksTitle');
const picksBadge = $('#picksBadge');
const picksEyebrow = $('#picksEyebrow');
const picksNote = $('#picksNote');
const stateTitle = $('#stateTitle');
const stateBadge = $('#stateBadge');
const gameStatusPill = $('#gameStatusPill');
const statusText = $('#statusText');
const gameSubline = $('#gameSubline');
const canesScore = $('#canesScore');
const oppScore = $('#oppScore');
const aaronRivalryScore = $('#aaronRivalryScore');
const julieRivalryScore = $('#julieRivalryScore');
const latestEvent = $('#latestEvent');
const eventImpact = $('#eventImpact');
const pulseBadge = $('#pulseBadge');
const eventControls = $('#eventControls');
const picksModule = $('#picksModule');
const bottomNav = $('#bottomNav');
const pageTitle = $('#pageTitle');

const states = {
  missing: {
    title: 'Missing Picks', badge: 'Needs Picks', badgeClass: 'warning', gameStatus: 'Pregame', statusText: 'Needs picks', subline: 'Tonight · 7:00 PM · Picks still open', score: ['0', '0'], rivalry: ['0', '0'], picksTitle: 'Make Your Picks', picksBadge: '1 Missing', picksBadgeClass: 'warning', picksNote: 'Julie needs one more pick before this locks.', mode: 'editable', latest: 'Waiting for Julie’s second pick', impact: 'No rivalry points yet', winner: null, moments: ['⏳ Aaron is ready with 2/2 picks', '⚠️ Julie needs one more pick', '🔓 Picks remain editable until scoring starts'], users: { Aaron: ['Sebastian Aho', 'Andrei Svechnikov'], Julie: ['Seth Jarvis', ''] }
  },
  pregame: {
    title: 'Pregame Ready', badge: 'Editable', badgeClass: 'calm', gameStatus: 'Pregame', statusText: 'Ready', subline: 'Tonight · 7:00 PM · Picks ready', score: ['0', '0'], rivalry: ['0', '0'], picksTitle: 'Make Your Picks', picksBadge: 'Editable', picksBadgeClass: 'calm', picksNote: '2 Canes each · no duplicates · locks when scoring starts.', mode: 'editable', latest: 'Picks submitted and waiting for puck drop', impact: 'No rivalry points yet', winner: null, moments: ['✅ Aaron submitted 2/2 picks', '✅ Julie submitted 2/2 picks', '🚫 No overlapping players'], users: { Aaron: ['Sebastian Aho', 'Andrei Svechnikov'], Julie: ['Seth Jarvis', 'Jaccob Slavin'] }
  },
  live: {
    title: 'Live Game', badge: 'Locked', badgeClass: 'live', gameStatus: 'Live', statusText: 'Live sync', subline: '2nd Period · CAR leads 2-1', score: ['2', '1'], rivalry: ['4', '1'], picksTitle: 'Picks With Stats', picksBadge: 'Locked', picksBadgeClass: 'live', picksNote: 'Goals, assists, and first-goal bonus update live.', mode: 'locked', latest: 'Svechnikov assist', impact: 'Aaron +1 · lead grows to 4-1 tonight', winner: null, moments: ['🚨 Sebastian Aho scored first — Aaron +3', '🍎 Andrei Svechnikov assist — Aaron +1', '🍎 Seth Jarvis assist — Julie +1'], users: { Aaron: [{ player: 'Sebastian Aho', g: 1, a: 0, first: true, pts: 3 }, { player: 'Andrei Svechnikov', g: 0, a: 1, first: false, pts: 1 }], Julie: [{ player: 'Seth Jarvis', g: 0, a: 1, first: false, pts: 1 }, { player: 'Jaccob Slavin', g: 0, a: 0, first: false, pts: 0 }] }
  },
  final: {
    title: 'Final Result', badge: 'Final', badgeClass: 'dark', gameStatus: 'Final', statusText: 'Complete', subline: 'Final · Hurricanes win 3-2', score: ['3', '2'], rivalry: ['5', '2'], picksTitle: 'Final Picks Score', picksBadge: 'Away Wins', picksBadgeClass: 'dark', picksNote: 'Final scoring locked. Away wins this game by 3 points.', mode: 'locked', latest: 'Away wins the night', impact: 'Final rivalry score: Away 5, Home 2', winner: 'Aaron', moments: ['🏁 Final: Away wins 5-2', '⭐ First-goal bonus made the difference', '📈 Rivalry edge grows'], users: { Aaron: [{ player: 'Sebastian Aho', g: 1, a: 1, first: true, pts: 4 }, { player: 'Andrei Svechnikov', g: 0, a: 1, first: false, pts: 1 }], Julie: [{ player: 'Seth Jarvis', g: 1, a: 0, first: false, pts: 2 }, { player: 'Jaccob Slavin', g: 0, a: 0, first: false, pts: 0 }] }
  }
};

const roster = ['Sebastian Aho', 'Andrei Svechnikov', 'Seth Jarvis', 'Jaccob Slavin', 'Martin Necas', 'Jordan Staal', 'Brent Burns'];
let currentMode = 'pregame';

function installPreviewBranding() {
  return;
}

function setBadge(element, text, variant) {
  if (!element) return;
  element.textContent = text;
  element.className = `panel-tag ${variant || ''}`.trim();
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function flashSync() {
  syncFlash?.classList.remove('show');
  void syncFlash?.offsetWidth;
  syncFlash?.classList.add('show');
  setTimeout(() => syncFlash?.classList.remove('show'), 720);
}

function switchTab(tabName) {
  const targetTab = tabName === 'history' ? 'history' : 'gameday';
  document.querySelectorAll('.app-view').forEach((view) => {
    view.classList.toggle('active-view', view.dataset.view === targetTab);
  });
  bottomNav?.querySelectorAll('button[data-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === targetTab);
  });
  setText(pageTitle, targetTab === 'history' ? 'History' : 'Game Day');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getUserCardClass(userName, state, picks) {
  const base = userName === 'Aaron' ? 'aaron-owner' : 'julie-owner';
  const missing = state.mode === 'editable' && picks.some((pick) => !pick) ? 'needs-attention-card' : '';
  const winner = state.winner === userName ? 'winner-card' : '';
  return `${base} ${missing} ${winner}`.trim();
}

function renderEditablePick(userName, picks, taken, state) {
  const displayName = userName === 'Aaron' ? 'Away' : 'Home';
  const rows = [0, 1].map((index) => {
    const current = picks[index] || '';
    const options = roster.map((player) => {
      const owner = Object.entries(taken).find(([, players]) => players.includes(player))?.[0];
      const disabled = owner && owner !== userName;
      const label = disabled ? `${player} — ${owner === 'Aaron' ? 'Away' : 'Home'}` : player;
      return `<option ${player === current ? 'selected' : ''} ${disabled ? 'disabled' : ''}>${label}</option>`;
    }).join('');
    const label = current ? `Pick ${index + 1}` : 'Missing';
    return `<label class="pick-select-row ${!current ? 'missing-pick-row' : ''}"><span>${label}</span><select aria-label="${displayName} pick ${index + 1}"><option value="">Choose player</option>${options}</select></label>`;
  }).join('');
  const readyCount = picks.filter(Boolean).length;
  return `<div class="single-user-card ${getUserCardClass(userName, state, picks)}"><div class="single-user-head"><div><strong>${displayName}</strong><span>${readyCount}/2 selected</span></div><span class="pick-lock-pill ${readyCount < 2 ? 'warning-pill' : ''}">${readyCount < 2 ? 'Needs pick' : 'Ready'}</span></div>${rows}</div>`;
}

function renderLockedPick(userName, picks, state) {
  const displayName = userName === 'Aaron' ? 'Away' : 'Home';
  const total = picks.reduce((sum, pick) => sum + pick.pts, 0);
  const rows = picks.map((pick) => {
    const tags = [`${pick.g} G`, `${pick.a} A`];
    if (pick.first) tags.push('1st goal');
    return `<article class="locked-pick-row ${pick.pts > 0 ? 'active-pick' : ''}" data-player="${pick.player}"><div class="locked-pick-main"><strong>${pick.player}</strong><span>${tags.join(' · ')}</span></div><span class="pick-points" aria-label="${pick.pts} points"><span>+${pick.pts}</span></span></article>`;
  }).join('');
  const winnerBadge = state.winner === userName ? '<span class="winner-chip">Winner</span>' : '';
  return `<div class="single-user-card ${getUserCardClass(userName, state, [])}"><div class="single-user-head"><div><strong>${displayName}</strong><span>${picks.length}/2 locked</span></div><div class="score-stack">${winnerBadge}<span class="owner-score">+${total}</span></div></div>${rows}</div>`;
}

function renderPicks(state) {
  if (!picksContent) return;
  picksContent.innerHTML = Object.entries(state.users)
    .map(([userName, picks]) => state.mode === 'editable' ? renderEditablePick(userName, picks, state.users, state) : renderLockedPick(userName, picks, state))
    .join('');
}

function renderMoments(items) {
  if (!feed) return;
  feed.innerHTML = items.map((item, index) => `<div class="moment-item ${index === 0 ? 'featured-moment' : ''}">${item}</div>`).join('');
}

function renderState(mode) {
  const state = states[mode] || states.pregame;
  currentMode = mode;
  picksModule?.setAttribute('data-mode', state.mode);
  picksModule?.setAttribute('data-state', mode);
  setText(stateTitle, state.title);
  setBadge(stateBadge, state.badge, state.badgeClass);
  setText(gameStatusPill, state.gameStatus);
  setLiveStatus(statusText, state.statusText);
  setText(gameSubline, state.subline);
  setText(canesScore, state.score[0]);
  setText(oppScore, state.score[1]);
  setText(aaronRivalryScore, state.rivalry[0]);
  setText(julieRivalryScore, state.rivalry[1]);
  setText(picksEyebrow, state.mode === 'editable' ? 'Game picks' : 'Locked picks');
  setText(picksTitle, state.picksTitle);
  setBadge(picksBadge, state.picksBadge, state.picksBadgeClass);
  setText(picksNote, state.picksNote);
  setText(latestEvent, state.latest);
  setText(eventImpact, state.impact);
  setText(pulseBadge, state.mode === 'editable' ? 'Preview' : state.gameStatus);
  if (eventControls) eventControls.style.display = state.mode === 'editable' ? 'none' : 'grid';
  renderPicks(state);
  renderMoments(state.moments);
  stateSwitcher?.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
}

function addMoment(message) {
  if (!feed) return;
  const row = document.createElement('div');
  row.className = 'moment-item new-moment featured-moment';
  row.textContent = message;
  feed.prepend(row);
}

function runAaronScoreSwing() {
  if (currentMode === 'missing' || currentMode === 'pregame') renderState('live');
  flashSync();
  addMoment('🔥 Away swing: scoring bump lands');
  document.querySelector('[data-player="Sebastian Aho"]')?.classList.add('pick-hit');
  showToast('Away swing · +3');
}

function runJulieAssist() {
  if (currentMode === 'missing' || currentMode === 'pregame') renderState('live');
  flashSync();
  addMoment('👀 Home answer: rivalry stays alive');
  document.querySelector('[data-player="Seth Jarvis"]')?.classList.add('pick-hit');
  showToast('Home assist · +1');
}

stateSwitcher?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-mode]');
  if (button) renderState(button.dataset.mode);
});

bottomNav?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-tab]');
  if (!button) return;
  if (button.dataset.tab === 'manage') {
    showToast('Manage tab coming next');
    return;
  }
  switchTab(button.dataset.tab);
});

toastButton?.addEventListener('click', runAaronScoreSwing);
refreshButton?.addEventListener('click', () => { flashSync(); showToast('Mock realtime refresh complete'); });
$('#simulateAaronGoal')?.addEventListener('click', runAaronScoreSwing);
$('#simulateJulieAssist')?.addEventListener('click', runJulieAssist);

try {
  installPreviewBranding();
  renderState('pregame');
  switchTab('gameday');
} catch (error) {
  console.error('V2 render failed', error);
  document.body.insertAdjacentHTML('afterbegin', '<div style="padding:16px;background:#fee;color:#900;font-weight:800">V2 preview render failed. Check console.</div>');
}