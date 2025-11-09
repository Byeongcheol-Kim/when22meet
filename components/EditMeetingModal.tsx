'use client';

import { X, Link } from 'lucide-react';
import DateSelector from '@/components/DateSelector';
import MeetingTitleInput from '@/components/MeetingTitleInput';
import ParticipantsInput from '@/components/ParticipantsInput';
import { useTranslation } from '@/lib/useTranslation';

interface EditMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setTitle: (value: string) => void;
  participants: string[];
  setParticipants: (value: string[]) => void;
  dates: string[];
  setDates: (value: string[]) => void;
  isUpdating: boolean;
  onUpdate: () => void;
  onShareTemplate: () => void;
}

export default function EditMeetingModal({
  isOpen,
  onClose,
  title,
  setTitle,
  participants,
  setParticipants,
  dates,
  setDates,
  isUpdating,
  onUpdate,
  onShareTemplate,
}: EditMeetingModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('meeting.edit.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <MeetingTitleInput
            value={title}
            onChange={setTitle}
            disabled={isUpdating}
          />
        </div>

        <div className="mb-4">
          <ParticipantsInput
            participants={participants}
            onParticipantsChange={setParticipants}
            disabled={isUpdating}
            label={t('meeting.edit.manageParticipants')}
            placeholder={t('meeting.edit.participantPlaceholder')}
          />
        </div>

        <DateSelector
          selectedDates={dates}
          onDatesChange={setDates}
          disabled={isUpdating}
        />

        {/* 템플릿 URL 공유 버튼 */}
        {(title || participants.length > 0) && (
          <button
            onClick={onShareTemplate}
            className="w-full py-2 mt-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Link className="w-4 h-4" />
            {t('meeting.edit.shareTemplate')}
          </button>
        )}

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onUpdate}
            disabled={isUpdating || dates.length === 0}
            className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold disabled:bg-gray-300 transition-colors"
          >
            {isUpdating ? t('meeting.edit.updating') : t('meeting.edit.updateComplete')}
          </button>
        </div>
      </div>
    </div>
  );
}
