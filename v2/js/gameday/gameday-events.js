window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  CR.gameDayEvents = {
    bind({ claimedOwner, draftOrder, nextDraftSide, renderManageSheet, setModalOpen, rerender }) {
      document.querySelectorAll('.gd-small-action').forEach((button) => {
        button.addEventListener('click', () => {
          const side = button.dataset.side;
          const player = button.dataset.player;
          CR.gameDay.pregame[side] = CR.gameDay.pregame[side].filter((name) => name !== player);
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
          rerender('pregame');
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
