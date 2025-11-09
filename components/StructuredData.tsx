'use client';

import { useTranslation } from '@/lib/useTranslation';
import { getLocalizedStructuredData } from '@/lib/utils/i18n';

export default function StructuredData() {
  const { locale } = useTranslation();
  const localizedData = getLocalizedStructuredData(locale);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": localizedData.name,
    "alternateName": localizedData.alternateName,
    "url": "https://when22meet.vercel.app",
    "description": localizedData.description,
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": locale === 'ko' ? "KRW" : "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": localizedData.organizationName,
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
    "inLanguage": [locale, locale === 'ko' ? 'en' : 'ko'],
    "keywords": localizedData.keywords,
    "featureList": localizedData.featureList,
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