/**
 * i18n (Internationalization) Utilities
 * 다국어 관련 유틸리티 함수 모음
 */

import type { Locale } from '@/lib/useTranslation';

/**
 * 서버에서 언어 감지 (headers 기반)
 * Use in Server Components
 */
export function detectServerLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'ko';

  const lang = acceptLanguage.toLowerCase();
  if (lang.includes('ko') || lang.includes('kr')) {
    return 'ko';
  }

  return 'en';
}

/**
 * 브라우저에서 언어 감지 (navigator 기반)
 * Use in Client Components
 */
export function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return 'ko';

  const browserLang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage;

  if (browserLang && (browserLang.startsWith('ko') || browserLang.startsWith('kr'))) {
    return 'ko';
  }

  return 'en';
}

/**
 * 언어별 메타데이터 가져오기
 */
export function getLocalizedMetadata(locale: Locale) {
  const metadata = {
    ko: {
      title: '언제만나 | 약속일정 잡기 앱 - 간편한 일정 조율 서비스',
      description: '약속일정 잡기, 모임 시간 정하기가 쉬운 무료 일정 조율 앱. 로그인 없이 바로 사용, 드래그로 여러 날짜 선택, 실시간 동기화. 팀 미팅, 모임, 회의 시간 조율에 최적화된 스케줄링 서비스',
      keywords: [
        '약속일정 잡기 앱', '약속 일정 조율 앱', '모임 시간 정하기 앱',
        '일정 조율 서비스', '회의 시간 정하기', '팀 미팅 일정',
        '그룹 일정 조율', '약속 잡기 앱', '모임 일정 조율',
      ],
    },
    en: {
      title: 'When22Meet | Schedule Coordination App - Simple Meeting Scheduler',
      description: 'Easy meeting scheduling app for coordinating group schedules. No login required, drag to select multiple dates, real-time sync. Perfect for team meetings and group events.',
      keywords: [
        'meeting scheduler', 'schedule coordination', 'group scheduling app',
        'meeting time finder', 'team meeting schedule', 'group calendar',
        'scheduling app', 'meeting planner', 'availability poll',
      ],
    },
  };

  return metadata[locale];
}

/**
 * 언어별 Structured Data 가져오기
 */
export function getLocalizedStructuredData(locale: Locale) {
  const data = {
    ko: {
      name: '언제만나 - 약속일정 잡기 앱',
      alternateName: ['When22Meet', '언제만나', '약속일정 앱'],
      description: '약속일정 잡기, 모임 시간 정하기가 쉬운 무료 일정 조율 앱. 로그인 없이 바로 사용 가능한 스케줄링 서비스',
      keywords: '약속일정 잡기 앱, 모임 시간 정하기, 일정 조율 서비스, 회의 시간 정하기, 팀 미팅 일정, 그룹 일정 조율',
      featureList: [
        '실시간 동기화',
        '로그인 없이 사용 가능',
        '드래그로 여러 날짜 선택',
        '모바일 최적화',
        '무료 일정 조율',
        '팀 미팅 일정 관리',
        '회의 시간 투표',
      ],
      organizationName: '언제만나 팀',
    },
    en: {
      name: 'When22Meet - Schedule Coordination App',
      alternateName: ['When22Meet', 'Schedule Coordination', 'Meeting Scheduler'],
      description: 'Easy meeting scheduling app for coordinating group schedules. Free scheduling service with no login required',
      keywords: 'meeting scheduler, schedule coordination, group scheduling app, team meeting planner, availability poll, meeting time finder',
      featureList: [
        'Real-time synchronization',
        'No login required',
        'Drag to select multiple dates',
        'Mobile optimized',
        'Free scheduling',
        'Team meeting management',
        'Availability voting',
      ],
      organizationName: 'When22Meet Team',
    },
  };

  return data[locale];
}

/**
 * 언어 코드를 locale 문자열로 변환
 * ko -> ko_KR
 * en -> en_US
 */
export function getLocaleString(locale: Locale): string {
  return locale === 'ko' ? 'ko_KR' : 'en_US';
}

/**
 * hreflang용 언어 코드 변환
 * ko -> ko
 * en -> en
 */
export function getHreflangCode(locale: Locale): string {
  return locale;
}

/**
 * 현재 URL에 대한 언어별 대체 URL 생성
 */
export function getAlternateUrls(pathname: string, baseUrl: string = 'https://when22meet.vercel.app') {
  return {
    ko: `${baseUrl}${pathname}`,
    en: `${baseUrl}${pathname}`,
    'x-default': `${baseUrl}${pathname}`,
  };
}

/**
 * 언어별 미팅 설명 가져오기
 */
export function getLocalizedMeetingDescription(locale: Locale, participantCount: number, dateCount: number) {
  if (locale === 'ko') {
    return `${participantCount}명이 참여하는 일정 조율. ${dateCount}개의 날짜 중 선택`;
  }
  return `Schedule coordination with ${participantCount} participant${participantCount !== 1 ? 's' : ''}. Choosing from ${dateCount} date${dateCount !== 1 ? 's' : ''}`;
}

/**
 * 언어별 조직명 가져오기
 */
export function getLocalizedOrganizationName(locale: Locale) {
  return locale === 'ko' ? '언제만나' : 'When22Meet';
}
