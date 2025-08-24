'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
import DateSelector from '@/components/DateSelector';
import AboutModal from '@/components/AboutModal';
import MeetingTitleInput from '@/components/MeetingTitleInput';
import ParticipantsInput from '@/components/ParticipantsInput';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [title, setTitle] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const router = useRouter();

  // 2초 후 자동으로 메인 화면으로 전환
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);


  const handleCreateMeeting = async () => {
    if (!title || selectedDates.length === 0) {
      alert('약속 이름과 날짜를 선택해주세요.');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          dates: selectedDates.sort(),
          participants: participants
        })
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/meeting/${data.meetingId}`);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('미팅 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  if (showSplash) {
    // 스플래시 화면 - 2초간 표시
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-xs text-center">
          <h1 className="text-2xl font-medium mb-2 animate-fade-in">간편한 스케줄링 서비스</h1>
          <h2 className="text-4xl font-bold animate-fade-in animation-delay-200">언제만나?</h2>
        </div>
      </div>
    );
  }

  // 날짜 선택 화면
  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-4">언제만나!</h1>
          
          <div className="space-y-4">
            <MeetingTitleInput 
              value={title}
              onChange={setTitle}
            />
            <ParticipantsInput
              participants={participants}
              onParticipantsChange={setParticipants}
              label="참여자 (선택사항)"
              placeholder="이름을 입력하고 Enter 또는 쉼표로 구분"
            />
            <p className="text-sm text-gray-500">아래에서 가능한 날짜들을 선택해주세요. 드래그로 여러 날짜를 한번에 선택할 수 있습니다.</p>
          </div>
        </div>

        <div className="mb-8">
          <DateSelector 
            selectedDates={selectedDates}
            onDatesChange={setSelectedDates}
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCreateMeeting}
            disabled={isCreating || !title || selectedDates.length === 0}
            className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold disabled:bg-gray-300 transition-colors"
          >
            {isCreating ? '생성 중...' : '약속 만들기'}
          </button>
        </div>
      </div>
      
      {/* 우측 상단 정보 아이콘 */}
      <button 
        onClick={() => setShowHelpModal(true)}
        className="absolute top-8 right-8 hover:opacity-70 transition-opacity"
        title="정보"
      >
        <Info className="w-6 h-6 text-gray-400" />
      </button>

      {/* About Modal */}
      <AboutModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}