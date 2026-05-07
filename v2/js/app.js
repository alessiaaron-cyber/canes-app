const feed = document.getElementById('momentsFeed');
const toast = document.getElementById('toast');
const toastButton = document.getElementById('toastButton');
const refreshButton = document.getElementById('refreshButton');
const aaronPicks = document.getElementById('aaronPicks');
const opponentPicks = document.getElementById('opponentPicks');

function calculatePoints(pick) {
  const rules = window.V2_MOCK_DATA.scoringRules;

  let total = 0;

  total += pick.goals * rules.goal;
  total += pick.assists * rules.assist;

  if (pick.firstGoal) {
    total += rules.firstGoalBonus;
  }

  return total;
}

function buildPickCard(pick) {
  const total = calculatePoints(pick);

  return `
    <article class="pick-card ${total > 0 ? 'active-pick' : ''}">
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

function renderPicks() {
  const users = window.V2_MOCK_DATA.users;

  aaronPicks.innerHTML = users.aaron.picks
    .map(buildPickCard)
    .join('');

  opponentPicks.innerHTML = users.julie.picks
    .map(buildPickCard)
    .join('');
}

function renderMoments() {
  const moments = window.V2_MOCK_DATA?.moments || [];

  feed.innerHTML = moments
    .map(moment => `<div class="moment-item">${moment}</div>`)
    .join('');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

toastButton?.addEventListener('click', () => {
  showToast('🚨 Sebastian Aho scored first · Aaron +3');
});

refreshButton?.addEventListener('click', () => {
  document.body.animate(
    [
      { opacity: 0.98 },
      { opacity: 1 }
    ],
    {
      duration: 350
    }
  );

  showToast('✅ Mock realtime refresh complete');
});

renderMoments();
renderPicks();