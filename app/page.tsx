'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import { Info, Link2, Calendar } from 'lucide-react';
import DateSelector from '@/components/DateSelector';
import AboutModal from '@/components/AboutModal';
import Toast from '@/components/Toast';
import MeetingTitleInput from '@/components/MeetingTitleInput';
import ParticipantsInput from '@/components/ParticipantsInput';
import { generateDatesFromTemplate, type DateTemplate } from '@/lib/utils/dateTemplates';

function HomeContent() {
  const { t } = useTranslation();
  const [showSplash, setShowSplash] = useState(true);
  const [title, setTitle] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DateTemplate | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read template settings from URL parameters
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

  // Automatically switch to main screen after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);


  const handleTemplateSelect = (template: DateTemplate) => {
    // 이미 선택된 템플릿을 다시 클릭하면 날짜 해제
    if (selectedTemplate === template) {
      setSelectedDates([]);
      setSelectedTemplate(null);
    } else {
      const dates = generateDatesFromTemplate(template, 2);
      setSelectedDates(dates);
      setSelectedTemplate(template);
    }
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
    const currentPath = window.location.pathname;
    return `${baseUrl}${currentPath}?${params.toString()}`;
  };

  const handleCopyShareUrl = async () => {
    try {
      const url = generateShareUrl();

      // Call URL shortening API
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const data = await response.json();
        navigator.clipboard.writeText(data.shortUrl);
        setToastMessage('템플릿 링크가 복사되었습니다!');
        setToastType('success');
      } else {
        // Copy original URL if shortening fails
        navigator.clipboard.writeText(url);
        setToastMessage('템플릿 링크가 복사되었습니다!');
        setToastType('success');
      }
    } catch (error) {
      console.error('Error copying URL:', error);
      // Copy original URL on error
      const url = generateShareUrl();
      navigator.clipboard.writeText(url);
      setToastMessage('템플릿 링크가 복사되었습니다!');
      setToastType('success');
    }
  };

  const handleCreateMeeting = async () => {
    if (!title || selectedDates.length === 0) {
      alert(t('landing.alerts.selectRequired'));
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
      alert(t('landing.alerts.createFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  if (showSplash) {
    // Splash screen - displayed for 2 seconds
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-xs text-center">
          <h1 className="text-2xl font-medium mb-2 animate-fade-in">
            {t('landing.splash.title')}
          </h1>
          <h2 className="text-4xl font-bold animate-fade-in animation-delay-200">
            {t('landing.splash.subtitle')}
          </h2>
        </div>
      </div>
    );
  }

  // Date selection screen
  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="w-full max-w-sm md:max-w-xl lg:max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold">{t('landing.title')}</h1>
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title={t('about.title')}
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <MeetingTitleInput 
              value={title}
              onChange={setTitle}
              label={t('landing.meetingTitle.label')}
              placeholder={t('landing.meetingTitle.placeholder')}
            />
            <ParticipantsInput
              participants={participants}
              onParticipantsChange={setParticipants}
              label={t('landing.participants.label')}
              placeholder={t('landing.participants.placeholder')}
              countText={t('landing.participants.count').replace('%count%', participants.length.toString())}
            />
            <p className="text-sm text-gray-700">
              {t('landing.dateSelection.description')}
            </p>
          </div>
        </div>

        {/* Date template selection */}
        <div className="mb-4">
          <label className="text-sm text-gray-800 font-medium block mb-2">
            {t('landing.dateSelection.quickSelection')}
          </label>
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
              {t('landing.dateSelection.templates.weekend')}
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
              {t('landing.dateSelection.templates.weekday')}
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
              {t('landing.dateSelection.templates.friSatSun')}
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
              {t('landing.dateSelection.templates.full')}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <DateSelector 
            selectedDates={selectedDates}
            onDatesChange={(dates) => {
              setSelectedDates(dates);
              setSelectedTemplate(null); // Clear template on manual selection
            }}
            title={t('landing.dateSelection.title')}
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCreateMeeting}
            disabled={isCreating || !title || selectedDates.length === 0}
            className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold disabled:bg-gray-300 transition-colors"
          >
            {isCreating ? t('landing.creating') : t('landing.createMeeting')}
          </button>
          
          {/* Template URL share button */}
          {(title || participants.length > 0 || selectedTemplate) && (
            <button
              onClick={handleCopyShareUrl}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              {t('landing.shareTemplate')}
            </button>
          )}
        </div>
      </div>

      {showHelpModal && (
        <AboutModal onClose={() => setShowHelpModal(false)} />
      )}

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>}>
        <HomeContent />
      </Suspense>

      {/* SEO Content - Hidden but accessible to search engines */}
      <div className="sr-only">
        <h2>약속일정 잡기 앱 - 언제만나</h2>
        <p>
          언제만나는 약속일정 잡기, 모임 시간 정하기, 회의 시간 조율이 쉬운 무료 일정 조율 앱입니다.
          팀 미팅, 그룹 모임, 단체 약속의 최적 시간을 찾는데 최적화된 스케줄링 서비스입니다.
        </p>
        <h3>주요 기능</h3>
        <ul>
          <li>로그인 없이 바로 사용 가능한 일정 조율</li>
          <li>드래그로 여러 날짜 쉽게 선택</li>
          <li>실시간 동기화로 팀원들과 함께 일정 조율</li>
          <li>모바일 최적화로 언제 어디서나 약속 잡기</li>
          <li>무료 스케줄링 서비스</li>
        </ul>
        <h3>이런 분들께 추천합니다</h3>
        <ul>
          <li>팀 미팅 일정을 조율하고 싶은 직장인</li>
          <li>모임 시간을 정하고 싶은 동호회, 스터디 그룹</li>
          <li>회의 시간을 찾고 있는 프로젝트 팀</li>
          <li>단체 약속 시간을 조율하고 싶은 모든 분</li>
        </ul>
      </div>
    </>
  );
}