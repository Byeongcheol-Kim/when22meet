'use client';

import { useTranslation } from '@/lib/useTranslation';

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
    if (newValue.length <= 10) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <label className="text-sm text-gray-800 font-medium block mb-2">
        {displayLabel}
        <span className="ml-2 text-xs text-gray-500">({value.length}/10)</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={displayPlaceholder}
        disabled={disabled}
        maxLength={10}
        className="w-full px-4 py-3 border rounded-lg outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
}