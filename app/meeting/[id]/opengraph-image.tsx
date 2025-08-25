import { ImageResponse } from 'next/og';
import redis from '@/lib/redis';
import { Meeting } from '@/lib/types';

export const runtime = 'edge';
export const alt = '언제만나? - 일정 조율';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  try {
    const meetingData = await redis.get(`meeting:${params.id}`);
    const meeting = meetingData as Meeting | null;
    
    const title = meeting?.title || '새로운 일정';
    const dateCount = meeting?.dates?.length || 0;
    
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 20, opacity: 0.9 }}>언제만나?</div>
          <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 20 }}>{title}</div>
          <div style={{ fontSize: 32, opacity: 0.9 }}>
            {dateCount}개의 날짜 중에서 선택
          </div>
          <div style={{ fontSize: 28, marginTop: 40, opacity: 0.8 }}>
            간편한 일정 조율 서비스
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch {
    // Default image on error
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 20 }}>언제만나?</div>
          <div style={{ fontSize: 32 }}>간편한 일정 조율 서비스</div>
        </div>
      ),
      {
        ...size,
      }
    );
  }
}