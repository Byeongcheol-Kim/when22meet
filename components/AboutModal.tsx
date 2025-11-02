'use client';

import { X, Github, Linkedin, Instagram, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useTranslation();
  
  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl animate-fade-in border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
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
            <h3 className="font-semibold mb-2">{t('about.serviceIntro')}</h3>
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
            <Link
              href="/faq"
              className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              자주 묻는 질문 보기
            </Link>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-700 mb-3">{t('about.creators')}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  {t('about.team.designer.name')} - {t('about.team.designer.role')}
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
                  {t('about.team.developer.name')} - {t('about.team.developer.role')}
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
                  💙 {t('about.freeService')}
                </p>
                <p className="text-xs text-gray-800 mt-0.5">
                  {t('about.supportMessage')}
                </p>
              </div>
              <a 
                href="https://buymeacoffee.com/benchleykim"
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-3 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-xs font-semibold rounded-md transition-all hover:scale-105 flex items-center gap-1"
              >
                <span>☕</span>
                <span>{t('about.supportButton')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}