const $ = (selector) => document.querySelector(selector);

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
const carGoals = $('#carGoals');
const trackedPoints = $('#trackedPoints');
const latestEvent = $('#latestEvent');
const pulseBadge = $('#pulseBadge');
const eventControls = $('#eventControls');

const states = {
  missing: {
    title: 'Missing Picks',
    badge: 'Needs Picks',
    badgeClass: 'warning',
    gameStatus: 'Pregame',
    statusText: 'Julie needs 1 pick',
    subline: 'Tonight · 7:00 PM · Picks still open',
    picksTitle: 'Make Your Picks',
    picksBadge: '1 Missing',
    picksBadgeClass: 'warning',
    picksNote: 'Julie still needs one more unique Canes player before puck drop.',
    mode: 'editable',
    goals: 0,
    points: 0,
    latest: 'Waiting for all picks',
    moments: [
      '⏳ Aaron has submitted 2/2 picks',
      '⚠️ Julie still needs one more pick',
      '🔓 Picks remain editable until scoring starts'
    ],
    users: {
      Aaron: ['Sebastian Aho', 'Andrei Svechnikov'],
      Julie: ['Seth Jarvis', '']
    }
  },
  pregame: {
    title: 'Pregame Ready',
    badge: 'Editable',
    badgeClass: 'calm',
    gameStatus: 'Pregame',
    statusText: 'All picks in',
    subline: 'Tonight · 7:00 PM · Picks ready',
    picksTitle: 'Make Your Picks',
    picksBadge: 'Editable',
    picksBadgeClass: 'calm',
    picksNote: '2 Canes each · no duplicate players · locks when scoring starts.',
    mode: 'editable',
    goals: 0,
    points: 0,
    latest: 'Picks submitted and waiting for puck drop',
    moments: [
      '✅ Aaron submitted 2/2 picks',
      '✅ Julie submitted 2/2 picks',
      '🚫 No overlapping players'
    ],
    users: {
      Aaron: ['Sebastian Aho', 'Andrei Svechnikov'],
      Julie: ['Seth Jarvis', 'Jaccob Slavin']
    }
  },
  live: {
    title: 'Live Game',
    badge: 'Locked',
    badgeClass: 'live',
    gameStatus: 'Live',
    statusText: 'Realtime active',
    subline: '2nd Period · CAR 2 - NYR 1',
    picksTitle: 'Picks With Stats',
    picksBadge: 'Locked',
    picksBadgeClass: 'live',
    picksNote: 'Picks are locked. Goals, assists, and first-goal bonus update live.',
    mode: 'locked',
    goals: 2,
    points: 4,
    latest: 'Svechnikov assist → Aaron +1',
    moments: [
      '🚨 Sebastian Aho scored first — Aaron +3',
      '🍎 Andrei Svechnikov assist — Aaron +1',
      '🍎 Seth Jarvis assist — Julie +1'
    ],
    users: {
      Aaron: [
        { player: 'Sebastian Aho', g: 1, a: 0, first: true, pts: 3 },
        { player: 'Andrei Svechnikov', g: 0, a: 1, first: false, pts: 1 }
      ],
      Julie: [
        { player: 'Seth Jarvis', g: 0, a: 1, first: false, pts: 1 },
        { player: 'Jaccob Slavin', g: 0, a: 0, first: false, pts: 0 }
      ]
    }
  },
  final: {
    title: 'Final Result',
    badge: 'Final',
    badgeClass: 'dark',
    gameStatus: 'Final',
    statusText: 'Game complete',
    subline: 'Final · CAR 3 - NYR 2',
    picksTitle: 'Final Picks Score',
    picksBadge: 'Aaron Wins',
    picksBadgeClass: 'dark',
    picksNote: 'Final scoring locked. Aaron wins this game by 3 points.',
    mode: 'locked',
    goals: 3,
    points: 7,
    latest: 'Finalized game · Aaron wins 8 - 5',
    moments: [
      '🏁 Finalized: Aaron wins 8 - 5',
      '🚨 First-goal bonus mattered: Aho +3 total',
      '📈 Aaron extends the rivalry lead'
    ],
    users: {
      Aaron: [
        { player: 'Sebastian Aho', g: 1, a: 1, first: true, pts: 4 },
        { player: 'Andrei Svechnikov', g: 0, a: 1, first: false, pts: 1 }
      ],
      Julie: [
        { player: 'Seth Jarvis', g: 1, a: 0, first: false, pts: 2 },
        { player: 'Jaccob Slavin', g: 0, a: 0, first: false, pts: 0 }
      ]
    }
  }
};

const roster = ['Sebastian Aho', 'Andrei Svechnikov', 'Seth Jarvis', 'Jaccob Slavin', 'Martin Necas', 'Jordan Staal', 'Brent Burns'];
let currentMode = 'pregame';

function setBadge(element, text, variant) {
  element.textContent = text;
  element.className = `panel-tag ${variant || ''}`.trim();
}

function showToast(message) {
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
  const options = roster.map((player) => {
    const owner = Object.entries(taken).find(([, players]) => players.includes(player))?.[0];
    const selected = picks.includes(player);
    const disabled = owner && owner !== userName;
    const label = disabled ? `${player} — ${owner}` : player;
    return { player, label, selected, disabled };
  });

  const rows = [0, 1].map((index) => {
    const current = picks[index] || '';
    const selectOptions = [
      `<option value="">${index === 0 ? 'Choose first player' : 'Choose second player'}</option>`,
      ...options.map((option) => `
        <option ${option.player === current ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}>${option.label}</option>
      `)
    ].join('');

    return `
      <label class="pick-select-row ${!current ? 'missing-pick-row' : ''}">
        <span>Pick ${index + 1}</span>
        <select aria-label="${userName} pick ${index + 1}">${selectOptions}</select>
      </label>
    `;
  }).join('');

  const readyCount = picks.filter(Boolean).length;
  return `
    <div class="single-user-card ${userName === 'Aaron' ? 'aaron-owner' : 'julie-owner'}">
      <div class="single-user-head">
        <div><strong>${userName}</strong><span>${readyCount}/2 selected</span></div>
        <span class="pick-lock-pill ${readyCount < 2 ? 'warning-pill' : ''}">${readyCount < 2 ? 'Needs pick' : 'Ready'}</span>
      </div>
      ${rows}
    </div>
  `;
}

function renderLockedPick(userName, picks) {
  const total = picks.reduce((sum, pick) => sum + pick.pts, 0);
  const rows = picks.map((pick) => `
    <article class="locked-pick-row ${pick.pts > 0 ? 'active-pick' : ''}" data-player="${pick.player}">
      <div>
        <strong>${pick.player}</strong>
        <span>G ${pick.g} · A ${pick.a}${pick.first ? ' · 1st Goal' : ''}</span>
      </div>
      <b>+${pick.pts}</b>
    </article>
  `).join('');

  return `
    <div class="single-user-card ${userName === 'Aaron' ? 'aaron-owner' : 'julie-owner'}">
      <div class="single-user-head">
        <div><strong>${userName}</strong><span>Tonight: +${total}</span></div>
        <span class="owner-score">+${total}</span>
      </div>
      ${rows}
    </div>
  `;
}

function renderPicks(state) {
  if (state.mode === 'editable') {
    picksContent.innerHTML = Object.entries(state.users)
      .map(([userName, picks]) => renderEditablePick(userName, picks, state.users))
      .join('');
  } else {
    picksContent.innerHTML = Object.entries(state.users)
      .map(([userName, picks]) => renderLockedPick(userName, picks))
      .join('');
  }
}

function renderMoments(items) {
  feed.innerHTML = items.map((item) => `<div class="moment-item">${item}</div>`).join('');
}

function renderState(mode) {
  currentMode = mode;
  const state = states[mode];

  stateTitle.textContent = state.title;
  setBadge(stateBadge, state.badge, state.badgeClass);
  gameStatusPill.textContent = state.gameStatus;
  statusText.textContent = state.statusText;
  gameSubline.textContent = state.subline;
  picksEyebrow.textContent = state.mode === 'editable' ? 'Game picks' : 'Locked picks';
  picksTitle.textContent = state.picksTitle;
  setBadge(picksBadge, state.picksBadge, state.picksBadgeClass);
  picksNote.textContent = state.picksNote;
  carGoals.textContent = state.goals;
  trackedPoints.textContent = state.points;
  latestEvent.textContent = state.latest;
  pulseBadge.textContent = state.mode === 'editable' ? 'Preview' : state.gameStatus;
  eventControls.style.display = state.mode === 'editable' ? 'none' : 'grid';

  renderPicks(state);
  renderMoments(state.moments);

  stateSwitcher.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });

  flashSync();
  showToast(`Showing ${state.title}`);
}

function addMoment(message) {
  const row = document.createElement('div');
  row.className = 'moment-item new-moment';
  row.textContent = message;
  feed.prepend(row);
}

function runAaronScoreSwing() {
  if (currentMode === 'missing' || currentMode === 'pregame') renderState('live');
  flashSync();
  addMoment('🔥 Animation: Aho scoring swing bumps Aaron');
  const aho = document.querySelector('[data-player="Sebastian Aho"]');
  aho?.classList.add('pick-hit');
  showToast('🔥 Aho event: Aaron score swing');
}

function runJulieAssist() {
  if (currentMode === 'missing' || currentMode === 'pregame') renderState('live');
  flashSync();
  addMoment('👀 Animation: Jarvis assist keeps Julie alive');
  const jarvis = document.querySelector('[data-player="Seth Jarvis"]');
  jarvis?.classList.add('pick-hit');
  showToast('👀 Jarvis assist: Julie +1');
}

stateSwitcher?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-mode]');
  if (!button) return;
  renderState(button.dataset.mode);
});

toastButton?.addEventListener('click', runAaronScoreSwing);
refreshButton?.addEventListener('click', () => {
  flashSync();
  showToast('✅ Mock realtime refresh complete');
});
$('#simulateAaronGoal')?.addEventListener('click', runAaronScoreSwing);
$('#simulateJulieAssist')?.addEventListener('click', runJulieAssist);

renderState('pregame');