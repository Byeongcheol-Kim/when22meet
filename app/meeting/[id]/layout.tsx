import { Metadata } from 'next';
import {
  fetchMeetingWithAvailabilities,
  calculateTopDates,
} from '@/lib/utils/redis';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;

    // Use optimized fetch (solves N+1 query problem)
    const result = await fetchMeetingWithAvailabilities(id);

    if (!result) {
      return {
        title: '언제만나? - 일정을 찾을 수 없습니다',
        description: '간편한 일정 조율 서비스',
      };
    }

    const { meeting, availabilities } = result;

    // Calculate top dates using centralized utility
    const topDatesData = calculateTopDates(meeting, availabilities, 3);

    // Convert to the format expected below
    const topDates: [string, number][] = topDatesData.map((td) => [
      td.date,
      td.count,
    ]);

    const formatDate = (dateString: string) => {
      const date = new Date(dateString + 'T00:00:00');
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      return `${date.getMonth() + 1}/${date.getDate()}(${dayNames[date.getDay()]})`;
    };

    const participantCount = availabilities.length;
    const dateCount = meeting.dates?.length || 0;

    let description = '';

    if (topDates.length > 0) {
      const medals = ['🥇', '🥈', '🥉'];
      const topDatesText = topDates
        .slice(0, 2) // Top 2만 표시 (길이 제한)
        .map(([date, count], index) => `${medals[index]} ${formatDate(date)} ${count}명`)
        .join(' | ');
      description = `${topDatesText} - ${meeting.title} (${participantCount}명 참여)`;
    } else {
      description = `${meeting.title} - ${participantCount}명 참여 중 · ${dateCount}개 날짜`;
    }

    const title = `${meeting.title} | 언제만나?`;

    const meetingUrl = `/meeting/${id}`;

    return {
      title,
      description,
      alternates: {
        canonical: meetingUrl,
        languages: {
          'ko': meetingUrl,
          'en': meetingUrl,
          'x-default': meetingUrl,
        },
      },
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: '언제만나',
        locale: 'ko_KR',
        url: `https://when22meet.vercel.app/meeting/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      keywords: [
        '언제만나',
        'when2meet',
        meeting.title,
        '일정조율',
        '모임시간',
        '약속잡기',
        '스케줄링',
      ],
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: '언제만나? - 간편한 일정 조율 서비스',
      description: '모임 시간을 쉽게 정하는 무료 스케줄링 서비스',
    };
  }
}

export default function MeetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
