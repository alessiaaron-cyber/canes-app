import { GAME_STATES, PICKS, FEED_ITEMS } from './gameday-state.js';

const app = document.querySelector('#app');
const buttons = document.querySelectorAll('[data-state]');

let currentState = 'pregame';

function renderPicks() {
  return `
    <section class="card section-card stack">
      <div class="card-title-row">
        <div>
          <div class="card-meta">Select 2 players each</div>
          <h2 class="card-title">Rivalry Picks</h2>
        </div>
        <button class="pill-button">Stats</button>
      </div>

      <div class="picks-grid">
        <article class="pick-panel pick-panel--red">
          <header class="pick-panel__header">
            <span>Aaron's Picks</span>
            <span>0/2</span>
          </header>

          <div class="pick-list">
            ${PICKS.aaron.map(player => `
              <div class="pick-item">
                <div>
                  <div class="pick-player">${player.name}<small>${player.detail}</small></div>
                </div>
                <div class="pick-value">${player.value}</div>
              </div>
            `).join('')}
          </div>
        </article>

        <article class="pick-panel pick-panel--dark">
          <header class="pick-panel__header">
            <span>Julie's Picks</span>
            <span>0/2</span>
          </header>

          <div class="pick-list">
            ${PICKS.julie.map(player => `
              <div class="pick-item">
                <div>
                  <div class="pick-player">${player.name}<small>${player.detail}</small></div>
                </div>
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
    <section class="card gameday-hero">
      <div class="matchup-row">
        <div class="avatar-ring avatar-ring--leader">
          <span class="avatar-ring__letter">A</span>
        </div>

        <div class="matchup-meta">
          <div class="matchup-names">
            <span class="matchup-name">${state.hero.left}</span>
            <span class="matchup-versus">VS</span>
            <span class="matchup-name">${state.hero.right}</span>
          </div>

          <div class="matchup-details">
            ${state.hero.puckDrop}<br>
            ${state.hero.venue}
          </div>

          <div class="lock-banner">
            <span class="pill pill--soft">🔒 Picks lock at puck drop</span>
          </div>
        </div>

        <div class="avatar-ring">
          <span class="avatar-ring__letter">J</span>
        </div>
      </div>
    </section>

    ${renderPicks()}
  `;
}

function renderLive() {
  const state = GAME_STATES.live;

  return `
    <section class="card gameday-hero stack">
      <div class="live-meta">
        <span class="pill pill--live">Live</span>
        <span class="card-meta">${state.period} • ${state.clock}</span>
        <span class="pill pill--success">Synced</span>
      </div>

      <div class="hero-scoreboard">
        <div class="hero-score">
          <div class="hero-score__label">Aaron</div>
          <div class="hero-score__value">${state.score.left}</div>
        </div>

        <div class="hero-center-logo">
          <img src="./assets/app-icon.png" alt="Canes Rivalry" />
          <div class="card-meta">Rivalry Score</div>
        </div>

        <div class="hero-score">
          <div class="hero-score__label">Julie</div>
          <div class="hero-score__value">${state.score.right}</div>
        </div>
      </div>

      <div>
        <div class="card-title-row">
          <span class="card-meta">Momentum</span>
          <span class="card-meta">Aaron surge</span>
        </div>

        <div class="momentum-track">
          <div class="momentum-fill"></div>
          <div class="momentum-puck"></div>
        </div>
      </div>
    </section>

    <section class="card section-card stack">
      <div class="card-title-row">
        <div>
          <div class="card-meta">Live rivalry feed</div>
          <h2 class="card-title">Big Moments</h2>
        </div>

        <button class="pill-button">Filter</button>
      </div>

      <div class="feed-list">
        ${FEED_ITEMS.map(item => `
          <article class="feed-item">
            <div class="feed-item__icon">${item.icon}</div>

            <div>
              <div class="feed-item__title">${item.title}</div>
              <div class="feed-item__subtitle">${item.subtitle}</div>
            </div>

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
    <section class="card gameday-hero stack">
      <div class="final-banner">
        <h2 class="final-banner__title">${state.winner}</h2>
      </div>

      <div class="hero-scoreboard">
        <div class="hero-score">
          <div class="hero-score__label">Aaron</div>
          <div class="hero-score__value">${state.score.left}</div>
        </div>

        <div class="hero-center-logo">
          <img src="./assets/app-icon.png" alt="Canes Rivalry" />
          <div class="card-meta">Final</div>
        </div>

        <div class="hero-score">
          <div class="hero-score__label">Julie</div>
          <div class="hero-score__value">${state.score.right}</div>
        </div>
      </div>
    </section>

    <section class="card section-card stack">
      <div class="final-summary-grid">
        <article class="final-summary-card">
          <div class="final-summary-card__label">Final Score</div>
          <div class="final-summary-card__value">5–2</div>
        </article>

        <article class="final-summary-card">
          <div class="final-summary-card__label">Rivalry Points</div>
          <div class="final-summary-card__value">${state.rivalryPoints}</div>
        </article>

        <article class="final-summary-card">
          <div class="final-summary-card__label">Winner</div>
          <div class="final-summary-card__value">Aaron 🏆</div>
        </article>
      </div>
    </section>

    <section class="card section-card">
      <div class="card-title-row">
        <div>
          <div class="card-meta">Rivalry MVP</div>
          <h2 class="card-title">Sebastian Aho</h2>
        </div>
      </div>

      <div class="mvp-card">
        <div class="avatar-ring avatar-ring--leader">
          <span class="avatar-ring__letter">A</span>
        </div>

        <div class="mvp-meta">
          <h3>S. Aho</h3>
          <p>1 Goal • 1 Assist • First Goal Bonus</p>
        </div>

        <div class="mvp-points">+3</div>
      </div>
    </section>
  `;
}

function render() {
  let content = '';

  if (currentState === 'pregame') content = renderPregame();
  if (currentState === 'live') content = renderLive();
  if (currentState === 'final') content = renderFinal();

  app.innerHTML = content;

  buttons.forEach(button => {
    button.classList.toggle('is-active', button.dataset.state === currentState);
  });
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    currentState = button.dataset.state;
    render();
  });
});

render();