'use client';

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { formatDateToString, isPastDate, getDayName, getMonthDisplayName } from '@/lib/utils/date';
import { useTranslation } from '@/lib/useTranslation';
import { DATE_SELECTOR_COLORS } from '@/lib/constants/colors';

interface DateSelectorProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  disabled?: boolean;
  title?: string;
}

export interface DateSelectorRef {
  scrollToToday: () => void;
}

const DateSelector = forwardRef<DateSelectorRef, DateSelectorProps>(({ selectedDates, onDatesChange, disabled = false, title }, ref) => {
  const { locale } = useTranslation();
  const todayLabel = locale === 'ko' ? '오늘' : 'Today';
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToToday: () => {
      if (calendarRef.current) {
        const today = new Date();
        const todayString = formatDateToString(today);
        const todayElement = calendarRef.current.querySelector(`[data-date="${todayString}"]`);
        if (todayElement) {
          todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // 오늘이 없으면 맨 위로
          calendarRef.current.scrollTop = 0;
        }
      }
    }
  }));
  
  // Locale-based day names
  const localeCode = locale === 'ko' ? 'ko-KR' : 'en-US';
  const dayNames = Array.from({ length: 7 }, (_, i) => getDayName(i, localeCode));

  const handleDateToggle = (date: string) => {
    if (disabled) return;
    const newDates = selectedDates.includes(date) 
      ? selectedDates.filter(d => d !== date)
      : [...selectedDates, date];
    onDatesChange(newDates);
  };

  const handleMouseDown = (date: string, isDisabled: boolean) => {
    if (isDisabled || disabled) return;
    setIsDragging(true);
    setDragStart(date);
    handleDateToggle(date);
  };

  const handleMouseEnter = (date: string, isDisabled: boolean) => {
    if (!isDragging || isDisabled || !dragStart || disabled) return;
    
    const startDate = new Date(dragStart);
    const currentDate = new Date(date);
    const minDate = new Date(Math.min(startDate.getTime(), currentDate.getTime()));
    const maxDate = new Date(Math.max(startDate.getTime(), currentDate.getTime()));
    
    const dates: string[] = [];
    const current = new Date(minDate);
    
    while (current <= maxDate) {
      const dateStr = formatDateToString(current);
      if (!isPastDate(current) && !isDateBeyondLimit(current)) {
        dates.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }
    
    onDatesChange(dates);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  
  const isDateBeyondLimit = (date: Date) => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 12);
    return date > maxDate;
  };
  
  // Generate scrollable 12-month data
  const generateMonthsData = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        displayName: getMonthDisplayName(date.getFullYear(), date.getMonth())
      });
    }
    
    return months;
  };
  
  const monthsData = generateMonthsData();

  return (
    <div>
      {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-1 text-center bg-black py-2">
          {dayNames.map((day, index) => {
            const dayColor = index === 0 ? DATE_SELECTOR_COLORS.header.sunday :
                           index === 6 ? DATE_SELECTOR_COLORS.header.saturday :
                           DATE_SELECTOR_COLORS.header.weekday;
            return (
              <div key={index} className={`text-sm font-bold ${dayColor}`}>{day}</div>
            );
          })}
        </div>
        <div
          ref={calendarRef}
          className="h-96 overflow-y-auto px-2 pb-2"
          style={{ scrollbarWidth: 'thin' }}
        >
        {monthsData.map((monthData, monthIndex) => {
          const year = monthData.year;
          const month = monthData.month;
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          return (
            <div key={`${year}-${month}`} className={monthIndex > 0 ? 'mt-6' : 'mt-2'}>
              <h4 className="text-sm font-bold text-gray-900 mb-3 sticky top-0 bg-white py-2 z-10">
                {monthData.displayName}
              </h4>
              <div className="grid grid-cols-7 gap-1 select-none">
                {/* Empty cells for padding */}
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${monthIndex}-${i}`} className="aspect-square" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(year, month, day);
                  const date = formatDateToString(dateObj);
                  const isSelected = selectedDates.includes(date);
                  const isPast = isPastDate(dateObj);
                  const isBeyondLimit = isDateBeyondLimit(dateObj);
                  const isDisabled = isPast || isBeyondLimit || disabled;
                  const isToday = dateObj.toDateString() === new Date().toDateString();
                  
                  return (
                    <button
                      key={day}
                      data-date={date}
                      onMouseDown={() => handleMouseDown(date, isDisabled)}
                      onMouseEnter={() => handleMouseEnter(date, isDisabled)}
                      disabled={isDisabled}
                      className={`aspect-square rounded-full flex flex-col items-center justify-center text-sm transition-all relative ${
                        isSelected
                          ? `${DATE_SELECTOR_COLORS.selected.bg} ${DATE_SELECTOR_COLORS.selected.text} font-medium`
                          : isDisabled
                          ? `${DATE_SELECTOR_COLORS.disabled.text} ${DATE_SELECTOR_COLORS.disabled.cursor}`
                          : isToday
                          ? `${DATE_SELECTOR_COLORS.today.bg} ${DATE_SELECTOR_COLORS.today.text} font-medium ${DATE_SELECTOR_COLORS.today.hover}`
                          : `${DATE_SELECTOR_COLORS.default.text} ${DATE_SELECTOR_COLORS.default.hover}`
                      }`}
                    >
                      {isToday && !isDisabled && (
                        <span className="absolute top-1 bg-black text-white text-[9px] px-1 py-0.5 rounded leading-none font-medium">
                          {todayLabel}
                        </span>
                      )}
                      <span className={isToday && !isDisabled ? 'mt-1' : ''}>
                        {day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
});

DateSelector.displayName = 'DateSelector';

export default DateSelector;