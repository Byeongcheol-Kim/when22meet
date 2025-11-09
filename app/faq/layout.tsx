import type { Metadata } from "next";
import FAQSchema from "@/components/FAQSchema";

export const metadata: Metadata = {
  title: "FAQ | When22Meet - 언제만나",
  description: "Find answers to common questions about When22Meet. Learn about sign-up, data storage, date selection and more. 언제만나 사용 중 궁금한 점을 확인하세요.",
  keywords: [
    "언제만나 FAQ", "자주 묻는 질문", "사용법", "도움말",
    "when2meet FAQ", "일정조율 방법", "스케줄링 가이드",
    "FAQ", "frequently asked questions", "help", "guide"
  ],
  openGraph: {
    title: "FAQ | When22Meet - 언제만나",
    description: "Find answers to common questions about When22Meet | 언제만나 사용 중 궁금한 점을 확인하세요",
    url: "https://when22meet.vercel.app/faq",
  },
  alternates: {
    canonical: '/faq',
    languages: {
      'ko': '/faq',
      'en': '/faq',
      'x-default': '/faq',
    },
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FAQSchema />
      {children}
    </>
  );
}
