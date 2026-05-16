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

  function syncManageChrome(state = CR.manageState) {
    const manageView = document.querySelector('#manageView');
    const accountPanel = document.querySelector('#manageView .account-panel');
    const isSubpage = state?.activeManageView && state.activeManageView !== 'main';

    manageView?.classList.toggle('is-manage-subpage', Boolean(isSubpage));

    if (accountPanel) {
      accountPanel.hidden = Boolean(isSubpage);
      accountPanel.setAttribute('aria-hidden', isSubpage ? 'true' : 'false');
      accountPanel.classList.toggle('is-hidden', Boolean(isSubpage));
    }
  }

  function hasOpenManageSheet(state = CR.manageState) {
    return Boolean(
      state?.activeEditField ||
      state?.profileEditOpen ||
      state?.startSeasonOpen ||
      state?.scoringEditOpen ||
      state?.rosterSheetOpen ||
      state?.scheduleSheetOpen ||
      state?.confirmRemove
    );
  }

  function syncManageSheetScrollLock(state = CR.manageState) {
    if (hasOpenManageSheet(state)) {
      CR.ui?.lockBodyScroll?.('manage-sheet-open');
    } else {
      CR.ui?.unlockBodyScroll?.('manage-sheet-open');
    }
  }

  function renderManageView(state) {
    const root = document.querySelector('#manageContent');
    if (!root || !CR.manageRender) return;

    syncManageChrome(state);
    root.innerHTML = CR.manageRender.renderRoot(state);
    syncManageChrome(state);
    syncManageSheetScrollLock(state);
  }

  function renderManage(options = {}) {
    if (CR.manageStore) {
      if (options.scrollTop) {
        CR.manageStore.render();
        requestAnimationFrame(scrollManageToTop);
        return;
      }

      CR.manageStore.scheduleRender();
      return;
    }

    renderManageView(CR.manageState);

    if (options.scrollTop) {
      requestAnimationFrame(scrollManageToTop);
    }
  }

  function initManage() {
    CR.manageState = CR.manageModel.build();
    CR.manageStore = CR.ui?.createViewStore?.({
      initialState: CR.manageState,
      render: renderManageView,
      onAfterRender: (state) => {
        CR.manageState = state;
        syncManageSheetScrollLock(state);
      }
    });

    if (CR.manageStore) {
      CR.manageState = CR.manageStore.getState();
      CR.manageStore.render();
    } else {
      renderManage();
    }

    CR.manageEvents?.bindManageEvents?.();
  }

  CR.renderManage = renderManage;
  CR.scrollManageToTop = scrollManageToTop;
  CR.syncManageSheetScrollLock = syncManageSheetScrollLock;
  CR.initManage = initManage;
})();