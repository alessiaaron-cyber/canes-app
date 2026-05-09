import { GAME_STATES, PICKS, FEED_ITEMS } from './gameday-state.js';

let currentState = 'pregame';

function updateHeader(stateKey) {
  const labelMap = {
    pregame: ['Pregame Ready', 'Editable', 'soft'],
    live: ['Live Game', 'Live', 'live'],
    final: ['Final Result', 'Final', 'final']
  };

  const [title, badge, badgeClass] = labelMap[stateKey] || labelMap.pregame;
  const titleEl = document.querySelector('#stateTitle');
  const badgeEl = document.querySelector('#stateBadge');

  if (titleEl) titleEl.textContent = title;
  if (badgeEl) {
    badgeEl.textContent = badge;
    badgeEl.className = `status-chip status-chip--${badgeClass}`;
  }
}

function renderPicks() {
  return `
    <section class="surface-card section-card page-stack">
      <div class="section-heading section-heading--tight">
        <div>
          <div class="eyebrow">2 players each</div>
          <h2 class="section-title">Rivalry Picks</h2>
        </div>
        <button class="pill-button" type="button">Stats</button>
      </div>

      <div class="picks-grid">
        <article class="pick-panel pick-panel--red">
          <header class="pick-panel__header"><span>Aaron</span><span>2 Picks</span></header>
          <div class="pick-list">
            ${PICKS.aaron.map((player) => `
              <div class="pick-item">
                <div class="pick-player">${player.name}<small>${player.detail}</small></div>
                <div class="pick-value">${player.value}</div>
              </div>
            `).join('')}
          </div>
        </article>

        <article class="pick-panel pick-panel--dark">
          <header class="pick-panel__header"><span>Julie</span><span>2 Picks</span></header>
          <div class="pick-list">
            ${PICKS.julie.map((player) => `
              <div class="pick-item">
                <div class="pick-player">${player.name}<small>${player.detail}</small></div>
                <div class="pick-value">${player.value}</div>
              </div>
            `).join('')}
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderPregame() {
  const state = GAME_STATES.pregame;
  return `
    <section class="surface-card section-card gameday-hero">
      <div class="matchup-row">
        <div class="avatar-ring avatar-ring--leader"><span class="avatar-ring__letter">A</span></div>
        <div class="matchup-meta">
          <div class="matchup-names">
            <span class="matchup-name">${state.hero.left}</span>
            <span class="matchup-versus">VS</span>
            <span class="matchup-name">${state.hero.right}</span>
          </div>
          <div class="matchup-details">${state.hero.puckDrop}<br>${state.hero.venue}</div>
          <div class="lock-banner"><span class="status-chip status-chip--soft">Picks lock at puck drop</span></div>
        </div>
        <div class="avatar-ring"><span class="avatar-ring__letter">J</span></div>
      </div>
    </section>
    ${renderPicks()}
  `;
}

function renderLive() {
  const state = GAME_STATES.live;
  return `
    <section class="surface-card section-card gameday-hero page-stack">
      <div class="live-meta">
        <span class="status-chip status-chip--live">Live</span>
        <span class="card-meta">${state.period} • ${state.clock}</span>
        <span class="status-chip status-chip--success">Synced</span>
      </div>

      <div class="hero-scoreboard">
        <div class="hero-score"><div class="hero-score__label">Aaron</div><div class="hero-score__value">${state.score.left}</div></div>
        <div class="hero-center-logo"><img src="./assets/app-icon.png" alt="Canes Rivalry"><div class="card-meta">Rivalry Score</div></div>
        <div class="hero-score"><div class="hero-score__label">Julie</div><div class="hero-score__value">${state.score.right}</div></div>
      </div>

      <div>
        <div class="card-title-row"><span class="card-meta">Momentum</span><span class="card-meta">Aaron surge</span></div>
        <div class="momentum-track"><div class="momentum-fill"></div><div class="momentum-puck"></div></div>
      </div>
    </section>
    ${renderPicks()}
    <section class="surface-card section-card page-stack">
      <div class="section-heading section-heading--tight">
        <div><div class="eyebrow">Live rivalry feed</div><h2 class="section-title">Big Moments</h2></div>
      </div>
      <div class="feed-list">
        ${FEED_ITEMS.map((item) => `
          <article class="feed-item">
            <div class="feed-item__icon">${item.icon}</div>
            <div><div class="feed-item__title">${item.title}</div><div class="feed-item__subtitle">${item.subtitle}</div></div>
            <div class="feed-item__score">${item.score}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderFinal() {
  const state = GAME_STATES.final;
  return `
    <section class="surface-card section-card gameday-hero page-stack">
      <div class="final-banner"><h2 class="final-banner__title">${state.winner}</h2></div>
      <div class="hero-scoreboard">
        <div class="hero-score"><div class="hero-score__label">Aaron</div><div class="hero-score__value">${state.score.left}</div></div>
        <div class="hero-center-logo"><img src="./assets/app-icon.png" alt="Canes Rivalry"><div class="card-meta">Final</div></div>
        <div class="hero-score"><div class="hero-score__label">Julie</div><div class="hero-score__value">${state.score.right}</div></div>
      </div>
    </section>

    <section class="surface-card section-card page-stack">
      <div class="final-summary-grid">
        <article class="final-summary-card"><div class="final-summary-card__label">Final Score</div><div class="final-summary-card__value">5–2</div></article>
        <article class="final-summary-card"><div class="final-summary-card__label">Rivalry Points</div><div class="final-summary-card__value">${state.rivalryPoints}</div></article>
        <article class="final-summary-card"><div class="final-summary-card__label">Winner</div><div class="final-summary-card__value">Aaron</div></article>
      </div>
    </section>

    <section class="surface-card section-card">
      <div class="section-heading section-heading--tight">
        <div><div class="eyebrow">Rivalry MVP</div><h2 class="section-title">Sebastian Aho</h2></div>
      </div>
      <div class="mvp-card">
        <div class="avatar-ring avatar-ring--leader"><span class="avatar-ring__letter">A</span></div>
        <div class="mvp-meta"><h3>S. Aho</h3><p>1 Goal • 1 Assist • First Goal Bonus</p></div>
        <div class="mvp-points">+3</div>
      </div>
    </section>
  `;
}

export function renderGameDayPage(stateKey = currentState) {
  currentState = stateKey;
  if (stateKey === 'live') return renderLive();
  if (stateKey === 'final') return renderFinal();
  return renderPregame();
}

export function initGameDayStateLab() {
  const app = document.querySelector('#gameDayContent');
  const buttons = document.querySelectorAll('#stateSwitcher button[data-mode]');

  if (!app) return;

  function paint() {
    app.innerHTML = renderGameDayPage(currentState);
    updateHeader(currentState);
    buttons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === currentState);
    });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      currentState = button.dataset.mode;
      paint();
    });
  });

  paint();
}