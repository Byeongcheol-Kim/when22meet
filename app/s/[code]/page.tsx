'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { decompressToUrlParams } from '@/lib/utils/urlShortener';

export default function ShortUrlRedirect({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/shorten?code=${resolvedParams.code}`);
        
        if (!response.ok) {
          // 단축 URL을 찾을 수 없으면 홈으로
          router.push('/');
          return;
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          // 압축된 데이터를 URL 파라미터로 복원
          const urlParams = decompressToUrlParams(data.data);
          router.push(`/?${urlParams.toString()}`);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error redirecting:', error);
        router.push('/');
      }
    }
    
    redirect();
  }, [params, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">리다이렉트 중...</p>
      </div>
    </div>
  );
}