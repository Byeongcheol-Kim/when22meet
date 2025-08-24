import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { generateShortCode, compressUrlParams, type CompressedParams } from '@/lib/utils/urlShortener';

interface ShortUrlData {
  original: CompressedParams;
  created: string;
  lastAccess: string;
  accessCount: number;
}

// URL 단축 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // URL 파싱
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    // 파라미터 압축
    const compressed = compressUrlParams(params);
    
    // 짧은 코드 생성 (중복 체크)
    let shortCode = generateShortCode();
    let attempts = 0;
    while (await redis.get(`short:${shortCode}`) && attempts < 10) {
      shortCode = generateShortCode();
      attempts++;
    }
    
    // Redis에 저장 (2개월 TTL)
    await redis.setex(
      `short:${shortCode}`,
      60 * 24 * 60 * 60, // 60일 (2개월)
      {
        original: compressed,
        created: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
        accessCount: 0
      }
    );
    
    // 단축 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || urlObj.origin;
    const shortUrl = `${baseUrl}/s/${shortCode}`;
    
    return NextResponse.json({
      success: true,
      shortUrl,
      shortCode
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Failed to create short URL' },
      { status: 500 }
    );
  }
}

// 단축 URL 조회 및 리다이렉트 정보 반환
export async function GET(request: NextRequest) {
  try {
    const shortCode = request.nextUrl.searchParams.get('code');
    
    if (!shortCode) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }
    
    // Redis에서 조회
    const data = await redis.get(`short:${shortCode}`);
    
    if (!data) {
      return NextResponse.json(
        { error: 'Short URL not found or expired' },
        { status: 404 }
      );
    }
    
    // 접근 시간 및 카운트 업데이트 (TTL 갱신)
    const shortUrlData = data as ShortUrlData;
    const updatedData = {
      ...shortUrlData,
      lastAccess: new Date().toISOString(),
      accessCount: (shortUrlData.accessCount || 0) + 1
    };
    
    // TTL 갱신 (다시 2개월로 연장)
    await redis.setex(
      `short:${shortCode}`,
      60 * 24 * 60 * 60, // 60일 (2개월)
      updatedData
    );
    
    return NextResponse.json({
      success: true,
      data: shortUrlData.original
    });
  } catch (error) {
    console.error('Error retrieving short URL:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve short URL' },
      { status: 500 }
    );
  }
}