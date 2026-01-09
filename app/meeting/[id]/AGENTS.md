# Meeting Detail Page - AGENTS.md

이 디렉토리는 미팅 상세 페이지를 구성하는 핵심 컴포넌트를 포함합니다.

## 파일 구조

```
app/meeting/[id]/
├── page.tsx              # 미팅 상세 페이지 (614줄)
├── layout.tsx            # 레이아웃 및 메타데이터 (111줄)
└── opengraph-image.tsx   # 동적 OG 이미지 (185줄)
```

---

## page.tsx (614줄)

미팅 가용성 그리드를 표시하고 상태 관리를 담당하는 핵심 페이지 컴포넌트입니다.

### 사용하는 훅

| 훅 | 용도 |
|-----|------|
| `useMeetingData` | 미팅 및 가용성 데이터 페칭 |
| `useMeetingActions` | 상태 변경 액션 (클릭, 잠금, 수정) |
| `useMeetingGrid` | 그리드 렌더링 데이터 계산 |
| `useScrollManager` | 스크롤 위치 및 현재 월 추적 |
| `useToast` | 토스트 알림 |
| `useCurrentUser` | 현재 사용자 세션 관리 |
| `useTranslation` | 다국어 지원 |

### 주요 상태 변수

```typescript
// UI 모달 상태
const [showCreatorModal, setShowCreatorModal] = useState(false);
const [showFabMenu, setShowFabMenu] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showShareModal, setShowShareModal] = useState(false);
const [showNewMeetingConfirm, setShowNewMeetingConfirm] = useState(false);
const [showParticipantSelectModal, setShowParticipantSelectModal] = useState(false);

// 수정 모달용 임시 상태
const [editingDates, setEditingDates] = useState<string[]>([]);
const [editingTitle, setEditingTitle] = useState('');
const [editingParticipants, setEditingParticipants] = useState<string[]>([]);
const [isUpdating, setIsUpdating] = useState(false);

// 시간대 모드 상태
const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
const [consecutiveSlotCount, setConsecutiveSlotCount] = useState(1);
```

### 핵심 로직

#### 1. 참석자 순서 재정렬

현재 사용자를 맨 앞으로 이동:

```typescript
const orderedParticipants = useMemo(() => {
  if (!currentUser || isOrganizer) return allParticipants;
  const filtered = allParticipants.filter((p) => p !== currentUser);
  return [currentUser, ...filtered];
}, [allParticipants, currentUser, isOrganizer]);
```

#### 2. 수정 권한 결정

```typescript
// 주최자: 잠금되지 않은 참석자 수정 가능
// 참석자: 본인만 수정 가능 (잠금 안 됐을 때)
const canEdit = isOrganizer
  ? !participantIsLocked
  : isCurrent && !participantIsLocked && isEditing;
```

#### 3. 시간대 모드 날짜 접기/펼치기

```typescript
const handleToggleDateExpand = useCallback((date: string) => {
  setExpandedDates((prev) => {
    const next = new Set(prev);
    if (next.has(date)) next.delete(date);
    else next.add(date);
    return next;
  });
}, []);
```

#### 4. Top 날짜 클릭 시 스크롤

```typescript
const handleTopDateClick = useCallback((dateSlotKey: string) => {
  const datePart = dateSlotKey.split(':')[0];

  // 접힌 날짜면 펼치고 스크롤
  if (hasTimeSlots && !expandedDates.has(datePart)) {
    setExpandedDates((prev) => new Set(prev).add(datePart));
    setTimeout(() => scrollToDate(dateSlotKey), 100);
  } else {
    scrollToDate(dateSlotKey);
  }
}, [hasTimeSlots, expandedDates, scrollToDate]);
```

### 렌더링 구조

```
┌─────────────────────────────────────────┐
│ Header (미팅 제목, 참석자 수, 현재 사용자)  │
├─────────────────────────────────────────┤
│ Grid Container                          │
│ ┌─────────────────────────────────────┐ │
│ │ CSS Grid                            │ │
│ │ - HeaderCorner (sticky)             │ │
│ │ - ParticipantHeader[] (sticky)      │ │
│ │ - DateCell / TimeSlotCell (sticky)  │ │
│ │ - StatusCell[] (클릭 가능)           │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ TopDatesIndicator (플로팅)              │
│ FloatingActionButton (FAB)              │
├─────────────────────────────────────────┤
│ Modals                                  │
│ - EditMeetingModal                      │
│ - ShareModal                            │
│ - AboutModal                            │
│ - ConfirmModal                          │
│ - ParticipantSelectModal                │
├─────────────────────────────────────────┤
│ Toast                                   │
└─────────────────────────────────────────┘
```

### CSS Grid 설정

```typescript
style={{
  gridTemplateColumns: `minmax(50px, min-content) ${
    orderedParticipants.map(() => 'var(--col-width)').join(' ')
  }`,
  ['--col-width' as string]: 'clamp(90px, 10vw, 120px)',
}}
```

---

## layout.tsx (111줄)

동적 메타데이터 생성을 담당합니다.

### generateMetadata 함수

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meeting = await redis.get<Meeting>(`meeting:${id}`);

  return {
    title: meeting ? `${meeting.title} - 언제만나` : '언제만나',
    description: meeting
      ? `${meeting.title} 일정에 참여하세요. ${meeting.dates.length}개 날짜 중 가능한 시간을 선택해주세요.`
      : '...',
    openGraph: { ... },
  };
}
```

---

## opengraph-image.tsx (185줄)

동적 OG 이미지를 생성합니다.

### ImageResponse 설정

```typescript
export default async function Image({ params }: { params: { id: string } }) {
  return new ImageResponse(
    (
      <div style={{ /* 스타일 */ }}>
        <div>{meeting.title}</div>
        <div>{meeting.dates.length}개 날짜</div>
        <div>{availabilities.length}명 참여</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'NotoSansKR', data: fontData }],
    }
  );
}
```

### 이미지 구성 요소

- 미팅 제목
- 날짜 개수
- 참석자 수
- Top 날짜 정보 (있는 경우)
- 브랜드 로고

---

## 의존성

### 컴포넌트

- `MeetingGrid/*` - GridCell, TopDatesIndicator, FloatingActionButton
- `Modal/*` - ModalFrame
- `AboutModal`, `ShareModal`, `EditMeetingModal`, `ConfirmModal`
- `ParticipantSelectModal`
- `Toast`

### 훅

- `hooks/useMeetingData`
- `hooks/useMeetingActions`
- `hooks/useMeetingGrid`
- `hooks/useScrollManager`
- `hooks/useToast`
- `hooks/useCurrentUser`

### 상수

- `lib/constants/colors` - DATE_COLUMN_COLORS, CURRENT_USER_COLORS

---

## 수정 시 주의사항

1. **성능**: `useMemo`, `useCallback` 의존성 배열 확인
2. **Ref 패턴**: `showToastRef`, `tRef` 등 Ref로 안정적인 참조 유지
3. **시간대 모드**: `hasTimeSlots` 조건 분기 확인
4. **권한 로직**: `isOrganizer`, `isCurrentUser`, `isLocked` 조합
5. **그리드 필터링**: `expandedDates`로 접힌 시간대 행 필터

### 체크리스트

- [ ] 새 모달 추가 시 상태 변수 및 열기/닫기 핸들러 추가
- [ ] 새 액션 추가 시 `useMeetingActions`에 추가
- [ ] 번역 키 `messages/*.json`에 추가
- [ ] 그리드 셀 타입 추가 시 `GridCell.tsx`에 컴포넌트 추가
