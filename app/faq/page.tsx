'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Home } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';

export default function FAQPage() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('faq.title')}
          </h1>
          <p className="text-gray-600">{t('faq.subtitle')}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          {faqKeys.map((key, index) => {
            const question = t(`faq.questions.${key}.question`);
            const answer = t(`faq.questions.${key}.answer`);

            return (
              <div key={index} className="border-b last:border-b-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-start text-left p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                      Q{index + 1}. {question}
                    </h3>
                    {openIndex === index && (
                      <p className="text-sm md:text-base text-gray-700 mt-3 leading-relaxed">
                        {answer}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 mt-1">
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFC354] text-gray-800 rounded-lg hover:bg-[#FFD580] transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            {t('faq.backHome')}
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="font-medium">{t('faq.moreQuestions')}</p>
          <p className="mt-1">{t('faq.tryService')}</p>
        </div>
      </div>
    </div>
  );
}
