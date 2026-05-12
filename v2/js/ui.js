window.CR = window.CR || {};

window.CR.$ = (selector) => document.querySelector(selector);

window.CR.showToast = (input) => {
  const toast = window.CR.$('#toast');
  if (!toast) return;

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const payload = typeof input === 'string' ? { message: input, tier: 'light' } : (input || {});
  const message = payload.message || '';
  const tier = payload.tier || 'light';

  toast.textContent = message;
  toast.dataset.tier = tier;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), prefersReducedMotion ? 1800 : 2400);
};

window.CR.flashSync = () => {
  const syncFlash = window.CR.$('#syncFlash');
  syncFlash?.classList.remove('show');
  void syncFlash?.offsetWidth;
  syncFlash?.classList.add('show');
  setTimeout(() => syncFlash?.classList.remove('show'), 720);
};

window.CR.initPullRefresh = () => {
  const indicator = window.CR.$('#pullRefresh');
  const label = window.CR.$('#pullRefreshLabel');

  if (!indicator || window.CR.__pullRefreshBound) return;

  window.CR.__pullRefreshBound = true;

  let pulling = false;
  let startY = 0;
  let currentY = 0;
  let refreshTriggered = false;

  const THRESHOLD = 84;
  const MAX_PULL = 120;

  function resetPull() {
    pulling = false;
    refreshTriggered = false;
    indicator.classList.remove('visible', 'ready', 'refreshing');
    indicator.style.setProperty('--pull-distance', '0px');
    if (label) label.textContent = 'Pull to refresh';
  }

  window.addEventListener('touchstart', (event) => {
    if (window.scrollY > 0) return;

    pulling = true;
    startY = event.touches[0].clientY;
    currentY = startY;
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    if (!pulling || refreshTriggered) return;
    if (window.scrollY > 0) return;

    currentY = event.touches[0].clientY;
    const delta = Math.max(0, Math.min(MAX_PULL, currentY - startY));

    if (delta < 8) return;

    indicator.classList.add('visible');
    indicator.style.setProperty('--pull-distance', `${delta}px`);

    if (delta >= THRESHOLD) {
      indicator.classList.add('ready');
      if (label) label.textContent = 'Release to refresh';
    } else {
      indicator.classList.remove('ready');
      if (label) label.textContent = 'Pull to refresh';
    }
  }, { passive: true });

  window.addEventListener('touchend', async () => {
    if (!pulling) return;

    const delta = Math.max(0, Math.min(MAX_PULL, currentY - startY));

    if (delta >= THRESHOLD && !refreshTriggered) {
      refreshTriggered = true;
      indicator.classList.add('refreshing');
      indicator.classList.remove('ready');

      if (label) label.textContent = 'Refreshing…';

      try {
        window.CR.flashSync?.();
        window.CR.showToast?.('Refreshing rivalry data');

        if (typeof window.CR.refreshApp === 'function') {
          await window.CR.refreshApp();
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Pull refresh failed', error);
      }
    }

    setTimeout(resetPull, 420);
  });
};
