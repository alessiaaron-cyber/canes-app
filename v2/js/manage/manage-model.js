window.CR = window.CR || {};

(() => {
  const STREAM_OPTIONS = [
    { value: 'off', label: 'Realtime', note: 'Show live rivalry moments immediately.' },
    { value: '30s', label: '30s', note: 'Small spoiler buffer for near-live streams.' },
    { value: '60s', label: '60s', note: 'Balanced protection without feeling far behind.' },
    { value: '90s', label: '90s', note: 'Recommended for most delayed broadcasts.' },
    { value: '120s', label: '120s', note: 'Extra protection for laggier streams.' },
    { value: 'period', label: 'Period Recaps', note: 'Hold visible moments until the horn.' },
    { value: 'final', label: 'Final Only', note: 'Keep everything hidden until the game ends.' }
  ];

  function build() {
    return {
      streamMode: {
        selected: '90s',
        options: STREAM_OPTIONS,
        delayPush: true,
        delayToasts: true,
        delayFeed: false,
        bigMomentsOnly: false,
        quietViewing: true
      },
      notifications: {
        pushEnabled: true,
        toastsEnabled: true,
        rivalrySwings: true,
        scoringMoments: true,
        recapSummaries: true,
        consolidateBursts: true
      },
      rivalry: {
        tone: 'balanced',
        showMomentumLanguage: true,
        celebrateLeadChanges: true,
        subtleMotionOnly: true
      },
      season: {
        activeSeasonLabel: '2025-26',
        playoffMode: false,
        carryoverEnabled: true,
        scoringProfile: 'Classic',
        draftRotation: 'Aaron next'
      },
      appHealth: {
        realtimeStatus: 'Connected',
        syncStatus: 'Healthy',
        notificationStatus: 'Ready',
        pwaStatus: 'Installed',
        lastSyncLabel: '2 minutes ago'
      },
      admin: {
        rosterStatus: 'Verified',
        scheduleStatus: 'Imported',
        activeGameContext: 'No live game right now',
        correctionToolsEnabled: true
      }
    };
  }

  window.CR.manageModel = { build };
})();
