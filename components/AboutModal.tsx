'use client';

import { X, Github, Linkedin, Instagram } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  const { t, locale } = useTranslation();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('about.title')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{locale === 'ko' ? '서비스 소개' : 'About'}</h3>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {t('about.description')}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">{t('about.howTo.title')}</h3>
            <ol className="text-sm text-gray-800 space-y-1 list-decimal list-inside">
              <li>{t('about.howTo.step1')}</li>
              <li>{t('about.howTo.step2')}</li>
              <li>{t('about.howTo.step3')}</li>
              <li>{t('about.howTo.step4')}</li>
            </ol>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-700 mb-3">{locale === 'ko' ? '제작자' : 'Creators'}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  이진휘 - {locale === 'ko' ? '디자인' : 'Design'}
                </span>
                <div className="flex gap-2">
                  <a 
                    href="https://www.instagram.com/jinhwi_12?igsh=MTMwd2MzdzJoOGc2bQ=="
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-pink-600 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  김병철 - {locale === 'ko' ? '개발' : 'Development'}
                </span>
                <div className="flex gap-2">
                  <a 
                    href="https://github.com/Byeongcheol-Kim/graphchat"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/byeongcheol-kim-a477a7263/"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://www.instagram.com/benchley_goo/?igsh=cHI1emRjaXJpcWdm&utm_source=qr#"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-pink-600 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t bg-yellow-50 -mx-6 -mb-6 px-6 py-3 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-900 font-medium">
                  💙 {locale === 'ko' ? '광고 없는 무료 서비스입니다' : 'Free service without ads'}
                </p>
                <p className="text-xs text-gray-800 mt-0.5">
                  {locale === 'ko' ? '도움이 되셨다면 커피 한 잔 부탁드려요!' : 'If you found this helpful, buy us a coffee!'}
                </p>
              </div>
              <a 
                href="https://buymeacoffee.com/benchleykim"
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-3 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-xs font-semibold rounded-md transition-all hover:scale-105 flex items-center gap-1"
              >
                <span>☕</span>
                <span>{locale === 'ko' ? '후원하기' : 'Support'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}