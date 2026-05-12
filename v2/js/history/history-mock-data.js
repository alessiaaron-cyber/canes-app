window.CR = window.CR || {};

(() => {
  const players = [
    { id: 'aho', name: 'Sebastian Aho', position: 'C', vibe: 'Reliable chaos' },
    { id: 'jarvis', name: 'Seth Jarvis', position: 'RW', vibe: 'Annoyingly clutch' },
    { id: 'svech', name: 'Andrei Svechnikov', position: 'RW', vibe: 'Big swing energy' },
    { id: 'slavin', name: 'Jaccob Slavin', position: 'D', vibe: 'Quiet closer' },
    { id: 'staal', name: 'Jordan Staal', position: 'C', vibe: 'Two-way stabilizer' },
    { id: 'blake', name: 'Jackson Blake', position: 'RW', vibe: 'Rookie spark' },
    { id: 'burns', name: 'Brent Burns', position: 'D', vibe: 'Late-night chaos' },
    { id: 'kk', name: 'Jesperi Kotkaniemi', position: 'C', vibe: 'Swingy depth play' },
    { id: 'roslovic', name: 'Jack Roslovic', position: 'C', vibe: 'Sneaky spot start' },
    { id: 'chatfield', name: 'Jalen Chatfield', position: 'D', vibe: 'Momentum jolt' }
  ];

  const seasons = [
    {
      id: '2024-25',
      label: '2024–25',
      shortLabel: '24–25',
      isCurrent: false,
      note: 'Julie edges the regular season before Aaron answers in the playoffs.'
    },
    {
      id: '2025-26',
      label: '2025–26',
      shortLabel: '25–26',
      isCurrent: true,
      note: 'Current season default with tighter rivalry swings and louder playoff stakes.'
    }
  ];

  const games = [
    {
      id: 'g-2024-25-01',
      seasonId: '2024-25',
      date: '2024-10-11',
      title: 'Opening night punch',
      playoff: false,
      aaronScore: 7,
      julieScore: 5,
      summary: 'Aaron opens the season fast behind an Aho first-goal hit.',
      tags: ['Opening Night', 'First Goal', 'Momentum Swing'],
      moments: ['Aho hits first goal bonus', 'Aaron takes the first lead of the year'],
      picks: {
        Aaron: [
          { playerId: 'aho', goals: 1, assists: 1, firstGoal: true },
          { playerId: 'svech', goals: 1, assists: 0, firstGoal: false }
        ],
        Julie: [
          { playerId: 'jarvis', goals: 1, assists: 1, firstGoal: false },
          { playerId: 'slavin', goals: 0, assists: 1, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2024-25-02',
      seasonId: '2024-25',
      date: '2024-10-25',
      title: 'Julie answers back',
      playoff: false,
      aaronScore: 4,
      julieScore: 8,
      summary: 'Jarvis and Slavin drag the rivalry back level for Julie.',
      tags: ['Bounce Back', 'Two-Goal Night'],
      moments: ['Julie evens the rivalry', 'Jarvis delivers the dagger'],
      picks: {
        Aaron: [
          { playerId: 'svech', goals: 1, assists: 0, firstGoal: false },
          { playerId: 'staal', goals: 0, assists: 2, firstGoal: false }
        ],
        Julie: [
          { playerId: 'jarvis', goals: 2, assists: 0, firstGoal: true },
          { playerId: 'slavin', goals: 0, assists: 2, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2024-25-03',
      seasonId: '2024-25',
      date: '2024-11-14',
      title: 'Overtime mess',
      playoff: false,
      aaronScore: 6,
      julieScore: 5,
      summary: 'A tight OT game swings on late Svechnikov noise.',
      tags: ['OT', 'Nail-biter'],
      moments: ['Svechnikov flips it late', 'Aaron starts a mini streak'],
      picks: {
        Aaron: [
          { playerId: 'svech', goals: 2, assists: 0, firstGoal: false },
          { playerId: 'burns', goals: 0, assists: 2, firstGoal: false }
        ],
        Julie: [
          { playerId: 'aho', goals: 1, assists: 1, firstGoal: true },
          { playerId: 'kk', goals: 0, assists: 1, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2024-25-04',
      seasonId: '2024-25',
      date: '2025-01-05',
      title: 'Julie’s calm response',
      playoff: false,
      aaronScore: 3,
      julieScore: 7,
      summary: 'Julie cools Aaron’s streak with a clean, low-drama win.',
      tags: ['Streak Breaker'],
      moments: ['Jarvis keeps haunting Aaron', 'Julie regains season control'],
      picks: {
        Aaron: [
          { playerId: 'blake', goals: 0, assists: 1, firstGoal: false },
          { playerId: 'burns', goals: 1, assists: 0, firstGoal: false }
        ],
        Julie: [
          { playerId: 'jarvis', goals: 1, assists: 1, firstGoal: true },
          { playerId: 'staal', goals: 1, assists: 1, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2024-25-05',
      seasonId: '2024-25',
      date: '2025-03-23',
      title: 'Blowout energy',
      playoff: false,
      aaronScore: 9,
      julieScore: 2,
      summary: 'Aaron steamrolls the board with Svech and Aho both spiking.',
      tags: ['Blowout', 'Statement Win'],
      moments: ['Aaron’s biggest margin of the season', 'Aho-Svech combo erupts'],
      picks: {
        Aaron: [
          { playerId: 'aho', goals: 1, assists: 2, firstGoal: false },
          { playerId: 'svech', goals: 2, assists: 1, firstGoal: true }
        ],
        Julie: [
          { playerId: 'slavin', goals: 0, assists: 1, firstGoal: false },
          { playerId: 'kk', goals: 0, assists: 1, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2024-25-06',
      seasonId: '2024-25',
      date: '2025-04-26',
      title: 'Playoff opener',
      playoff: true,
      aaronScore: 5,
      julieScore: 7,
      summary: 'Julie steals the first playoff game behind a sharp Jarvis line.',
      tags: ['Playoffs', 'Road Split'],
      moments: ['Julie grabs early playoff edge', 'Jarvis scores immediately'],
      picks: {
        Aaron: [
          { playerId: 'aho', goals: 1, assists: 1, firstGoal: false },
          { playerId: 'blake', goals: 1, assists: 0, firstGoal: false }
        ],
        Julie: [
          { playerId: 'jarvis', goals: 1, assists: 1, firstGoal: true },
          { playerId: 'slavin', goals: 0, assists: 2, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2024-25-07',
      seasonId: '2024-25',
      date: '2025-05-03',
      title: 'Aaron forces the split',
      playoff: true,
      aaronScore: 8,
      julieScore: 6,
      summary: 'Aaron survives playoff pressure with a heavy Svech push.',
      tags: ['Playoffs', 'Lead Change'],
      moments: ['Series even again', 'Svechnikov crushes the middle frame'],
      picks: {
        Aaron: [
          { playerId: 'svech', goals: 2, assists: 1, firstGoal: true },
          { playerId: 'staal', goals: 0, assists: 2, firstGoal: false }
        ],
        Julie: [
          { playerId: 'aho', goals: 1, assists: 2, firstGoal: false },
          { playerId: 'jarvis', goals: 0, assists: 1, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2025-26-01',
      seasonId: '2025-26',
      date: '2025-10-09',
      title: 'Current season spark',
      playoff: false,
      aaronScore: 6,
      julieScore: 4,
      summary: 'Aaron opens the new season with a balanced night and a late dagger.',
      tags: ['Opening Night', 'Balanced Win'],
      moments: ['Aaron starts ahead again', 'Slavin quietly pads the margin'],
      picks: {
        Aaron: [
          { playerId: 'aho', goals: 1, assists: 1, firstGoal: false },
          { playerId: 'slavin', goals: 0, assists: 2, firstGoal: false }
        ],
        Julie: [
          { playerId: 'jarvis', goals: 1, assists: 0, firstGoal: true },
          { playerId: 'blake', goals: 0, assists: 1, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2025-26-02',
      seasonId: '2025-26',
      date: '2025-10-29',
      title: 'Julie’s rookie jolt',
      playoff: false,
      aaronScore: 3,
      julieScore: 6,
      summary: 'Julie rides Jackson Blake and Jarvis to a tidy rebound.',
      tags: ['Bounce Back', 'Rookie Spark'],
      moments: ['Blake flips the mood', 'Julie keeps the season tight'],
      picks: {
        Aaron: [
          { playerId: 'svech', goals: 1, assists: 0, firstGoal: false },
          { playerId: 'burns', goals: 0, assists: 1, firstGoal: false }
        ],
        Julie: [
          { playerId: 'blake', goals: 1, assists: 1, firstGoal: true },
          { playerId: 'jarvis', goals: 0, assists: 2, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2025-26-03',
      seasonId: '2025-26',
      date: '2025-11-18',
      title: 'First-goal heartbreak',
      playoff: false,
      aaronScore: 5,
      julieScore: 4,
      summary: 'Aho lands the first-goal bonus and that ends up being the difference.',
      tags: ['First Goal', 'One-Point Edge'],
      moments: ['Aho steals a tiny game', 'Aaron survives a late push'],
      picks: {
        Aaron: [
          { playerId: 'aho', goals: 1, assists: 1, firstGoal: true },
          { playerId: 'chatfield', goals: 0, assists: 1, firstGoal: false }
        ],
        Julie: [
          { playerId: 'jarvis', goals: 1, assists: 1, firstGoal: false },
          { playerId: 'staal', goals: 0, assists: 1, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2025-26-04',
      seasonId: '2025-26',
      date: '2026-01-12',
      title: 'Julie takes the grindy one',
      playoff: false,
      aaronScore: 4,
      julieScore: 7,
      summary: 'Julie wins the ugly version of the rivalry with safer picks and fewer misses.',
      tags: ['Grind', 'Streak Breaker'],
      moments: ['Season tied again', 'Staal does annoying veteran things'],
      picks: {
        Aaron: [
          { playerId: 'roslovic', goals: 1, assists: 0, firstGoal: false },
          { playerId: 'svech', goals: 0, assists: 2, firstGoal: false }
        ],
        Julie: [
          { playerId: 'staal', goals: 1, assists: 1, firstGoal: true },
          { playerId: 'jarvis', goals: 0, assists: 2, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2025-26-05',
      seasonId: '2025-26',
      date: '2026-03-08',
      title: 'Playoff clincher chaos',
      playoff: true,
      aaronScore: 10,
      julieScore: 8,
      summary: 'A wild playoff game turns into a Svech-Aho avalanche for Aaron.',
      tags: ['Playoffs', 'Chaos', 'Comeback'],
      moments: ['Aaron erases a deficit', 'Best current-season game so far'],
      picks: {
        Aaron: [
          { playerId: 'svech', goals: 2, assists: 1, firstGoal: false },
          { playerId: 'aho', goals: 1, assists: 2, firstGoal: true }
        ],
        Julie: [
          { playerId: 'jarvis', goals: 1, assists: 2, firstGoal: false },
          { playerId: 'slavin', goals: 0, assists: 2, firstGoal: false }
        ]
      }
    },
    {
      id: 'g-2025-26-06',
      seasonId: '2025-26',
      date: '2026-04-19',
      title: 'Julie survives overtime',
      playoff: true,
      aaronScore: 6,
      julieScore: 7,
      summary: 'A one-point playoff dagger in OT keeps the current season deliciously messy.',
      tags: ['Playoffs', 'OT', 'Nail-biter'],
      moments: ['Julie answers immediately', 'Playoff race stays tense'],
      picks: {
        Aaron: [
          { playerId: 'aho', goals: 1, assists: 1, firstGoal: false },
          { playerId: 'blake', goals: 1, assists: 1, firstGoal: false }
        ],
        Julie: [
          { playerId: 'jarvis', goals: 1, assists: 1, firstGoal: true },
          { playerId: 'chatfield', goals: 0, assists: 2, firstGoal: false }
        ]
      }
    }
  ];

  window.CR.historyMockData = {
    currentSeasonId: '2025-26',
    seasons,
    players,
    games
  };
})();
