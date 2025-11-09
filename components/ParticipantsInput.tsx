'use client';

import { useState, KeyboardEvent } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface ParticipantsInputProps {
  participants: string[];
  onParticipantsChange: (participants: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  countText?: string;
}

export default function ParticipantsInput({
  participants,
  onParticipantsChange,
  disabled = false,
  placeholder,
  label,
  countText
}: ParticipantsInputProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  
  const displayLabel = label || t('landing.participants.label');
  const displayPlaceholder = placeholder || t('landing.participants.placeholder');

  const addParticipants = (input: string) => {
    if (!input.trim()) return;

    // Add multiple participants separated by comma
    const newParticipants = input
      .split(',')
      .map(name => name.trim())
      .filter(name => {
        if (!name) return false;
        if (participants.includes(name)) return false;
        if (name.length > 10) {
          alert(t('landing.participants.nameTooLong'));
          return false;
        }
        return true;
      });

    if (newParticipants.length > 0) {
      onParticipantsChange([...participants, ...newParticipants]);
    }
    setInputValue('');
  };

  const removeParticipant = (participantToRemove: string) => {
    onParticipantsChange(participants.filter(p => p !== participantToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addParticipants(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && participants.length > 0) {
      // Remove last participant when backspace is pressed with empty input
      removeParticipant(participants[participants.length - 1]);
    }
  };

  const handleInputChange = (value: string) => {
    // Automatically add when comma is entered
    if (value.endsWith(',')) {
      const nameToAdd = value.slice(0, -1).trim();
      if (nameToAdd) {
        addParticipants(nameToAdd);
      } else {
        setInputValue(''); // Reset if only comma was entered
      }
    } else {
      setInputValue(value);
    }
  };

  return (
    <div>
      <label className="text-lg font-bold text-gray-800 block mb-4">
        {displayLabel}
        {participants.length > 0 && countText && (
          <span className="ml-2 text-xs font-normal bg-gray-300 text-gray-700 px-2 py-0.5 rounded">
            {countText}
          </span>
        )}
      </label>

      {/* 참여자 칩스 표시 */}
      {participants.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFC354] text-gray-800 rounded-full text-sm font-medium"
            >
              <span>{participant}</span>
              {!disabled && (
                <button
                  onClick={() => removeParticipant(participant)}
                  className="hover:bg-[#FFD580] rounded-full p-0.5 transition-colors"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 입력 필드 */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Use setTimeout to prevent duplicates on blur
            setTimeout(() => {
              if (inputValue.trim()) {
                addParticipants(inputValue);
              }
            }, 100);
          }}
          placeholder={displayPlaceholder}
          disabled={disabled}
          maxLength={10}
          className="w-full px-4 py-3 pr-10 border rounded-lg outline-none focus:border-[#FFC354] disabled:bg-gray-50 disabled:text-gray-500"
        />
        <UserPlus className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
      </div>
    </div>
  );
}