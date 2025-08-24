'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Meeting, Availability } from '@/lib/types';
import { Plus } from 'lucide-react';

type ParticipantStatus = 'available' | 'unavailable' | 'undecided';

interface GridCell {
  type: 'header-corner' | 'header-participant' | 'date' | 'status' | 'month-separator' | 'add-input';
  content?: string;
  date?: string;
  participant?: string;
  status?: ParticipantStatus;
  month?: string;
}

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState('');
  const [lockedParticipants, setLockedParticipants] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMeetingData();
  }, [resolvedParams.id]);
  
  // 초기 월 설정
  useEffect(() => {
    if (meeting && meeting.dates.length > 0 && !currentMonth) {
      const firstDate = new Date(meeting.dates[0] + 'T00:00:00');
      setCurrentMonth(`${firstDate.getFullYear()}.${String(firstDate.getMonth() + 1).padStart(2, '0')}`);
    }
  }, [meeting]);

  const fetchMeetingData = async () => {
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Meeting not found');
      }
      const data = await response.json();
      setMeeting(data.meeting);
      setAvailabilities(data.availabilities);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      alert('미팅을 찾을 수 없습니다.');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: newParticipantName.trim(),
          availableDates: []
        })
      });

      if (response.ok) {
        await fetchMeetingData();
        setNewParticipantName('');
        setShowAddInput(false);
        // 새 참여자는 기본적으로 편집 가능 상태 (잠기지 않음)
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('참가자 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusClick = async (participant: string, date: string, currentStatus: ParticipantStatus) => {
    // 상태 순환: 미정 -> 참여 -> 불참 -> 미정
    let newStatus: ParticipantStatus;
    if (currentStatus === 'undecided') {
      newStatus = 'available';
    } else if (currentStatus === 'available') {
      newStatus = 'unavailable';
    } else {
      newStatus = 'undecided';
    }

    // 현재 참여자의 availability 찾기
    const currentAvailability = availabilities.find(a => a.participantName === participant);
    const currentAvailableDates = currentAvailability?.availableDates || [];
    const currentUnavailableDates = currentAvailability?.unavailableDates || [];
    
    // Optimistic UI - 즉시 상태 업데이트
    const optimisticAvailabilities = availabilities.map(a => {
      if (a.participantName === participant) {
        let newAvailableDates = [...currentAvailableDates];
        let newUnavailableDates = [...currentUnavailableDates];
        
        // Remove from all lists first
        newAvailableDates = newAvailableDates.filter(d => d !== date);
        newUnavailableDates = newUnavailableDates.filter(d => d !== date);
        
        // Add to appropriate list
        if (newStatus === 'available') {
          newAvailableDates.push(date);
        } else if (newStatus === 'unavailable') {
          newUnavailableDates.push(date);
        }
        
        return {
          ...a,
          availableDates: newAvailableDates,
          unavailableDates: newUnavailableDates
        };
      }
      return a;
    });
    
    // Optimistic update
    setAvailabilities(optimisticAvailabilities);
    
    // Calculate final dates for API
    let newAvailableDates = [...currentAvailableDates];
    newAvailableDates = newAvailableDates.filter(d => d !== date);
    if (newStatus === 'available') {
      newAvailableDates.push(date);
    }

    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: participant,
          availableDates: newAvailableDates,
          unavailableDates: newStatus === 'unavailable' ? [date] : [],
          statusUpdate: { date, status: newStatus }
        })
      });

      if (!response.ok) {
        // Rollback on error
        await fetchMeetingData();
        alert('상태 업데이트에 실패했습니다. 다시 시도해주세요.');
      }
      // Success - keep optimistic update
    } catch (error) {
      console.error('Error updating status:', error);
      // Rollback on error
      await fetchMeetingData();
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current || !meeting) return;
    
    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const rowHeight = 56; // 대략적인 행 높이
    
    // 스크롤 위치로 현재 보이는 날짜 인덱스 계산
    const visibleIndex = Math.floor((scrollTop + 40) / rowHeight); // 헤더 높이 40px 고려
    const dateIndex = Math.max(0, Math.min(visibleIndex - 1, meeting.dates.length - 1)); // 월 구분 행 고려
    
    if (meeting.dates[dateIndex]) {
      const date = new Date(meeting.dates[dateIndex] + 'T00:00:00');
      const month = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (month !== currentMonth) {
        setCurrentMonth(month);
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollHandler = () => {
        handleScroll();
      };
      
      container.addEventListener('scroll', scrollHandler);
      // 초기값 설정
      setTimeout(() => handleScroll(), 100);
      
      return () => {
        container.removeEventListener('scroll', scrollHandler);
      };
    }
  }, [meeting, availabilities, currentMonth]); // currentMonth 의존성 추가

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!meeting) return null;

  // 그리드 데이터 생성
  const buildGridData = () => {
    const allParticipants = Array.from(new Set(availabilities.map(a => a.participantName)));
    const gridData: GridCell[][] = [];
    
    // 첫 번째 날짜의 월을 기본값으로 사용
    let defaultYear = '';
    let defaultMonth = '';
    if (meeting.dates.length > 0) {
      const firstDate = new Date(meeting.dates[0] + 'T00:00:00');
      defaultYear = String(firstDate.getFullYear());
      defaultMonth = String(firstDate.getMonth() + 1).padStart(2, '0');
    }
    
    // 현재 월 파싱
    const [currentYear, currentMonthOnly] = currentMonth ? currentMonth.split('.') : [defaultYear, defaultMonth];
    
    // 헤더 행 생성
    const headerRow: GridCell[] = [
      { type: 'header-corner', content: `${currentYear || defaultYear}\n${currentMonthOnly || defaultMonth}` }
    ];
    
    // 참여자 헤더 추가
    allParticipants.forEach(name => {
      headerRow.push({ type: 'header-participant', content: name, participant: name });
    });
    
    gridData.push(headerRow);
    
    // 날짜별 행 생성
    let lastMonth = '';
    meeting.dates.forEach((date, index) => {
      const dateObj = new Date(date + 'T00:00:00');
      const currentMonth = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      
      // 월이 바뀌면 구분선 추가
      if (lastMonth && lastMonth !== currentMonth) {
        const [year, month] = currentMonth.split('.');
        const separatorRow: GridCell[] = [
          { type: 'month-separator', content: `${year}\n${month}`, month: currentMonth }
        ];
        // 참여자 수만큼 빈 셀 추가
        for (let i = 0; i < allParticipants.length; i++) {
          separatorRow.push({ type: 'month-separator' });
        }
        gridData.push(separatorRow);
      }
      lastMonth = currentMonth;
      
      // 날짜 행 생성
      const dateRow: GridCell[] = [
        { 
          type: 'date', 
          content: `${dateObj.getDate()} ${dayNames[dateObj.getDay()]}`,
          date: date,
          month: currentMonth
        }
      ];
      
      // 각 참여자의 상태 추가
      allParticipants.forEach(name => {
        const availability = availabilities.find(a => a.participantName === name);
        let status: ParticipantStatus;
        
        if (!availability) {
          // 새로 추가된 참여자
          status = 'undecided';
        } else if (availability.availableDates.includes(date)) {
          // 참여 가능
          status = 'available';
        } else if (availability.unavailableDates?.includes(date)) {
          // 명시적으로 불참
          status = 'unavailable';
        } else {
          // 미정 (아직 선택하지 않음)
          status = 'undecided';
        }
        
        dateRow.push({
          type: 'status',
          status,
          participant: name,
          date: date
        });
      });
      
      gridData.push(dateRow);
    });
    
    return gridData;
  };

  const gridData = buildGridData();
  const allParticipants = Array.from(new Set(availabilities.map(a => a.participantName)));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 정보 영역 - 이 부분은 스크롤되지 않음 */}
      <div className="flex-shrink-0 bg-gray-50">
        <div className="flex">
          <div className="bg-black" style={{ minWidth: '50px', maxWidth: 'min-content' }}></div>
          <div className="flex-1 px-4 py-2 flex items-center justify-between">
            <span className="text-base font-bold text-gray-800">전체 참여자 {availabilities.length}</span>
            <div className="flex items-center gap-2">
            {showAddInput ? (
              <>
                <input
                  type="text"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSubmitting) {
                      handleAddParticipant();
                    } else if (e.key === 'Escape') {
                      setShowAddInput(false);
                      setNewParticipantName('');
                    }
                  }}
                  placeholder="이름 입력"
                  className="w-28 px-2 py-1 text-sm border border-gray-200 rounded-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  autoFocus
                />
                <button
                  onClick={handleAddParticipant}
                  disabled={isSubmitting || !newParticipantName.trim()}
                  className="px-3 py-1 text-sm bg-[#6B7280] text-white rounded-md disabled:bg-gray-300 hover:bg-gray-700 transition-colors"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setShowAddInput(false);
                    setNewParticipantName('');
                  }}
                  className="px-2 py-1 text-sm text-gray-600"
                >
                  취소
                </button>
              </>
            ) : (
              <button 
                onClick={() => setShowAddInput(true)}
                className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
              >
                추가 <Plus className="w-4 h-4" />
              </button>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid 컨테이너 */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-auto"
        >
          <div 
            className="meeting-grid-container"
            style={{
              gridTemplateColumns: `minmax(50px, min-content) ${allParticipants.map(() => '90px').join(' ')}`
            }}
          >
          {gridData.map((row, rowIndex) => (
            row.map((cell, colIndex) => {
              // 월 구분선
              if (cell.type === 'month-separator') {
                if (colIndex === 0) {
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="px-2 py-1 bg-black"
                      style={{ position: 'sticky', left: 0, zIndex: 10 }}
                    >
                      <div className="flex flex-col items-end justify-center">
                        <span className="text-xs font-medium text-yellow-400">{cell.content?.split('\n')[0]}</span>
                        <span className="text-sm font-bold text-yellow-400">{cell.content?.split('\n')[1]}</span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="bg-gray-50"
                    />
                  );
                }
              }
              
              // 헤더 코너 (날짜/참여자 교차점)
              if (cell.type === 'header-corner') {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="px-2 py-1 bg-black"
                    style={{ position: 'sticky', top: 0, left: 0, zIndex: 30 }}
                  >
                    <div className="flex flex-col items-end justify-center">
                      <span className="text-xs font-medium text-yellow-400">{cell.content?.split('\n')[0]}</span>
                      <span className="text-sm font-bold text-yellow-400">{cell.content?.split('\n')[1]}</span>
                    </div>
                  </div>
                );
              }
              
              // 참여자 헤더
              if (cell.type === 'header-participant') {
                const isLocked = lockedParticipants.has(cell.participant || '');
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`px-2 py-1 text-center text-sm font-bold ${
                      isLocked ? 'bg-gray-50' : 'bg-white'
                    }`}
                    style={{ position: 'sticky', top: 0, zIndex: 20 }}
                  >
                    <button
                      onClick={() => {
                        const participant = cell.participant || '';
                        setLockedParticipants(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(participant)) {
                            newSet.delete(participant);
                          } else {
                            newSet.add(participant);
                          }
                          return newSet;
                        });
                      }}
                      className={`w-full ${
                        isLocked ? 'text-gray-500' : 'text-gray-800 hover:text-blue-500 transition-colors'
                      }`}
                    >
                      {cell.content}
                      {isLocked && <span className="ml-1 text-xs">✓</span>}
                    </button>
                  </div>
                );
              }
              
              // 날짜 셀
              if (cell.type === 'date') {
                const dateObj = new Date(cell.date + 'T00:00:00');
                const dayNumber = String(dateObj.getDate()).padStart(2, '0');
                const dayOfWeek = cell.content?.split(' ')[1];
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="px-2 py-1.5 bg-black"
                    style={{ position: 'sticky', left: 0, zIndex: 10 }}
                    data-date-row
                    data-month={cell.month}
                  >
                    <div className="flex flex-col items-end justify-center">
                      <span className="text-[10px] text-white">{dayOfWeek}</span>
                      <span className="text-lg font-black text-white leading-tight">{dayNumber}</span>
                    </div>
                  </div>
                );
              }
              
              // 상태 셀
              if (cell.type === 'status') {
                const isLocked = lockedParticipants.has(cell.participant || '');
                const isEditable = !isLocked;
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="px-2 py-2 bg-white"
                  >
                    <button
                      onClick={() => {
                        if (isEditable && cell.participant && cell.date) {
                          handleStatusClick(cell.participant, cell.date, cell.status!);
                        }
                      }}
                      disabled={!isEditable}
                      className={`
                        w-full h-10 rounded-md flex items-center justify-center text-sm font-medium transition-all shadow-sm
                        ${cell.status === 'available' ? 'bg-[#FFC354] text-gray-800' : 
                          cell.status === 'unavailable' ? 'bg-[#6B7280] text-white' : 
                          'bg-gray-50 text-gray-400 border border-gray-200'}
                        ${isEditable ? 'cursor-pointer hover:shadow-md hover:scale-105' : 'cursor-default opacity-60'}
                      `}
                    >
                      {cell.status === 'available' ? '참여' : 
                       cell.status === 'unavailable' ? '불참' : '미정'}
                    </button>
                  </div>
                );
              }
              
              return null;
            })
          ))}
          </div>
        </div>
      </div>

    </div>
  );
}