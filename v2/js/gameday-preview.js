const states = {
  pregame: {
    score: '0–0',
    subline: 'Tonight · 7:00 PM · Picks editable',
    aaron: ['Sebastian Aho', 'Andrei Svechnikov'],
    julie: ['Seth Jarvis', 'Jaccob Slavin']
  },
  live: {
    score: '4–3',
    subline: '2nd Period · Aaron leads',
    aaron: ['Sebastian Aho +3', 'Andrei Svechnikov +1'],
    julie: ['Seth Jarvis +2', 'Jaccob Slavin +1']
  },
  final: {
    score: '5–2',
    subline: 'Final · Aaron wins the rivalry',
    aaron: ['Sebastian Aho +4', 'Andrei Svechnikov +1'],
    julie: ['Seth Jarvis +2', 'Jaccob Slavin +0']
  }
};

const root = document.querySelector('#gd-root');

function render(stateKey) {
  const state = states[stateKey];

  root.innerHTML = `
    <section class="gd-card gd-hero">
      <div class="gd-matchup">
        <div class="gd-avatar gd-avatar--aaron">A</div>

        <div class="gd-center">
          <div class="gd-versus">AARON VS JULIE</div>
          <div class="gd-score">${state.score}</div>
          <div class="gd-subline">${state.subline}</div>
        </div>

        <div class="gd-avatar gd-avatar--julie">J</div>
      </div>
    </section>

    <section class="gd-card gd-section">
      <div class="gd-section-title">Rivalry Picks</div>

      <div class="gd-picks-grid">
        <article class="gd-pick-card gd-pick-card--aaron">
          <div class="gd-pick-head">
            <span>Aaron</span>
            <span>2 Picks</span>
          </div>

          ${state.aaron.map((player) => `
            <div class="gd-player">
              <div class="gd-player-name">
                <strong>${player}</strong>
                <small>Carolina Hurricanes</small>
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

          ${state.julie.map((player) => `
            <div class="gd-player">
              <div class="gd-player-name">
                <strong>${player}</strong>
                <small>Carolina Hurricanes</small>
              </div>
              <div class="gd-points">•</div>
            </div>
          `).join('')}
        </article>
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