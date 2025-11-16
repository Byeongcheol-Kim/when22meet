'use client';

import { X } from 'lucide-react';
import DateSelector from '@/components/DateSelector';
import MeetingTitleInput from '@/components/MeetingTitleInput';
import ParticipantsInput from '@/components/ParticipantsInput';
import { useTranslation } from '@/lib/useTranslation';
import { MODAL_COLORS, BUTTON_COLORS, TEXT_COLORS, SECTION_BADGE_COLORS, DISABLED_COLORS } from '@/lib/constants/colors';

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
  onShareTemplate?: () => void;
  onShowToast?: (message: string, type: 'warning' | 'error' | 'success' | 'info') => void;
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
  onShowToast,
}: EditMeetingModalProps) {
  const { t } = useTranslation();

  const handleUpdate = () => {
    if (!title) {
      onShowToast?.(t('landing.alerts.titleRequired'), 'warning');
      return;
    }
    if (dates.length === 0) {
      onShowToast?.(t('landing.alerts.datesRequired'), 'warning');
      return;
    }
    if (participants.length === 0) {
      onShowToast?.(t('landing.alerts.participantsRequired'), 'warning');
      return;
    }
    onUpdate();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${MODAL_COLORS.overlay} flex items-center justify-center z-50 px-4`}>
      <div className={`${MODAL_COLORS.background} rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${MODAL_COLORS.header}`}>{t('meeting.edit.title')}</h2>
          <button
            onClick={onClose}
            className={`${MODAL_COLORS.close.text} ${MODAL_COLORS.close.hover} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <MeetingTitleInput
            value={title}
            onChange={setTitle}
            disabled={isUpdating}
          />

          <ParticipantsInput
            participants={participants}
            onParticipantsChange={setParticipants}
            disabled={isUpdating}
            label={t('meeting.edit.manageParticipants')}
            placeholder={t('meeting.edit.participantPlaceholder')}
            countText={participants.length > 0 ? t('landing.participants.count').replace('%count%', participants.length.toString()) : undefined}
          />

          <div>
            <h3 className={`text-lg font-bold ${TEXT_COLORS.primary} mb-4`}>
              {t('meeting.edit.dateSelection')}
              {dates.length > 0 && (
                <span className={`ml-2 text-xs font-normal ${SECTION_BADGE_COLORS.dates.bg} ${SECTION_BADGE_COLORS.dates.text} px-2 py-0.5 rounded`}>
                  {t('landing.dateSelection.selectedCount').replace('%count%', dates.length.toString())}
                </span>
              )}
            </h3>
            <DateSelector
              selectedDates={dates}
              onDatesChange={setDates}
              disabled={isUpdating}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className={`flex-1 py-3 ${BUTTON_COLORS.secondary.bg} ${BUTTON_COLORS.secondary.text} rounded-xl font-semibold ${BUTTON_COLORS.secondary.hover} transition-colors`}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className={`flex-1 py-3 ${
              !title || dates.length === 0 || participants.length === 0
                ? `${DISABLED_COLORS.button.bg} ${DISABLED_COLORS.button.text} ${DISABLED_COLORS.button.cursor}`
                : `${BUTTON_COLORS.primary.bg} ${BUTTON_COLORS.primary.text} ${BUTTON_COLORS.primary.hover}`
            } rounded-xl font-semibold transition-colors`}
          >
            {isUpdating ? t('meeting.edit.updating') : t('meeting.edit.updateComplete')}
          </button>
        </div>
      </div>
    </div>
  );
}
