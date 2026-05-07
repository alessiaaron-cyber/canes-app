const feed = document.getElementById('momentsFeed');
const toast = document.getElementById('toast');
const toastButton = document.getElementById('toastButton');
const refreshButton = document.getElementById('refreshButton');
const picksGrid = document.getElementById('picksGrid');

function renderMoments() {
  const moments = window.V2_MOCK_DATA?.moments || [];

  feed.innerHTML = moments
    .map(moment => `<div class="moment-item">${moment}</div>`)
    .join('');
}

function renderPicks() {
  const picks = window.V2_MOCK_DATA?.picks || [];

  picksGrid.innerHTML = picks
    .map(pick => `
      <article class="pick-card">
        <small>${pick.type}</small>
        <strong>${pick.player}</strong>
        <span>${pick.status}</span>
      </article>
    `)
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
  showToast('🚨 Goal sync animation preview');
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