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

  function closeEditSheet() {
    if (!CR.manageState) return;
    CR.manageState.activeEditField = null;
    CR.renderManage?.();
  }

  function bindManageEvents() {
    const root = document.querySelector('#manageContent');
    if (!root) return;

    root.addEventListener('click', (event) => {
      const editTrigger = event.target.closest('[data-manage-edit]');
      if (editTrigger) {
        CR.manageState.activeEditField = editTrigger.dataset.manageEdit;
        CR.renderManage?.();
        return;
      }

      const closeEdit = event.target.closest('[data-manage-close-edit]');
      if (closeEdit) {
        closeEditSheet();
        return;
      }

      const editOption = event.target.closest('[data-manage-edit-value]');
      if (editOption) {
        const field = CR.manageState.activeEditField;
        const value = editOption.dataset.manageEditValue;
        if (field && Object.prototype.hasOwnProperty.call(CR.manageState.season, field)) {
          CR.manageState.season[field] = value;
          CR.manageState.activeEditField = null;
          CR.renderManage?.();
          CR.showToast?.({ message: `${value} selected` });
        }
        return;
      }

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
      }
    });
  }

  CR.manageEvents = {
    bindManageEvents
  };
})();
