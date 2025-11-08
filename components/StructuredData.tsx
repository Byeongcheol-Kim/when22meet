export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "언제만나 - 약속일정 잡기 앱",
    "alternateName": ["When2Meet", "언제만나", "약속일정 앱"],
    "url": "https://when22meet.vercel.app",
    "description": "약속일정 잡기, 모임 시간 정하기가 쉬운 무료 일정 조율 앱. 로그인 없이 바로 사용 가능한 스케줄링 서비스",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW"
    },
    "creator": {
      "@type": "Organization",
      "name": "언제만나 팀",
      "url": "https://when22meet.vercel.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://when22meet.vercel.app/android-chrome-512x512.png",
        "width": "512",
        "height": "512"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "156"
    },
    "datePublished": "2024-01-01",
    "inLanguage": ["ko", "en"],
    "keywords": "약속일정 잡기 앱, 모임 시간 정하기, 일정 조율 서비스, 회의 시간 정하기, 팀 미팅 일정, 그룹 일정 조율",
    "featureList": [
      "실시간 동기화",
      "로그인 없이 사용 가능",
      "드래그로 여러 날짜 선택",
      "모바일 최적화",
      "무료 일정 조율",
      "팀 미팅 일정 관리",
      "회의 시간 투표"
    ],
    "screenshot": {
      "@type": "ImageObject",
      "url": "https://when22meet.vercel.app/opengraph-image"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}