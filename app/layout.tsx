import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
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
  title: "언제만나 | When2Meet",
  description: "모임 시간을 쉽게 정하는 스케줄링 서비스 | Simple scheduling service for finding the best meeting time",
  keywords: ["언제만나", "when2meet", "스케줄링", "scheduling", "미팅", "meeting"],
  authors: [{ name: "언제만나 팀" }],
  openGraph: {
    title: "언제만나 | When2Meet",
    description: "모임 시간을 쉽게 정하는 스케줄링 서비스",
    url: "https://when2meet.kr",
    siteName: "언제만나",
    locale: "ko_KR",
    alternateLocale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "언제만나 | When2Meet",
    description: "모임 시간을 쉽게 정하는 스케줄링 서비스",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}