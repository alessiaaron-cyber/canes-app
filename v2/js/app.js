import { initGameDayStateLab } from './gameday-render.js';
import { renderHistoryPage } from './history-render.js';
import { renderManagePage } from './manage-render.js';

const historyRoot = document.querySelector('#historyContent');
const manageRoot = document.querySelector('#manageContent');
const pageTitle = document.querySelector('#pageTitle');
const toast = document.querySelector('#toast');

function switchTab(tabName) {
  document.querySelectorAll('.app-view').forEach((view) => {
    const isActive = view.dataset.view === tabName;
    view.classList.toggle('is-active', isActive);
  });

  document.querySelectorAll('.nav-button').forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle('is-active', isActive);

    if (isActive) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });

  if (!pageTitle) return;

  if (tabName === 'history') pageTitle.textContent = 'History';
  else if (tabName === 'manage') pageTitle.textContent = 'Manage';
  else pageTitle.textContent = 'Game Day';
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('is-visible');

  clearTimeout(window.__crToastTimer);

  window.__crToastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 1800);
}

initGameDayStateLab();

if (historyRoot) {
  historyRoot.innerHTML = renderHistoryPage();
}

if (manageRoot) {
  manageRoot.innerHTML = renderManagePage();
}

document.querySelectorAll('.nav-button').forEach((button) => {
  button.addEventListener('click', () => {
    switchTab(button.dataset.tab);
  });
});

document.querySelector('#refreshButton')?.addEventListener('click', () => {
  showToast('Preview refreshed');
});

switchTab('gameday');