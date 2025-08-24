import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '언제만나? - 간편한 일정 조율 서비스';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', marginBottom: 20 }}>언제만나?</div>
        <div style={{ fontSize: 36, marginBottom: 40 }}>간편한 일정 조율 서비스</div>
        <div style={{ 
          display: 'flex', 
          gap: 40,
          fontSize: 28,
          opacity: 0.9
        }}>
          <div>✅ 무료</div>
          <div>📅 간편</div>
          <div>👥 함께</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}