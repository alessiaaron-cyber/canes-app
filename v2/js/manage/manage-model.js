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

  const MOCK_USERS = [
    { id: 'aaron', username: 'Aaron' },
    { id: 'julie', username: 'Julie' }
  ];

  const MOCK_ROSTER = [
    { id: 'aho', name: 'Sebastian Aho', position: 'F', active: true },
    { id: 'jarvis', name: 'Seth Jarvis', position: 'F', active: true },
    { id: 'svechnikov', name: 'Andrei Svechnikov', position: 'F', active: true },
    { id: 'slavin', name: 'Jaccob Slavin', position: 'D', active: true },
    { id: 'chatfield', name: 'Jalen Chatfield', position: 'D', active: true }
  ];

  const MOCK_SCHEDULE = [
    { id: 'game-1', date: '2026-03-08', opponent: 'NYR', type: 'Playoffs', firstPicker: 'Aaron' },
    { id: 'game-2', date: '2026-03-10', opponent: 'FLA', type: 'Regular', firstPicker: 'Julie' }
  ];

  const EDIT_OPTIONS = {
    activeSeasonLabel: {
      title: 'Active season',
      hint: 'Choose which season Manage should treat as current.',
      options: ['2025-26', '2026-27', '2027-28']
    },
    scoringProfile: {
      title: 'Scoring profile',
      hint: 'Choose the scoring system used for new rivalry matchups.',
      options: ['Classic', 'Playoff Boost']
    },
    firstPicker: {
      title: 'First picker',
      hint: 'Choose who picks first next game. Picks alternate after that.',
      options: MOCK_USERS.map((user) => user.username)
    }
  };

  function getNextSeasonLabel(currentLabel) {
    const match = String(currentLabel || '').match(/^(\d{4})-(\d{2})$/);
    if (!match) return '2026-27';

    const startYear = Number(match[1]) + 1;
    const endYear = String((startYear + 1) % 100).padStart(2, '0');
    return `${startYear}-${endYear}`;
  }

  function build() {
    const currentSeason = '2025-26';
    const nextSeason = getNextSeasonLabel(currentSeason);

    return {
      activeManageView: 'main',
      streamMode: {
        selected: '90s',
        options: STREAM_OPTIONS,
        delayPush: true,
        delayToasts: true,
        delayFeed: false
      },
      notifications: {
        pushEnabled: true,
        toastsEnabled: true
      },
      season: {
        activeSeasonLabel: currentSeason,
        playoffMode: false,
        scoringProfile: 'Classic',
        firstPicker: 'Aaron',
        scoringSystems: {
          Classic: {
            firstGoal: 3,
            goal: 2,
            assist: 1
          },
          'Playoff Boost': {
            firstGoal: 5,
            goal: 3,
            assist: 2
          }
        }
      },
      newSeasonDraft: {
        seasonLabel: nextSeason,
        firstPicker: 'Aaron'
      },
      newSeasonOptions: [nextSeason],
      roster: MOCK_ROSTER,
      schedule: MOCK_SCHEDULE,
      rosterDraft: {
        name: '',
        position: 'F'
      },
      scheduleDraft: {
        date: '',
        opponent: '',
        type: 'Regular',
        firstPicker: 'Aaron'
      },
      appHealth: {
        realtimeStatus: 'Connected',
        syncStatus: 'Healthy',
        notificationStatus: 'Ready',
        pwaStatus: 'Installed',
        lastSyncLabel: '2 minutes ago'
      },
      users: MOCK_USERS,
      editOptions: EDIT_OPTIONS
    };
  }

  window.CR.manageModel = { build };
})();
