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

### Product Feel
- premium
- energetic
- emotionally reactive
- playful
- modern
- mobile-first
- never cluttered
- never sportsbook/gamer UI

### Visual Direction
- light-first design
- modern iOS-native styling
- layered white cards
- restrained Canes red accents
- black/charcoal typography
- subtle hockey branding
- premium sports-broadcast energy
- rounded, clean, tactile card UI

### Motion Philosophy
- calm in passive states
- stronger motion during live rivalry moments
- subtle live indicators
- quick, emotional score-swing reactions
- avoid constant flashy animation

### Voice / Terminology
Prefer rivalry-first language such as:
- Rivalry Moments
- Make Your Picks
- Picks Locked
- Latest Event
- Final
- Tonight
- Stream Mode

Avoid overly technical or fantasy/gambling-heavy language.

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
- animation should create tension and payoff, not noise
- red should be meaningful, not used for everything
- future tabs should inherit the same visual system instead of inventing their own style

## Files

- `index.html` — static V2 shell
- `styles.css` — V2-only styling and design tokens
- `js/app.js` — V2-only UI behavior
- `js/mock-data.js` — static demo data
- `assets/app-icon.png` — approved V2 app icon
