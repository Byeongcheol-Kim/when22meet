import { formatDateToString } from './date';

export type DateTemplate = 'weekend' | 'weekday' | 'fri-sat-sun' | 'full';

/**
 * 템플릿에 따라 날짜 배열 생성
 * @param template 템플릿 타입
 * @param months 생성할 개월 수 (기본값: 2)
 * @returns 날짜 문자열 배열
 */
export function generateDatesFromTemplate(template: DateTemplate, months: number = 2): string[] {
  const dates: string[] = [];
  const today = new Date();
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + months);
  
  const current = new Date(today);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    let shouldInclude = false;
    
    switch (template) {
      case 'weekend':
        // Saturday(6), Sunday(0)
        shouldInclude = dayOfWeek === 0 || dayOfWeek === 6;
        break;
      case 'weekday':
        // Monday(1) ~ Friday(5)
        shouldInclude = dayOfWeek >= 1 && dayOfWeek <= 5;
        break;
      case 'fri-sat-sun':
        // Friday(5), Saturday(6), Sunday(0)
        shouldInclude = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
        break;
      case 'full':
        // All dates
        shouldInclude = true;
        break;
    }
    
    if (shouldInclude) {
      dates.push(formatDateToString(current));
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * 템플릿 이름을 한글로 변환
 */
export function getTemplateDisplayName(template: DateTemplate): string {
  const names: Record<DateTemplate, string> = {
    'weekend': '주말 (토, 일)',
    'weekday': '주중 (월~금)',
    'fri-sat-sun': '금토일',
    'full': '전체 날짜'
  };
  return names[template] || template;
}