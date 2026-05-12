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
          <div class="auth-mark">🏒</div>
          <div class="auth-kicker">Canes Rivalry V2</div>
          <h1 class="auth-title">${message}</h1>
          <p class="auth-copy">${body}</p>
          ${actions ? `<div class="auth-actions">${actions}</div>` : ''}
          <div class="auth-footnote">Private rivalry tracker • protected preview</div>
        </div>
      </div>
    `;
  }

  function renderBoot(message = 'Loading Canes Rivalry') {
    return shell(message, 'Checking your session and account access.');
  }

  function renderSignedOut(email = '') {
    return shell(
      'Sign in',
      'Use your approved email to request a one-time sign-in code.',
      `
        <form class="auth-form" id="authSignInForm">
          <label class="auth-label" for="authEmailInput">Approved email</label>
          <input class="auth-input" id="authEmailInput" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" value="${escapeHtml(email)}" required />
          <button class="auth-button" type="submit" id="authSubmitButton">Send sign-in code</button>
        </form>
        <div class="auth-status" id="authStatus"></div>
      `
    );
  }

  function renderTokenStep(email = '') {
    return shell(
      'Enter sign-in code',
      `Enter the code sent to ${escapeHtml(email || 'your email')}.`,
      `
        <form class="auth-form" id="authVerifyForm">
          <label class="auth-label" for="authTokenInput">Email code</label>
          <input class="auth-input" id="authTokenInput" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" required />
          <button class="auth-button" type="submit" id="authVerifyButton">Verify code</button>
          <button class="auth-button auth-button-secondary" type="button" id="authBackButton">Back</button>
        </form>
        <div class="auth-status" id="authStatus"></div>
      `
    );
  }

  function renderUnauthorized(email = '') {
    return shell(
      'Not approved yet',
      `${escapeHtml(email || 'This account')} is signed in, but it is not currently allowed to use Canes Rivalry V2.`,
      '<button class="auth-button auth-button-secondary" type="button" id="authSignOutButton">Sign out</button>'
    );
  }

  function renderProfileMissing(email = '') {
    return shell(
      'Account setup missing',
      `${escapeHtml(email || 'This account')} is approved, but no active V2 profile was found yet.`,
      '<button class="auth-button auth-button-secondary" type="button" id="authSignOutButton">Sign out</button>'
    );
  }

  function renderAuthError(message = 'Something went sideways during sign-in.') {
    return shell(
      'Auth issue',
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
