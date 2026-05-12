window.CR = window.CR || {};

(() => {
  const CR = window.CR;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function shell(message, body, actions = '') {
    return `
      <div class="auth-screen">
        <div class="auth-card">
          <div class="auth-brand">
            <div class="auth-brand-mark">
              <img class="auth-brand-icon" src="./assets/app-icon.png" alt="Canes Rivalry app icon" />
            </div>

            <div>
              <div class="auth-kicker">Canes Rivalry</div>
              <div class="auth-brand-subtitle">Carolina hockey rivalry tracker</div>
            </div>
          </div>

          <h1 class="auth-title">${message}</h1>
          <p class="auth-copy">${body}</p>

          ${actions ? `<div class="auth-actions">${actions}</div>` : ''}

          <div class="auth-footnote">Game day picks, rivalry tracking, and season history.</div>
        </div>
      </div>
    `;
  }

  function renderBoot(message = 'Loading Canes Rivalry') {
    return shell(message, 'Getting your rivalry session ready.');
  }

  function renderSignedOut(email = '') {
    return shell(
      'Sign in',
      'Enter your approved email to request a one-time sign-in code.',
      `
        <form class="auth-form" id="authSignInForm">
          <label class="auth-label" for="authEmailInput">Email</label>
          <input class="auth-input" id="authEmailInput" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" value="${escapeHtml(email)}" required />
          <button class="auth-button" type="submit" id="authSubmitButton">Send code</button>
        </form>

        <div class="auth-status" id="authStatus"></div>
      `
    );
  }

  function renderTokenStep(email = '') {
    return shell(
      'Enter code',
      `Type the sign-in code sent to ${escapeHtml(email || 'your email')}.`,
      `
        <form class="auth-form" id="authVerifyForm">
          <label class="auth-label" for="authTokenInput">Sign-in code</label>
          <input class="auth-input auth-input-code" id="authTokenInput" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" required />
          <button class="auth-button" type="submit" id="authVerifyButton">Verify code</button>
          <button class="auth-button auth-button-secondary" type="button" id="authBackButton">Back</button>
        </form>

        <div class="auth-status" id="authStatus"></div>
      `
    );
  }

  function renderUnauthorized(email = '') {
    return shell(
      'Access not enabled',
      `${escapeHtml(email || 'This account')} is signed in, but it is not currently enabled for Canes Rivalry.`,
      '<button class="auth-button auth-button-secondary" type="button" id="authSignOutButton">Sign out</button>'
    );
  }

  function renderProfileMissing(email = '') {
    return shell(
      'Account still needs setup',
      `${escapeHtml(email || 'This account')} is approved, but the rivalry profile is not ready yet.`,
      '<button class="auth-button auth-button-secondary" type="button" id="authSignOutButton">Sign out</button>'
    );
  }

  function renderAuthError(message = 'Something went sideways during sign-in.') {
    return shell(
      'Sign-in issue',
      escapeHtml(message),
      '<button class="auth-button auth-button-secondary" type="button" id="retryBootButton">Try again</button>'
    );
  }

  CR.authUi = {
    renderBoot,
    renderSignedOut,
    renderTokenStep,
    renderUnauthorized,
    renderProfileMissing,
    renderAuthError
  };
})();
