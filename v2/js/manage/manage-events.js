window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function getNestedValue(target, path) {
    return String(path || '').split('.').reduce((acc, key) => (acc ? acc[key] : undefined), target);
  }

  function setNestedValue(target, path, value) {
    const keys = String(path || '').split('.').filter(Boolean);
    if (!keys.length) return;

    let cursor = target;
    for (let i = 0; i < keys.length - 1; i += 1) {
      cursor = cursor[keys[i]];
      if (!cursor) return;
    }

    cursor[keys[keys.length - 1]] = value;
  }

  function labelForStreamOption(value) {
    const option = CR.manageState?.streamMode?.options?.find((item) => item.value === value);
    return option?.label || 'Updated';
  }

  function bindManageEvents() {
    const root = document.querySelector('#manageContent');
    if (!root) return;

    root.addEventListener('click', (event) => {
      const toggleButton = event.target.closest('[data-manage-toggle]');
      if (toggleButton) {
        const key = toggleButton.dataset.manageToggle;
        const currentValue = Boolean(getNestedValue(CR.manageState, key));
        setNestedValue(CR.manageState, key, !currentValue);
        CR.renderManage?.();
        CR.showToast?.({ message: `${toggleButton.querySelector('.manage-toggle-label')?.textContent || 'Setting'} ${!currentValue ? 'on' : 'off'}` });
        return;
      }

      const streamOption = event.target.closest('[data-manage-stream-option]');
      if (streamOption) {
        const nextValue = streamOption.dataset.manageStreamOption;
        CR.manageState.streamMode.selected = nextValue;
        CR.renderManage?.();
        CR.showToast?.({ message: `Stream Mode set to ${labelForStreamOption(nextValue)}` });
        return;
      }

      const inlineChoice = event.target.closest('[data-manage-choice]');
      if (inlineChoice) {
        const key = inlineChoice.dataset.manageChoice;
        const value = inlineChoice.dataset.manageValue;
        setNestedValue(CR.manageState, key, value);
        CR.renderManage?.();
        CR.showToast?.({ message: `${inlineChoice.textContent || 'Preference'} selected` });
        return;
      }

      const actionButton = event.target.closest('[data-manage-action]');
      if (actionButton) {
        const action = actionButton.dataset.manageAction;
        const labels = {
          carryover: 'Carryover review coming next',
          commissioner: 'Commissioner tools will hook in later',
          health: 'Health check placeholder run'
        };
        CR.showToast?.({ message: labels[action] || 'Manage action triggered' });
      }
    });
  }

  CR.manageEvents = {
    bindManageEvents
  };
})();
