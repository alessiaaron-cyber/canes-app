const feed = document.getElementById('momentsFeed');
const toast = document.getElementById('toast');
const toastButton = document.getElementById('toastButton');

function renderMoments() {
  const moments = window.V2_MOCK_DATA?.moments || [];

  feed.innerHTML = moments
    .map(
      (moment) => `
        <div class="moment-item">
          ${moment}
        </div>
      `
    )
    .join('');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  window.clearTimeout(window.__toastTimer);

  window.__toastTimer = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

toastButton?.addEventListener('click', () => {
  showToast('Realtime goal sync simulated 🚨');
});

renderMoments();