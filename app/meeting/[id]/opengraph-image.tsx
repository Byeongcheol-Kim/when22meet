import { ImageResponse } from 'next/og';
import redis from '@/lib/redis';
import { Meeting, StoredAvailability } from '@/lib/types';

// Remove edge runtime due to Turbopack compatibility issue
// export const runtime = 'edge';
export const alt = '언제만나? - 일정 조율';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;

    const meetingData = await redis.get(`meeting:${id}`);
    const meeting = meetingData as Meeting | null;

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Use locale from meeting data (saved when meeting was created), default to Korean
    const isKorean = !meeting.locale || meeting.locale === 'ko';

    const title = meeting.title || (isKorean ? '새로운 일정' : 'New Meeting');

    // Get all availabilities
    const availabilityKeys = await redis.keys(`availability:${id}:*`);
    const availabilities: { availableDates: string[] }[] = [];

    for (const key of availabilityKeys) {
      const data = await redis.get(key);
      if (data) {
        const parsedData = data as StoredAvailability | string[];

        if (Array.isArray(parsedData)) {
          availabilities.push({
            availableDates: parsedData,
          });
        } else {
          availabilities.push({
            availableDates: parsedData.dates || [],
          });
        }
      }
    }

    // Calculate top dates
    const dateScores: { [date: string]: number } = {};

    meeting.dates.forEach((date: string) => {
      let count = 0;
      availabilities.forEach((availability: { availableDates: string[] }) => {
        if (availability.availableDates.includes(date)) {
          count++;
        }
      });
      dateScores[date] = count;
    });

    const topDates = Object.entries(dateScores)
      .sort((a, b) => b[1] - a[1])
      .filter(([, count]) => count > 0)
      .slice(0, 3);

    const formatDate = (dateString: string) => {
      const date = new Date(dateString + 'T00:00:00');
      const dayNamesKo = ['일', '월', '화', '수', '목', '금', '토'];
      const dayNamesEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayName = isKorean ? dayNamesKo[date.getDay()] : dayNamesEn[date.getDay()];
      return `${month}/${day} (${dayName})`;
    };

    const peopleText = isKorean ? '명' : 'people';
    const brandText = isKorean ? '언제만나' : 'When22Meet';
    const waitingText = isKorean ? '참여자를 기다리는 중...' : 'Waiting for participants...';
    const shareText = isKorean ? '링크를 공유해보세요' : 'Share the link';

    const medals = ['🥇', '🥈', '🥉'];

    // Pre-calculate all text to avoid conditional rendering in JSX
    const rank1 = topDates[0] ? `${medals[0]} ${formatDate(topDates[0][0])} - ${topDates[0][1]} ${peopleText}` : null;
    const rank2 = topDates[1] ? `${medals[1]} ${formatDate(topDates[1][0])} - ${topDates[1][1]} ${peopleText}` : null;
    const rank3 = topDates[2] ? `${medals[2]} ${formatDate(topDates[2][0])} - ${topDates[2][1]} ${peopleText}` : null;
    const hasTopDates = topDates.length > 0;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            padding: 80,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {/* Title */}
          <div style={{ display: 'flex', fontSize: 60, fontWeight: 700, color: '#1F2937', marginBottom: 40 }}>
            {title} - {brandText}
          </div>

          {/* Content */}
          {hasTopDates ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                width: '100%',
              }}
            >
              {rank1 && (
                <div style={{
                  display: 'flex',
                  backgroundColor: '#FBBF24',
                  color: '#78350F',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 40,
                  fontWeight: 700,
                }}>
                  {rank1}
                </div>
              )}
              {rank2 && (
                <div style={{
                  display: 'flex',
                  backgroundColor: '#D1D5DB',
                  color: '#374151',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 40,
                  fontWeight: 700,
                }}>
                  {rank2}
                </div>
              )}
              {rank3 && (
                <div style={{
                  display: 'flex',
                  backgroundColor: '#FB923C',
                  color: '#7C2D12',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 40,
                  fontWeight: 700,
                }}>
                  {rank3}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', fontSize: 48, color: '#6B7280', marginBottom: 20 }}>
                {waitingText}
              </div>
              <div style={{ display: 'flex', fontSize: 32, color: '#9CA3AF' }}>
                {shareText}
              </div>
            </div>
          )}
        </div>
      ),
      { ...size }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    // Default image on error (fallback to Korean)
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
          }}
        >
          <div style={{ display: 'flex', fontSize: 80, fontWeight: 700, color: '#1F2937' }}>
            언제만나?
          </div>
          <div style={{ display: 'flex', fontSize: 40, color: '#6B7280', marginTop: 20 }}>
            간편한 일정 조율 서비스
          </div>
        </div>
      ),
      { ...size }
    );
  }
}