'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDateToString, isPastDate, getDayName, getMonthDisplayName } from '@/lib/utils/date';

interface DateSelectorProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  disabled?: boolean;
}

export default function DateSelector({ selectedDates, onDatesChange, disabled = false }: DateSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // 로케일 기반 요일 이름
  const locale = typeof navigator !== 'undefined' && navigator.language.startsWith('ko') ? 'ko-KR' : 'en-US';
  const dayNames = Array.from({ length: 7 }, (_, i) => getDayName(i, locale));

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
  
  // 스크롤 가능한 12개월 데이터 생성
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
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">날짜 선택</h3>
        <div className="grid grid-cols-7 gap-1 text-center sticky top-0 bg-white z-10 pb-1">
          {dayNames.map((day, index) => (
            <div key={index} className="text-sm font-bold text-gray-900 py-1">{day}</div>
          ))}
        </div>
      </div>
      
      <div 
        ref={calendarRef}
        className="h-96 overflow-y-auto border rounded-lg p-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {monthsData.map((monthData, monthIndex) => {
          const year = monthData.year;
          const month = monthData.month;
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          
          return (
            <div key={`${year}-${month}`} className="mb-6">
              <h4 className="text-sm font-bold text-gray-700 mb-3 sticky top-0 bg-white py-1">
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
                      onMouseDown={() => handleMouseDown(date, isDisabled)}
                      onMouseEnter={() => handleMouseEnter(date, isDisabled)}
                      disabled={isDisabled}
                      className={`aspect-square rounded-full flex items-center justify-center text-sm transition-all ${
                        isSelected
                          ? 'bg-blue-500 text-white font-medium'
                          : isDisabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : isToday
                          ? 'bg-blue-100 text-blue-600 font-medium hover:bg-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-sm text-gray-500 text-center mt-3">
        {selectedDates.length > 0 
          ? `${selectedDates.length}개의 날짜가 선택됨`
          : '날짜를 선택해주세요'}
      </div>
    </div>
  );
}