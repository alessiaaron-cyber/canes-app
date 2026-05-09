import './gameday-render.js';

window.CR = window.CR || {};

try {
  window.CR.initTabs?.();
  window.CR.switchTab?.('gameday');

  document.querySelector('#refreshButton')?.addEventListener('click', () => {
    window.CR.flashSync?.();
    window.CR.showToast?.('Mock realtime refresh complete');
  });
} catch (error) {
  console.error('V2 bootstrap failed', error);
}