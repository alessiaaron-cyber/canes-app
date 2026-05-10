window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  CR.gameDayEvents = {
    bind({ claimedOwner, draftOrder, renderManageSheet, setModalOpen, rerender }) {
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
          const total = CR.gameDay.pregame.Aaron.length + CR.gameDay.pregame.Julie.length;
          if (total >= 4) return;
          const side = draftOrder[total];
          CR.gameDay.pregame[side].push(player);
          rerender('pregame');
        });
      });

      document.querySelectorAll('[data-action="open-manage"]').forEach((button) => {
        button.addEventListener('click', () => {
          renderManageSheet();
          setModalOpen(true);
        });
      });

      document.querySelectorAll('.gd-sim-button').forEach((button) => {
        button.addEventListener('click', () => {
          const side = button.dataset.side;
          const kind = button.dataset.kind;
          const pick = CR.gameDay.live.users[side][0];
          if (!pick) return;
          if (kind === 'goal') {
            pick.goals += 1;
            CR.gameDay.live.scores[side] += 2;
            CR.gameDay.live.feed.unshift({ icon: '🚨', title: `${pick.player} goal`, detail: `${side} scores through a picked player`, points: 2 });
          }
          if (kind === 'assist') {
            pick.assists += 1;
            CR.gameDay.live.scores[side] += 1;
            CR.gameDay.live.feed.unshift({ icon: '🍎', title: `${pick.player} assist`, detail: `${side} adds an assist point`, points: 1 });
          }
          if (kind === 'first' && !pick.firstGoal) {
            pick.firstGoal = true;
            CR.gameDay.live.scores[side] += 2;
            CR.gameDay.live.feed.unshift({ icon: '⭐', title: `${pick.player} first Canes goal`, detail: `${side} gets the first goal bonus`, points: 2 });
          }
          CR.flashSync?.();
          CR.showToast?.(`${side} ${kind} update`);
          rerender('live');
        });
      });
    }
  };
})();