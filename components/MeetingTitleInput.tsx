'use client';

import { useTranslation } from '@/lib/useTranslation';
import { SECTION_BADGE_COLORS, INPUT_COLORS, TEXT_COLORS, DISABLED_COLORS } from '@/lib/constants/colors';

interface MeetingTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export default function MeetingTitleInput({ 
  value, 
  onChange, 
  placeholder,
  disabled = false,
  label
}: MeetingTitleInputProps) {
  const { t } = useTranslation();
  
  const displayLabel = label || t('landing.meetingTitle.label');
  const displayPlaceholder = placeholder || t('landing.meetingTitle.placeholder');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 20) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <label className={`text-lg font-bold ${TEXT_COLORS.primary} block mb-4`}>
        {displayLabel}
        <span className={`ml-2 text-xs font-normal ${SECTION_BADGE_COLORS.title.bg} ${SECTION_BADGE_COLORS.title.text} px-2 py-0.5 rounded`}>
          ({value.length}/20)
        </span>
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={displayPlaceholder}
        disabled={disabled}
        maxLength={20}
        className={`w-full px-4 py-3 border rounded-lg outline-none ${INPUT_COLORS.focusPrimary} disabled:${DISABLED_COLORS.input.bg} disabled:${DISABLED_COLORS.input.text}`}
      />
    </div>
  );
}