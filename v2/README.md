# Canes Rivalry V2 UI Sandbox

This folder is the isolated V2 frontend/UI sandbox.

## Guardrails

- Build only under `/v2/` in this repository.
- Do not modify production files at the repository root unless explicitly approved.
- Do not change GitHub Pages settings.
- Do not add a service worker yet.
- Do not add a manifest yet.
- Do not add Supabase writes or backend changes yet.
- Keep V2 isolated from production until explicitly merged.

## Current Scope

This scaffold is static/mock-data only. It is intended for UI structure, Game Day layout exploration, mobile UX polish, animations, realtime visual concepts, toast presentation, and frontend architecture groundwork for future V2 work.

## Brand Identity Direction

### Core Identity
Canes Rivalry V2 is a premium live rivalry tracker built around Hurricanes game-day competition.

The rivalry is the hero.
The Canes game is the context.

### Primary Visual North Star
Premium Apple Sports-style rivalry experience.

This means:
- clean, light, iPhone-native presentation
- readable hierarchy first
- calm premium surfaces most of the time
- subtle sports atmosphere
- emotional UI spikes only when moments deserve it
- rivalry tension expressed through motion, hierarchy, and selective emphasis

### Product Feel
- premium
- modern
- mobile-first
- emotionally reactive
- smooth
- readable
- energetic in key moments only
- never cluttered
- never sportsbook/gamer UI

### Visual Direction
- light-first design
- Apple Sports-inspired hierarchy and restraint
- layered white cards
- restrained Canes red accents
- black/charcoal typography
- subtle hockey atmosphere
- premium sports energy without broadcast clutter
- rounded, clean, tactile card UI

### Motion Philosophy
Base state should feel:
- calm
- smooth
- premium
- Apple-like

Event state should feel:
- more reactive
- more emotional
- score-change aware
- momentum-aware
- still restrained

Animation should create payoff, not noise.

### Emotional Peaks
Stronger visual/motion emphasis is reserved for moments like:
- goals
- lead changes
- close rivalry swings
- first goal bonus
- final results
- comeback moments

### Voice / Terminology
Prefer rivalry-first language such as:
- Rivalry Moments
- Goal Swing
- Make Your Picks
- Picks Locked
- Latest Event
- Final
- Tonight
- Stream Mode

Avoid overly technical, enterprise, fantasy-heavy, or gambling-heavy language.

### Team / Expansion Direction
- Canes-first branding for now
- revisit broader multi-team branding only if the app later expands beyond its current scope

### Theme Direction
- primary target is light mode
- structure V2 styling around reusable CSS variables/tokens
- allow future system dark mode later without major rework

### Icon Direction
- use the approved `app-icon.png` in `/v2/assets/`
- no generated icon overrides
- no SVG fallback icon path in V2

## Implementation Notes
Frontend work in V2 should follow these principles by default:
- rivalry score gets visual priority over the NHL game score
- Canes game state supports the rivalry experience rather than dominating it
- calm layout should contrast with live emotional moments
- red should be meaningful, not used for everything
- typography and spacing should do most of the work before decoration does
- future tabs should inherit the same visual system instead of inventing their own style
- the app should feel closer to Apple Sports than to a fantasy dashboard

## Files

- `index.html` — static V2 shell
- `styles.css` — V2-only styling and design tokens
- `js/app.js` — V2 bootstrap
- `js/gameday.js` — Game Day behavior
- `js/tabs.js` — tab/view navigation
- `js/ui.js` — shared UI helpers
- `js/mock-data.js` — static demo data
- `assets/app-icon.png` — approved V2 app icon
