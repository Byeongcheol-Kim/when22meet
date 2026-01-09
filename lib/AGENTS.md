# Lib Directory - AGENTS.md

이 디렉토리는 핵심 유틸리티, 타입 정의, 상수, Redis 클라이언트 등을 포함합니다.

## 디렉토리 구조

```
lib/
├── constants/                    # 설정 상수
│   ├── colors.ts                # 색상 토큰 및 헬퍼 함수
│   └── config.ts                # 앱 설정 (TTL, 검증, UI)
├── types/                       # API 타입 정의
│   └── api.ts                   # 요청/응답 타입
├── utils/                       # 유틸리티 함수
│   ├── date.ts                  # 날짜 포맷팅
│   ├── dateTemplates.ts         # 빠른 날짜 선택 템플릿
│   ├── i18n.ts                  # 서버사이드 i18n
│   ├── redis.ts                 # Redis 추상화 레이어
│   └── urlShortener.ts          # URL 단축 로직
├── redis.ts                     # Upstash Redis 클라이언트
├── types.ts                     # 핵심 도메인 타입
├── utils.ts                     # 일반 유틸리티
└── useTranslation.ts            # 클라이언트 i18n 훅
```

## 핵심 타입 정의

### types.ts - 도메인 타입

```typescript
// 미팅 데이터
interface Meeting {
  id: string;
  title: string;
  dates: string[];              // YYYY-MM-DD 형식
  participants: string[];
  createdAt: string;
  expiresAt: string;
  timeSlotEnabled?: boolean;
  timeSlots?: string[];         // HH:MM 형식
  consecutiveSlotCount?: number;
}

// 참석자 가용성
interface Availability {
  participantName: string;
  availableDates: string[];     // YYYY-MM-DD 또는 YYYY-MM-DD:HH:MM
  unavailableDates: string[];
  isLocked: boolean;
}

// 저장용 가용성 (타임스탬프 포함)
interface StoredAvailability extends Availability {
  updatedAt: string;
}

// 참석자 상태
type ParticipantStatus = 'available' | 'unavailable' | 'undecided';

// 시간대 단축키
const TIME_SLOT_SHORTCUTS = {
  dawn: ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30'],
  morning: ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  afternoon: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
  evening: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'],
  night: ['22:00', '22:30', '23:00', '23:30'],
  allDay: [...] // 모든 시간대
};
```

### types/api.ts - API 타입

```typescript
// 미팅 생성
interface CreateMeetingRequest {
  title: string;
  dates: string[];
  participants: string[];
  locale?: 'ko' | 'en';
  timeSlotEnabled?: boolean;
  timeSlots?: string[];
  consecutiveSlotCount?: number;
}

interface CreateMeetingResponse {
  success: boolean;
  meetingId: string;
  meeting: Meeting;
}

// 가용성 업데이트
interface UpdateAvailabilityRequest {
  participantName: string;
  availableDates?: string[];
  unavailableDates?: string[];
  isLocked?: boolean;
  statusUpdate?: {
    dateSlotKey: string;
    status: ParticipantStatus;
  };
}

// 에러 응답
interface ApiErrorResponse {
  error: string;
  details?: string;
}
```

---

## 상수 정의

### constants/config.ts

```typescript
export const CONFIG = {
  // TTL 설정
  TTL: {
    MEETING_SECONDS: 47304000,    // 18개월
    SHORT_URL_SECONDS: 5184000,   // 60일
  },

  // 유효성 검사
  VALIDATION: {
    MAX_PARTICIPANTS: 100,
    MAX_DATES: 365,
    MAX_TITLE_LENGTH: 100,
    MAX_NAME_LENGTH: 50,
  },

  // UI 타이밍
  UI: {
    HIGHLIGHT_DURATION_MS: 2000,
    TOAST_DURATION_MS: 3000,
    DEBOUNCE_DELAY_MS: 300,
  },

  // 그리드 크기
  GRID: {
    ROW_HEIGHT_PX: 56,
    HEADER_HEIGHT_PX: 40,
    MIN_COLUMN_WIDTH: '90px',
    MAX_COLUMN_WIDTH: '120px',
    COLUMN_WIDTH_VW: '10vw',
  },

  // Redis 키 패턴
  REDIS_KEYS: {
    meeting: (id: string) => `meeting:${id}`,
    availability: (meetingId: string, name: string) => `availability:${meetingId}:${name}`,
    shortUrl: (code: string) => `short:${code}`,
  },
};
```

### constants/colors.ts

```typescript
// 상태 색상
export const STATUS_COLORS = {
  available: {
    bg: 'bg-[#FFC354]',
    text: 'text-gray-800',
    border: 'border-[#FFC354]',
    hover: 'hover:bg-[#FFD580]',
  },
  unavailable: {
    bg: 'bg-[#6B7280]',
    text: 'text-white',
    border: 'border-[#6B7280]',
    hover: 'hover:bg-gray-600',
  },
  undecided: {
    bg: 'bg-gray-50',
    text: 'text-gray-400',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-100',
  },
};

// 버튼 색상
export const BUTTON_COLORS = {
  primary: {
    bg: 'bg-[#FFC354]',
    text: 'text-gray-800',
    hover: 'hover:bg-[#FFD580]',
  },
  secondary: {
    bg: 'bg-gray-200',
    text: 'text-gray-700',
    hover: 'hover:bg-gray-300',
  },
};

// Top 날짜 뱃지 (메달)
export const TOP_DATES_COLORS = {
  first: { bg: 'bg-yellow-400', text: 'text-yellow-900' },
  second: { bg: 'bg-gray-300', text: 'text-gray-700' },
  third: { bg: 'bg-orange-400', text: 'text-orange-900' },
};

// 헬퍼 함수
export function getStatusClasses(status: ParticipantStatus, isEditable: boolean): string;
export function getTopDateClasses(rank: 1 | 2 | 3, type: 'badge' | 'indicator'): string;
export function getDayOfWeekColor(dayIndex: number, isHighlighted: boolean): string;
```

---

## 유틸리티 함수

### utils/date.ts

```typescript
// 날짜 → 문자열 (YYYY-MM-DD)
formatDateToString(date: Date): string

// 문자열 → 날짜
parseStringToDate(dateString: string): Date

// 연월 포맷 (YYYY.MM)
formatYearMonth(date: Date): string

// 월일 포맷 (M/D)
formatMonthDay(date: Date): string

// 같은 달 확인
isSameMonth(date1: Date, date2: Date): boolean

// 과거 날짜 확인
isPastDate(date: Date): boolean

// 요일명 (월, Mon)
getDayName(dayIndex: number, locale: 'ko' | 'en'): string

// 월 표시명 (2025. 01.)
getMonthDisplayName(year: number, month: number): string
```

### utils/dateTemplates.ts

빠른 날짜 선택을 위한 템플릿:

```typescript
const DATE_TEMPLATES = [
  { key: 'next7days', label: '오는 한 주', getDates: () => [...] },
  { key: 'next30days', label: '다음 한 달', getDates: () => [...] },
  { key: 'weekdaysOnly', label: '평일만', getDates: () => [...] },
  { key: 'weekendsOnly', label: '주말만', getDates: () => [...] },
];
```

### utils/redis.ts - Redis 추상화

```typescript
// 미팅의 모든 가용성 조회 (MGET - N+1 방지)
fetchMeetingAvailabilities(meetingId: string): Promise<Availability[]>

// 미팅 + 가용성 함께 조회
fetchMeetingWithAvailabilities(meetingId: string): Promise<{
  meeting: Meeting | null;
  availabilities: Availability[];
}>

// 미팅 저장 (TTL 포함)
saveMeeting(meeting: Meeting): Promise<void>

// 가용성 저장 (TTL 포함)
saveAvailability(meetingId: string, name: string, data: StoredAvailability): Promise<void>

// 가용성 삭제
deleteAvailability(meetingId: string, name: string): Promise<void>

// Top 날짜 계산
calculateTopDates(meeting: Meeting, availabilities: Availability[]): TopDate[]
```

### utils/urlShortener.ts

```typescript
// 단축 코드 생성 (base62)
generateShortCode(): string

// 단축 URL 저장
saveShortUrl(code: string, originalUrl: string): Promise<void>

// 단축 URL 조회
getOriginalUrl(code: string): Promise<string | null>
```

---

## Redis 클라이언트

### redis.ts

```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

**중요**: Upstash Redis는 자동 JSON 직렬화를 수행합니다. `JSON.stringify()` / `JSON.parse()` 를 사용하지 마세요.

**키 패턴:**
- `meeting:{id}` - 미팅 데이터
- `availability:{meetingId}:{participantName}` - 참석자 가용성
- `short:{code}` - 단축 URL 매핑

---

## i18n 시스템

### useTranslation.ts (클라이언트)

```typescript
interface UseTranslationReturn {
  locale: 'ko' | 'en';
  t: (key: string) => string;
  setLocale: (locale: 'ko' | 'en') => void;
  isHydrated: boolean;
}

export function useTranslation(): UseTranslationReturn;
```

**번역 키 패턴:**
```typescript
t('landing.splash.title')           // "일정 조율"
t('meeting.status.available')       // "참여"
t('meeting.toast.linkCopied')       // "링크가 복사되었습니다"
```

### utils/i18n.ts (서버)

```typescript
// 번역 파일 로드
loadTranslations(locale: 'ko' | 'en'): Translations

// 브라우저 언어 감지
detectLocale(acceptLanguage: string): 'ko' | 'en'
```

---

## 개발 가이드라인

### 새 상수 추가 시

1. **TTL**: `CONFIG.TTL`에 추가
2. **유효성 검사**: `CONFIG.VALIDATION`에 추가
3. **Redis 키**: `CONFIG.REDIS_KEYS`에 패턴 추가
4. **색상**: `lib/constants/colors.ts`에 추가

### 새 유틸리티 함수 추가 시

1. 관련 파일에 함수 추가 (`utils/date.ts`, `utils/redis.ts` 등)
2. TypeScript 타입 명시
3. 순수 함수로 작성 (부작용 없음)
4. 필요시 단위 테스트 추가

### 새 타입 추가 시

1. **도메인 타입**: `lib/types.ts`에 추가
2. **API 타입**: `lib/types/api.ts`에 추가
3. 필요시 `export`하여 다른 모듈에서 사용

### 체크리스트

- [ ] 상수는 하드코딩하지 않고 `CONFIG`에서 가져오기
- [ ] 색상은 Tailwind 클래스로 `colors.ts`에 정의
- [ ] Redis 작업은 `utils/redis.ts` 추상화 레이어 사용
- [ ] 날짜 처리는 `utils/date.ts` 함수 사용
- [ ] 번역 키는 `messages/ko.json`, `messages/en.json`에 추가

---

## 의존성

- **@upstash/redis**: Upstash Redis REST 클라이언트
- **nanoid**: 고유 ID 생성
- **messages/*.json**: 번역 파일 (messages 디렉토리)

---

## 하위 모듈 문서

복잡한 코드가 있는 하위 디렉토리에 상세 문서가 있습니다:

| 파일 | 내용 |
|------|------|
| [`constants/AGENTS.md`](./constants/AGENTS.md) | 색상 토큰 (579줄), 설정 상수, 헬퍼 함수 |
| [`utils/AGENTS.md`](./utils/AGENTS.md) | Redis 추상화, 날짜/i18n/URL 유틸리티 |
