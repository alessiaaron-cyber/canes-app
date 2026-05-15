window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const INTERVAL_MS = 30000;
  let timer = null;

  function canCheckPush() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  async function getEmail() {
    if (CR.currentUser?.email) return CR.currentUser.email;
    const session = await CR.auth?.getSession?.();
    return session?.user?.email || '';
  }

  async function getEndpoint() {
    if (!canCheckPush()) return '';
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration?.pushManager?.getSubscription?.();
    return subscription?.endpoint || '';
  }

  async function markActive() {
    if (document.hidden) return;

    try {
      const email = await getEmail();
      const endpoint = await getEndpoint();
      if (!email || !endpoint) return;

      const db = await CR.getSupabase();
      const { error } = await db
        .from('push_subscriptions')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('endpoint', endpoint)
        .eq('user_email', email);

      if (error) throw error;
    } catch (error) {
      console.warn('Active device update failed', error);
    }
  }

  function start() {
    if (timer) return;
    markActive();
    timer = setInterval(markActive, INTERVAL_MS);
  }

  function bind() {
    if (CR.__activeDeviceBound) return;
    CR.__activeDeviceBound = true;

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) markActive();
    });
    window.addEventListener('focus', markActive);
    window.addEventListener('pageshow', markActive);
  }

  CR.activeDeviceService = {
    bind,
    start,
    markActive
  };
})();
