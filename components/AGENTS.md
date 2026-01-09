# Components Directory - AGENTS.md

이 디렉토리는 재사용 가능한 React UI 컴포넌트를 포함합니다.

## 디렉토리 구조

```
components/
├── Modal/                        # 모달 기본 컴포넌트
│   └── ModalFrame.tsx           # 모달 래퍼
├── MeetingGrid/                  # 미팅 그리드 컴포넌트
│   ├── index.ts                 # Barrel exports
│   ├── GridCell.tsx             # 그리드 셀 렌더링
│   ├── TopDatesIndicator.tsx    # Top 3 날짜 표시기
│   ├── FloatingActionButton.tsx # 모바일 FAB
│   └── AddParticipantInput.tsx  # 참석자 추가 입력
├── AboutModal.tsx               # 서비스 정보 모달
├── ConfirmModal.tsx             # 확인 다이얼로그
├── DateSelector.tsx             # 캘린더 날짜 선택기
├── EditMeetingModal.tsx         # 미팅 수정 모달
├── FAQSchema.tsx                # FAQ 구조화 데이터
├── MeetingStructuredData.tsx    # 미팅 JSON-LD
├── MeetingTitleInput.tsx        # 제목 입력
├── ParticipantSelectModal.tsx   # 참석자 선택 모달
├── ParticipantsInput.tsx        # 칩 기반 참석자 입력
├── ShareModal.tsx               # 공유 모달
├── StructuredData.tsx           # 홈페이지 JSON-LD
├── TimeSlotSelector.tsx         # 시간대 선택기
└── Toast.tsx                    # 토스트 알림
```

## 핵심 컴포넌트

### ModalFrame

모든 모달의 기본 래퍼 컴포넌트.

```typescript
interface ModalFrameProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}
```

**기능:**
- ESC 키로 닫기
- 배경 클릭으로 닫기
- body 스크롤 방지
- 사이즈별 max-width 설정

**사이즈 매핑:**
| Size | Class |
|------|-------|
| sm | `max-w-sm` |
| md | `max-w-md` |
| lg | `max-w-lg` |
| xl | `max-w-xl` |
| full | `max-w-full mx-4` |

### DateSelector

드래그로 날짜 범위를 선택할 수 있는 캘린더 컴포넌트.

```typescript
interface DateSelectorProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  locale?: 'ko' | 'en';
  maxDates?: number;
}
```

**기능:**
- 드래그 선택 (Shift + 클릭)
- 빠른 템플릿 (오는 한 주, 다음 한 달 등)
- 과거 날짜 비활성화
- 월 네비게이션
- forwardRef 지원

### ParticipantsInput

칩 형태로 참석자를 관리하는 입력 컴포넌트.

```typescript
interface ParticipantsInputProps {
  participants: string[];
  onParticipantsChange: (participants: string[]) => void;
  maxParticipants?: number;
  maxNameLength?: number;
}
```

**기능:**
- 칩 추가/삭제
- 중복 검사
- 길이 제한 (기본 50자)
- 최대 인원 제한 (기본 100명)

### TimeSlotSelector

시간대 모드 활성화 및 시간 선택 컴포넌트.

```typescript
interface TimeSlotSelectorProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
  consecutiveCount: number;
  onConsecutiveCountChange: (count: number) => void;
}
```

**기능:**
- 시간대 모드 토글
- 단축 버튼 (새벽, 오전, 오후, 저녁, 심야, 종일)
- 연속 시간 슬롯 카운트 설정

### GridCell

미팅 그리드의 개별 셀을 렌더링하는 컴포넌트.

```typescript
interface GridCellProps {
  type: 'header-corner' | 'header-participant' | 'date' | 'status' | 'time-slot' | 'add-input';
  date?: string;
  participant?: string;
  status?: ParticipantStatus;
  isLocked?: boolean;
  onStatusClick?: (participant: string, date: string, status: ParticipantStatus) => void;
}
```

**상태 색상:**
| 상태 | 배경 | 텍스트 |
|------|------|--------|
| available (참여) | `#FFC354` | `gray-800` |
| unavailable (불참) | `#6B7280` | `white` |
| undecided (미정) | `gray-50` | `gray-400` |

### TopDatesIndicator

가장 많은 참석자가 가능한 Top 3 날짜를 표시하는 플로팅 인디케이터.

```typescript
interface TopDatesIndicatorProps {
  topDates: TopDate[];
  gridRef: RefObject<HTMLDivElement>;
}
```

**뱃지 색상 (메달 시스템):**
| 순위 | 배경 | 텍스트 |
|------|------|--------|
| 1위 | `yellow-400` | `yellow-900` |
| 2위 | `gray-300` | `gray-700` |
| 3위 | `orange-400` | `orange-900` |

### Toast

일시적인 알림 메시지를 표시하는 컴포넌트.

```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
}
```

**타입별 색상:**
| Type | 배경 |
|------|------|
| success | `orange-400` |
| error | `red-500` |
| warning | `yellow-500` |
| info | `blue-500` |

## 컴포넌트 작성 가이드라인

### 패턴 및 규칙

1. **'use client' 명시**: 클라이언트 사이드 렌더링이 필요한 경우 파일 상단에 명시
2. **TypeScript 인터페이스**: Props는 명시적 인터페이스로 정의
3. **memo 사용**: 성능 최적화가 필요한 컴포넌트는 `memo`로 래핑
4. **forwardRef**: ref 전달이 필요한 컴포넌트는 `forwardRef` 사용

### 스타일링 규칙

1. **Tailwind CSS 사용**: 인라인 스타일 대신 Tailwind 클래스 사용
2. **색상 토큰**: `lib/constants/colors.ts`의 상수 및 헬퍼 함수 사용
3. **반응형 디자인**: 모바일 우선 (`sm:`, `md:`, `lg:` 브레이크포인트)

### 새 컴포넌트 추가 시 체크리스트

- [ ] Props 인터페이스 정의
- [ ] 'use client' 필요 여부 확인
- [ ] `lib/constants/colors.ts` 색상 토큰 사용
- [ ] 필요시 `memo` 또는 `forwardRef` 적용
- [ ] 번역이 필요한 텍스트는 `useTranslation` 사용
- [ ] 접근성(a11y) 고려 (aria-label, role 등)
- [ ] 모바일/데스크톱 반응형 테스트

### 컴포넌트 예시

```typescript
'use client';

import { memo } from 'react';
import { STATUS_COLORS } from '@/lib/constants/colors';
import { useTranslation } from '@/lib/useTranslation';

interface ExampleComponentProps {
  status: 'available' | 'unavailable' | 'undecided';
  onClick: () => void;
}

export const ExampleComponent = memo(function ExampleComponent({
  status,
  onClick,
}: ExampleComponentProps) {
  const { t } = useTranslation();
  const colors = STATUS_COLORS[status];

  return (
    <button
      className={`${colors.bg} ${colors.text} px-4 py-2 rounded-lg`}
      onClick={onClick}
      aria-label={t(`meeting.status.${status}`)}
    >
      {t(`meeting.status.${status}`)}
    </button>
  );
});
```

## 의존성

- **lucide-react**: 아이콘 라이브러리 (`Check`, `X`, `Info`, `Calendar` 등)
- **lib/constants/colors.ts**: 색상 토큰 및 헬퍼 함수
- **lib/useTranslation.ts**: 다국어 지원 훅
- **lib/constants/config.ts**: 유효성 검사 상수

---

## 하위 모듈 문서

복잡한 코드가 있는 하위 디렉토리에 상세 문서가 있습니다:

| 파일 | 내용 |
|------|------|
| [`MeetingGrid/AGENTS.md`](./MeetingGrid/AGENTS.md) | GridCell (405줄), 셀 타입별 컴포넌트, z-index 계층 |
