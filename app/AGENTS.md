# App Directory - AGENTS.md

이 디렉토리는 Next.js 15 App Router를 사용하는 페이지 및 API 라우트를 포함합니다.

## 디렉토리 구조

```
app/
├── api/                           # REST API 엔드포인트
│   ├── meetings/                 # 미팅 CRUD API
│   │   ├── route.ts             # POST: 미팅 생성
│   │   └── [id]/
│   │       ├── route.ts         # GET/PATCH: 미팅 조회/수정
│   │       └── availability/
│   │           └── route.ts     # POST: 참석자 가용성 업데이트
│   └── shorten/
│       └── route.ts             # POST: URL 단축
├── meeting/[id]/                  # 미팅 상세 페이지
│   ├── page.tsx                 # 미팅 그리드 뷰
│   └── opengraph-image.tsx      # 동적 OG 이미지
├── faq/                          # FAQ 페이지
│   ├── page.tsx
│   └── opengraph-image.tsx
├── s/[code]/                     # 단축 URL 리다이렉트
│   ├── page.tsx
│   └── opengraph-image.tsx
├── layout.tsx                    # 루트 레이아웃 (폰트, 메타데이터)
├── page.tsx                      # 랜딩 페이지 (미팅 생성)
├── globals.css                   # 전역 스타일 및 애니메이션
├── robots.ts                     # SEO robots.txt
└── opengraph-image.tsx           # 홈페이지 OG 이미지
```

## API 엔드포인트 명세

### POST `/api/meetings` - 미팅 생성

**Request:**
```typescript
interface CreateMeetingRequest {
  title: string;              // 최대 100자
  dates: string[];            // YYYY-MM-DD 형식, 최대 365개
  participants: string[];     // 최대 100명, 각 이름 최대 50자
  locale?: 'ko' | 'en';
  timeSlotEnabled?: boolean;
  timeSlots?: string[];       // HH:MM 형식 (30분 단위)
  consecutiveSlotCount?: number;
}
```

**Response:**
```typescript
interface CreateMeetingResponse {
  success: boolean;
  meetingId: string;
  meeting: Meeting;
}
```

### GET `/api/meetings/[id]` - 미팅 조회

**Response:**
```typescript
{
  meeting: Meeting;
  availabilities: Availability[];
}
```

### PATCH `/api/meetings/[id]` - 미팅 수정

**Request:**
```typescript
{
  title?: string;
  dates?: string[];
  participants?: string[];
}
```

### POST `/api/meetings/[id]/availability` - 가용성 업데이트

**Request:**
```typescript
interface UpdateAvailabilityRequest {
  participantName: string;
  availableDates?: string[];
  unavailableDates?: string[];
  isLocked?: boolean;
  statusUpdate?: {
    dateSlotKey: string;      // "YYYY-MM-DD" 또는 "YYYY-MM-DD:HH:MM"
    status: 'available' | 'unavailable' | 'undecided';
  };
}
```

## 페이지 컴포넌트

### `page.tsx` (랜딩 페이지)

미팅 생성 폼을 포함하는 메인 페이지:
- `DateSelector` 컴포넌트로 날짜 선택
- `ParticipantsInput` 컴포넌트로 참석자 추가
- `TimeSlotSelector` 컴포넌트로 시간대 설정 (선택사항)
- URL 생성 후 미팅 페이지로 리다이렉트

### `meeting/[id]/page.tsx` (미팅 상세)

미팅 그리드 및 가용성 관리:
- 훅 사용: `useMeetingData`, `useMeetingActions`, `useMeetingGrid`, `useCurrentUser`
- 참석자 선택 모달
- 상태 토글 (참여/불참/미정)
- Top 3 날짜 표시
- 공유 기능

### `layout.tsx` (루트 레이아웃)

- Noto Sans KR 폰트 설정
- 메타데이터 및 OG 태그
- Vercel Analytics/Speed Insights

## 스타일링

### `globals.css` 핵심 클래스

```css
/* 애니메이션 */
.animate-fade-in          /* 페이드 인 */
.animate-slide-up-toast   /* 토스트 슬라이드 업 */
.animate-slide-down-toast /* 토스트 슬라이드 다운 */

/* 그리드 */
.meeting-grid-container   /* CSS Grid 컨테이너 */
.meeting-grid-header-corner  /* Sticky 헤더 코너 */

/* 지연 */
.animation-delay-200
.animation-delay-400
```

## 개발 가이드라인

### API 라우트 작성 시

1. **유효성 검사**: `lib/constants/config.ts`의 `VALIDATION` 상수 사용
2. **에러 처리**: 일관된 `ApiErrorResponse` 형식 반환
3. **TTL 설정**: `CONFIG.TTL.MEETING_SECONDS` 사용
4. **Redis 키 패턴**: `CONFIG.REDIS_KEYS` 패턴 준수

### 페이지 작성 시

1. **'use client'**: 클라이언트 컴포넌트 명시
2. **메타데이터**: `generateMetadata` 함수로 동적 SEO
3. **OG 이미지**: 별도 `opengraph-image.tsx` 파일 생성
4. **i18n**: `useTranslation` 훅으로 다국어 지원

### 새 API 라우트 추가 시 체크리스트

- [ ] 요청/응답 타입을 `lib/types/api.ts`에 정의
- [ ] 유효성 검사 상수를 `lib/constants/config.ts`에 추가
- [ ] 에러 메시지 번역을 `messages/ko.json`, `messages/en.json`에 추가
- [ ] 필요시 Redis 키 패턴을 `CONFIG.REDIS_KEYS`에 추가

---

## 하위 모듈 문서

복잡한 코드가 있는 하위 디렉토리에 상세 문서가 있습니다:

| 파일 | 내용 |
|------|------|
| [`meeting/[id]/AGENTS.md`](./meeting/[id]/AGENTS.md) | 미팅 상세 페이지 (614줄), 훅 사용법, 그리드 렌더링 |
| [`api/meetings/AGENTS.md`](./api/meetings/AGENTS.md) | 미팅 API 엔드포인트, 요청/응답 명세 |
