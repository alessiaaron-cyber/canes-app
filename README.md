# Canes Rivalry App

Canes Rivalry is a mobile-first rivalry tracker for Carolina Hurricanes game-day competition.

## Current Frontend

The V2 frontend now lives at the repository root for GitHub Pages deployment.

Primary root structure:

- `index.html` — app shell and script/style entry point
- `css/` — shared app styling plus Game Day, History, and Manage styles
- `js/` — app boot, auth, navigation, Game Day, History, and Manage modules
- `assets/` — app icons and static frontend assets
- `service-worker.js` — push notification service worker for the GitHub Pages app scope

## Deployment Path

The GitHub Pages app path is:

`/canes-rivalry-app/`

Auth redirect and notification click behavior should remain aligned to that path.

## Current V2 Data State

The V2 UI still uses frontend mock/model data for Game Day, History, and Manage screens.

Supabase is currently used for authentication/session/profile checks. Do not add Supabase write behavior to the V2 frontend until the data integration phase.

## Icons and PWA Assets

The active V2 app icon lives at:

`assets/app-icon.png`

Do not reference the old root `icon.png`; it was removed during the V2 root migration.

## Migration Notes

The previous `/v2` sandbox folder has been migrated to the repository root. Future frontend work should happen against the root app structure, not under `/v2`.

Production `main` and the tagged rollback point were intentionally left untouched during this migration branch work.
