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

  async function handleSignIn(event) {
    event.preventDefault();

    const emailInput = document.querySelector('#authEmailInput');
    const status = document.querySelector('#authStatus');
    const button = document.querySelector('#authSubmitButton');
    const email = String(emailInput?.value || '').trim();

    if (!email) {
      if (status) status.textContent = 'Enter your approved email.';
      return;
    }

    if (button) button.disabled = true;
    if (status) status.textContent = 'Sending sign-in code...';

    try {
      const { error } = await CR.auth.signIn(email);
      if (error) throw error;
      if (status) status.textContent = 'Check your email for the sign-in code.';
    } catch (error) {
      console.error(error);
      if (status) status.textContent = error?.message || 'Unable to send sign-in code.';
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function handleSignOut() {
    try {
      await CR.auth.signOut();
    } catch (error) {
      console.error('Sign out failed', error);
    }

    await boot();
  }

  function bindAuthUi() {
    document.querySelector('#authSignInForm')?.addEventListener('submit', handleSignIn);
    document.querySelector('#authSignOutButton')?.addEventListener('click', handleSignOut);
    document.querySelector('#retryBootButton')?.addEventListener('click', boot);
  }

  async function boot() {
    try {
      render(CR.authUi.renderBoot());

      const resolved = await resolveSessionState();

      switch (resolved.state) {
        case STATES.SIGNED_OUT:
          render(CR.authUi.renderSignedOut());
          bindAuthUi();
          return;

        case STATES.UNAUTHORIZED:
          render(CR.authUi.renderUnauthorized(resolved.email));
          bindAuthUi();
          return;

        case STATES.PROFILE_MISSING:
          render(CR.authUi.renderProfileMissing(resolved.email));
          bindAuthUi();
          return;

        case STATES.READY:
          CR.session = resolved.session;
          CR.currentUser = resolved.user;
          CR.currentProfile = resolved.profile;
          mountShell();
          return;

        default:
          throw new Error('Unknown boot state.');
      }
    } catch (error) {
      console.error('Boot failed', error);
      render(CR.authUi.renderAuthError(error?.message || 'Unable to load Canes Rivalry V2.'));
      bindAuthUi();
    }
  }

  window.CR.bootState = STATES;
  window.CR.mountShell = mountShell;
  window.CR.resolveSessionState = resolveSessionState;
  window.CR.renderBootScreen = render;
  window.CR.boot = boot;

  document.addEventListener('DOMContentLoaded', () => {
    boot();

    try {
      const supabase = CR.getSupabase();
      supabase.auth.onAuthStateChange(() => {
        const hasShell = !!document.querySelector('#bottomNav');
        if (!hasShell) return;
        boot();
      });
    } catch (error) {
      console.error('Auth listener setup failed', error);
    }
  });
})();
