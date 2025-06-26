export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login-json',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  BALANCE: {
    CREATE: '/balance',
    GET: (id: number) => `/balance/${id}`,
    UPDATE: (id: number) => `/balance/${id}`,
    DELETE: (id: number) => `/balance/${id}`,
    GRAPH: (id: number) => `/balance/${id}/graph`,
  },
  INCOME: {
    CREATE: '/incomes',
    LIST: '/incomes',
    GET: (id: number) => `/incomes/${id}`,
    UPDATE: (id: number) => `/incomes/${id}`,
    DELETE: (id: number) => `/incomes/${id}`,
  },
  EXPENSE: {
    CREATE: '/expenses',
    LIST: '/expenses',
    GET: (id: number) => `/expenses/${id}`,
    UPDATE: (id: number) => `/expenses/${id}`,
    DELETE: (id: number) => `/expenses/${id}`,
  },
  SUGGESTIONS: {
    GENERATE: (balanceId: number) => `/suggestions/${balanceId}`,
    GET: (balanceId: number) => `/suggestions/${balanceId}`,
  },
} as const;

// Query Keys for TanStack Query
export const QUERY_KEYS = {
  AUTH: {
    CURRENT_USER: ['currentUser'],
  },
  BALANCE: {
    GET: (id: number) => ['balance', id],
  },
  INCOME: {
    LIST: (balanceId?: number) => ['incomes', balanceId],
    GET: (id: number) => ['income', id],
  },
  EXPENSE: {
    LIST: (balanceId?: number) => ['expenses', balanceId],
    GET: (id: number) => ['expense', id],
  },
  SUGGESTIONS: {
    GET: (balanceId: number) => ['suggestions', balanceId],
  },
  GRAPH: {
    GET: (balanceId: number) => ['graph', balanceId],
  },
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'Budget App',
  VERSION: '1.0.0',
  THEME_STORAGE_KEY: 'themeMode',
  TOKEN_STORAGE_KEY: 'access_token',
} as const;

// Form Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  EMAIL_MAX_LENGTH: 255,
} as const;

// UI Constants
export const UI = {
  DRAWER_WIDTH: 240,
  HEADER_HEIGHT: 64,
  MAX_CONTAINER_WIDTH: 'xl' as const,
} as const;