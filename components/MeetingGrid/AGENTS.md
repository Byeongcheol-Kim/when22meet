# MeetingGrid Components - AGENTS.md

이 디렉토리는 미팅 그리드 렌더링에 사용되는 컴포넌트를 포함합니다.

## 파일 구조

```
components/MeetingGrid/
├── index.ts                  # Barrel exports
├── GridCell.tsx              # 그리드 셀 컴포넌트 (405줄)
├── TopDatesIndicator.tsx     # Top 3 플로팅 인디케이터 (82줄)
├── FloatingActionButton.tsx  # FAB 메뉴 (76줄)
└── AddParticipantInput.tsx   # 참석자 추가 입력 (71줄)
```

---

## GridCell.tsx (405줄)

그리드의 모든 셀 타입을 렌더링하는 컴포넌트 모음입니다.

### 셀 컴포넌트 목록

| 컴포넌트 | 용도 | 줄 번호 |
|----------|------|---------|
| `DateCell` | 날짜 표시 (일+요일) | 23-58 |
| `StatusCell` | 참여/불참/미정 상태 버튼 | 71-118 |
| `ParticipantHeader` | 참석자 이름 헤더 | 128-178 |
| `MonthSeparator` | 월 구분 행 | 185-208 |
| `HeaderCorner` | 좌상단 코너 (연/월 표시) | 217-266 |
| `DateSeparatorCell` | 시간대 모드 날짜 구분 | 281-360 |
| `TimeSlotCell` | 시간대 레이블 | 372-405 |

### DateCell

날짜 열의 개별 날짜를 표시합니다.

```typescript
interface DateCellProps {
  date: string;           // YYYY-MM-DD
  content: string;        // "15 수" 형식
  month: string;          // "2025.01"
  highlightedDate: string | null;
  topDateInfo?: { rank: 1 | 2 | 3 };
}
```

**특징:**
- Sticky 포지션 (left: 0)
- 요일별 색상 (일요일=빨강, 토요일=파랑)
- Top 날짜 순위 배지 표시
- 하이라이트 시 확대 효과

### StatusCell

참석자의 가용성 상태를 표시하고 토글합니다.

```typescript
interface StatusCellProps {
  status: ParticipantStatus;
  participant: string;
  date: string;
  dateSlotKey?: string;     // 시간대 모드: "YYYY-MM-DD:HH:MM"
  isLocked: boolean;
  isCurrentUser?: boolean;
  onStatusClick: (participant: string, dateSlotKey: string, status: ParticipantStatus) => void;
  t: (key: string) => string;
}
```

**상태 순환:**
```
undecided → available → unavailable → undecided
```

**스타일링 로직:**
```typescript
const getCellBackground = () => {
  if (isCurrentUser && isCurrentUserEditing) {
    return CURRENT_USER_COLORS.editing.cell;
  }
  if (isCurrentUser && !isCurrentUserEditing) {
    return CURRENT_USER_COLORS.completed.cell;
  }
  return 'bg-white';
};
```

### ParticipantHeader

참석자 이름과 상태(수정 중/완료)를 표시합니다.

```typescript
interface ParticipantHeaderProps {
  name: string;
  isLocked: boolean;
  isCurrentUser?: boolean;
  isCurrentUserEditing?: boolean;
  onToggleLock: (participant: string) => void;
}
```

**아이콘 표시:**
- 수정 중: `<Pencil />` 아이콘
- 완료: `<Check />` 아이콘
- 잠금 (타인): `<Check />` 아이콘 (흐리게)

### HeaderCorner

그리드 좌상단 코너 셀입니다.

```typescript
interface HeaderCornerProps {
  content: string;
  currentDate?: string | null;  // 시간대 모드에서 현재 보이는 날짜
  hasTimeSlots?: boolean;
  getDayName?: (day: number) => string;
}
```

**모드별 표시:**
- 기본 모드: 연/월만 표시
- 시간대 모드: 스크롤 시 현재 날짜 표시 (일+요일)

### DateSeparatorCell

시간대 모드에서 날짜 구분 행을 렌더링합니다.

```typescript
interface DateSeparatorCellProps {
  date: string;
  content: string;
  month: string;
  highlightedDate: string | null;
  isFirst?: boolean;           // 첫 번째 열 (날짜 표시)
  isFirstOfMonth?: boolean;
  isExpanded?: boolean;        // 펼쳐진 상태
  onToggleExpand?: (date: string) => void;
  dateSummary?: ParticipantDateSummary;  // 접힌 상태 요약
}
```

**접힌 상태 요약 표시:**
```typescript
// 참여가 있으면: "3/5" (3명 참여 / 5개 시간대)
// 전부 불참: "0/5"
// 전부 미정: "?"
```

### TimeSlotCell

시간대 레이블을 표시합니다.

```typescript
interface TimeSlotCellProps {
  date: string;
  timeSlot: TimeSlotValue;
  timeSlotLabel: string;        // "09:00" 형식
  highlightedDate: string | null;
  topDateInfo?: { rank: 1 | 2 | 3 };
  dateSlotKey: string;          // "YYYY-MM-DD:HH:MM"
}
```

---

## TopDatesIndicator.tsx (82줄)

가장 많은 참석자가 가능한 Top 3 날짜/시간대를 플로팅으로 표시합니다.

```typescript
interface TopDatesIndicatorProps {
  topDates: TopDate[];
  datePositions: Map<string, number>;
  scrollTop: number;
  clientHeight: number;
  onDateClick: (dateSlotKey: string) => void;
  t: (key: string) => string;
}

interface TopDate {
  date: string;
  dateSlotKey: string;
  count: number;
  rank: 1 | 2 | 3;
}
```

**기능:**
- 화면에 보이는 Top 날짜만 표시
- 클릭 시 해당 날짜로 스크롤
- 메달 색상: 금(1위), 은(2위), 동(3위)

---

## FloatingActionButton.tsx (76줄)

화면 우하단 FAB 메뉴입니다.

```typescript
interface FloatingActionButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  onShareClick: () => void;
  onEditClick: () => void;
  onNewMeetingClick: () => void;
  onInfoClick: () => void;
  t: (key: string) => string;
}
```

**메뉴 항목:**
- 공유하기
- 수정하기
- 새 미팅 만들기
- 정보

---

## AddParticipantInput.tsx (71줄)

그리드 내에서 참석자를 추가하는 입력 컴포넌트입니다.

```typescript
interface AddParticipantInputProps {
  onAddParticipant: (name: string) => Promise<boolean>;
  maxLength?: number;
  placeholder?: string;
}
```

---

## 성능 최적화

모든 셀 컴포넌트는 `memo`로 래핑되어 있습니다:

```typescript
export const DateCell = memo(function DateCell({ ... }) {
  // ...
});
```

### 리렌더 방지 조건

- `memo` 기본: props 얕은 비교
- 상태 변경 시 해당 셀만 리렌더
- 함수 props는 `useCallback`으로 안정화 (부모에서)

---

## 스타일링

### Sticky 포지션

```typescript
// 날짜 열
style={{ position: 'sticky', left: 0, zIndex: 10 }}

// 헤더 행
style={{ position: 'sticky', top: 0, zIndex: 20 }}

// 좌상단 코너
style={{ position: 'sticky', top: 0, left: 0, zIndex: 30 }}
```

### z-index 계층

| z-index | 요소 |
|---------|------|
| 30 | HeaderCorner (좌상단) |
| 20 | ParticipantHeader (상단), 하이라이트된 날짜 |
| 10 | DateCell, TimeSlotCell (좌측) |

---

## 의존성

- `lib/constants/colors` - 모든 색상 상수
- `lib/types` - `TimeSlotValue`, `ParticipantStatus`
- `hooks/useMeetingGrid` - `ParticipantDateSummary` 타입
- `lucide-react` - `Check`, `Pencil` 아이콘

---

## 수정 가이드라인

### 새 셀 타입 추가 시

1. `GridCell.tsx`에 인터페이스 및 컴포넌트 추가
2. `memo`로 래핑
3. `index.ts`에 export 추가
4. `useMeetingGrid`의 `gridData` 생성 로직에 새 타입 추가
5. `app/meeting/[id]/page.tsx`의 렌더링 분기에 추가

### 체크리스트

- [ ] 새 컴포넌트는 `memo`로 래핑
- [ ] Props 인터페이스 명시적 정의
- [ ] 색상은 `lib/constants/colors` 상수 사용
- [ ] Sticky 포지션 및 z-index 계층 확인
- [ ] `index.ts`에 export 추가
