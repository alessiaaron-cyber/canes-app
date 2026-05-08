window.CR = window.CR || {};

window.CR.switchTab = (tabName) => {
  const targetTab = tabName === 'history' ? 'history' : 'gameday';

  document.querySelectorAll('.app-view').forEach((view) => {
    view.classList.toggle('active-view', view.dataset.view === targetTab);
  });

  const bottomNav = document.querySelector('#bottomNav');

  bottomNav?.querySelectorAll('button[data-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === targetTab);
  });

  const pageTitle = document.querySelector('#pageTitle');

  if (pageTitle) {
    pageTitle.textContent = targetTab === 'history' ? 'History' : 'Game Day';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.CR.initTabs = () => {
  const bottomNav = document.querySelector('#bottomNav');

  bottomNav?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-tab]');

    if (!button) return;

    if (button.dataset.tab === 'manage') {
      window.CR.showToast('Manage tab coming next');
      return;
    }

    window.CR.switchTab(button.dataset.tab);
  });
};
