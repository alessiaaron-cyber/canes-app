import './gameday-render.js';

window.CR = window.CR || {};

function switchTabFallback(tabName) {
  const validTabs = ['gameday', 'history', 'manage'];
  const targetTab = validTabs.includes(tabName) ? tabName : 'gameday';

  document.querySelectorAll('.app-view').forEach((view) => {
    view.classList.toggle('active-view', view.dataset.view === targetTab);
  });

  document.querySelectorAll('#bottomNav button[data-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === targetTab);
  });

  const pageTitle = document.querySelector('#pageTitle');

  if (pageTitle) {
    if (targetTab === 'history') pageTitle.textContent = 'History';
    else if (targetTab === 'manage') pageTitle.textContent = 'Manage';
    else pageTitle.textContent = 'Game Day';
  }
}

try {
  const switchTab = typeof window.CR.switchTab === 'function'
    ? window.CR.switchTab
    : switchTabFallback;

  document.querySelectorAll('#bottomNav button[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
    });
  });

  switchTab('gameday');

  document.querySelector('#refreshButton')?.addEventListener('click', () => {
    window.CR.flashSync?.();
    window.CR.showToast?.('Mock realtime refresh complete');
  });
} catch (error) {
  console.error('V2 bootstrap failed', error);
}