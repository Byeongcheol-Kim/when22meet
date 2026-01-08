'use client';

import { useMemo } from 'react';
import { TIME_SLOTS, TIME_SLOT_SHORTCUTS, TimeSlotValue } from '@/lib/types';
import { TIME_SLOT_COLORS } from '@/lib/constants/colors';
import { useTranslation } from '@/lib/useTranslation';

interface TimeSlotSelectorProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  selectedSlots: TimeSlotValue[];
  onSlotsChange: (slots: TimeSlotValue[]) => void;
  consecutiveSlotCount?: number;
  onConsecutiveSlotCountChange?: (count: number) => void;
  disabled?: boolean;
}

export default function TimeSlotSelector({
  enabled,
  onEnabledChange,
  selectedSlots,
  onSlotsChange,
  consecutiveSlotCount = 1,
  onConsecutiveSlotCountChange,
  disabled = false,
}: TimeSlotSelectorProps) {
  const { t, locale } = useTranslation();

  const handleToggle = () => {
    if (disabled) return;
    const newEnabled = !enabled;
    onEnabledChange(newEnabled);
    // 비활성화할 때 선택된 시간대 초기화
    if (!newEnabled) {
      onSlotsChange([]);
    }
  };

  const handleSlotToggle = (slotValue: TimeSlotValue) => {
    if (disabled || !enabled) return;

    if (selectedSlots.includes(slotValue)) {
      onSlotsChange(selectedSlots.filter((s) => s !== slotValue));
    } else {
      // 정렬된 순서로 추가
      const newSlots = [...selectedSlots, slotValue].sort();
      onSlotsChange(newSlots);
    }
  };

  const handleShortcutClick = (shortcutSlots: readonly string[]) => {
    if (disabled || !enabled) return;

    const slots = shortcutSlots as unknown as TimeSlotValue[];
    const allSelected = slots.every((slot) => selectedSlots.includes(slot));

    if (allSelected) {
      // 모두 선택되어 있으면 해제
      onSlotsChange(selectedSlots.filter((s) => !slots.includes(s)));
    } else {
      // 하나라도 선택 안 되어 있으면 모두 선택
      const newSlots = [...new Set([...selectedSlots, ...slots])].sort();
      onSlotsChange(newSlots);
    }
  };

  const isShortcutSelected = (shortcutSlots: readonly string[]) => {
    return shortcutSlots.every((slot) => selectedSlots.includes(slot));
  };

  const isShortcutPartial = (shortcutSlots: readonly string[]) => {
    const selectedCount = shortcutSlots.filter((slot) =>
      selectedSlots.includes(slot)
    ).length;
    return selectedCount > 0 && selectedCount < shortcutSlots.length;
  };

  const getShortcutLabel = (shortcut: (typeof TIME_SLOT_SHORTCUTS)[number]) => {
    return locale === 'en' ? shortcut.labelEn : shortcut.label;
  };

  // 선택된 시간대 개수 표시
  const selectedCount = selectedSlots.length;

  // 시간대를 시간별로 그룹화 (0-5, 6-11, 12-17, 18-23)
  const timeGroups = useMemo(() => {
    return [
      { label: '00:00-05:30', labelEn: '12AM-5:30AM', slots: TIME_SLOTS.slice(0, 12) },
      { label: '06:00-11:30', labelEn: '6AM-11:30AM', slots: TIME_SLOTS.slice(12, 24) },
      { label: '12:00-17:30', labelEn: '12PM-5:30PM', slots: TIME_SLOTS.slice(24, 36) },
      { label: '18:00-23:30', labelEn: '6PM-11:30PM', slots: TIME_SLOTS.slice(36, 48) },
    ];
  }, []);

  return (
    <div className="space-y-3">
      {/* 토글 스위치 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${TIME_SLOT_COLORS.label.text}`}>
            {t('timeSlot.toggle')}
          </span>
          <span className="text-xs text-gray-500">
            {t('timeSlot.toggleDescription')}
          </span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
          } ${
            enabled
              ? TIME_SLOT_COLORS.toggle.enabled.bg
              : TIME_SLOT_COLORS.toggle.disabled.bg
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
              TIME_SLOT_COLORS.toggle.enabled.dot
            } ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      {/* 시간대 선택 UI */}
      {enabled && (
        <div className="space-y-4 animate-fade-in">
          {/* 숏컷 버튼들 */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500 font-medium">
              {t('timeSlot.shortcuts')}
            </span>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOT_SHORTCUTS.map((shortcut) => {
                const isSelected = isShortcutSelected(shortcut.slots);
                const isPartial = isShortcutPartial(shortcut.slots);

                return (
                  <button
                    key={shortcut.id}
                    type="button"
                    onClick={() => handleShortcutClick(shortcut.slots)}
                    disabled={disabled}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? `${TIME_SLOT_COLORS.chip.selected.bg} ${TIME_SLOT_COLORS.chip.selected.text} ${TIME_SLOT_COLORS.chip.selected.border}`
                        : isPartial
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          : `${TIME_SLOT_COLORS.chip.default.bg} ${TIME_SLOT_COLORS.chip.default.text} ${TIME_SLOT_COLORS.chip.default.border} ${TIME_SLOT_COLORS.chip.default.hover}`
                    } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    title={shortcut.description}
                  >
                    {getShortcutLabel(shortcut)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 30분 단위 시간 선택 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                {t('timeSlot.selectSlots')}
              </span>
              {selectedCount > 0 && (
                <span className="text-xs text-gray-400">
                  {t('timeSlot.selectedCount').replace('{count}', String(selectedCount))}
                </span>
              )}
            </div>

            {/* 시간대 그리드 */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {timeGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {locale === 'en' ? group.labelEn : group.label}
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {group.slots.map((slot) => {
                      const isSelected = selectedSlots.includes(slot.value);
                      // 시간만 간단히 표시 (예: "09:00", "09:30")
                      const shortLabel = slot.value;

                      return (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => handleSlotToggle(slot.value)}
                          disabled={disabled}
                          className={`px-2 py-1 text-xs rounded border transition-all duration-150 ${
                            isSelected
                              ? `${TIME_SLOT_COLORS.chip.selected.bg} ${TIME_SLOT_COLORS.chip.selected.text} ${TIME_SLOT_COLORS.chip.selected.border} font-medium`
                              : `${TIME_SLOT_COLORS.chip.default.bg} ${TIME_SLOT_COLORS.chip.default.text} ${TIME_SLOT_COLORS.chip.default.border} ${TIME_SLOT_COLORS.chip.default.hover}`
                          } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                          {shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 연속 시간대 개수 설정 */}
          {selectedSlots.length >= 2 && onConsecutiveSlotCountChange && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">
                    {t('timeSlot.consecutiveCount')}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {t('timeSlot.consecutiveCountDescription')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onConsecutiveSlotCountChange(Math.max(1, consecutiveSlotCount - 1))}
                    disabled={disabled || consecutiveSlotCount <= 1}
                    className={`w-7 h-7 rounded border flex items-center justify-center text-sm font-medium ${
                      consecutiveSlotCount <= 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{consecutiveSlotCount}</span>
                  <button
                    type="button"
                    onClick={() => onConsecutiveSlotCountChange(Math.min(selectedSlots.length, consecutiveSlotCount + 1))}
                    disabled={disabled || consecutiveSlotCount >= selectedSlots.length}
                    className={`w-7 h-7 rounded border flex items-center justify-center text-sm font-medium ${
                      consecutiveSlotCount >= selectedSlots.length
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              {consecutiveSlotCount > 1 && (
                <p className="text-[10px] text-blue-600">
                  {t('timeSlot.consecutiveHint').replace('{count}', String(consecutiveSlotCount))}
                </p>
              )}
            </div>
          )}

          {enabled && selectedSlots.length === 0 && (
            <p className="text-xs text-orange-500">
              {t('timeSlot.selectAtLeastOne')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
