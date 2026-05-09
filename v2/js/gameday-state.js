export const GAME_STATES = {
  pregame: {
    mode: 'pregame',
    title: 'Make your picks',
    status: 'Pregame',
    hero: {
      left: 'Aaron',
      right: 'Julie',
      venue: 'PNC Arena • Raleigh, NC',
      puckDrop: 'Tonight • 7:00 PM'
    }
  },
  live: {
    mode: 'live',
    period: '2ND',
    clock: '7:42',
    score: {
      left: 4,
      right: 3
    },
    momentum: 58
  },
  final: {
    mode: 'final',
    winner: 'Aaron Wins!',
    score: {
      left: 5,
      right: 2
    },
    rivalryPoints: '+3'
  }
};

export const PICKS = {
  aaron: [
    { name: 'S. Aho', detail: 'C', value: '+3.2' },
    { name: 'A. Svechnikov', detail: 'RW', value: '+2.1' },
    { name: 'J. Staal', detail: 'C', value: '+1.6' }
  ],
  julie: [
    { name: 'S. Aho', detail: 'C', value: '+3.2' },
    { name: 'J. Guentzel', detail: 'LW', value: '+1.8' },
    { name: 'J. Slavin', detail: 'D', value: '+1.2' }
  ]
};

export const FEED_ITEMS = [
  {
    icon: '🚨',
    title: 'Aho goal swings Aaron ahead',
    subtitle: 'Aaron +3 • First Goal Bonus',
    score: '4–3'
  },
  {
    icon: '📈',
    title: 'Momentum shift',
    subtitle: 'Aaron taking control',
    score: '3–3'
  },
  {
    icon: '⭐️',
    title: 'Jarvis assist',
    subtitle: 'Julie cuts the lead to one',
    score: '3–2'
  }
];