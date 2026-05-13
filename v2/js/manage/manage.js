window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function scrollManageToTop() {
    const manageView = document.querySelector('#manageView');
    const appShell = document.querySelector('.app-shell');

    manageView?.scrollTo?.({ top: 0, behavior: 'auto' });
    appShell?.scrollTo?.({ top: 0, behavior: 'auto' });
    window.scrollTo?.({ top: 0, behavior: 'auto' });
  }

  function syncManageChrome() {
    const accountPanel = document.querySelector('#manageView .account-panel');
    const isSubpage = CR.manageState?.activeManageView && CR.manageState.activeManageView !== 'main';

    if (accountPanel) {
      accountPanel.classList.toggle('is-hidden', Boolean(isSubpage));
    }
  }

  function renderManage(options = {}) {
    const root = document.querySelector('#manageContent');
    if (!root || !CR.manageRender) return;

    root.innerHTML = CR.manageRender.renderRoot(CR.manageState);
    syncManageChrome();

    if (options.scrollTop) {
      requestAnimationFrame(scrollManageToTop);
    }
  }

  function initManage() {
    CR.manageState = CR.manageModel.build();
    renderManage();
    CR.manageEvents?.bindManageEvents?.();
  }

  CR.renderManage = renderManage;
  CR.scrollManageToTop = scrollManageToTop;
  CR.initManage = initManage;
})();
