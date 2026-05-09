function switchTab(tabName) {
  document.querySelectorAll('.app-view').forEach((view) => {
    const active = view.dataset.view === tabName;
    view.classList.toggle('is-active', active);
  });

  document.querySelectorAll('.nav-button').forEach((button) => {
    const active = button.dataset.tab === tabName;
    button.classList.toggle('is-active', active);
  });

  const pageTitle = document.querySelector('#pageTitle');

  if (!pageTitle) return;

  if (tabName === 'history') pageTitle.textContent = 'History';
  else if (tabName === 'manage') pageTitle.textContent = 'Manage';
  else pageTitle.textContent = 'Game Day';
}

document.querySelectorAll('.nav-button').forEach((button) => {
  button.addEventListener('click', () => {
    switchTab(button.dataset.tab);
  });
});

switchTab('gameday');