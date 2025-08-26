import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import StructuredData from "@/components/StructuredData";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "언제만나 | When2Meet - 간편한 일정 조율 서비스",
  description: "모임 시간을 쉽게 정하는 무료 스케줄링 서비스. 로그인 없이 바로 사용 가능. 드래그로 여러 날짜 선택, 실시간 동기화 지원 | Free scheduling service for finding the best meeting time",
  keywords: [
    "언제만나", "when2meet", "스케줄링", "scheduling", 
    "일정조율", "미팅", "meeting", "약속잡기",
    "모임시간", "팀미팅", "온라인미팅", "일정관리",
    "무료 스케줄링", "free scheduling", "meeting scheduler"
  ],
  authors: [{ name: "언제만나 팀" }],
  metadataBase: new URL('https://when22meet.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'ko': '/ko',
      'en': '/en',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '1XQBJXV6W21_4jf-kkmySkt9kV-CgsMVEku97b-Q34M', // Google Search Console 인증 코드
  },
  openGraph: {
    title: "언제만나 | When2Meet - 간편한 일정 조율 서비스",
    description: "모임 시간을 쉽게 정하는 무료 스케줄링 서비스. 로그인 없이 바로 사용 가능",
    url: "https://when22meet.vercel.app",
    siteName: "언제만나",
    images: [
      {
        url: 'https://when22meet.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: '언제만나 - 간편한 일정 조율 서비스',
      }
    ],
    locale: "ko_KR",
    alternateLocale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "언제만나 | When2Meet",
    description: "모임 시간을 쉽게 정하는 무료 스케줄링 서비스",
    images: ['https://when22meet.vercel.app/twitter-image.png'],
    creator: '@when2meet',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <StructuredData />
      </head>
      <body className={`${notoSansKr.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}