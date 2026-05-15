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

  async function handleDraftClick(button, rerender) {
    const player = button.dataset.player;
    if (!player || button.disabled) return;

    try {
      CR.ui?.setActionBusy?.(button, true, { label: 'Drafting…' });
      await CR.gameDaySaveService?.saveDraftPick?.(CR.gameDay.currentGameId, player);
      CR.gameDay.lastDraftedPlayer = player;
      clearEditing();
      await CR.refreshGameDayData?.({ flash: true });
      CR.showToast?.(`${player} drafted`);

      requestAnimationFrame(() => {
        focusPregamePicks();
      });

      clearTimeout(window.__gdLastDraftedTimer);
      window.__gdLastDraftedTimer = setTimeout(() => {
        CR.gameDay.lastDraftedPlayer = '';
        if (CR.gameDay.mode === 'pregame') rerender('pregame');
      }, 950);
    } catch (error) {
      console.error('Draft pick failed', error);
      CR.showToast?.({ message: error?.message || 'Could not draft player', tier: 'warning' });
      await CR.refreshGameDayData?.({ flash: true });
    } finally {
      CR.ui?.setActionBusy?.(button, false);
    }
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
        button.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();

          const player = button.dataset.player;
          if (claimedOwner(player)) return;

          await handleDraftClick(button, rerender);
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