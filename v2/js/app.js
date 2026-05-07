const feed = document.getElementById('momentsFeed');
const toast = document.getElementById('toast');
const toastButton = document.getElementById('toastButton');
const refreshButton = document.getElementById('refreshButton');
const aaronPicks = document.getElementById('aaronPicks');
const opponentPicks = document.getElementById('opponentPicks');
const syncFlash = document.getElementById('syncFlash');
const aaronSlots = document.getElementById('aaronSlots');
const julieSlots = document.getElementById('julieSlots');
const rosterChips = document.getElementById('rosterChips');

function calculatePoints(pick) {
  const rules = window.V2_MOCK_DATA.scoringRules;
  let total = 0;
  total += pick.goals * rules.goal;
  total += pick.assists * rules.assist;
  if (pick.firstGoal) total += rules.firstGoalBonus;
  return total;
}

function buildPickCard(pick) {
  const total = calculatePoints(pick);
  const key = pick.player.toLowerCase().replaceAll(' ', '-');

  return `
    <article class="pick-card ${total > 0 ? 'active-pick' : ''}" data-player-key="${key}">
      <div class="pick-player-row">
        <strong>${pick.player}</strong>
        <span class="pick-total">+${total}</span>
      </div>
      <div class="pick-stat-row">
        <span>G ${pick.goals}</span>
        <span>A ${pick.assists}</span>
        ${pick.firstGoal ? '<span class="bonus-chip">1st Goal</span>' : ''}
      </div>
    </article>
  `;
}

function renderPregameSelections() {
  const selections = window.V2_MOCK_DATA.pregameSelections;
  const roster = window.V2_MOCK_DATA.roster;

  aaronSlots.innerHTML = selections.aaron
    .map(player => `<div class="pregame-slot selected">${player}</div>`)
    .join('');

  julieSlots.innerHTML = selections.julie
    .map(player => `<div class="pregame-slot selected opponent">${player}</div>`)
    .join('');

  const taken = [...selections.aaron, ...selections.julie];

  rosterChips.innerHTML = roster
    .map(player => {
      const locked = taken.includes(player);

      return `
        <button class="roster-chip ${locked ? 'locked-chip' : ''}" ${locked ? 'disabled' : ''}>
          ${player}
        </button>
      `;
    })
    .join('');
}

function renderPicks() {
  const users = window.V2_MOCK_DATA.users;
  aaronPicks.innerHTML = users.aaron.picks.map(buildPickCard).join('');
  opponentPicks.innerHTML = users.julie.picks.map(buildPickCard).join('');
}

function renderMoments() {
  const moments = window.V2_MOCK_DATA?.moments || [];
  feed.innerHTML = moments.map(moment => `<div class="moment-item">${moment}</div>`).join('');
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
  setTimeout(() => syncFlash?.classList.remove('show'), 700);
}

function bumpElement(element) {
  element?.classList.remove('score-bump');
  void element?.offsetWidth;
  element?.classList.add('score-bump');
}

function highlightPick(playerName) {
  const key = playerName.toLowerCase().replaceAll(' ', '-');
  const card = document.querySelector(`[data-player-key="${key}"]`);
  card?.classList.remove('pick-hit');
  void card?.offsetWidth;
  card?.classList.add('pick-hit');
}

function addMoment(message) {
  const row = document.createElement('div');
  row.className = 'moment-item new-moment';
  row.textContent = message;
  feed.prepend(row);
}

function runAaronScoreSwing() {
  flashSync();
  bumpElement(document.querySelector('.score-card.leading'));
  bumpElement(document.querySelector('.aaron-owner'));
  highlightPick('Sebastian Aho');
  addMoment('🔥 Score swing: Aho event pushes Aaron further ahead');
  showToast('🔥 Score swing: Aaron advantage grows');
}

toastButton?.addEventListener('click', runAaronScoreSwing);
refreshButton?.addEventListener('click', () => {
  flashSync();
  showToast('✅ Mock realtime refresh complete');
});

renderPregameSelections();
renderMoments();
renderPicks();