'use client';

import { Meeting } from '@/lib/types';

interface MeetingStructuredDataProps {
  meeting: Meeting;
  participantCount: number;
  topDate?: {
    date: string;
    count: number;
  };
}

export default function MeetingStructuredData({
  meeting,
  participantCount,
  topDate,
}: MeetingStructuredDataProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toISOString();
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: meeting.title,
    description: `${participantCount}명이 참여하는 일정 조율. ${meeting.dates.length}개의 날짜 중 선택`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    organizer: {
      '@type': 'Organization',
      name: '언제만나',
      url: 'https://when22meet.vercel.app',
    },
    ...(topDate && {
      startDate: formatDate(topDate.date),
      endDate: formatDate(topDate.date),
      location: {
        '@type': 'VirtualLocation',
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
    }),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
