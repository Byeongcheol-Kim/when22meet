# Constants Directory - AGENTS.md

이 디렉토리는 프로젝트 전반에서 사용하는 상수를 중앙 집중 관리합니다.

## 파일 구조

```
lib/constants/
├── colors.ts    # 색상 토큰 및 헬퍼 함수 (579줄)
└── config.ts    # 앱 설정 상수 (54줄)
```

---

## colors.ts (579줄)

Tailwind CSS 클래스 기반 색상 토큰을 정의합니다.

### 색상 카테고리

| 상수명 | 용도 | 줄 번호 |
|--------|------|---------|
| `STATUS_COLORS` | 참여/불참/미정 상태 | 9-28 |
| `DATE_COLUMN_COLORS` | 왼쪽 날짜 열 (검정 배경) | 33-47 |
| `TOP_DATES_COLORS` | 금/은/동 메달 배지 | 52-83 |
| `MODAL_COLORS` | 모달 오버레이, 배경 | 88-97 |
| `BUTTON_COLORS` | 버튼 variants | 102-124 |
| `TOAST_COLORS` | 토스트 알림 | 129-146 |
| `SHARE_MODAL_COLORS` | 공유 모달 옵션 | 151-162 |
| `DATE_SELECTOR_COLORS` | 캘린더 날짜 선택기 | 195-226 |
| `SECTION_BADGE_COLORS` | 메인 페이지 섹션 배지 | 231-244 |
| `INPUT_COLORS` | 입력 필드 | 249-260 |
| `LINK_COLORS` | 링크 (GitHub, Instagram 등) | 265-282 |
| `SUPPORT_COLORS` | 후원 영역 | 287-296 |
| `MEETING_PAGE_COLORS` | 미팅 페이지 추가 색상 | 301-322 |
| `TEMPLATE_BUTTON_COLORS` | 템플릿 선택 버튼 | 327-339 |
| `TEXT_COLORS` | 일반 텍스트 | 344-351 |
| `BG_COLORS` | 배경 | 356-360 |
| `CURRENT_USER_COLORS` | 현재 사용자 상태 (수정/완료/주최자) | 365-426 |
| `ROLE_BADGE_COLORS` | 역할 배지 | 441-464 |
| `DISABLED_COLORS` | 비활성 상태 | 469-479 |
| `ICON_COLORS` | 아이콘 | 484-492 |
| `CONFIRM_MODAL_COLORS` | 확인 모달 (danger/warning/info) | 497-522 |
| `FAQ_COLORS` | FAQ 페이지 | 527-536 |
| `TIME_SLOT_COLORS` | 시간대 선택기 | 541-579 |

### 핵심 색상 값

| 용도 | Hex | Tailwind |
|------|-----|----------|
| Primary (참여) | `#FFC354` | `bg-[#FFC354]` |
| Primary Hover | `#FFD580` | `hover:bg-[#FFD580]` |
| Unavailable | `#6B7280` | `bg-[#6B7280]` (gray-500) |
| 날짜 열 배경 | black | `bg-black` |
| 일요일 | red-300 | `text-red-300` |
| 토요일 | blue-300 | `text-blue-300` |

### 헬퍼 함수

#### getStatusClasses

상태별 Tailwind 클래스 문자열 생성:

```typescript
function getStatusClasses(
  status: 'available' | 'unavailable' | 'undecided',
  isEditable: boolean = true
): string

// 사용 예
getStatusClasses('available', true)
// → "bg-[#FFC354] text-gray-800 cursor-pointer hover:shadow-md hover:scale-105 hover:border-[#FFD580]"

getStatusClasses('unavailable', false)
// → "bg-[#6B7280] text-white cursor-default opacity-60"
```

#### getTopDateClasses

Top 날짜 순위별 클래스 생성:

```typescript
function getTopDateClasses(
  rank: 1 | 2 | 3,
  variant: 'badge' | 'indicator' = 'badge'
): string

// 사용 예
getTopDateClasses(1, 'badge')      // 금메달
getTopDateClasses(2, 'indicator')  // 은메달 인디케이터
```

#### getDayOfWeekColor

요일별 텍스트 색상:

```typescript
function getDayOfWeekColor(day: number, isHighlighted: boolean = false): string

// day: 0=일, 1=월, ..., 6=토
getDayOfWeekColor(0)  // → "text-red-300" (일요일)
getDayOfWeekColor(6)  // → "text-blue-300" (토요일)
getDayOfWeekColor(1)  // → "text-white" (평일)
```

### 색상 구조 패턴

```typescript
// 기본 패턴
export const EXAMPLE_COLORS = {
  bg: 'bg-...',
  text: 'text-...',
  border: 'border-...',
  hover: 'hover:bg-...',
} as const;

// 중첩 패턴 (상태별)
export const NESTED_COLORS = {
  variant1: {
    bg: '...',
    text: '...',
  },
  variant2: {
    bg: '...',
    text: '...',
  },
} as const;
```

---

## config.ts (54줄)

앱 설정, TTL, 유효성 검사 규칙을 정의합니다.

### CONFIG 구조

```typescript
export const CONFIG = {
  // TTL 설정 (초 단위)
  TTL: {
    MEETING_SECONDS: 47304000,      // 18개월
    SHORT_URL_SECONDS: 5184000,     // 60일
  },

  // 유효성 검사 제한
  VALIDATION: {
    MAX_PARTICIPANTS: 100,          // 최대 참석자 수
    MAX_DATES: 365,                 // 최대 날짜 수
    MAX_TITLE_LENGTH: 100,          // 제목 최대 길이
    MAX_NAME_LENGTH: 50,            // 이름 최대 길이
  },

  // UI 타이밍 (밀리초)
  UI: {
    HIGHLIGHT_DURATION_MS: 2000,    // 하이라이트 지속
    TOAST_DURATION_MS: 3000,        // 토스트 표시
    DEBOUNCE_DELAY_MS: 300,         // 디바운스 지연
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
    availability: (meetingId: string, name: string) =>
      `availability:${meetingId}:${name}`,
    shortUrl: (code: string) => `short:${code}`,
  },
} as const;
```

### 사용 예시

```typescript
import { CONFIG } from '@/lib/constants/config';

// TTL 설정
await redis.set(key, value, { ex: CONFIG.TTL.MEETING_SECONDS });

// 유효성 검사
if (title.length > CONFIG.VALIDATION.MAX_TITLE_LENGTH) {
  return { error: '제목이 너무 깁니다' };
}

// UI 타이밍
setTimeout(hideToast, CONFIG.UI.TOAST_DURATION_MS);

// Redis 키
const key = CONFIG.REDIS_KEYS.meeting(meetingId);
```

---

## 수정 가이드라인

### 새 색상 추가 시

1. 관련 카테고리 상수에 추가 (없으면 새 상수 생성)
2. `as const` 유지하여 타입 추론 보장
3. Tailwind 클래스 형식 사용 (`bg-...`, `text-...`)
4. 필요시 헬퍼 함수 추가

### 새 설정 추가 시

1. 적절한 카테고리에 추가 (TTL, VALIDATION, UI, GRID 등)
2. 상수 이름은 SCREAMING_SNAKE_CASE
3. 단위 명시 (초는 `_SECONDS`, 밀리초는 `_MS`)

### 체크리스트

- [ ] 하드코딩된 색상 값 → `colors.ts` 상수로 이동
- [ ] 하드코딩된 숫자 → `config.ts` 상수로 이동
- [ ] 새 상수 추가 시 타입 추론 확인 (`as const`)
- [ ] 헬퍼 함수 변경 시 호출부 테스트
