/**
 * 색상 상수 정의
 * 프로젝트 전체에서 사용하는 색상을 중앙에서 관리
 */

/**
 * 미팅 상태별 색상
 */
export const STATUS_COLORS = {
  available: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    hover: 'hover:border-green-400',
  },
  unavailable: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    hover: 'hover:border-red-400',
  },
  undecided: {
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
    hover: 'hover:border-gray-400',
  },
} as const;

/**
 * 날짜 열 색상 (왼쪽 고정 영역)
 */
export const DATE_COLUMN_COLORS = {
  bg: 'bg-blue-50',
  header: {
    bg: 'bg-blue-50',
    year: 'text-gray-700',
    month: 'text-gray-800',
  },
  weekday: 'text-gray-700',
  saturday: 'text-blue-700',
  sunday: 'text-red-600',
  highlighted: {
    bg: 'bg-yellow-200',
    text: 'text-gray-800',
  },
} as const;

/**
 * Top 날짜 배지 색상
 */
export const TOP_DATES_COLORS = {
  first: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    indicator: {
      bg: 'bg-yellow-200',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
    },
  },
  second: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    indicator: {
      bg: 'bg-blue-200',
      text: 'text-blue-800',
      border: 'border-blue-300',
    },
  },
  third: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    indicator: {
      bg: 'bg-orange-200',
      text: 'text-orange-800',
      border: 'border-orange-300',
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
    bg: 'bg-blue-500',
    text: 'text-white',
    hover: 'hover:bg-blue-600',
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
    bg: 'bg-green-500',
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
    icon: 'bg-yellow-500',
  },
  template: {
    bg: 'bg-blue-50',
    hover: 'hover:bg-blue-100',
    icon: 'bg-blue-500',
  },
} as const;

/**
 * 헬퍼 함수: 상태별 색상 클래스 문자열 생성
 */
export function getStatusClasses(status: 'available' | 'unavailable' | 'undecided', isEditable: boolean = true) {
  const colors = STATUS_COLORS[status];
  const baseClasses = `${colors.bg} ${colors.text} ${colors.border}`;
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
 * 헬퍼 함수: 요일별 색상 가져오기
 */
export function getDayOfWeekColor(day: number, isHighlighted: boolean = false) {
  if (isHighlighted) return DATE_COLUMN_COLORS.highlighted.text;
  if (day === 0) return DATE_COLUMN_COLORS.sunday;
  if (day === 6) return DATE_COLUMN_COLORS.saturday;
  return DATE_COLUMN_COLORS.weekday;
}
