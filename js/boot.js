window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const SIGN_IN_COOLDOWN_MS = 31 * 60 * 1000;
  const TRANSITION_MS = 220;

  const STATES = {
    BOOTING: 'BOOTING',
    SIGNED_OUT: 'SIGNED_OUT',
    UNAUTHORIZED: 'UNAUTHORIZED',
    PROFILE_MISSING: 'PROFILE_MISSING',
    READY: 'READY',
    AUTH_ERROR: 'AUTH_ERROR'
  };

  CR.pendingAuthEmail = CR.pendingAuthEmail || '';
  CR.__bootInFlight = false;

  function root() {
    return document.querySelector('#appRoot');
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function render(content, className = 'boot-stage') {
    const el = root();
    if (!el) return;
    el.innerHTML = `<div class="${className} boot-enter">${content}</div>`;

    window.requestAnimationFrame(() => {
      el.querySelector('.boot-enter')?.classList.add('is-visible');
    });
  }

  async function transitionOutCurrentStage() {
    const currentStage = root()?.firstElementChild;
    if (!currentStage) return;

    currentStage.classList.remove('is-visible');
    currentStage.classList.add('boot-exit');
    await wait(TRANSITION_MS);
  }

  async function swapStage(content, className = 'boot-stage') {
    await transitionOutCurrentStage();
    render(content, className);
  }

  async function mountShell(useTransition = true) {
    const template = document.querySelector('#appShellTemplate');
    const el = root();

    if (!template || !el) return;

    if (useTransition && root()?.firstElementChild) {
      await transitionOutCurrentStage();
    }

    el.innerHTML = `<div class="app-shell-stage boot-enter">${template.innerHTML}</div>`;

    window.requestAnimationFrame(() => {
      el.querySelector('.app-shell-stage')?.classList.add('is-visible');
    });

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

  async function boot() {
    if (CR.__bootInFlight) return;
    CR.__bootInFlight = true;

    try {
      const existingSession = await CR.auth.getSession();
      const hasExistingSession = !!existingSession?.user;

      if (!hasExistingSession) {
        if (!root()?.firstElementChild) {
          render(CR.authUi.renderBoot(), 'boot-stage auth-stage');
        } else {
          await swapStage(CR.authUi.renderBoot(), 'boot-stage auth-stage');
        }
      }

      const resolved = await resolveSessionState();

      switch (resolved.state) {
        case STATES.SIGNED_OUT:
          await swapStage(CR.authUi.renderSignedOut(), 'boot-stage auth-stage');
          bindAuthUi();
          return;

        case STATES.UNAUTHORIZED:
          await swapStage(CR.authUi.renderUnauthorized(resolved.email), 'boot-stage auth-stage');
          bindAuthUi();
          return;

        case STATES.PROFILE_MISSING:
          await swapStage(CR.authUi.renderProfileMissing(resolved.email), 'boot-stage auth-stage');
          bindAuthUi();
          return;

        case STATES.READY: {
          const shellAlreadyMounted = !!document.querySelector('#bottomNav');
          const sameUserAlreadyMounted = shellAlreadyMounted && CR.currentUser?.id === resolved.user.id;

          CR.session = resolved.session;
          CR.currentUser = resolved.user;
          CR.currentProfile = resolved.profile;

          if (sameUserAlreadyMounted) {
            return;
          }

          await mountShell(!hasExistingSession);
          return;
        }

        default:
          throw new Error('Unknown boot state.');
      }
    } catch (error) {
      console.error('Boot failed', error);
    } finally {
      CR.__bootInFlight = false;
    }
  }

  window.CR.boot = boot;

  document.addEventListener('DOMContentLoaded', async () => {
    await boot();

    try {
      const supabase = await CR.getSupabase();
      let sawInitialAuthCallback = false;

      supabase.auth.onAuthStateChange((event) => {
        if (!sawInitialAuthCallback) {
          sawInitialAuthCallback = true;
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
            return;
          }
        }

        boot();
      });
    } catch (error) {
      console.error('Auth listener setup failed', error);
    }
  });
})();
