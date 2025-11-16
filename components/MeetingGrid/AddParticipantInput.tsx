'use client';

import { memo } from 'react';
import { Plus } from 'lucide-react';

interface AddParticipantInputProps {
  showInput: boolean;
  inputValue: string;
  isSubmitting: boolean;
  onShowInput: () => void;
  onHideInput: () => void;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  t: (key: string) => string;
}

export const AddParticipantInput = memo(function AddParticipantInput({
  showInput,
  inputValue,
  isSubmitting,
  onShowInput,
  onHideInput,
  onInputChange,
  onSubmit,
  t,
}: AddParticipantInputProps) {
  if (showInput) {
    return (
      <>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isSubmitting) {
              onSubmit();
            } else if (e.key === 'Escape') {
              onHideInput();
            }
          }}
          placeholder={t('meeting.enterName')}
          maxLength={10}
          className="w-28 px-2 py-1 text-sm border border-gray-200 rounded-md outline-none focus:border-[#FFC354] focus:ring-1 focus:ring-yellow-100"
          autoFocus
        />
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !inputValue.trim()}
          className="px-3 py-1 text-sm bg-[#6B7280] text-white rounded-md disabled:bg-gray-300 hover:bg-gray-700 transition-colors"
        >
          {t('common.add')}
        </button>
        <button
          onClick={onHideInput}
          className="px-2 py-1 text-sm text-gray-600"
        >
          {t('common.cancel')}
        </button>
      </>
    );
  }

  return (
    <button
      onClick={onShowInput}
      className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
    >
      {t('common.add')} <Plus className="w-4 h-4" />
    </button>
  );
});
