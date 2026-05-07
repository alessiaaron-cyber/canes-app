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

const states = {
  missing: {
    title: 'Missing Picks', badge: 'Needs Picks', badgeClass: 'warning', gameStatus: 'Pregame', statusText: 'Needs picks', subline: 'Tonight · 7:00 PM · Picks still open', score: ['0', '0'], rivalry: ['0', '0'], picksTitle: 'Make Your Picks', picksBadge: '1 Missing', picksBadgeClass: 'warning', picksNote: 'Julie still needs one more unique Canes player before puck drop.', mode: 'editable', latest: 'Waiting for all picks', impact: 'No rivalry points yet', moments: ['⏳ Aaron has submitted 2/2 picks', '⚠️ Julie still needs one more pick', '🔓 Picks remain editable until scoring starts'], users: { Aaron: ['Sebastian Aho', 'Andrei Svechnikov'], Julie: ['Seth Jarvis', ''] }
  },
  pregame: {
    title: 'Pregame Ready', badge: 'Editable', badgeClass: 'calm', gameStatus: 'Pregame', statusText: 'Ready', subline: 'Tonight · 7:00 PM · Picks ready', score: ['0', '0'], rivalry: ['0', '0'], picksTitle: 'Make Your Picks', picksBadge: 'Editable', picksBadgeClass: 'calm', picksNote: '2 Canes each · no duplicate players · locks when scoring starts.', mode: 'editable', latest: 'Picks submitted and waiting for puck drop', impact: 'No rivalry points yet', moments: ['✅ Aaron submitted 2/2 picks', '✅ Julie submitted 2/2 picks', '🚫 No overlapping players'], users: { Aaron: ['Sebastian Aho', 'Andrei Svechnikov'], Julie: ['Seth Jarvis', 'Jaccob Slavin'] }
  },
  live: {
    title: 'Live Game', badge: 'Locked', badgeClass: 'live', gameStatus: 'Live', statusText: 'Live sync', subline: '2nd Period · CAR leads 2-1', score: ['2', '1'], rivalry: ['4', '1'], picksTitle: 'Picks With Stats', picksBadge: 'Locked', picksBadgeClass: 'live', picksNote: 'Goals, assists, and first-goal bonus update live.', mode: 'locked', latest: 'Svechnikov assist', impact: 'Aaron +1 · lead grows to 4-1 tonight', moments: ['🚨 Sebastian Aho scored first — Aaron +3', '🍎 Andrei Svechnikov assist — Aaron +1', '🍎 Seth Jarvis assist — Julie +1'], users: { Aaron: [{ player: 'Sebastian Aho', g: 1, a: 0, first: true, pts: 3 }, { player: 'Andrei Svechnikov', g: 0, a: 1, first: false, pts: 1 }], Julie: [{ player: 'Seth Jarvis', g: 0, a: 1, first: false, pts: 1 }, { player: 'Jaccob Slavin', g: 0, a: 0, first: false, pts: 0 }] }
  },
  final: {
    title: 'Final Result', badge: 'Final', badgeClass: 'dark', gameStatus: 'Final', statusText: 'Complete', subline: 'Final · Hurricanes win 3-2', score: ['3', '2'], rivalry: ['5', '2'], picksTitle: 'Final Picks Score', picksBadge: 'Aaron Wins', picksBadgeClass: 'dark', picksNote: 'Final scoring locked. Aaron wins this game by 3 points.', mode: 'locked', latest: 'Game finalized', impact: 'Aaron wins 5-2 on player picks', moments: ['🏁 Finalized: Aaron wins 5-2', '🚨 First-goal bonus mattered: Aho +3 total', '📈 Aaron extends the rivalry lead'], users: { Aaron: [{ player: 'Sebastian Aho', g: 1, a: 1, first: true, pts: 4 }, { player: 'Andrei Svechnikov', g: 0, a: 1, first: false, pts: 1 }], Julie: [{ player: 'Seth Jarvis', g: 1, a: 0, first: false, pts: 2 }, { player: 'Jaccob Slavin', g: 0, a: 0, first: false, pts: 0 }] }
  }
};

const roster = ['Sebastian Aho', 'Andrei Svechnikov', 'Seth Jarvis', 'Jaccob Slavin', 'Martin Necas', 'Jordan Staal', 'Brent Burns'];
let currentMode = 'pregame';

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
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function flashSync() {
  syncFlash?.classList.remove('show');
  void syncFlash?.offsetWidth;
  syncFlash?.classList.add('show');
  setTimeout(() => syncFlash?.classList.remove('show'), 800);
}

function renderEditablePick(userName, picks, taken) {
  const rows = [0, 1].map((index) => {
    const current = picks[index] || '';
    const options = roster.map((player) => {
      const owner = Object.entries(taken).find(([, players]) => players.includes(player))?.[0];
      const disabled = owner && owner !== userName;
      const label = disabled ? `${player} — ${owner}` : player;
      return `<option ${player === current ? 'selected' : ''} ${disabled ? 'disabled' : ''}>${label}</option>`;
    }).join('');
    return `<label class="pick-select-row ${!current ? 'missing-pick-row' : ''}"><span>Pick ${index + 1}</span><select aria-label="${userName} pick ${index + 1}"><option value="">Choose player</option>${options}</select></label>`;
  }).join('');
  const readyCount = picks.filter(Boolean).length;
  return `<div class="single-user-card ${userName === 'Aaron' ? 'aaron-owner' : 'julie-owner'}"><div class="single-user-head"><div><strong>${userName}</strong><span>${readyCount}/2 selected</span></div><span class="pick-lock-pill ${readyCount < 2 ? 'warning-pill' : ''}">${readyCount < 2 ? 'Needs pick' : 'Ready'}</span></div>${rows}</div>`;
}

function renderLockedPick(userName, picks) {
  const total = picks.reduce((sum, pick) => sum + pick.pts, 0);
  const rows = picks.map((pick) => {
    const tags = [`${pick.g} G`, `${pick.a} A`];
    if (pick.first) tags.push('1st goal');
    return `<article class="locked-pick-row ${pick.pts > 0 ? 'active-pick' : ''}" data-player="${pick.player}"><div class="locked-pick-main"><strong>${pick.player}</strong><span>${tags.join(' · ')}</span></div><span class="pick-points" aria-label="${pick.pts} points"><span>+${pick.pts}</span></span></article>`;
  }).join('');
  return `<div class="single-user-card ${userName === 'Aaron' ? 'aaron-owner' : 'julie-owner'}"><div class="single-user-head"><div><strong>${userName}</strong><span>${picks.length}/2 locked</span></div><span class="owner-score">+${total}</span></div>${rows}</div>`;
}

function renderPicks(state) {
  if (!picksContent) return;
  picksContent.innerHTML = Object.entries(state.users)
    .map(([userName, picks]) => state.mode === 'editable' ? renderEditablePick(userName, picks, state.users) : renderLockedPick(userName, picks))
    .join('');
}

function renderMoments(items) {
  if (!feed) return;
  feed.innerHTML = items.map((item) => `<div class="moment-item">${item}</div>`).join('');
}

function renderState(mode) {
  const state = states[mode] || states.pregame;
  currentMode = mode;
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
  row.className = 'moment-item new-moment';
  row.textContent = message;
  feed.prepend(row);
}

function runAaronScoreSwing() {
  if (currentMode === 'missing' || currentMode === 'pregame') renderState('live');
  flashSync();
  addMoment('🔥 Animation: Aho scoring swing bumps Aaron');
  document.querySelector('[data-player="Sebastian Aho"]')?.classList.add('pick-hit');
  showToast('🔥 Aho event: Aaron score swing');
}

function runJulieAssist() {
  if (currentMode === 'missing' || currentMode === 'pregame') renderState('live');
  flashSync();
  addMoment('👀 Animation: Jarvis assist keeps Julie alive');
  document.querySelector('[data-player="Seth Jarvis"]')?.classList.add('pick-hit');
  showToast('👀 Jarvis assist: Julie +1');
}

stateSwitcher?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-mode]');
  if (button) renderState(button.dataset.mode);
});

toastButton?.addEventListener('click', runAaronScoreSwing);
refreshButton?.addEventListener('click', () => { flashSync(); showToast('✅ Mock realtime refresh complete'); });
$('#simulateAaronGoal')?.addEventListener('click', runAaronScoreSwing);
$('#simulateJulieAssist')?.addEventListener('click', runJulieAssist);

try {
  renderState('pregame');
} catch (error) {
  console.error('V2 render failed', error);
  document.body.insertAdjacentHTML('afterbegin', '<div style="padding:16px;background:#fee;color:#900;font-weight:800">V2 preview render failed. Check console.</div>');
}