# Meetings API - AGENTS.md

이 디렉토리는 미팅 관련 REST API 엔드포인트를 포함합니다.

## 파일 구조

```
app/api/meetings/
├── route.ts                    # POST: 미팅 생성 (108줄)
└── [id]/
    ├── route.ts                # GET/PATCH: 미팅 조회/수정 (127줄)
    └── availability/
        └── route.ts            # POST: 가용성 업데이트 (120줄)
```

---

## POST /api/meetings - 미팅 생성

새 미팅을 생성합니다.

### 요청

```typescript
interface CreateMeetingRequest {
  title: string;                // 필수, 최대 100자
  dates: string[];              // 필수, YYYY-MM-DD 형식, 최대 365개
  participants?: string[];      // 선택, 초기 참석자 목록
  locale?: 'ko' | 'en';         // 선택, 기본값 'ko'
  timeSlotEnabled?: boolean;    // 선택, 시간대 모드
  timeSlots?: string[];         // timeSlotEnabled 시 필수, HH:MM 형식
  consecutiveSlotCount?: number; // 선택, 연속 시간대 추천 개수
}
```

### 응답

```typescript
// 성공 (200)
{
  success: true,
  meetingId: "abc123xyz",
  meeting: Meeting
}

// 실패 (400/500)
{
  error: "Title and dates are required"
}
```

### 유효성 검사

| 항목 | 규칙 | 에러 메시지 |
|------|------|-------------|
| title | 필수, 최대 100자 | "Title is too long" |
| dates | 필수, 1개 이상, 최대 365개 | "Title and dates are required" |
| timeSlots | timeSlotEnabled 시 필수 | "At least one time slot must be selected" |
| timeSlots 값 | TIME_SLOTS에 정의된 값만 | "Invalid time slot values" |

### 로직 플로우

```
1. 요청 파싱 및 유효성 검사
2. meetingId 생성 (nanoid)
3. Meeting 객체 생성
4. Redis에 미팅 저장 (18개월 TTL)
5. 참석자가 있으면 초기 가용성 생성
6. 응답 반환
```

---

## GET /api/meetings/[id] - 미팅 조회

미팅과 모든 가용성을 조회합니다.

### 응답

```typescript
// 성공 (200)
{
  meeting: Meeting,
  availabilities: Availability[]
}

// 실패 (404)
{
  error: "Meeting not found"
}
```

### 최적화

- `fetchMeetingWithAvailabilities` 사용
- MGET으로 N+1 문제 해결
- 타임스탬프로 정렬 (최신순)

---

## PATCH /api/meetings/[id] - 미팅 수정

미팅 정보를 수정합니다.

### 요청

```typescript
{
  title?: string;           // 제목 수정
  dates: string[];          // 필수, 날짜 목록
  participants?: string[];  // 참석자 목록 수정
  consecutiveSlotCount?: number;  // 연속 시간대 개수
}
```

### 응답

```typescript
// 성공 (200)
{
  success: true,
  meeting: Meeting
}

// 실패 (400/404/500)
{
  error: "Meeting not found"
}
```

### 참석자 관리 로직

```typescript
// 1. 현재 참석자 조회
const currentParticipants = await getMeetingParticipants(id);

// 2. 새 참석자 추가
for (const name of participants) {
  if (!currentParticipants.includes(name)) {
    await saveAvailability(id, name, { dates: [], ... });
  }
}

// 3. 제거된 참석자 삭제
for (const current of currentParticipants) {
  if (!participants.includes(current)) {
    await deleteAvailability(id, current);
  }
}
```

---

## POST /api/meetings/[id]/availability - 가용성 업데이트

참석자의 가용성을 업데이트합니다.

### 요청

```typescript
interface UpdateAvailabilityRequest {
  participantName: string;

  // 전체 업데이트 (둘 중 하나 사용)
  availableDates?: string[];
  unavailableDates?: string[];
  isLocked?: boolean;

  // 또는 단일 상태 업데이트
  statusUpdate?: {
    dateSlotKey: string;  // "YYYY-MM-DD" 또는 "YYYY-MM-DD:HH:MM"
    status: 'available' | 'unavailable' | 'undecided';
  };
}
```

### 응답

```typescript
// 성공 (200)
{
  success: true
}

// 실패 (400/404/500)
{
  error: "Participant name is required"
}
```

### statusUpdate 처리 로직

```typescript
// 기존 가용성 조회
const current = await getAvailability(meetingId, participantName);

// 상태에 따라 배열 업데이트
if (status === 'available') {
  // availableDates에 추가, unavailableDates에서 제거
} else if (status === 'unavailable') {
  // unavailableDates에 추가, availableDates에서 제거
} else {
  // 양쪽 배열에서 제거 (undecided)
}
```

---

## 공통 패턴

### 에러 응답 형식

```typescript
return NextResponse.json(
  { error: 'Error message' },
  { status: 400 | 404 | 500 }
);
```

### Redis 함수 사용

```typescript
import {
  fetchMeetingWithAvailabilities,
  getMeetingParticipants,
  saveMeeting,
  saveAvailability,
  deleteAvailability,
} from '@/lib/utils/redis';
```

### 설정 상수 사용

```typescript
import { CONFIG, REDIS_KEYS } from '@/lib/constants/config';

// TTL
CONFIG.MEETING_TTL_SECONDS

// 제한
CONFIG.MAX_MEETING_TITLE_LENGTH
CONFIG.MAX_DATES

// 키 패턴
REDIS_KEYS.meeting(id)
REDIS_KEYS.availability(meetingId, participantName)
```

---

## 의존성

- `@/lib/redis` - Redis 클라이언트
- `@/lib/types` - `Meeting`, `TIME_SLOTS`, `TimeSlotValue`
- `@/lib/utils/redis` - Redis 헬퍼 함수
- `@/lib/constants/config` - 설정 상수
- `@/lib/utils` - `generateMeetingId`

---

## 수정 가이드라인

### 새 엔드포인트 추가 시

1. `lib/types/api.ts`에 요청/응답 타입 정의
2. 유효성 검사는 `CONFIG` 상수 사용
3. Redis 작업은 `lib/utils/redis.ts` 함수 사용
4. 에러는 일관된 형식으로 반환

### 체크리스트

- [ ] 요청/응답 타입 `lib/types/api.ts`에 정의
- [ ] 유효성 검사 규칙 `CONFIG`에서 가져오기
- [ ] Redis 직접 호출 대신 `lib/utils/redis.ts` 사용
- [ ] 에러 응답 형식 일관성 유지
- [ ] 성공 응답에 `success: true` 포함
