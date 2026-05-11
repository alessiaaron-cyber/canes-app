window.CR = window.CR || {};

window.CR.switchTab = (tabName) => {
  const validTabs = ['gameday', 'history', 'manage'];
  const targetTab = validTabs.includes(tabName) ? tabName : 'gameday';

  document.querySelectorAll('.app-view').forEach((view) => {
    view.classList.toggle('active-view', view.dataset.view === targetTab);
  });

  const bottomNav = document.querySelector('#bottomNav');

  bottomNav?.querySelectorAll('button[data-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === targetTab);
  });

  const pageTitle = document.querySelector('#pageTitle');

  if (pageTitle) {
    if (targetTab === 'history') {
      pageTitle.textContent = 'History';
    } else if (targetTab === 'manage') {
      pageTitle.textContent = 'Manage';
    } else {
      pageTitle.textContent = 'Game Day';
    }
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto'
  });
};

window.CR.initTabs = () => {
  const bottomNav = document.querySelector('#bottomNav');

  bottomNav?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-tab]');

    if (!button) return;

    window.CR.switchTab(button.dataset.tab);
  });
};
