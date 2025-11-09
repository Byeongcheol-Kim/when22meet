'use client';

import { X, Link2, Copy } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { SHARE_MODAL_COLORS, MODAL_COLORS } from '@/lib/constants/colors';

interface ShareModalProps {
  onClose: () => void;
  onShareLink: () => void;
  onShareTemplate: () => void;
}

export default function ShareModal({ onClose, onShareLink, onShareTemplate }: ShareModalProps) {
  const { t } = useTranslation();

  return (
    <div className={`fixed inset-0 ${MODAL_COLORS.overlay} z-50`}>
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className={`${MODAL_COLORS.background} rounded-xl p-6 max-w-sm w-full shadow-2xl animate-fade-in`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${MODAL_COLORS.header}`}>{t('meeting.share.title')}</h2>
          <button
            onClick={onClose}
            className={`${MODAL_COLORS.close.text} ${MODAL_COLORS.close.hover} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* 약속 링크 복사 */}
          <button
            onClick={() => {
              onShareLink();
              onClose();
            }}
            className={`w-full p-4 ${SHARE_MODAL_COLORS.link.bg} ${SHARE_MODAL_COLORS.link.hover} rounded-lg transition-colors text-left group`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${SHARE_MODAL_COLORS.link.icon} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{t('meeting.share.link.title')}</h3>
                <p className="text-sm text-gray-600">{t('meeting.share.link.description')}</p>
              </div>
            </div>
          </button>

          {/* 약속 템플릿 복사 */}
          <button
            onClick={() => {
              onShareTemplate();
              onClose();
            }}
            className={`w-full p-4 ${SHARE_MODAL_COLORS.template.bg} ${SHARE_MODAL_COLORS.template.hover} rounded-lg transition-colors text-left group`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${SHARE_MODAL_COLORS.template.icon} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Copy className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{t('meeting.share.template.title')}</h3>
                <p className="text-sm text-gray-600">{t('meeting.share.template.description')}</p>
              </div>
            </div>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
