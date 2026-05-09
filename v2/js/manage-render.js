export function renderManagePage() {
  return `
    <div class="manage-layout page-stack">
      <section class="surface-card section-card">
        <div class="section-heading">
          <div>
            <div class="eyebrow">Preferences</div>
            <h2 class="section-title">Manage Rivalry</h2>
          </div>
        </div>

        <div class="manage-option-list">
          <article class="manage-option">
            <div class="manage-option__icon">📺</div>
            <div>
              <div class="manage-option__title">Stream Mode</div>
              <div class="manage-option__meta">Prevent live spoiler notifications</div>
            </div>
            <div class="manage-option__arrow">›</div>
          </article>

          <article class="manage-option">
            <div class="manage-option__icon">🔔</div>
            <div>
              <div class="manage-option__title">Notification Timing</div>
              <div class="manage-option__meta">Realtime, delayed, or summary only</div>
            </div>
            <div class="manage-option__arrow">›</div>
          </article>

          <article class="manage-option">
            <div class="manage-option__icon">🎨</div>
            <div>
              <div class="manage-option__title">Theme Preview</div>
              <div class="manage-option__meta">Future visual customization settings</div>
            </div>
            <div class="manage-option__arrow">›</div>
          </article>
        </div>
      </section>
    </div>
  `;
}