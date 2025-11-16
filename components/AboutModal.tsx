'use client';

import { X, Github, Linkedin, Instagram, Mail } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';
import { MODAL_COLORS, TEXT_COLORS, LINK_COLORS, SUPPORT_COLORS, ROLE_BADGE_COLORS, SECTION_BADGE_COLORS } from '@/lib/constants/colors';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useTranslation();
  
  return (
    <div
      className={`fixed inset-0 ${MODAL_COLORS.overlay} flex items-center justify-center z-50 px-4`}
      onClick={onClose}
    >
      <div
        className={`${MODAL_COLORS.background} rounded-xl p-6 max-w-md w-full shadow-2xl animate-fade-in border border-gray-100`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${MODAL_COLORS.header}`}>{t('about.title')}</h2>
          <button
            onClick={onClose}
            className={`${LINK_COLORS.github.text} ${LINK_COLORS.github.hover} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{t('about.serviceIntro')}</h3>
            <p className={`text-sm ${TEXT_COLORS.info} whitespace-pre-line`}>
              {t('about.description')}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">{t('about.howTo.title')}</h3>
            <ol className={`text-sm ${TEXT_COLORS.info} space-y-1 list-decimal list-inside`}>
              <li>{t('about.howTo.step1')}</li>
              <li>{t('about.howTo.step2')}</li>
              <li>{t('about.howTo.step3')}</li>
              <li>{t('about.howTo.step4')}</li>
            </ol>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{t('about.creators')}</h3>
              <a
                href="https://buymeacoffee.com/benchleykim"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 ${SUPPORT_COLORS.button.bg} ${SUPPORT_COLORS.button.hover} ${SUPPORT_COLORS.button.text} text-xs font-semibold rounded-md transition-all hover:scale-105 flex items-center gap-1`}
              >
                <span>☕</span>
                <span>{t('about.supportButton')}</span>
              </a>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${TEXT_COLORS.primary}`}>
                  {t('about.team.designer.name')} - <span className={`${ROLE_BADGE_COLORS.designer.bg} ${ROLE_BADGE_COLORS.designer.text} px-2 py-0.5 rounded text-xs font-bold`}>{t('about.team.designer.role')}</span>
                </span>
                <div className="flex gap-2">
                  <a
                    href="https://www.instagram.com/jinhwi_12?igsh=MTMwd2MzdzJoOGc2bQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${LINK_COLORS.instagram.text} ${LINK_COLORS.instagram.hover} transition-colors`}
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${TEXT_COLORS.primary}`}>
                  {t('about.team.developer.name')} - <span className={`${ROLE_BADGE_COLORS.developer.bg} ${ROLE_BADGE_COLORS.developer.text} px-2 py-0.5 rounded text-xs font-bold`}>{t('about.team.developer.role')}</span>
                </span>
                <div className="flex gap-2">
                  <a
                    href="mailto:benchely.kim@gmail.com"
                    className={`${LINK_COLORS.github.text} ${LINK_COLORS.github.hover} transition-colors`}
                    title="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com/Byeongcheol-Kim/graphchat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${LINK_COLORS.github.text} ${LINK_COLORS.github.hover} transition-colors`}
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/byeongcheol-kim-a477a7263/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${LINK_COLORS.linkedin.text} ${LINK_COLORS.linkedin.hover} transition-colors`}
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.instagram.com/benchley_goo/?igsh=cHI1emRjaXJpcWdm&utm_source=qr#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${LINK_COLORS.instagram.text} ${LINK_COLORS.instagram.hover} transition-colors`}
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/faq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-semibold ${TEXT_COLORS.primary}`}
                >
                  <span className={`${SECTION_BADGE_COLORS.dates.bg} ${SECTION_BADGE_COLORS.dates.text} px-2 py-0.5 rounded text-xs font-bold`}>{t('about.viewFAQ')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}