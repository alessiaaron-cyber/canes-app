window.CR = window.CR || {};

(() => {
  let started = false;

  window.CR.startApp = () => {
    if (started) return;
    started = true;

    try {
      window.CR.initTabs?.();
      window.CR.initGameDay?.();
      window.CR.switchTab?.('gameday');
    } catch (error) {
      console.error('V2 bootstrap failed', error);
      const root = document.querySelector('#appRoot') || document.body;
      root.insertAdjacentHTML('afterbegin', '<div style="padding:16px;background:#fee;color:#900;font-weight:800">V2 preview render failed. Check console.</div>');
    }
  };
})();
