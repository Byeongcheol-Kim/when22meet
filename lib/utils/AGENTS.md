# Utils Directory - AGENTS.md

이 디렉토리는 프로젝트 전반에서 사용하는 유틸리티 함수를 포함합니다.

## 파일 구조

```
lib/utils/
├── redis.ts          # Redis 추상화 레이어 (165줄)
├── i18n.ts           # 서버사이드 i18n (153줄)
├── date.ts           # 날짜 포맷팅 (63줄)
├── dateTemplates.ts  # 빠른 날짜 선택 템플릿 (62줄)
└── urlShortener.ts   # URL 단축 로직 (83줄)
```

---

## redis.ts (165줄)

Redis N+1 문제를 해결하는 최적화된 쿼리 함수들입니다.

### 함수 목록

#### fetchMeetingAvailabilities

미팅의 모든 가용성을 벌크로 조회합니다.

```typescript
async function fetchMeetingAvailabilities(
  meetingId: string
): Promise<Availability[]>
```

**핵심 로직:**
```typescript
// 1. 패턴으로 모든 키 조회
const keys = await redis.keys(`availability:${meetingId}:*`);

// 2. MGET으로 한 번에 조회 (N+1 방지)
const values = await redis.mget(...keys);

// 3. 타임스탬프로 정렬 (최신순)
availabilities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
```

**데이터 형식 호환성:**
- 구 형식 (배열): `["2025-01-15", "2025-01-16"]`
- 신 형식 (객체): `{ dates: [...], unavailableDates: [...], timestamp, isLocked }`

#### fetchMeetingWithAvailabilities

미팅과 모든 가용성을 함께 조회합니다.

```typescript
async function fetchMeetingWithAvailabilities(
  meetingId: string
): Promise<{ meeting: Meeting; availabilities: Availability[] } | null>
```

#### getMeetingParticipants

미팅의 현재 참석자 목록을 조회합니다.

```typescript
async function getMeetingParticipants(meetingId: string): Promise<string[]>
```

#### calculateTopDates

가장 많은 참석자가 가능한 날짜를 계산합니다.

```typescript
function calculateTopDates(
  meeting: Meeting,
  availabilities: Availability[],
  limit: number = 3
): Array<{ date: string; count: number; rank: number }>
```

**최적화:**
- `Map` + `Set` 사용하여 O(1) 조회
- 빈 결과 조기 반환

#### saveMeeting / saveAvailability / deleteAvailability

데이터 저장/삭제 헬퍼 함수들입니다.

```typescript
async function saveMeeting(meeting: Meeting): Promise<void>
async function saveAvailability(meetingId, participantName, data): Promise<void>
async function deleteAvailability(meetingId, participantName): Promise<void>
```

**특징:**
- 중앙화된 TTL 적용 (`CONFIG.MEETING_TTL_SECONDS`)
- 자동 키 생성 (`REDIS_KEYS.meeting()`, `REDIS_KEYS.availability()`)

---

## i18n.ts (153줄)

서버사이드 번역 유틸리티입니다.

### 함수 목록

#### loadTranslations

번역 파일을 로드합니다.

```typescript
function loadTranslations(locale: 'ko' | 'en'): Record<string, unknown>
```

#### getTranslation

중첩된 번역 키를 조회합니다.

```typescript
function getTranslation(
  translations: Record<string, unknown>,
  key: string
): string
```

#### detectLocale

Accept-Language 헤더에서 언어를 감지합니다.

```typescript
function detectLocale(acceptLanguage: string | null): 'ko' | 'en'
```

---

## date.ts (63줄)

날짜 포맷팅 유틸리티입니다.

### 함수 목록

```typescript
// 날짜 → 문자열 (YYYY-MM-DD)
function formatDateToString(date: Date): string

// 문자열 → 날짜 (타임존 안전)
function parseStringToDate(dateString: string): Date

// 연월 포맷 (YYYY.MM)
function formatYearMonth(date: Date): string

// 월일 포맷 (M/D)
function formatMonthDay(date: Date): string

// 같은 달 확인
function isSameMonth(date1: Date, date2: Date): boolean

// 과거 날짜 확인
function isPastDate(date: Date): boolean

// 요일명 (월, 화, ... / Mon, Tue, ...)
function getDayName(dayIndex: number, locale: 'ko' | 'en'): string

// 월 표시명 (2025. 01.)
function getMonthDisplayName(year: number, month: number): string
```

### 타임존 주의사항

```typescript
// ✅ 타임존 안전하게 파싱
const date = new Date(dateString + 'T00:00:00');

// ❌ 타임존 문제 발생 가능
const date = new Date(dateString);
```

---

## dateTemplates.ts (62줄)

빠른 날짜 선택 템플릿입니다.

### 템플릿 목록

```typescript
const DATE_TEMPLATES = [
  {
    key: 'next7days',
    label: { ko: '오는 한 주', en: 'Next 7 days' },
    getDates: () => { /* 다음 7일 */ },
  },
  {
    key: 'next30days',
    label: { ko: '다음 한 달', en: 'Next 30 days' },
    getDates: () => { /* 다음 30일 */ },
  },
  {
    key: 'weekdaysOnly',
    label: { ko: '평일만', en: 'Weekdays only' },
    getDates: () => { /* 평일만 (다음 30일 중) */ },
  },
  {
    key: 'weekendsOnly',
    label: { ko: '주말만', en: 'Weekends only' },
    getDates: () => { /* 주말만 (다음 30일 중) */ },
  },
];
```

### 사용 예시

```typescript
import { DATE_TEMPLATES } from '@/lib/utils/dateTemplates';

const template = DATE_TEMPLATES.find(t => t.key === 'next7days');
const dates = template.getDates(); // string[] (YYYY-MM-DD 형식)
```

---

## urlShortener.ts (83줄)

URL 단축 기능입니다.

### 함수 목록

```typescript
// 단축 코드 생성
function generateShortCode(length?: number): string

// 단축 URL 저장
async function saveShortUrl(code: string, originalUrl: string): Promise<void>

// 원본 URL 조회
async function getOriginalUrl(code: string): Promise<string | null>

// 단축 URL 생성 (저장 포함)
async function createShortUrl(originalUrl: string): Promise<string>
```

### TTL 설정

단축 URL은 60일 TTL로 저장됩니다:
```typescript
await redis.setex(key, CONFIG.SHORT_URL_TTL_SECONDS, originalUrl);
```

---

## 의존성

- `@/lib/redis` - Redis 클라이언트
- `@/lib/types` - 도메인 타입
- `@/lib/constants/config` - 설정 상수

---

## 수정 가이드라인

### 새 Redis 함수 추가 시

1. N+1 문제 주의 (MGET, Pipeline 사용)
2. TTL은 `CONFIG` 상수 사용
3. 키는 `REDIS_KEYS` 패턴 사용
4. 에러 처리 포함

### 새 날짜 함수 추가 시

1. 타임존 안전하게 처리 (`+ 'T00:00:00'`)
2. 입력/출력 형식 문서화
3. 로케일 지원 고려

### 체크리스트

- [ ] Redis 함수는 벌크 연산 사용 (MGET, MSET)
- [ ] TTL 하드코딩 금지 → `CONFIG` 사용
- [ ] 날짜 파싱 시 타임존 처리
- [ ] 번역 키는 `messages/*.json`에 정의
