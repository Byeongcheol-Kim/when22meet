/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환
 */
export function formatDateToString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * YYYY-MM-DD 문자열을 Date 객체로 변환
 */
export function parseStringToDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 날짜를 YYYY.MM 형식으로 변환
 */
export function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 날짜를 M/D 형식으로 변환
 */
export function formatMonthDay(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 두 날짜가 같은 달인지 확인
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && 
         date1.getMonth() === date2.getMonth();
}

/**
 * 날짜가 오늘 이전인지 확인
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * 요일 이름 가져오기 (로케일 지원)
 */
export function getDayName(dayIndex: number, locale: string = 'ko-KR'): string {
  const dayNames: { [key: string]: string[] } = {
    'ko-KR': ['일', '월', '화', '수', '목', '금', '토'],
    'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };
  
  return dayNames[locale]?.[dayIndex] || dayNames['en-US'][dayIndex];
}

/**
 * 월 표시 이름 생성
 */
export function getMonthDisplayName(year: number, month: number): string {
  return `${year}. ${String(month + 1).padStart(2, '0')}.`;
}