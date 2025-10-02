export const API_CONFIG = {
  BASE_URL: 'https://simple-hang-adopted-constructed.trycloudflare.com/api',
  ENDPOINTS: {
    USERS: '/users',
    LEADERBOARD: '/leaderboard',
    HEALTH: '/health',
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;
