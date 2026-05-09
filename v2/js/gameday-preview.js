const states = {
  pregame: {
    phase: 'Pregame',
    pillClass: '',
    rivalryScore: '0–0',
    leftScore: '-',
    rightScore: '-',
    subline: 'Tonight · 7:00 PM · Picks editable until puck drop',
    momentum: '50%',
    momentumText: 'Rivalry even',
    momentumMeta: 'Waiting for puck drop',
    feed: [
      ['🏒', 'Picks almost locked', 'Svechnikov projected hot tonight', '—'],
      ['🔥', 'Rivalry heating up', 'Aaron and Julie split top scorers', '—']
    ],
    aaron: [['Sebastian Aho', 'Locked in'], ['Andrei Svechnikov', 'Projected starter']],
    julie: [['Seth Jarvis', 'Hot streak'], ['Jaccob Slavin', 'Defensive anchor']]
  },
  live: {
    phase: 'Live',
    pillClass: 'gd-pill--live',
    rivalryScore: '4–3',
    leftScore: '4',
    rightScore: '3',
    subline: '2nd Period · Aaron leading the rivalry',
    momentum: '72%',
    momentumText: 'Momentum shifting Aaron',
    momentumMeta: 'Aho goal + assist swing',
    feed: [
      ['🚨', 'Sebastian Aho scores', 'Aaron jumps ahead in rivalry points', '+2'],
      ['⚡️', 'Jarvis answers quickly', 'Julie closes the gap instantly', '+1'],
      ['🧊', 'Slavin blocks streak', 'Defensive bonus triggered', '+1']
    ],
    aaron: [['Sebastian Aho +3', '1 Goal · 1 Assist'], ['Andrei Svechnikov +1', '3 Shots']],
    julie: [['Seth Jarvis +2', 'Goal scored'], ['Jaccob Slavin +1', '3 Blocks']]
  },
  final: {
    phase: 'Final',
    pillClass: 'gd-pill--final',
    rivalryScore: '5–2',
    leftScore: '5',
    rightScore: '2',
    subline: 'Final · Aaron wins tonight’s rivalry',
    momentum: '82%',
    momentumText: 'Aaron closes strong',
    momentumMeta: '3-point final swing',
    feed: [
      ['🏆', 'Aaron wins rivalry night', 'Aho MVP performance seals matchup', '+5'],
      ['⭐️', 'Sebastian Aho MVP', 'Goal · Assist · First Goal bonus', '+4']
    ],
    aaron: [['Sebastian Aho +4', 'Rivalry MVP'], ['Andrei Svechnikov +1', 'Assist']],
    julie: [['Seth Jarvis +2', 'Goal'], ['Jaccob Slavin +0', 'No bonus']]
  }
};

const root = document.querySelector('#gd-root');

function render(stateKey) {
  const state = states[stateKey];

  root.innerHTML = `
    <section class="gd-card gd-hero" style="--gd-momentum:${state.momentum}">
      <div class="gd-hero-top">
        <span class="gd-pill ${state.pillClass}">${state.phase}</span>
        <span class="gd-phase">Canes Rivalry</span>
        <span class="gd-sync">Synced</span>
      </div>

      <div class="gd-matchup">
        <div class="gd-side">
          <div class="gd-avatar gd-avatar--aaron">A</div>
          <div class="gd-side-name">Aaron</div>
          <div class="gd-side-score">${state.leftScore}</div>
        </div>

        <div class="gd-center">
          <div class="gd-versus">AARON VS JULIE</div>
          <div class="gd-rivalry-score">${state.rivalryScore}</div>
          <div class="gd-rivalry-label">Rivalry Score</div>
          <div class="gd-subline">${state.subline}</div>
        </div>

        <div class="gd-side">
          <div class="gd-avatar gd-avatar--julie">J</div>
          <div class="gd-side-name">Julie</div>
          <div class="gd-side-score">${state.rightScore}</div>
        </div>
      </div>

      <div class="gd-momentum">
        <div class="gd-momentum-head">
          <div>
            <div class="gd-momentum-title">Momentum</div>
            <div class="gd-subline">${state.momentumText}</div>
          </div>

          <div class="gd-momentum-meta">${state.momentumMeta}</div>
        </div>

        <div class="gd-track">
          <div class="gd-track-fill"></div>
          <div class="gd-track-puck"></div>
        </div>
      </div>
    </section>

    <section class="gd-card gd-section">
      <div class="gd-section-head">
        <div>
          <div class="gd-section-eyebrow">Live matchup board</div>
          <div class="gd-section-title">Rivalry Picks</div>
        </div>

        <div class="gd-section-note">2 players each</div>
      </div>

      <div class="gd-picks-grid">
        <article class="gd-pick-card gd-pick-card--aaron">
          <div class="gd-pick-head">
            <span>Aaron</span>
            <span>2 Picks</span>
          </div>

          ${state.aaron.map(([player, detail]) => `
            <div class="gd-player">
              <div class="gd-player-name">
                <strong>${player}</strong>
                <small>${detail}</small>
              </div>
              <div class="gd-points">•</div>
            </div>
          `).join('')}
        </article>

        <article class="gd-pick-card gd-pick-card--julie">
          <div class="gd-pick-head">
            <span>Julie</span>
            <span>2 Picks</span>
          </div>

          ${state.julie.map(([player, detail]) => `
            <div class="gd-player">
              <div class="gd-player-name">
                <strong>${player}</strong>
                <small>${detail}</small>
              </div>
              <div class="gd-points">•</div>
            </div>
          `).join('')}
        </article>
      </div>
    </section>

    <section class="gd-card gd-section">
      <div class="gd-section-head">
        <div>
          <div class="gd-section-eyebrow">Live rivalry feed</div>
          <div class="gd-section-title">Big Moments</div>
        </div>
      </div>

      <div class="gd-feed-list">
        ${state.feed.map(([icon, title, subtitle, score]) => `
          <article class="gd-feed-item">
            <div class="gd-feed-icon">${icon}</div>

            <div>
              <div class="gd-feed-title">${title}</div>
              <div class="gd-feed-subtitle">${subtitle}</div>
            </div>

            <div class="gd-feed-score">${score}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
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