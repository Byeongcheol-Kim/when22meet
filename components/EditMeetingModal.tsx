'use client';

import { X } from 'lucide-react';
import DateSelector from '@/components/DateSelector';
import MeetingTitleInput from '@/components/MeetingTitleInput';
import ParticipantsInput from '@/components/ParticipantsInput';
import { useTranslation } from '@/lib/useTranslation';
import { MODAL_COLORS, BUTTON_COLORS, TEXT_COLORS, SECTION_BADGE_COLORS, DISABLED_COLORS } from '@/lib/constants/colors';
import { TimeSlotValue } from '@/lib/types';

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
  // 시간대 관련 props
  hasTimeSlots?: boolean;
  timeSlots?: TimeSlotValue[];
  consecutiveSlotCount?: number;
  onConsecutiveSlotCountChange?: (count: number) => void;
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
  hasTimeSlots,
  timeSlots,
  consecutiveSlotCount = 1,
  onConsecutiveSlotCountChange,
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

          {/* 미팅 시간 설정 (시간대 모드일 때만 표시) */}
          {hasTimeSlots && timeSlots && timeSlots.length >= 2 && onConsecutiveSlotCountChange && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {t('timeSlot.meetingDuration')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t('timeSlot.meetingDurationDescription')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onConsecutiveSlotCountChange(Math.max(1, consecutiveSlotCount - 1))}
                    disabled={isUpdating || consecutiveSlotCount <= 1}
                    className={`w-7 h-7 rounded border flex items-center justify-center text-sm font-medium ${
                      consecutiveSlotCount <= 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold">
                    {t('timeSlot.minutes').replace('{minutes}', String(consecutiveSlotCount * 30))}
                  </span>
                  <button
                    type="button"
                    onClick={() => onConsecutiveSlotCountChange(Math.min(timeSlots.length, consecutiveSlotCount + 1))}
                    disabled={isUpdating || consecutiveSlotCount >= timeSlots.length}
                    className={`w-7 h-7 rounded border flex items-center justify-center text-sm font-medium ${
                      consecutiveSlotCount >= timeSlots.length
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              {consecutiveSlotCount > 1 && (
                <p className="text-xs text-blue-600 mt-2">
                  {t('timeSlot.meetingDurationHint').replace('{minutes}', String(consecutiveSlotCount * 30))}
                </p>
              )}
            </div>
          )}
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
