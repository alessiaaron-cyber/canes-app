const states = {
  pregame: {
    type: 'pregame',
    gameLine: 'Tonight • 7:00 PM',
    statusLine: 'Picks lock at puck drop',
    eventTitle: 'Rivalry ready',
    eventMeta: 'Both lineups set. No duplicate players.',
    projections: 'View projections',
    aaron: [
      { name: 'Sebastian Aho', detail: 'C • Top line', proj: '+3.2' },
      { name: 'Andrei Svechnikov', detail: 'RW • PP1', proj: '+2.1' }
    ],
    julie: [
      { name: 'Seth Jarvis', detail: 'RW • Hot streak', proj: '+2.0' },
      { name: 'Jaccob Slavin', detail: 'D • Defensive anchor', proj: '+1.2' }
    ],
    h2h: { aaron: 12, ties: 3, julie: 9 }
  },
  live: {
    type: 'live',
    period: '2nd • 7:42',
    score: { aaron: 4, julie: 3 },
    statusLine: 'Aaron leading the rivalry',
    momentum: '72%',
    eventTitle: 'Aho puts Aaron ahead',
    eventMeta: 'Goal + assist swing in the second period',
    gameStrip: 'Hurricanes 2 – 1 Rangers',
    gameMeta: 'Live game state synced',
    feed: [
      { icon: '🚨', time: '7:42 2nd', title: 'Sebastian Aho scores', subtitle: 'Aaron jumps ahead in rivalry points', score: '4–3', featured: true },
      { icon: '⚡️', time: '6:15 2nd', title: 'Jarvis answers quickly', subtitle: 'Julie keeps it close', score: '+1' },
      { icon: '🧊', time: '4:02 2nd', title: 'Slavin blocks streak', subtitle: 'Defensive bonus triggered', score: '+1' }
    ],
    picks: {
      aaron: [
        { icon: 'A', name: 'Sebastian Aho', detail: '1 Goal • 1 Assist', proj: '+3' },
        { icon: 'S', name: 'Andrei Svechnikov', detail: '3 Shots', proj: '+1' }
      ],
      julie: [
        { icon: 'J', name: 'Seth Jarvis', detail: 'Goal scored', proj: '+2' },
        { icon: 'S', name: 'Jaccob Slavin', detail: '3 Blocks', proj: '+1' }
      ]
    }
  },
  final: {
    type: 'final',
    winner: 'Aaron wins the night',
    score: { aaron: 5, julie: 2 },
    summary: [
      { label: 'Final Score', value: '5–2', red: false },
      { label: 'Rivalry Points', value: 'Aaron +5', red: true },
      { label: 'Winner', value: 'Aaron', red: false }
    ],
    recap: [
      { icon: '🏁', time: 'Final', title: 'Aaron wins rivalry night', subtitle: 'Aho MVP performance seals it', score: '5–2' },
      { icon: '🚨', time: '2nd', title: 'Aho first goal bonus', subtitle: 'Biggest swing of the night', score: '+3' },
      { icon: '⭐️', time: '3rd', title: 'Svechnikov adds insurance', subtitle: 'Aaron closes strong', score: '+1' }
    ],
    mvp: {
      letter: 'A',
      name: 'Sebastian Aho',
      detail: '1 Goal • 1 Assist • First Goal bonus',
      points: '+4'
    }
  }
};

const root = document.querySelector('#gd-root');

function renderPregame(state) {
  return `
    <section class="gd-phone">
      <div class="gd-topbar">
        <button class="gd-icon-button" type="button">←</button>
        <div class="gd-topbar-center"><img class="gd-wordmark" src="./assets/app-icon.png?v=gdp5" alt="Canes Rivalry" /></div>
        <button class="gd-icon-button" type="button">↻</button>
      </div>

      <div class="gd-main">
        <section class="gd-matchup-card">
          <div class="gd-matchup-row">
            <div class="gd-avatar-ring is-leader">A</div>
            <div class="gd-matchup-meta">
              <div class="gd-name-row">
                <span class="gd-name">Aaron</span>
                <span class="gd-vs">VS</span>
                <span class="gd-name">Julie</span>
              </div>
              <div class="gd-submeta">${state.gameLine}<br>${state.statusLine}</div>
              <div class="gd-lock-pill">🔒 Picks lock at puck drop</div>
            </div>
            <div class="gd-avatar-ring">J</div>
          </div>
        </section>

        <section class="gd-event-card">
          <div class="gd-event-icon">🏒</div>
          <div>
            <div class="gd-event-title">${state.eventTitle}</div>
            <div class="gd-event-meta">${state.eventMeta}</div>
          </div>
          <div class="gd-event-side">Preview</div>
          <div class="gd-add">›</div>
        </section>

        <div class="gd-section-label-row">
          <div class="gd-section-label">Your Picks</div>
          <div class="gd-filter">Forwards / Defense</div>
        </div>

        <section class="gd-picks-grid">
          <article class="gd-pick-panel">
            <div class="gd-pick-panel-head red"><span>Aaron</span><span>2/2</span></div>
            ${state.aaron.map((player) => `
              <div class="gd-pick-row">
                <div class="gd-pick-row-icon">•</div>
                <div class="gd-pick-row-main"><strong>${player.name}</strong><small>${player.detail}</small></div>
                <div class="gd-proj">Proj<strong>${player.proj}</strong></div>
                <div class="gd-add">+</div>
              </div>
            `).join('')}
          </article>

          <article class="gd-pick-panel">
            <div class="gd-pick-panel-head dark"><span>Julie</span><span>2/2</span></div>
            ${state.julie.map((player) => `
              <div class="gd-pick-row">
                <div class="gd-pick-row-icon">•</div>
                <div class="gd-pick-row-main"><strong>${player.name}</strong><small>${player.detail}</small></div>
                <div class="gd-proj">Proj<strong>${player.proj}</strong></div>
                <div class="gd-add">+</div>
              </div>
            `).join('')}
          </article>
        </section>

        <button class="gd-wide-button" type="button">📊 ${state.projections}</button>

        <section class="gd-headtohead">
          <div class="gd-section-label">Head to Head</div>
          <div class="gd-h2h-grid">
            <div class="gd-h2h-box"><strong>Aaron</strong><span>${state.h2h.aaron}</span></div>
            <div class="gd-ties"><strong>Ties</strong><span>${state.h2h.ties}</span></div>
            <div class="gd-h2h-box"><strong class="red-text">Julie</strong><span class="dark">${state.h2h.julie}</span></div>
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderLive(state) {
  return `
    <section class="gd-phone">
      <div class="gd-topbar">
        <button class="gd-icon-button" type="button">←</button>
        <div class="gd-topbar-center"><img class="gd-wordmark" src="./assets/app-icon.png?v=gdp5" alt="Canes Rivalry" /></div>
        <button class="gd-icon-button" type="button">↻</button>
      </div>

      <div class="gd-main">
        <section class="gd-live-score-card" style="--gd-momentum:${state.momentum}">
          <div class="gd-status-row">
            <span class="gd-pill live">Live</span>
            <span class="gd-period">${state.period}</span>
            <span class="gd-pill synced">Synced</span>
          </div>

          <div class="gd-score-grid">
            <div class="gd-side-score-wrap">
              <div class="gd-side-score-label red">Aaron</div>
              <div class="gd-side-score-value">${state.score.aaron}</div>
            </div>
            <div class="gd-center-score">
              <img class="gd-wordmark" src="./assets/app-icon.png?v=gdp5" alt="Canes Rivalry" />
              <div class="gd-center-label">Rivalry Score</div>
            </div>
            <div class="gd-side-score-wrap">
              <div class="gd-side-score-label dark">Julie</div>
              <div class="gd-side-score-value">${state.score.julie}</div>
            </div>
          </div>

          <div class="gd-summary-line">${state.statusLine}</div>

          <div class="gd-momentum-block">
            <div class="gd-momentum-label">Momentum</div>
            <div class="gd-track"><div class="gd-track-fill"></div><div class="gd-track-puck"></div></div>
          </div>
        </section>

        <section class="gd-event-card">
          <div class="gd-event-icon">🚨</div>
          <div>
            <div class="gd-event-title">${state.eventTitle}</div>
            <div class="gd-event-meta">${state.eventMeta}</div>
          </div>
          <div class="gd-event-side red">Now</div>
          <div class="gd-add">+</div>
        </section>

        <section class="gd-game-strip">
          <div class="gd-game-chip">Game</div>
          <div class="gd-game-line">${state.gameStrip}</div>
          <div class="gd-game-meta">${state.gameMeta}</div>
        </section>

        <div class="gd-section-label-row">
          <div class="gd-section-label">Rivalry Feed</div>
          <div class="gd-filter">Live</div>
        </div>

        <section class="gd-feed-list">
          ${state.feed.map((item) => `
            <article class="gd-feed-item ${item.featured ? 'featured' : ''}">
              <div class="gd-feed-icon">${item.icon}</div>
              <div>
                <div class="gd-feed-main-top">${item.time}</div>
                <div class="gd-feed-title">${item.title}</div>
                <div class="gd-feed-subtitle">${item.subtitle}</div>
                ${item.featured ? '<div class="gd-mini-track"></div>' : ''}
              </div>
              <div class="gd-feed-score">${item.score}</div>
            </article>
          `).join('')}
        </section>

        <div class="gd-section-label-row">
          <div class="gd-section-label">Tonight’s Picks</div>
          <div class="gd-filter">Summary</div>
        </div>

        <section class="gd-picks-summary">
          <article class="gd-pick-summary-card red">
            <div class="gd-pick-summary-head"><span class="red-text">Aaron</span><span>4 pts</span></div>
            ${state.picks.aaron.map((player) => `
              <div class="gd-pick-summary-row"><span>${player.name}</span><strong>${player.proj}</strong></div>
            `).join('')}
          </article>
          <article class="gd-pick-summary-card">
            <div class="gd-pick-summary-head"><span>Julie</span><span>3 pts</span></div>
            ${state.picks.julie.map((player) => `
              <div class="gd-pick-summary-row"><span>${player.name}</span><strong>${player.proj}</strong></div>
            `).join('')}
          </article>
        </section>
      </div>
    </section>
  `;
}

function renderFinal(state) {
  return `
    <section class="gd-phone">
      <div class="gd-topbar">
        <button class="gd-icon-button" type="button">←</button>
        <div class="gd-topbar-center"><img class="gd-wordmark" src="./assets/app-icon.png?v=gdp5" alt="Canes Rivalry" /></div>
        <button class="gd-icon-button" type="button">↻</button>
      </div>

      <div class="gd-main">
        <section class="gd-final-score-card">
          <div class="gd-win-banner">${state.winner}</div>
          <div class="gd-status-row">
            <span class="gd-pill final">Final</span>
          </div>

          <div class="gd-score-grid">
            <div class="gd-side-score-wrap">
              <div class="gd-side-score-label red">Aaron</div>
              <div class="gd-side-score-value">${state.score.aaron}</div>
            </div>
            <div class="gd-center-score">
              <img class="gd-wordmark" src="./assets/app-icon.png?v=gdp5" alt="Canes Rivalry" />
              <div class="gd-center-label">Final</div>
            </div>
            <div class="gd-side-score-wrap">
              <div class="gd-side-score-label dark">Julie</div>
              <div class="gd-side-score-value">${state.score.julie}</div>
            </div>
          </div>
        </section>

        <section class="gd-summary-grid">
          ${state.summary.map((item) => `
            <div class="gd-summary-cell">
              <small>${item.label}</small>
              <strong class="${item.red ? 'red-text' : ''}">${item.value}</strong>
            </div>
          `).join('')}
        </section>

        <div class="gd-section-label-row">
          <div class="gd-section-label">Game Recap</div>
          <div class="gd-filter">Final</div>
        </div>

        <section class="gd-recap-list">
          ${state.recap.map((item) => `
            <article class="gd-recap-item">
              <div class="gd-feed-icon">${item.icon}</div>
              <div class="gd-recap-time">${item.time}</div>
              <div class="gd-recap-main"><strong>${item.title}</strong><small>${item.subtitle}</small></div>
              <div class="gd-recap-score">${item.score}</div>
            </article>
          `).join('')}
        </section>

        <div class="gd-section-label-row">
          <div class="gd-section-label">Rivalry MVP</div>
        </div>

        <section class="gd-mvp">
          <div class="gd-mvp-ring">${state.mvp.letter}</div>
          <div class="gd-mvp-main"><strong>${state.mvp.name}</strong><small>${state.mvp.detail}</small></div>
          <div class="gd-mvp-points">${state.mvp.points}</div>
        </section>
      </div>
    </section>
  `;
}

function render(stateKey) {
  const state = states[stateKey];
  if (!state) return;

  if (state.type === 'live') {
    root.innerHTML = renderLive(state);
    return;
  }

  if (state.type === 'final') {
    root.innerHTML = renderFinal(state);
    return;
  }

  root.innerHTML = renderPregame(state);
}

render('pregame');

document.querySelectorAll('.gd-state-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.gd-state-button').forEach((b) => {
      b.classList.toggle('is-active', b === button);
    });
    render(button.dataset.state);
  });
});