export function renderHistoryPage() {
  return `
    <div class="history-layout page-stack">
      <section class="surface-card section-card">
        <div class="section-heading">
          <div>
            <div class="eyebrow">2025–26 Season</div>
            <h2 class="section-title">Rivalry Snapshot</h2>
          </div>
        </div>

        <div class="history-summary-grid">
          <article class="history-stat">
            <div class="history-stat__label">Aaron</div>
            <div class="history-stat__value">12</div>
          </article>

          <article class="history-stat">
            <div class="history-stat__label">Julie</div>
            <div class="history-stat__value">9</div>
          </article>

          <article class="history-stat">
            <div class="history-stat__label">Games</div>
            <div class="history-stat__value">21</div>
          </article>
        </div>
      </section>

      <section class="surface-card section-card">
        <div class="section-heading">
          <div>
            <div class="eyebrow">Recent Games</div>
            <h2 class="section-title">Latest Results</h2>
          </div>
        </div>

        <div class="history-game-list">
          <article class="history-game">
            <div class="history-game__badge">🏆</div>
            <div>
              <div class="history-game__title">Aaron wins thriller</div>
              <div class="history-game__meta">Canes vs Rangers • Apr 12</div>
            </div>
            <div class="history-game__score">5–4</div>
          </article>

          <article class="history-game">
            <div class="history-game__badge">🔥</div>
            <div>
              <div class="history-game__title">Julie comeback win</div>
              <div class="history-game__meta">Canes vs Bruins • Apr 8</div>
            </div>
            <div class="history-game__score">6–5</div>
          </article>
        </div>
      </section>
    </div>
  `;
}