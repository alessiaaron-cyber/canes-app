window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  const STATES = {
    BOOTING: 'BOOTING',
    SIGNED_OUT: 'SIGNED_OUT',
    UNAUTHORIZED: 'UNAUTHORIZED',
    PROFILE_MISSING: 'PROFILE_MISSING',
    READY: 'READY',
    AUTH_ERROR: 'AUTH_ERROR'
  };

  function root() {
    return document.querySelector('#appRoot');
  }

  function render(content) {
    const el = root();
    if (!el) return;
    el.innerHTML = content;
  }

  function mountShell() {
    const template = document.querySelector('#appShellTemplate');
    const el = root();

    if (!template || !el) return;

    el.innerHTML = template.innerHTML;
    CR.startApp?.();
  }

  async function resolveSessionState() {
    const session = await CR.auth.getSession();

    if (!session?.user) {
      return {
        state: STATES.SIGNED_OUT
      };
    }

    const user = session.user;
    const email = String(user.email || '').trim();

    const allowed = await CR.auth.isAllowedUser(email);

    if (!allowed) {
      return {
        state: STATES.UNAUTHORIZED,
        email
      };
    }

    const profile = await CR.auth.loadProfile(user);

    if (!profile) {
      return {
        state: STATES.PROFILE_MISSING,
        email
      };
    }

    return {
      state: STATES.READY,
      session,
      user,
      profile
    };
  }

  window.CR.bootState = STATES;
  window.CR.mountShell = mountShell;
  window.CR.resolveSessionState = resolveSessionState;
  window.CR.renderBootScreen = render;
})();
