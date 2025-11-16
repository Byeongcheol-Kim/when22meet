'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import { Info, Link2, Calendar } from 'lucide-react';
import DateSelector from '@/components/DateSelector';
import AboutModal from '@/components/AboutModal';
import Toast from '@/components/Toast';
import MeetingTitleInput from '@/components/MeetingTitleInput';
import ParticipantsInput from '@/components/ParticipantsInput';
import { generateDatesFromTemplate, type DateTemplate } from '@/lib/utils/dateTemplates';
import { TEMPLATE_BUTTON_COLORS, BUTTON_COLORS, TEXT_COLORS, SECTION_BADGE_COLORS, DISABLED_COLORS } from '@/lib/constants/colors';

function SEOContent() {
  const { t } = useTranslation();

  return (
    <div className="sr-only">
      <h2>{t('seo.title')}</h2>
      <p>{t('seo.description')}</p>
      <p>{t('seo.features')}</p>
      <p>{t('seo.keywords')}</p>
    </div>
  );
}

function HomeContent() {
  const { t, locale } = useTranslation();
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
  const dateSelectorRef = useRef<{ scrollToToday: () => void }>(null);

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
      // 오늘 날짜로 스크롤
      setTimeout(() => {
        dateSelectorRef.current?.scrollToToday();
      }, 100);
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
        setToastMessage(t('meeting.toast.shareTemplateCopied'));
        setToastType('success');
      } else {
        // Copy original URL if shortening fails
        navigator.clipboard.writeText(url);
        setToastMessage(t('meeting.toast.shareTemplateCopied'));
        setToastType('success');
      }
    } catch (error) {
      console.error('Error copying URL:', error);
      // Copy original URL on error
      const url = generateShareUrl();
      navigator.clipboard.writeText(url);
      setToastMessage(t('meeting.toast.shareTemplateCopied'));
      setToastType('success');
    }
  };

  const handleCreateMeeting = async () => {
    if (!title) {
      setToastMessage(t('landing.alerts.titleRequired'));
      setToastType('warning');
      return;
    }
    if (selectedDates.length === 0) {
      setToastMessage(t('landing.alerts.datesRequired'));
      setToastType('warning');
      return;
    }
    if (participants.length === 0) {
      setToastMessage(t('landing.alerts.participantsRequired'));
      setToastType('warning');
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
          participants: participants,
          locale, // Save user's language preference
        })
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/meeting/${data.meetingId}`);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      setToastMessage(t('landing.alerts.createFailed'));
      setToastType('error');
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
              className={`p-1 ${TEXT_COLORS.muted} hover:${TEXT_COLORS.secondary} transition-colors`}
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
              onError={(message) => {
                setToastMessage(message);
                setToastType('warning');
              }}
            />

            {/* Date Selection */}
            <div>
              {/* Date Selection Title with Count */}
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {t('landing.dateSelection.title')}
                {selectedDates.length > 0 && (
                  <span className={`ml-2 text-xs font-normal ${SECTION_BADGE_COLORS.dates.bg} ${SECTION_BADGE_COLORS.dates.text} px-2 py-0.5 rounded`}>
                    {t('landing.dateSelection.selectedCount').replace('%count%', selectedDates.length.toString())}
                  </span>
                )}
              </h3>

              {/* Quick Date Selection */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTemplateSelect('weekend')}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selectedTemplate === 'weekend'
                        ? `${TEMPLATE_BUTTON_COLORS.selected.bg} ${TEMPLATE_BUTTON_COLORS.selected.text} ${TEMPLATE_BUTTON_COLORS.selected.border}`
                        : `${TEMPLATE_BUTTON_COLORS.default.bg} ${TEMPLATE_BUTTON_COLORS.default.text} ${TEMPLATE_BUTTON_COLORS.default.border} ${TEMPLATE_BUTTON_COLORS.default.hover}`
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t('landing.dateSelection.templates.weekend')}
                  </button>
                  <button
                    onClick={() => handleTemplateSelect('weekday')}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selectedTemplate === 'weekday'
                        ? `${TEMPLATE_BUTTON_COLORS.selected.bg} ${TEMPLATE_BUTTON_COLORS.selected.text} ${TEMPLATE_BUTTON_COLORS.selected.border}`
                        : `${TEMPLATE_BUTTON_COLORS.default.bg} ${TEMPLATE_BUTTON_COLORS.default.text} ${TEMPLATE_BUTTON_COLORS.default.border} ${TEMPLATE_BUTTON_COLORS.default.hover}`
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t('landing.dateSelection.templates.weekday')}
                  </button>
                  <button
                    onClick={() => handleTemplateSelect('fri-sat-sun')}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selectedTemplate === 'fri-sat-sun'
                        ? `${TEMPLATE_BUTTON_COLORS.selected.bg} ${TEMPLATE_BUTTON_COLORS.selected.text} ${TEMPLATE_BUTTON_COLORS.selected.border}`
                        : `${TEMPLATE_BUTTON_COLORS.default.bg} ${TEMPLATE_BUTTON_COLORS.default.text} ${TEMPLATE_BUTTON_COLORS.default.border} ${TEMPLATE_BUTTON_COLORS.default.hover}`
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t('landing.dateSelection.templates.friSatSun')}
                  </button>
                  <button
                    onClick={() => handleTemplateSelect('full')}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selectedTemplate === 'full'
                        ? `${TEMPLATE_BUTTON_COLORS.selected.bg} ${TEMPLATE_BUTTON_COLORS.selected.text} ${TEMPLATE_BUTTON_COLORS.selected.border}`
                        : `${TEMPLATE_BUTTON_COLORS.default.bg} ${TEMPLATE_BUTTON_COLORS.default.text} ${TEMPLATE_BUTTON_COLORS.default.border} ${TEMPLATE_BUTTON_COLORS.default.hover}`
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t('landing.dateSelection.templates.full')}
                  </button>
                </div>
              </div>

              {/* Calendar */}
              <DateSelector
                ref={dateSelectorRef}
                selectedDates={selectedDates}
                onDatesChange={(dates) => {
                  setSelectedDates(dates);
                  setSelectedTemplate(null); // Clear template on manual selection
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCreateMeeting}
            disabled={isCreating}
            className={`w-full py-4 ${
              !title || selectedDates.length === 0 || participants.length === 0
                ? `${DISABLED_COLORS.button.bg} ${DISABLED_COLORS.button.text} ${DISABLED_COLORS.button.cursor}`
                : `${BUTTON_COLORS.primary.bg} ${BUTTON_COLORS.primary.text} ${BUTTON_COLORS.primary.hover}`
            } rounded-xl font-semibold transition-colors`}
          >
            {isCreating ? t('landing.creating') : t('landing.createMeeting')}
          </button>

          {/* Template URL share button */}
          {(title || participants.length > 0 || selectedTemplate) && (
            <button
              onClick={handleCopyShareUrl}
              className={`w-full py-3 ${BUTTON_COLORS.gray.bg} ${BUTTON_COLORS.gray.text} rounded-xl font-medium ${BUTTON_COLORS.gray.hover} transition-colors flex items-center justify-center gap-2`}
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
      <SEOContent />
    </>
  );
}