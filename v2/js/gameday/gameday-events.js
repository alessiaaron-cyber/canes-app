window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function focusPregamePicks() {
    const anchor = document.querySelector('#gdPregamePicksAnchor');

    anchor?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  CR.gameDayEvents = {
    bind({ claimedOwner, draftOrder, nextDraftSide, renderManageSheet, setModalOpen, rerender }) {
      document.querySelectorAll('.gd-small-action').forEach((button) => {
        button.addEventListener('click', () => {
          const side = button.dataset.side;
          const player = button.dataset.player;
          CR.gameDay.pregame[side] = CR.gameDay.pregame[side].filter((name) => name !== player);
          CR.gameDay.lastDraftedPlayer = '';
          rerender('pregame');
        });
      });

      document.querySelectorAll('.gd-draft-btn').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();

          const player = button.dataset.player;
          if (claimedOwner(player)) return;

          const side = typeof nextDraftSide === 'function' ? nextDraftSide() : null;
          if (!side) return;

          CR.gameDay.pregame[side].push(player);
          CR.gameDay.lastDraftedPlayer = player;
          rerender('pregame');

          requestAnimationFrame(() => {
            focusPregamePicks();
          });

          clearTimeout(window.__gdLastDraftedTimer);
          window.__gdLastDraftedTimer = setTimeout(() => {
            CR.gameDay.lastDraftedPlayer = '';
            if (CR.gameDay.mode === 'pregame') rerender('pregame');
          }, 950);
        });
      });

      document.querySelectorAll('[data-action="open-manage"]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          renderManageSheet();
          setModalOpen(true);
        });
      });

      document.querySelectorAll('.gd-sim-button').forEach((button) => {
        button.addEventListener('click', () => {
          const side = button.dataset.side;
          const kind = button.dataset.kind;
          CR.applyMockLiveBatch?.([{ side, kind }]);
        });
      });
    }
  };
})();
