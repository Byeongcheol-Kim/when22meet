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

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const meetingData = await redis.get(`meeting:${id}`);
    const meeting = meetingData as Meeting | null;

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    const title = meeting.title || '새로운 일정';
    const dateCount = meeting.dates?.length || 0;

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

    const participantCount = availabilities.length;

    const formatDate = (dateString: string) => {
      const date = new Date(dateString + 'T00:00:00');
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      return `${date.getMonth() + 1}/${date.getDate()}(${dayNames[date.getDay()]})`;
    };

    const medals = ['🥇', '🥈', '🥉'];

    // Pre-calculate all text to avoid conditional rendering in JSX
    const rank1 = topDates[0] ? `${medals[0]} ${formatDate(topDates[0][0])} (${topDates[0][1]}명)` : null;
    const rank2 = topDates[1] ? `${medals[1]} ${formatDate(topDates[1][0])} (${topDates[1][1]}명)` : null;
    const rank3 = topDates[2] ? `${medals[2]} ${formatDate(topDates[2][0])} (${topDates[2][1]}명)` : null;
    const hasTopDates = topDates.length > 0;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFC354',
            padding: 80,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {hasTopDates ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              {rank1 && (
                <div style={{ fontSize: 72, fontWeight: 700, color: 'black', marginBottom: rank2 ? 30 : 0 }}>
                  {rank1}
                </div>
              )}
              {rank2 && (
                <div style={{ fontSize: 72, fontWeight: 700, color: 'black', marginBottom: rank3 ? 30 : 0 }}>
                  {rank2}
                </div>
              )}
              {rank3 && (
                <div style={{ fontSize: 72, fontWeight: 700, color: 'black' }}>
                  {rank3}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 80, fontWeight: 700, color: 'black', marginBottom: 40 }}>
                언제만나?
              </div>
              <div style={{ fontSize: 48, color: 'black' }}>
                {title}
              </div>
            </div>
          )}
        </div>
      ),
      { ...size }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    // Default image on error
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
            backgroundColor: '#FFC354',
          }}
        >
          <div style={{ fontSize: 80, fontWeight: 700, color: 'black' }}>
            언제만나?
          </div>
          <div style={{ fontSize: 40, color: 'black', marginTop: 20 }}>
            간편한 일정 조율 서비스
          </div>
        </div>
      ),
      { ...size }
    );
  }
}