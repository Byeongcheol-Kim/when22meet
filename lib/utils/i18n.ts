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
  if (lang.includes('zh')) {
    return 'zh';
  }
  if (lang.includes('ja')) {
    return 'ja';
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
  if (browserLang && browserLang.startsWith('zh')) {
    return 'zh';
  }
  if (browserLang && browserLang.startsWith('ja')) {
    return 'ja';
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
    zh: {
      title: '什么时候见面 | 日程协调应用 - 简单的会议安排服务',
      description: '简单易用的免费日程协调应用。无需登录，拖拽选择多个日期，实时同步。团队会议、聚会、活动时间协调的最佳选择。',
      keywords: [
        '日程协调', '会议安排', '时间协调应用',
        '团队会议', '聚会时间', '日程安排',
        '会议时间', '活动安排', '时间投票',
      ],
    },
    ja: {
      title: 'いつ会う | スケジュール調整アプリ - 簡単な予定調整サービス',
      description: '簡単で使いやすい無料のスケジュール調整アプリ。ログイン不要、ドラッグで複数日選択、リアルタイム同期。チームミーティング、イベント、会議の時間調整に最適。',
      keywords: [
        'スケジュール調整', '予定調整', '会議スケジューラー',
        'チームミーティング', 'イベント時間', '日程調整',
        '会議時間', '予定投票', 'グループスケジュール',
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
    zh: {
      name: '什么时候见面 - 日程协调应用',
      alternateName: ['When22Meet', '什么时候见面', '日程协调'],
      description: '简单易用的免费日程协调应用。无需登录即可使用的排程服务',
      keywords: '日程协调, 会议安排, 时间协调应用, 团队会议, 日程安排, 时间投票',
      featureList: [
        '实时同步',
        '无需登录',
        '拖拽选择多个日期',
        '移动端优化',
        '免费日程协调',
        '团队会议管理',
        '出席投票',
      ],
      organizationName: '什么时候见面团队',
    },
    ja: {
      name: 'いつ会う - スケジュール調整アプリ',
      alternateName: ['When22Meet', 'いつ会う', 'スケジュール調整'],
      description: '簡単で使いやすい無料のスケジュール調整アプリ。ログイン不要ですぐに使えるスケジューリングサービス',
      keywords: 'スケジュール調整, 予定調整, 会議スケジューラー, チームミーティング, 日程調整, 出欠投票',
      featureList: [
        'リアルタイム同期',
        'ログイン不要',
        'ドラッグで複数日選択',
        'モバイル最適化',
        '無料スケジュール調整',
        'チームミーティング管理',
        '出欠投票',
      ],
      organizationName: 'いつ会うチーム',
    },
  };

  return data[locale];
}

/**
 * 언어 코드를 locale 문자열로 변환
 */
export function getLocaleString(locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    ko: 'ko_KR',
    en: 'en_US',
    zh: 'zh_CN',
    ja: 'ja_JP',
  };
  return localeMap[locale];
}

/**
 * hreflang용 언어 코드 변환
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
    zh: `${baseUrl}${pathname}`,
    ja: `${baseUrl}${pathname}`,
    'x-default': `${baseUrl}${pathname}`,
  };
}

/**
 * 언어별 미팅 설명 가져오기
 */
export function getLocalizedMeetingDescription(locale: Locale, participantCount: number, dateCount: number) {
  switch (locale) {
    case 'ko':
      return `${participantCount}명이 참여하는 일정 조율. ${dateCount}개의 날짜 중 선택`;
    case 'zh':
      return `${participantCount}人参与的日程协调。从${dateCount}个日期中选择`;
    case 'ja':
      return `${participantCount}人が参加するスケジュール調整。${dateCount}件の日付から選択`;
    default:
      return `Schedule coordination with ${participantCount} participant${participantCount !== 1 ? 's' : ''}. Choosing from ${dateCount} date${dateCount !== 1 ? 's' : ''}`;
  }
}

/**
 * 언어별 조직명 가져오기
 */
export function getLocalizedOrganizationName(locale: Locale) {
  const names: Record<Locale, string> = {
    ko: '언제만나',
    en: 'When22Meet',
    zh: '什么时候见面',
    ja: 'いつ会う',
  };
  return names[locale];
}
