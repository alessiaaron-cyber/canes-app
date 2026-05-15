window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function currentUserEmail() {
    return String(CR.currentUser?.email || CR.authState?.user?.email || '').toLowerCase().trim();
  }

  function currentGameId() {
    return String(CR.gameDay?.currentGameId || '');
  }

  function belongsToCurrentGame(row = {}) {
    const gameId = currentGameId();
    if (!gameId) return false;
    return String(row.game_id || '') === gameId;
  }

  function shouldToast(row = {}) {
    if (!row || row.event_type !== 'push_notification') return false;
    if (!belongsToCurrentGame(row)) return false;

    const payload = row.payload || {};
    const triggeredBy = String(payload.triggered_by || '').toLowerCase().trim();
    const email = currentUserEmail();

    if (triggeredBy && email && triggeredBy === email) return false;
    return true;
  }

  function toastRow(row = {}) {
    if (!shouldToast(row)) return;

    const payload = row.payload || {};
    const title = payload.title || 'Canes Rivalry';
    const message = payload.message || 'Rivalry update.';

    CR.showToast?.(`${title}: ${message}`);
  }

  function register() {
    if (CR.__rivalryEventsConsumerRegistered || !CR.realtime?.register) return;

    CR.__rivalryEventsConsumerRegistered = true;
    CR.realtime.register('rivalry-events-toasts', {
      tables: ['rivalry_events'],
      debounceMs: 0,
      onChange: (payloads = []) => {
        payloads.forEach((payload) => {
          if (payload.eventType === 'DELETE') return;
          toastRow(payload.new || {});
        });
      }
    });

    CR.realtime.start?.();
  }

  CR.rivalryEventsConsumer = {
    register,
    shouldToast,
    toastRow
  };
})();
