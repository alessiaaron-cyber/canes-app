window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function ensureEditState() {
    CR.gameDayEditState = CR.gameDayEditState || {
      isEditing: false,
      dirty: false,
      startedAt: 0
    };

    return CR.gameDayEditState;
  }

  function markEditing(dirty = true) {
    const state = ensureEditState();
    state.isEditing = true;
    state.dirty = Boolean(dirty || state.dirty);
    state.startedAt = state.startedAt || Date.now();
  }

  function clearEditing() {
    const state = ensureEditState();
    state.isEditing = false;
    state.dirty = false;
    state.startedAt = 0;
  }

  function focusPregamePicks() {
    const anchor = document.querySelector('#gdPregamePicksAnchor');

    anchor?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  CR.gameDayEvents = {
    bind({ claimedOwner, nextDraftSide, renderManageSheet, setModalOpen, rerender }) {
      document.querySelectorAll('.gd-small-action').forEach((button) => {
        button.addEventListener('click', () => {
          const side = button.dataset.side;
          const player = button.dataset.player;
          markEditing();
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

          markEditing();
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
          markEditing(false);
          renderManageSheet();
          setModalOpen(true);
        });
      });
    }
  };

  CR.gameDayEdit = {
    ensureEditState,
    markEditing,
    clearEditing
  };
})();
