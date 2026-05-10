window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  const bindRosterButtons = () => {
    document.querySelectorAll('.gd-draft-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const row = button.closest('.gd-roster-row');
        if (!row) return;
        row.classList.add('claimed');
        button.outerHTML = '<span class="gd-tag">Picked</span>';
      });
    });
  };

  const bindManageButtons = () => {
    document.querySelectorAll('.gd-manage-tiny').forEach((button) => {
      button.addEventListener('click', () => {
        document.getElementById('manageSheet')?.classList.add('is-open');
      });
    });

    document.getElementById('closeSheet')?.addEventListener('click', () => {
      document.getElementById('manageSheet')?.classList.remove('is-open');
    });

    document.getElementById('saveSheet')?.addEventListener('click', () => {
      document.getElementById('manageSheet')?.classList.remove('is-open');
    });
  };

  const cleanRosterRows = () => {
    document.querySelectorAll('.gd-roster-row').forEach((row) => {
      row.style.textAlign = 'left';
      row.style.width = '100%';
    });

    document.querySelectorAll('.gd-roster-row strong').forEach((name) => {
      name.style.color = '#11151f';
    });
  };

  CR.initGameDay = () => {
    bindRosterButtons();
    bindManageButtons();
    cleanRosterRows();
  };

  document.addEventListener('DOMContentLoaded', () => {
    CR.initGameDay();
  });
})();