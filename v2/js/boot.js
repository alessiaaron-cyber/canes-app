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

  function genericSignInSuccessMessage() {
    return 'If this email is approved, a sign-in code has been sent.';
  }

  function genericSignInErrorMessage(error) {
    const message = String(error?.message || '').toLowerCase();

    if (message.includes('rate limit')) {
      return 'Too many sign-in attempts. Please wait before requesting another code.';
    }

    if (message.includes('invalid email')) {
      return 'Enter a valid email address.';
    }

    return 'Unable to send a sign-in code right now. Please try again later.';
  }

  function genericVerifyErrorMessage() {
    return 'Invalid or expired sign-in code. Please try again.';
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
    const minutes = Math.ceil(ms / 60000);
    return `Code recently requested. Try again in about ${minutes} min.`;
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
    button.textContent = 'Send code';
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
    }, 30 * 1000);
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

  function renderTokenStep(email) {
    CR.pendingAuthEmail = email;
    render(CR.authUi.renderTokenStep(email), 'boot-stage auth-stage');
    bindTokenUi();
  }

  async function showSuccessTransition() {
    await swapStage(CR.authUi.renderBoot('Signing you in'), 'boot-stage auth-stage auth-stage-success');
    await wait(520);
  }

  async function handleSignIn(event) {
    event?.preventDefault?.();

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

    setCooldown();
    applyCooldownUi();
    startCooldownTicker();

    if (button) button.disabled = true;
    if (status) status.textContent = 'Sending sign-in code...';

    try {
      const { error } = await CR.auth.requestOtp(email);
      if (error) throw error;

      renderTokenStep(email);

      const tokenStatus = document.querySelector('#authStatus');
      if (tokenStatus) {
        tokenStatus.textContent = genericSignInSuccessMessage();
      }
    } catch (error) {
      console.error(error);
      if (status) status.textContent = genericSignInErrorMessage(error);
    }
  }

  async function handleVerify(event) {
    event?.preventDefault?.();

    const tokenInput = document.querySelector('#authTokenInput');
    const status = document.querySelector('#authStatus');
    const button = document.querySelector('#authVerifyButton');

    const token = String(tokenInput?.value || '').trim();
    const email = String(CR.pendingAuthEmail || '').trim();

    if (!token || !email) {
      if (status) status.textContent = 'Enter the sign-in code from your email.';
      return;
    }

    if (button) button.disabled = true;
    if (status) status.textContent = 'Verifying sign-in code...';

    try {
      const { error } = await CR.auth.verifyOtp(email, token);
      if (error) throw error;

      CR.pendingAuthEmail = '';
      clearCooldown();
      await showSuccessTransition();
      await boot();
    } catch (error) {
      console.error(error);
      if (status) status.textContent = genericVerifyErrorMessage();
      if (button) button.disabled = false;
    }
  }

  function handleBackToEmail() {
    render(CR.authUi.renderSignedOut(CR.pendingAuthEmail), 'boot-stage auth-stage');
    bindAuthUi();
  }

  async function handleSignOut() {
    try {
      await CR.auth.signOut();
    } catch (error) {
      console.error('Sign out failed', error);
    }

    await boot();
  }

  function bindTokenUi() {
    document.querySelector('#authVerifyForm')?.addEventListener('submit', (event) => event.preventDefault());
    document.querySelector('#authVerifyButton')?.addEventListener('click', handleVerify);
    document.querySelector('#authBackButton')?.addEventListener('click', handleBackToEmail);
  }

  function bindAuthUi() {
    const form = document.querySelector('#authSignInForm');
    const emailInput = document.querySelector('#authEmailInput');
    const status = document.querySelector('#authStatus');
    const submitButton = document.querySelector('#authSubmitButton');

    form?.addEventListener('submit', (event) => event.preventDefault());
    submitButton?.addEventListener('click', handleSignIn);
    emailInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSignIn(event);
      }
    });
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

        case STATES.READY:
          CR.session = resolved.session;
          CR.currentUser = resolved.user;
          CR.currentProfile = resolved.profile;
          await mountShell(!hasExistingSession);
          return;

        default:
          throw new Error('Unknown boot state.');
      }
    } catch (error) {
      console.error('Boot failed', error);
      await swapStage(CR.authUi.renderAuthError(error?.message || 'Unable to load Canes Rivalry V2.'), 'boot-stage auth-stage');
      bindAuthUi();
    } finally {
      CR.__bootInFlight = false;
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
      let sawInitialAuthCallback = false;

      supabase.auth.onAuthStateChange((event) => {
        if (!sawInitialAuthCallback) {
          sawInitialAuthCallback = true;
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
            return;
          }
        }

        const hasShell = !!document.querySelector('#bottomNav');
        const hasAuthScreen = !!document.querySelector('#authSignInForm') || !!document.querySelector('#authVerifyForm');

        if (!hasShell && !hasAuthScreen) return;
        boot();
      });
    } catch (error) {
      console.error('Auth listener setup failed', error);
    }
  });
})();
