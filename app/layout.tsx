import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "언제만나? - 간편한 일정 조율 서비스",
  description: "여러 사람이 모임 일정을 쉽게 조율할 수 있는 무료 스케줄링 서비스입니다. 가능한 날짜를 선택하고 최적의 일정을 찾아보세요!",
  keywords: "일정조율, 약속잡기, 모임일정, 스케줄링, when2meet, 언제만나",
  authors: [{ name: "이진휘" }, { name: "김병철" }],
  creator: "언제만나 팀",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "언제만나?",
    description: "약속 일정을 쉽게 조율하세요.",
    url: "https://when2meet.vercel.app",
    siteName: "언제만나?",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "언제만나? - 간편한 일정 조율 서비스"
      }
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "언제만나? - 간편한 일정 조율 서비스",
    description: "여러 사람이 모임 일정을 쉽게 조율할 수 있는 무료 스케줄링 서비스",
    images: ["/opengraph-image"],
  },
  metadataBase: new URL("https://when2meet.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKr.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
