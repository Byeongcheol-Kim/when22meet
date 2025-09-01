import { ImageResponse } from 'next/og';
import { headers } from 'next/headers';

export const runtime = 'edge';
export const alt = '언제만나? - 간편한 일정 조율 서비스';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  // Get language from request headers
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKorean = acceptLanguage.toLowerCase().includes('ko');
  
  // Since we have SVG files, we'll create a design that matches them
  // The SVG files are 800x400, we'll scale the design to 1200x630
  
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
          backgroundColor: '#ffffff',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Main container matching the SVG design */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}>
          {/* Logo/Icon */}
          <div style={{
            fontSize: 120,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 40,
            background: 'rgba(255, 255, 255, 0.2)',
            width: 180,
            height: 180,
            borderRadius: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isKorean ? '언' : 'W2M'}
          </div>
          
          {/* Title */}
          <div style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 30,
          }}>
            {isKorean ? '언제만나?' : 'When2Meet'}
          </div>
          
          {/* Subtitle */}
          <div style={{
            fontSize: 36,
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: 50,
            textAlign: 'center',
            maxWidth: '900px',
          }}>
            {isKorean 
              ? '모임 시간을 쉽게 정하는 일정 조율 서비스' 
              : 'Simple scheduling service for finding the best meeting time'}
          </div>
          
          {/* Features */}
          <div style={{
            display: 'flex',
            gap: 80,
            fontSize: 28,
            color: 'white',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <span style={{ fontSize: 40 }}>✨</span>
              <span>{isKorean ? '로그인 없이' : 'No Login'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <span style={{ fontSize: 40 }}>🔄</span>
              <span>{isKorean ? '실시간 동기화' : 'Real-time Sync'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <span style={{ fontSize: 40 }}>📱</span>
              <span>{isKorean ? '모바일 최적화' : 'Mobile Ready'}</span>
            </div>
          </div>
        </div>
        
        {/* URL at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          fontSize: 24,
          color: 'rgba(255, 255, 255, 0.8)',
        }}>
          when22meet.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}