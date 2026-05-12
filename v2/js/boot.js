window.CR = window.CR || {};

(() => {
  const CR = window.CR;
  const SIGN_IN_COOLDOWN_MS = 90 * 1000;

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

  function genericSignInSuccessMessage() {
    return 'If this email is approved, a sign-in code has been sent.';
  }

  function genericSignInErrorMessage(error) {
    const message = String(error?.message || '').toLowerCase();

    if (message.includes('rate limit')) {
      return 'Too many sign-in attempts. Please wait a bit and try again.';
    }

    if (message.includes('invalid email')) {
      return 'Enter a valid email address.';
    }

    return 'Unable to send a sign-in code right now. Please try again.';
  }

  function cooldownEndsAt() {
    return Number(window.localStorage?.getItem('cr_v2_signin_cooldown_until') || 0);
  }

  function setCooldown(msFromNow = SIGN_IN_COOLDOWN_MS) {
    const until = Date.now() + msFromNow;
    window.localStorage?.setItem('cr_v2_signin_cooldown_until', String(until));
    return until;
  }

  function clearCooldown() {
    window.localStorage?.removeItem('cr_v2_signin_cooldown_until');
  }

  function cooldownRemainingMs() {
    return Math.max(0, cooldownEndsAt() - Date.now());
  }

  function formatCooldownMessage(ms) {
    const seconds = Math.max(1, Math.ceil(ms / 1000));
    return `Code recently requested. Try again in ${seconds}s.`;
  }

  function applyCooldownUi() {
    const button = document.querySelector('#authSubmitButton');
    const status = document.querySelector('#authStatus');
    const remaining = cooldownRemainingMs();

    if (!button) return;

    if (remaining > 0) {
      button.disabled = true;
      button.textContent = 'Code requested';
      if (status && !status.textContent) {
        status.textContent = formatCooldownMessage(remaining);
      }
      return true;
    }

    button.disabled = false;
    button.textContent = 'Send sign-in code';
    return false;
  }

  function startCooldownTicker() {
    window.clearInterval(window.CR.__signInCooldownTimer);

    window.CR.__signInCooldownTimer = window.setInterval(() => {
      const status = document.querySelector('#authStatus');
      const active = applyCooldownUi();
      const remaining = cooldownRemainingMs();

      if (active) {
        if (status) status.textContent = formatCooldownMessage(remaining);
        return;
      }

      window.clearInterval(window.CR.__signInCooldownTimer);
      if (status && status.textContent.startsWith('Code recently requested.')) {
        status.textContent = '';
      }
      clearCooldown();
    }, 1000);
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

    const submitter = event.submitter;
    if (!submitter || submitter.id !== 'authSubmitButton') {
      return;
    }

    const emailInput = document.querySelector('#authEmailInput');
    const status = document.querySelector('#authStatus');
    const button = document.querySelector('#authSubmitButton');
    const email = String(emailInput?.value || '').trim();

    if (!email) {
      if (status) status.textContent = 'Enter your approved email.';
      return;
    }

    if (cooldownRemainingMs() > 0) {
      if (status) status.textContent = formatCooldownMessage(cooldownRemainingMs());
      applyCooldownUi();
      startCooldownTicker();
      return;
    }

    if (button) button.disabled = true;
    if (status) status.textContent = 'Sending sign-in code...';

    try {
      const { error } = await CR.auth.signIn(email);
      if (error) throw error;
      setCooldown();
      applyCooldownUi();
      startCooldownTicker();
      if (status) status.textContent = genericSignInSuccessMessage();
    } catch (error) {
      console.error(error);
      if (status) status.textContent = genericSignInErrorMessage(error);
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
    const form = document.querySelector('#authSignInForm');
    const emailInput = document.querySelector('#authEmailInput');
    const status = document.querySelector('#authStatus');

    form?.addEventListener('submit', handleSignIn);
    emailInput?.addEventListener('input', () => {
      if (status && !cooldownRemainingMs()) status.textContent = '';
    });
    document.querySelector('#authSignOutButton')?.addEventListener('click', handleSignOut);
    document.querySelector('#retryBootButton')?.addEventListener('click', boot);

    applyCooldownUi();
    if (cooldownRemainingMs() > 0) {
      startCooldownTicker();
    }
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

  document.addEventListener('DOMContentLoaded', async () => {
    await boot();

    try {
      const supabase = await CR.getSupabase();

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
