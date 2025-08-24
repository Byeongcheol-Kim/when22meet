'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Info, Link2, Calendar, Check } from 'lucide-react';
import DateSelector from '@/components/DateSelector';
import AboutModal from '@/components/AboutModal';
import MeetingTitleInput from '@/components/MeetingTitleInput';
import ParticipantsInput from '@/components/ParticipantsInput';
import { generateDatesFromTemplate, type DateTemplate } from '@/lib/utils/dateTemplates';

function HomeContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [title, setTitle] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DateTemplate | null>(null);
  const [showShareUrl, setShowShareUrl] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 템플릿 설정 읽기
  useEffect(() => {
    const templateTitle = searchParams.get('title');
    const templateParticipants = searchParams.get('participants');
    const templateDates = searchParams.get('template') as DateTemplate | null;
    const templateMonths = searchParams.get('months');
    
    if (templateTitle) {
      setTitle(decodeURIComponent(templateTitle));
    }
    
    if (templateParticipants) {
      const participantList = decodeURIComponent(templateParticipants).split(',').filter(p => p);
      setParticipants(participantList);
    }
    
    if (templateDates && ['weekend', 'weekday', 'fri-sat-sun', 'full'].includes(templateDates)) {
      const months = templateMonths ? parseInt(templateMonths) : 2;
      const dates = generateDatesFromTemplate(templateDates, months);
      setSelectedDates(dates);
      setSelectedTemplate(templateDates);
    }
  }, [searchParams]);

  // 2초 후 자동으로 메인 화면으로 전환
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);


  const handleTemplateSelect = (template: DateTemplate) => {
    const dates = generateDatesFromTemplate(template, 2);
    setSelectedDates(dates);
    setSelectedTemplate(template);
  };

  const generateShareUrl = () => {
    const params = new URLSearchParams();
    
    if (title) {
      params.set('title', encodeURIComponent(title));
    }
    
    if (participants.length > 0) {
      params.set('participants', encodeURIComponent(participants.join(',')));
    }
    
    if (selectedTemplate) {
      params.set('template', selectedTemplate);
      params.set('months', '2');
    }
    
    const baseUrl = window.location.origin;
    return `${baseUrl}?${params.toString()}`;
  };

  const handleCopyShareUrl = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setShowShareUrl(true);
    setTimeout(() => setShowShareUrl(false), 1500);
  };

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

        {/* 날짜 템플릿 선택 */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-2">빠른 날짜 선택</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleTemplateSelect('weekend')}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                selectedTemplate === 'weekend' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              주말 (토, 일)
            </button>
            <button
              onClick={() => handleTemplateSelect('weekday')}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                selectedTemplate === 'weekday' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              주중 (월~금)
            </button>
            <button
              onClick={() => handleTemplateSelect('fri-sat-sun')}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                selectedTemplate === 'fri-sat-sun' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              금토일
            </button>
            <button
              onClick={() => handleTemplateSelect('full')}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                selectedTemplate === 'full' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              전체 날짜
            </button>
          </div>
        </div>

        <div className="mb-8">
          <DateSelector 
            selectedDates={selectedDates}
            onDatesChange={(dates) => {
              setSelectedDates(dates);
              setSelectedTemplate(null); // 수동 선택시 템플릿 해제
            }}
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
          
          {/* 템플릿 URL 공유 버튼 */}
          {(title || participants.length > 0 || selectedTemplate) && (
            <button
              onClick={handleCopyShareUrl}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                showShareUrl 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showShareUrl ? (
                <>
                  <Check className="w-4 h-4" />
                  복사 완료!
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  템플릿 URL 복사
                </>
              )}
            </button>
          )}
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HomeContent />
    </Suspense>
  );
}