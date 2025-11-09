'use client';

import { X, Link2, Copy } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
  onShareLink: () => void;
  onShareTemplate: () => void;
}

export default function ShareModal({ onClose, onShareLink, onShareTemplate }: ShareModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">공유하기</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
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
            className="w-full p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">약속 링크 복사</h3>
                <p className="text-sm text-gray-600">이 약속 페이지 링크를 공유합니다</p>
              </div>
            </div>
          </button>

          {/* 약속 템플릿 복사 */}
          <button
            onClick={() => {
              onShareTemplate();
              onClose();
            }}
            className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Copy className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">약속 템플릿 복사</h3>
                <p className="text-sm text-gray-600">같은 참가자와 약속 이름으로 새 약속을 만드는 템플릿 링크를 만듭니다</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
