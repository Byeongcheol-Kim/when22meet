# Hooks Directory - AGENTS.md

이 디렉토리는 미팅 관리 로직을 캡슐화한 커스텀 React Hooks를 포함합니다.

## 디렉토리 구조

```
hooks/
├── useMeetingData.ts      # 미팅 데이터 페칭 및 상태 관리
├── useMeetingActions.ts   # 미팅 데이터 변경 액션
├── useMeetingGrid.ts      # 그리드 렌더링 데이터 계산
├── useCurrentUser.ts      # 현재 사용자 세션 관리
├── useScrollManager.ts    # 스크롤 위치 관리
└── useToast.ts            # 토스트 알림 상태 관리
```

## 훅 상세 설명

### useMeetingData

미팅 및 가용성 데이터 페칭과 상태 관리를 담당합니다.

```typescript
function useMeetingData(meetingId: string | null): {
  meeting: Meeting | null;
  availabilities: Availability[];
  isLoading: boolean;
  lockedParticipants: Set<string>;
  availabilityMap: Map<string, Availability>;
  allParticipants: string[];
  fetchMeetingData: (preserveLocalLockState?: boolean) => Promise<void>;
}
```

**주요 기능:**
- API에서 미팅 + 모든 가용성 데이터 페칭
- 잠금 상태 추적 (`lockedParticipants`)
- 데이터 새로고침 시 잠금 상태 보존
- O(1) 조회를 위한 `availabilityMap` (useMemo)

**참석자 정렬 순서:**
1. 잠금되지 않은 참석자 우선
2. 미정(undecided) 개수가 많은 순

**성능 최적화:**
- `useMemo`로 availabilityMap 캐싱
- Ref 기반 상태 보존 (리렌더링 방지)

---

### useMeetingActions

미팅 데이터 변경 작업(Mutation)을 담당합니다.

```typescript
function useMeetingActions(
  meeting: Meeting | null,
  availabilities: Availability[],
  fetchMeetingData: () => Promise<void>
): {
  handleAddParticipant: (name: string) => Promise<boolean>;
  handleStatusClick: (participant: string, date: string, status: ParticipantStatus) => void;
  handleToggleLock: (participant: string) => void;
  handleUpdateMeeting: (title: string, dates: string[], participants: string[]) => Promise<boolean>;
}
```

**주요 기능:**

#### `handleAddParticipant(name: string)`
- 새 참석자 추가
- 중복 검사
- 이름 유효성 검사
- 성공 시 `true`, 실패 시 `false` 반환

#### `handleStatusClick(participant, date, status)`
- 상태 3-way 토글: `undecided → available → unavailable → undecided`
- **Optimistic Update**: UI 즉시 업데이트 후 API 호출
- 실패 시 롤백

#### `handleToggleLock(participant)`
- 참석자 일정 확정/해제 토글
- 잠금 시 수정 불가

#### `handleUpdateMeeting(title, dates, participants)`
- 미팅 정보(제목, 날짜, 참석자) 수정
- 삭제된 날짜의 가용성 데이터 정리

**에러 처리 패턴:**
```typescript
// Optimistic Update 패턴
const originalState = currentState;
setOptimisticState(newState);  // 즉시 UI 업데이트

try {
  await apiCall(newState);
} catch (error) {
  setOptimisticState(originalState);  // 롤백
  showToast('error message', 'error');
}
```

---

### useMeetingGrid

CSS Grid 렌더링을 위한 데이터 계산을 담당합니다.

```typescript
function useMeetingGrid(
  meeting: Meeting | null,
  availabilityMap: Map<string, Availability>,
  allParticipants: string[]
): {
  gridData: GridCell[];
  topDates: TopDate[];
  columnCount: number;
}
```

**GridCell 타입:**
```typescript
interface GridCell {
  type: 'header-corner' | 'header-participant' | 'date' | 'date-separator'
       | 'time-slot' | 'status' | 'month-separator' | 'add-input';
  date?: string;
  participant?: string;
  status?: ParticipantStatus;
  dateSlotKey?: string;       // "YYYY-MM-DD" 또는 "YYYY-MM-DD:HH:MM"
  dateSummary?: ParticipantDateSummary;  // 접힌 날짜용 요약
}
```

**TopDate 타입:**
```typescript
interface TopDate {
  dateSlotKey: string;
  count: number;
  rank: 1 | 2 | 3;
}
```

**주요 기능:**
- 날짜 전용 모드 / 시간대 모드 지원
- Top 3 날짜/시간대 계산
- 연속 시간대 추천 (N시간 블록)
- 월 구분자 삽입
- 접힌 날짜 요약 정보

**성능 최적화:**
- O(N) 시간 복잡도 알고리즘
- `useMemo`로 그리드 데이터 캐싱

---

### useCurrentUser

현재 사용자 세션 및 역할 관리를 담당합니다.

```typescript
function useCurrentUser(
  meetingId: string | null,
  allParticipants: string[]
): {
  currentUser: string | null;
  userRole: 'participant' | 'organizer';
  isUserSelected: boolean;
  needsSelection: boolean;
  isOrganizer: boolean;
  setCurrentUser: (user: string | null) => void;
  setUserRole: (role: 'participant' | 'organizer') => void;
}
```

**주요 기능:**
- 현재 사용자 추적 (참석자 이름 또는 주최자 모드)
- localStorage 영속성 (`when2meet_user_{meetingId}`, `when2meet_role_{meetingId}`)
- 삭제된 사용자 자동 감지 및 상태 초기화
- 주최자 모드: 특수 ID `__organizer__`

**역할별 동작:**
| 역할 | 설명 | 수정 권한 |
|------|------|-----------|
| participant | 특정 참석자로 선택 | 본인 일정만 수정 |
| organizer | 주최자 모드 | 미팅 정보 수정, 참석자 추가 |

---

### useToast

토스트 알림 상태 관리를 담당합니다.

```typescript
function useToast(): {
  toast: { message: string; type: ToastType } | null;
  isVisible: boolean;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

type ToastType = 'success' | 'error' | 'info' | 'warning';
```

**자동 숨김:**
- `CONFIG.UI.TOAST_DURATION_MS` (기본 3000ms) 후 자동 숨김

---

### useScrollManager

그리드 스크롤 위치를 관리합니다.

```typescript
function useScrollManager(
  gridRef: RefObject<HTMLDivElement>
): {
  saveScrollPosition: () => void;
  restoreScrollPosition: () => void;
}
```

**용도:**
- 데이터 업데이트 후 스크롤 위치 유지
- UX 연속성 보장

---

## 훅 작성 가이드라인

### 패턴 및 규칙

1. **단일 책임 원칙**: 각 훅은 하나의 명확한 책임을 가짐
2. **의존성 주입**: 필요한 데이터는 인자로 전달받음
3. **Optimistic Update**: 사용자 경험을 위해 즉시 UI 업데이트
4. **에러 복구**: API 실패 시 롤백 메커니즘

### 새 훅 추가 시 체크리스트

- [ ] TypeScript 반환 타입 명시
- [ ] 의존성 배열 최적화 (`useMemo`, `useCallback`)
- [ ] 에러 처리 및 롤백 로직
- [ ] 메모리 누수 방지 (cleanup 함수)
- [ ] SSR 호환성 (localStorage 접근 시 hydration 체크)

### 훅 구조 예시

```typescript
'use client';

import { useState, useCallback, useMemo } from 'react';

interface UseExampleReturn {
  data: SomeType;
  isLoading: boolean;
  handleAction: (param: string) => Promise<void>;
}

export function useExample(dependency: string): UseExampleReturn {
  const [data, setData] = useState<SomeType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = useCallback(async (param: string) => {
    const originalData = data;

    // Optimistic update
    setData(/* new state */);

    try {
      await apiCall(param);
    } catch (error) {
      // Rollback
      setData(originalData);
      console.error('Action failed:', error);
    }
  }, [data]);

  const computedValue = useMemo(() => {
    // Expensive computation
    return processData(data);
  }, [data]);

  return {
    data: computedValue,
    isLoading,
    handleAction,
  };
}
```

## 데이터 흐름

```
사용자 상호작용
      ↓
useMeetingActions (Mutation)
      ↓
Optimistic UI Update
      ↓
API 호출 (app/api/)
      ↓
Redis 저장
      ↓
useMeetingData (Fetch)
      ↓
availabilityMap 업데이트 (useMemo)
      ↓
useMeetingGrid (계산)
      ↓
gridData → 컴포넌트 렌더링
      ↓
TopDates 표시
```

## 의존성

- **lib/types.ts**: `Meeting`, `Availability`, `ParticipantStatus` 타입
- **lib/constants/config.ts**: UI 타이밍 상수
- **lib/useTranslation.ts**: 에러 메시지 번역
