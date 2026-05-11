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
