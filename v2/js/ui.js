window.CR = window.CR || {};

window.CR.$ = (selector) => document.querySelector(selector);

window.CR.setText = (element, value) => {
  if (element) element.textContent = value;
};

window.CR.setLiveStatus = (element, value) => {
  if (!element) return;
  element.innerHTML = `<span aria-hidden="true"></span>${value}`;
};

window.CR.setBadge = (element, text, variant) => {
  if (!element) return;
  element.textContent = text;
  element.className = `panel-tag ${variant || ''}`.trim();
};

window.CR.showToast = (message) => {
  const toast = window.CR.$('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
};

window.CR.flashSync = () => {
  const syncFlash = window.CR.$('#syncFlash');
  syncFlash?.classList.remove('show');
  void syncFlash?.offsetWidth;
  syncFlash?.classList.add('show');
  setTimeout(() => syncFlash?.classList.remove('show'), 720);
};
