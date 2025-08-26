export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "언제만나 | When2Meet",
    "alternateName": "When2Meet",
    "url": "https://when22meet.vercel.app",
    "logo": "https://when22meet.vercel.app/logo.png",
    "description": "모임 시간을 쉽게 정하는 스케줄링 서비스 | Simple scheduling service for finding the best meeting time",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW"
    },
    "creator": {
      "@type": "Organization",
      "name": "언제만나 팀",
      "url": "https://when22meet.vercel.app"
    },
    "datePublished": "2024-01-01",
    "inLanguage": ["ko", "en"],
    "featureList": [
      "실시간 동기화",
      "로그인 없이 사용 가능",
      "드래그로 여러 날짜 선택",
      "모바일 최적화"
    ],
    "screenshot": [
      "https://when22meet.vercel.app/screenshot1.png",
      "https://when22meet.vercel.app/screenshot2.png"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}