'use client';

import { Meeting } from '@/lib/types';
import { useTranslation } from '@/lib/useTranslation';
import { getLocalizedMeetingDescription, getLocalizedOrganizationName } from '@/lib/utils/i18n';

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
  const { locale } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toISOString();
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: meeting.title,
    description: getLocalizedMeetingDescription(locale, participantCount, meeting.dates.length),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    organizer: {
      '@type': 'Organization',
      name: getLocalizedOrganizationName(locale),
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
