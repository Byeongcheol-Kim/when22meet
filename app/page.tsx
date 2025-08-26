'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/useTranslation';
import { Info, Link2, Calendar, Check } from 'lucide-react';
import DateSelector from '@/components/DateSelector';
import AboutModal from '@/components/AboutModal';
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
  const [showShareUrl, setShowShareUrl] = useState(false);
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
        setShowShareUrl(true);
        setTimeout(() => setShowShareUrl(false), 1500);
      } else {
        // Copy original URL if shortening fails
        navigator.clipboard.writeText(url);
        setShowShareUrl(true);
        setTimeout(() => setShowShareUrl(false), 1500);
      }
    } catch (error) {
      console.error('Error copying URL:', error);
      // Copy original URL on error
      const url = generateShareUrl();
      navigator.clipboard.writeText(url);
      setShowShareUrl(true);
      setTimeout(() => setShowShareUrl(false), 1500);
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
          <h1 className="text-xl font-bold mb-4">{t('landing.title')}</h1>
          
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
              {showShareUrl && (
                <Check className="w-4 h-4 text-green-500 ml-1" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Info icon at top right */}
      <button
        onClick={() => setShowHelpModal(true)}
        className="fixed top-4 right-16 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-40"
      >
        <Info className="w-5 h-5 text-gray-600" />
      </button>

      {showHelpModal && (
        <AboutModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>}>
      <HomeContent />
    </Suspense>
  );
}