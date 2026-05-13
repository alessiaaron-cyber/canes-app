window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function renderManage() {
    const root = document.querySelector('#manageContent');
    if (!root || !CR.manageRender) return;

    root.innerHTML = CR.manageRender.renderRoot(CR.manageState);
  }

  function initManage() {
    CR.manageState = CR.manageModel.build();
    renderManage();
    CR.manageEvents?.bindManageEvents?.();
  }

  CR.renderManage = renderManage;
  CR.initManage = initManage;
})();
