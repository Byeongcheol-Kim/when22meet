// Application configuration constants
// Centralized configuration to avoid magic numbers

export const CONFIG = {
  // Redis TTL settings (in seconds)
  MEETING_TTL_SECONDS: 18 * 30 * 24 * 60 * 60, // 18 months
  SHORT_URL_TTL_SECONDS: 60 * 24 * 60 * 60, // 60 days

  // Validation limits
  MAX_PARTICIPANT_NAME_LENGTH: 50,
  MAX_MEETING_TITLE_LENGTH: 100,
  MAX_PARTICIPANTS: 100,
  MAX_DATES: 365,

  // UI settings
  HIGHLIGHT_DURATION_MS: 2000,
  TOAST_DURATION_MS: 3000,
  DEBOUNCE_DELAY_MS: 300,
  SCROLL_THROTTLE_MS: 100,

  // Grid settings
  ROW_HEIGHT_PX: 56,
  HEADER_HEIGHT_PX: 40,
  MIN_COLUMN_WIDTH: '90px',
  MAX_COLUMN_WIDTH: '120px',
  COLUMN_WIDTH_VW: '10vw',
} as const;

// Redis key patterns
export const REDIS_KEYS = {
  meeting: (id: string) => `meeting:${id}`,
  availability: (meetingId: string, participantName: string) =>
    `availability:${meetingId}:${participantName}`,
  availabilityPattern: (meetingId: string) => `availability:${meetingId}:*`,
  shortUrl: (code: string) => `short:${code}`,
} as const;

// Input validation patterns
export const VALIDATION_PATTERNS = {
  // Whitelist approach: allow alphanumeric, Korean, spaces, hyphens, dots
  PARTICIPANT_NAME: /^[a-zA-Z0-9가-힣\s\-\.]+$/,
  // Dangerous characters for Redis keys
  REDIS_UNSAFE_CHARS: /[:\*]/,
} as const;

// API response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
