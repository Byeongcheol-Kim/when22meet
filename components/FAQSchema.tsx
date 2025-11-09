'use client';

import { useTranslation } from '@/lib/useTranslation';

export default function FAQSchema() {
  const { t } = useTranslation();

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqKeys.map(key => ({
      '@type': 'Question',
      'name': t(`faq.questions.${key}.question`),
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': t(`faq.questions.${key}.answer`),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}
