/**
 * 색상 상수 정의
 * 프로젝트 전체에서 사용하는 색상을 중앙에서 관리
 */

/**
 * 미팅 상태별 색상
 */
export const STATUS_COLORS = {
  available: {
    bg: 'bg-[#FFC354]',
    text: 'text-gray-800',
    border: 'border-[#FFC354]',
    hover: 'hover:border-[#FFD580]',
  },
  unavailable: {
    bg: 'bg-[#6B7280]',
    text: 'text-white',
    border: 'border-[#6B7280]',
    hover: 'hover:border-gray-600',
  },
  undecided: {
    bg: 'bg-gray-50',
    text: 'text-gray-400',
    border: 'border-gray-200',
    hover: 'hover:border-gray-400',
  },
} as const;

/**
 * 날짜 열 색상 (왼쪽 고정 영역)
 */
export const DATE_COLUMN_COLORS = {
  bg: 'bg-black',
  header: {
    bg: 'bg-black',
    year: 'text-white',
    month: 'text-white',
  },
  weekday: 'text-white',
  saturday: 'text-blue-300',
  sunday: 'text-red-300',
  highlighted: {
    bg: 'bg-yellow-500',
    text: 'text-black',
  },
} as const;

/**
 * Top 날짜 배지 색상 (금/은/동)
 */
export const TOP_DATES_COLORS = {
  first: {
    bg: 'bg-yellow-400',
    text: 'text-yellow-900',
    border: 'border-yellow-400',
    indicator: {
      bg: 'bg-yellow-400',
      text: 'text-yellow-900',
      border: 'border-yellow-400',
    },
  },
  second: {
    bg: 'bg-gray-300',
    text: 'text-gray-700',
    border: 'border-gray-300',
    indicator: {
      bg: 'bg-gray-300',
      text: 'text-gray-700',
      border: 'border-gray-300',
    },
  },
  third: {
    bg: 'bg-orange-400',
    text: 'text-orange-900',
    border: 'border-orange-400',
    indicator: {
      bg: 'bg-orange-400',
      text: 'text-orange-900',
      border: 'border-orange-400',
    },
  },
} as const;

/**
 * 모달 색상
 */
export const MODAL_COLORS = {
  overlay: 'bg-black/30',
  background: 'bg-white',
  header: 'text-gray-900',
  text: 'text-gray-700',
  close: {
    text: 'text-gray-500',
    hover: 'hover:text-gray-700',
  },
} as const;

/**
 * 버튼 색상
 */
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
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-white',
    hover: 'hover:bg-yellow-600',
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    hover: 'hover:bg-gray-200',
  },
} as const;

/**
 * Toast 색상
 */
export const TOAST_COLORS = {
  success: {
    bg: 'bg-orange-400',
    text: 'text-white',
  },
  error: {
    bg: 'bg-red-500',
    text: 'text-white',
  },
  warning: {
    bg: 'bg-yellow-500',
    text: 'text-white',
  },
  info: {
    bg: 'bg-blue-500',
    text: 'text-white',
  },
} as const;

/**
 * 공유 모달 옵션 색상
 */
export const SHARE_MODAL_COLORS = {
  link: {
    bg: 'bg-yellow-50',
    hover: 'hover:bg-yellow-100',
    icon: 'bg-[#FFC354]',
  },
  template: {
    bg: 'bg-gray-50',
    hover: 'hover:bg-gray-100',
    icon: 'bg-gray-500',
  },
} as const;

/**
 * 헬퍼 함수: 상태별 색상 클래스 문자열 생성
 */
export function getStatusClasses(status: 'available' | 'unavailable' | 'undecided', isEditable: boolean = true) {
  const colors = STATUS_COLORS[status];
  const borderClass = status === 'undecided' ? `border ${colors.border}` : '';
  const baseClasses = `${colors.bg} ${colors.text} ${borderClass}`;
  const interactiveClasses = isEditable
    ? `cursor-pointer hover:shadow-md hover:scale-105 ${colors.hover}`
    : 'cursor-default opacity-60';

  return `${baseClasses} ${interactiveClasses}`;
}

/**
 * 헬퍼 함수: Top 날짜 순위별 색상 클래스 생성
 */
export function getTopDateClasses(rank: 1 | 2 | 3, variant: 'badge' | 'indicator' = 'badge') {
  const rankKey = rank === 1 ? 'first' : rank === 2 ? 'second' : 'third';
  const colors = TOP_DATES_COLORS[rankKey];

  if (variant === 'indicator') {
    return `${colors.indicator.bg} ${colors.indicator.text} ${colors.indicator.border}`;
  }

  return `${colors.bg} ${colors.text} ${colors.border}`;
}

/**
 * 날짜 선택기 색상
 */
export const DATE_SELECTOR_COLORS = {
  selected: {
    bg: 'bg-[#FFC354]',
    text: 'text-gray-800',
    border: 'border-[#FFC354]',
  },
  today: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    hover: 'hover:bg-yellow-200',
  },
  disabled: {
    text: 'text-gray-300',
    cursor: 'cursor-not-allowed',
  },
  default: {
    bg: 'bg-white',
    text: 'text-gray-900',
    hover: 'hover:bg-gray-50',
    border: 'border-gray-300',
  },
  header: {
    bg: 'bg-black',
    text: 'text-white',
    weekday: 'text-white',
    saturday: 'text-blue-300',
    sunday: 'text-red-300',
  },
  count: {
    text: 'text-gray-700',
  },
} as const;

/**
 * 섹션 헤더 배지 색상 (메인 페이지)
 */
export const SECTION_BADGE_COLORS = {
  title: {
    bg: 'bg-yellow-400',
    text: 'text-yellow-900',
  },
  participants: {
    bg: 'bg-gray-300',
    text: 'text-gray-700',
  },
  dates: {
    bg: 'bg-orange-400',
    text: 'text-orange-900',
  },
} as const;

/**
 * 입력 필드 색상
 */
export const INPUT_COLORS = {
  label: 'text-gray-800',
  border: 'border-gray-300',
  focus: 'focus:border-blue-500',
  disabled: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
  },
  count: 'text-gray-500',
  text: 'text-gray-900',
} as const;

/**
 * 링크 색상
 */
export const LINK_COLORS = {
  primary: {
    text: 'text-blue-600',
    hover: 'hover:text-blue-700',
  },
  github: {
    text: 'text-gray-700',
    hover: 'hover:text-gray-900',
  },
  instagram: {
    text: 'text-gray-700',
    hover: 'hover:text-pink-600',
  },
  linkedin: {
    text: 'text-gray-700',
    hover: 'hover:text-blue-600',
  },
} as const;

/**
 * 후원 영역 색상
 */
export const SUPPORT_COLORS = {
  bg: 'bg-yellow-50',
  text: 'text-gray-900',
  description: 'text-gray-800',
  button: {
    bg: 'bg-yellow-400',
    hover: 'hover:bg-yellow-500',
    text: 'text-gray-800',
  },
} as const;

/**
 * FAB 버튼 & 미팅 페이지 추가 색상
 */
export const MEETING_PAGE_COLORS = {
  addParticipant: {
    bg: 'bg-gray-600',
    hover: 'hover:bg-gray-700',
    text: 'text-white',
    disabled: 'disabled:bg-gray-300',
  },
  monthSelector: {
    text: 'text-gray-600',
    bg: 'bg-gray-50',
    hover: 'hover:bg-gray-100',
    border: 'border-gray-200',
  },
  participantHeader: {
    locked: 'bg-gray-50',
    unlocked: 'bg-white',
  },
  monthSeparator: {
    bg: 'bg-gray-50',
  },
  title: 'text-gray-800',
} as const;

/**
 * 템플릿 버튼 색상 (홈페이지)
 */
export const TEMPLATE_BUTTON_COLORS = {
  selected: {
    bg: 'bg-[#FFC354]',
    text: 'text-gray-800',
    border: 'border-[#FFC354]',
  },
  default: {
    bg: 'bg-white',
    text: 'text-gray-700',
    border: 'border-gray-300',
    hover: 'hover:bg-gray-50',
  },
} as const;

/**
 * 일반 텍스트 색상
 */
export const TEXT_COLORS = {
  primary: 'text-gray-900',
  secondary: 'text-gray-700',
  tertiary: 'text-gray-600',
  muted: 'text-gray-500',
  disabled: 'text-gray-400',
  info: 'text-gray-800',
} as const;

/**
 * 배경 색상
 */
export const BG_COLORS = {
  page: 'bg-white',
  section: 'bg-gray-50',
  hover: 'hover:bg-gray-100',
} as const;

/**
 * 현재 사용자 상태 색상 (수정 중/완료)
 */
export const CURRENT_USER_COLORS = {
  editing: {
    header: {
      bg: 'bg-amber-500',
      text: 'text-amber-950',
      border: 'border-amber-600',
      borderX: 'border-x-2 border-x-amber-500',
      hover: 'hover:bg-amber-600',
    },
    cell: {
      bg: 'bg-amber-500/20',
      borderX: 'border-x-2 border-amber-500',
    },
    button: {
      bg: 'bg-amber-500',
      text: 'text-amber-900',
      border: 'border-amber-600',
      hover: 'hover:bg-amber-600',
      shadow: 'shadow-sm',
    },
  },
  completed: {
    header: {
      bg: 'bg-gray-200',
      text: 'text-gray-600',
      border: 'border-gray-400',
      borderX: 'border-x-2 border-x-gray-400',
      hover: 'hover:bg-gray-300',
    },
    cell: {
      bg: 'bg-gray-200/50',
      borderX: 'border-x-2 border-gray-400',
    },
    button: {
      bg: 'bg-gray-200',
      text: 'text-gray-600',
      border: 'border-gray-400',
      hover: 'hover:bg-gray-300',
    },
  },
  organizer: {
    button: {
      bg: 'bg-yellow-400',
      text: 'text-yellow-900',
      border: 'border-yellow-500',
      hover: 'hover:bg-yellow-500',
      dot: 'bg-yellow-600',
    },
    header: {
      bg: 'bg-yellow-400',
      text: 'text-yellow-900',
      border: 'border-yellow-500',
    },
  },
  participant: {
    header: {
      bg: 'bg-amber-500',
      text: 'text-amber-900',
      border: 'border-amber-600',
    },
  },
} as const;

/**
 * 헬퍼 함수: 요일별 색상 가져오기
 */
export function getDayOfWeekColor(day: number, isHighlighted: boolean = false) {
  if (isHighlighted) return DATE_COLUMN_COLORS.highlighted.text;
  if (day === 0) return DATE_COLUMN_COLORS.sunday;
  if (day === 6) return DATE_COLUMN_COLORS.saturday;
  return DATE_COLUMN_COLORS.weekday;
}
