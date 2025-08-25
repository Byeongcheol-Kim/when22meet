import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { generateShortCode, compressUrlParams, type CompressedParams } from '@/lib/utils/urlShortener';

interface ShortUrlData {
  original: CompressedParams;
  created: string;
  lastAccess: string;
  accessCount: number;
}

// Create shortened URL
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
    
    // Parse URL
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    // Compress parameters
    const compressed = compressUrlParams(params);
    
    // Generate short code (with duplicate check)
    let shortCode = generateShortCode();
    let attempts = 0;
    while (await redis.get(`short:${shortCode}`) && attempts < 10) {
      shortCode = generateShortCode();
      attempts++;
    }
    
    // Store in Redis (2-month TTL)
    await redis.setex(
      `short:${shortCode}`,
      60 * 24 * 60 * 60, // 60 days (2 months)
      {
        original: compressed,
        created: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
        accessCount: 0
      }
    );
    
    // Generate shortened URL
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

// Get shortened URL and return redirect info
export async function GET(request: NextRequest) {
  try {
    const shortCode = request.nextUrl.searchParams.get('code');
    
    if (!shortCode) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }
    
    // Retrieve from Redis
    const data = await redis.get(`short:${shortCode}`);
    
    if (!data) {
      return NextResponse.json(
        { error: 'Short URL not found or expired' },
        { status: 404 }
      );
    }
    
    // Update access time and count (refresh TTL)
    const shortUrlData = data as ShortUrlData;
    const updatedData = {
      ...shortUrlData,
      lastAccess: new Date().toISOString(),
      accessCount: (shortUrlData.accessCount || 0) + 1
    };
    
    // Refresh TTL (extend to 2 months again)
    await redis.setex(
      `short:${shortCode}`,
      60 * 24 * 60 * 60, // 60 days (2 months)
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