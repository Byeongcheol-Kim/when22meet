import { headers } from 'next/headers';
import fs from 'fs';
import path from 'path';

export const alt = '언제만나? - 일정 조율';
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

  // Select PNG file based on language
  const pngFileName = isKorean ? 'link_thumbnail_ko.png' : 'link_thumbnail_en.png';
  const pngPath = path.join(process.cwd(), 'public', pngFileName);

  try {
    // Read the PNG file
    const imageBuffer = fs.readFileSync(pngPath);

    // Return the PNG file as response
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error reading PNG file for short URL:', error);

    // Fallback: return Korean version if file not found
    const fallbackPath = path.join(process.cwd(), 'public', 'link_thumbnail_ko.png');
    const fallbackBuffer = fs.readFileSync(fallbackPath);

    return new Response(fallbackBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
}
