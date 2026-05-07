window.V2_MOCK_DATA = {
  scoringRules: {
    goal: 2,
    assist: 1,
    firstGoalBonus: 1
  },
  firstGoalScorer: 'Sebastian Aho',
  users: {
    aaron: {
      name: 'Aaron',
      score: 7,
      tonightDelta: 3,
      picks: [
        {
          player: 'Sebastian Aho',
          goals: 1,
          assists: 0,
          firstGoal: true
        },
        {
          player: 'Andrei Svechnikov',
          goals: 0,
          assists: 1,
          firstGoal: false
        }
      ]
    },
    julie: {
      name: 'Julie',
      score: 5,
      tonightDelta: 1,
      picks: [
        {
          player: 'Seth Jarvis',
          goals: 0,
          assists: 1,
          firstGoal: false
        },
        {
          player: 'Jaccob Slavin',
          goals: 0,
          assists: 0,
          firstGoal: false
        }
      ]
    }
  },
  moments: [
    '🚨 Sebastian Aho scored first — Aaron gets goal + first-goal bonus',
    '🍎 Andrei Svechnikov assist — Aaron +1',
    '🍎 Seth Jarvis assist — Julie +1',
    '✅ No overlapping picks detected'
  ]
};