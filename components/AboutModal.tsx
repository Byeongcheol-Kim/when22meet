'use client';

import { X, Github, Linkedin, Instagram } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">언제만나?</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">서비스 소개</h3>
            <p className="text-sm text-gray-600">
              언제만나는 여러 사람이 모임 일정을 조율할 수 있도록
              도와주는 간편한 스케줄링 서비스입니다.
              가능한 날짜를 선택하고 참여자들이 각자 가능한 날짜를 표시하면, 
              가장 많은 사람이 참여 가능한 날짜를 쉽게 찾을 수 있습니다.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">사용 방법</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>약속 이름을 입력하세요</li>
              <li>후보 날짜들을 선택하세요 (드래그로 여러 날짜 선택 가능)</li>
              <li>약속 만들기 버튼을 눌러 링크를 생성하세요</li>
              <li>생성된 링크를 참여자들에게 공유하세요</li>
            </ol>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-3">제작자</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">김병철</span>
                <div className="flex gap-2">
                  <a 
                    href="https://github.com/Byeongcheol-Kim/graphchat"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/byeongcheol-kim-a477a7263/"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://instagram.com/byeongcheol.kim"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-pink-600 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">이진휘</span>
                <div className="flex gap-2">
                  <a 
                    href="https://github.com/lymsbk"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/sukbeom-lim"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://instagram.com/jinhwi.lee"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-pink-600 transition-colors"
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
                <p className="text-xs text-gray-700 font-medium">
                  💙 광고 없는 무료 서비스입니다
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  도움이 되셨다면 커피 한 잔 부탁드려요!
                </p>
              </div>
              <a 
                href="https://buymeacoffee.com/benchleykim"
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-3 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-xs font-semibold rounded-md transition-all hover:scale-105 flex items-center gap-1"
              >
                <span>☕</span>
                <span>후원하기</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}