'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [title, setTitle] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const router = useRouter();
  
  // 로케일 기반 요일 이름
  const isKorean = typeof navigator !== 'undefined' && navigator.language.startsWith('ko');
  const dayNames = isKorean 
    ? ['일', '월', '화', '수', '목', '금', '토']
    : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // 2초 후 자동으로 메인 화면으로 전환
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDateToggle = (date: string) => {
    setSelectedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const handleMouseDown = (date: string, isDisabled: boolean) => {
    if (isDisabled) return;
    setIsDragging(true);
    setDragStart(date);
    handleDateToggle(date);
  };

  const handleMouseEnter = (date: string, isDisabled: boolean) => {
    if (!isDragging || isDisabled || !dragStart) return;
    
    const startDate = new Date(dragStart);
    const currentDate = new Date(date);
    const minDate = new Date(Math.min(startDate.getTime(), currentDate.getTime()));
    const maxDate = new Date(Math.max(startDate.getTime(), currentDate.getTime()));
    
    const dates: string[] = [];
    const current = new Date(minDate);
    
    while (current <= maxDate) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      if (!isPastDate(current) && !isDateBeyondLimit(current)) {
        dates.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }
    
    setSelectedDates(dates);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
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
        displayName: `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}.`
      });
    }
    
    return months;
  };
  
  const monthsData = generateMonthsData();


  const handleCreateMeeting = async () => {
    if (!title || selectedDates.length === 0) {
      alert('약속 이름과 날짜를 선택해주세요.');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          dates: selectedDates.sort()
        })
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/meeting/${data.meetingId}`);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('미팅 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  if (showSplash) {
    // 스플래시 화면 - 2초간 표시
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-xs text-center">
          <h1 className="text-2xl font-medium mb-2 animate-fade-in">간편한 스케줄링 서비스</h1>
          <h2 className="text-4xl font-bold animate-fade-in animation-delay-200">언제만나?</h2>
        </div>
      </div>
    );
  }

  // 날짜 선택 화면
  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-4">언제만나!</h1>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-2">약속 이름</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 팀 회식, 동창 모임"
                className="w-full px-4 py-3 border rounded-lg outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-sm text-gray-500">아래에서 가능한 날짜들을 선택해주세요. 드래그로 여러 날짜를 한번에 선택할 수 있습니다.</p>
          </div>
        </div>

        <div className="mb-8">
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
                      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dateObj = new Date(year, month, day);
                      const isSelected = selectedDates.includes(date);
                      const isPast = isPastDate(dateObj);
                      const isBeyondLimit = isDateBeyondLimit(dateObj);
                      const isDisabled = isPast || isBeyondLimit;
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
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-500 text-center">
            {selectedDates.length > 0 
              ? `${selectedDates.length}개의 날짜가 선택됨`
              : '날짜를 선택해주세요'}
          </div>
          <button
            onClick={handleCreateMeeting}
            disabled={isCreating || !title || selectedDates.length === 0}
            className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold disabled:bg-gray-300 transition-colors"
          >
            {isCreating ? '생성 중...' : '약속 만들기'}
          </button>
        </div>
      </div>
      
      {/* 우측 상단 물음표 아이콘 */}
      <button className="absolute top-8 right-8">
        <HelpCircle className="w-6 h-6 text-gray-400" />
      </button>
    </div>
  );
}