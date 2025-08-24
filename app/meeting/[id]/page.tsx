'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Meeting, Availability } from '@/lib/types';
import { Plus, Link, PlusCircle, Info, X, Menu, Calendar } from 'lucide-react';
import DateSelector from '@/components/DateSelector';
import AboutModal from '@/components/AboutModal';
import MeetingTitleInput from '@/components/MeetingTitleInput';
import ParticipantsInput from '@/components/ParticipantsInput';
import AvailabilityGrid from '@/components/AvailabilityGrid';
import { formatYearMonth, parseStringToDate } from '@/lib/utils/date';

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [datePositions, setDatePositions] = useState<{[date: string]: number}>({});
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDates, setEditingDates] = useState<string[]>([]);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingParticipants, setEditingParticipants] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMeetingData();
  }, [resolvedParams.id]);
  
  // 초기 잠금 상태만 설정 (첫 로드시에만)
  useEffect(() => {
    if (isInitialLoad && availabilities.length > 0) {
      const locked = new Set<string>();
      availabilities.forEach(a => {
        if (a.isLocked) {
          locked.add(a.participantName);
        }
      });
      setLockedParticipants(locked);
      setIsInitialLoad(false);
    }
  }, [availabilities, isInitialLoad]);
  
  // 초기 월 설정
  useEffect(() => {
    if (meeting && meeting.dates.length > 0 && !currentMonth) {
      const firstDate = parseStringToDate(meeting.dates[0]);
      setCurrentMonth(formatYearMonth(firstDate));
    }
  }, [meeting]);

  const fetchMeetingData = async (preserveLocalLockState = false) => {
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Meeting not found');
      }
      const data = await response.json();
      setMeeting(data.meeting);
      
      // preserveLocalLockState가 true면 현재 클라이언트의 잠금 상태를 유지
      if (preserveLocalLockState) {
        const currentLocked = new Set(lockedParticipants);
        setAvailabilities(data.availabilities.map((a: Availability) => ({
          ...a,
          isLocked: currentLocked.has(a.participantName) || a.isLocked
        })));
      } else {
        setAvailabilities(data.availabilities);
      }
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
        await fetchMeetingData(true); // 잠금 상태 유지하면서 데이터 새로고침
        setNewParticipantName(''); // 입력만 초기화, 입력창은 계속 열어둠
        // 입력창은 닫지 않음 - 계속 추가 가능
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
          statusUpdate: { date, status: newStatus },
          isLocked: lockedParticipants.has(participant) // 현재 잠금 상태 유지
        })
      });

      if (!response.ok) {
        // Rollback on error, but preserve lock state
        await fetchMeetingData(true);
        alert('상태 업데이트에 실패했습니다. 다시 시도해주세요.');
      }
      // Success - keep optimistic update
    } catch (error) {
      console.error('Error updating status:', error);
      // Rollback on error, but preserve lock state
      await fetchMeetingData(true);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 월 표시를 위한 스크롤 핸들러
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !meeting) return;
      
      const container = scrollContainerRef.current;
      const scrollTop = container.scrollTop;
      const rowHeight = 56; // 대략적인 행 높이
      
      // 스크롤 위치로 현재 보이는 날짜 인덱스 계산
      const visibleIndex = Math.floor((scrollTop + 40) / rowHeight); // 헤더 높이 40px 고려
      const dateIndex = Math.max(0, Math.min(visibleIndex - 1, meeting.dates.length - 1)); // 월 구분 행 고려
      
      if (meeting.dates[dateIndex]) {
        const date = parseStringToDate(meeting.dates[dateIndex]);
        const month = formatYearMonth(date);
        
        if (month !== currentMonth) {
          setCurrentMonth(month);
        }
      }
    };
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // 초기값 설정
      setTimeout(() => handleScroll(), 100);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [meeting, availabilities, currentMonth]); // currentMonth 의존성 추가
  
  // 스크롤 위치 추적을 위한 useEffect
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        setScrollTop(container.scrollTop);
        setScrollHeight(container.scrollHeight);
        setClientHeight(container.clientHeight);
      };
      
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // 초기값 설정
      
      // 날짜 위치 계산
      const positions: {[date: string]: number} = {};
      const dateRows = container.querySelectorAll('[data-date-row]');
      dateRows.forEach((row) => {
        const date = (row as HTMLElement).querySelector('.flex-col')?.parentElement?.getAttribute('data-date-row');
        if (date && row instanceof HTMLElement) {
          const dateAttr = row.getAttribute('data-date-row');
          if (dateAttr) {
            positions[dateAttr] = row.offsetTop;
          }
        }
      });
      setDatePositions(positions);
      
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [meeting, availabilities]);

  // 하이라이트 자동 제거
  useEffect(() => {
    if (highlightedDate) {
      const timer = setTimeout(() => {
        setHighlightedDate(null);
      }, 2000); // 2초 후 하이라이트 제거
      return () => clearTimeout(timer);
    }
  }, [highlightedDate]);

  // 일정 수정 핸들러
  const handleUpdateDates = async () => {
    if (!meeting || editingDates.length === 0) {
      alert('날짜를 선택해주세요.');
      return;
    }

    if (!editingTitle.trim()) {
      alert('약속 이름을 입력해주세요.');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTitle.trim(),
          dates: editingDates.sort(),
          participants: editingParticipants
        })
      });

      if (response.ok) {
        await fetchMeetingData(true);
        setShowEditModal(false);
        alert('일정이 수정되었습니다.');
      } else {
        alert('일정 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating dates:', error);
      alert('일정 수정에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 일정 수정 모달 열 때 현재 데이터 로드
  useEffect(() => {
    if (showEditModal && meeting) {
      setEditingDates(meeting.dates);
      setEditingTitle(meeting.title);
      // 현재 참여자 목록 로드
      const currentParticipants = Array.from(new Set(availabilities.map(a => a.participantName)));
      setEditingParticipants(currentParticipants);
    }
  }, [showEditModal, meeting, availabilities]);

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
  
  // 참여자가 가장 많은 날짜 TOP 3 계산
  const calculateTopDates = () => {
    if (!meeting || availabilities.length === 0) return [];
    
    const dateScores: { [date: string]: number } = {};
    
    // 각 날짜별 참여 가능한 사람 수 계산
    meeting.dates.forEach(date => {
      let count = 0;
      availabilities.forEach(availability => {
        if (availability.availableDates.includes(date)) {
          count++;
        }
      });
      dateScores[date] = count;
    });
    
    // 점수 기준으로 정렬하고 TOP 3 추출
    return Object.entries(dateScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .filter(([_, count]) => count > 0)
      .map(([date, count], index) => ({
        date,
        count,
        rank: index + 1
      }));
  };
  
  const topDates = calculateTopDates();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 정보 영역 - 이 부분은 스크롤되지 않음 */}
      <div className="flex-shrink-0 bg-gray-50">
        <div className="flex">
          <div className="bg-black" style={{ minWidth: '50px', maxWidth: 'min-content' }}></div>
          <div className="flex-1 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-base font-bold text-gray-800">
                {meeting?.title || '약속'} - {availabilities.length}명
              </span>
            </div>
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
                      onClick={async () => {
                        const participant = cell.participant || '';
                        const currentAvailability = availabilities.find(a => a.participantName === participant);
                        if (!currentAvailability) return;
                        
                        const newIsLocked = !lockedParticipants.has(participant);
                        
                        // Optimistic update
                        setLockedParticipants(prev => {
                          const newSet = new Set(prev);
                          if (newIsLocked) {
                            newSet.add(participant);
                          } else {
                            newSet.delete(participant);
                          }
                          return newSet;
                        });
                        
                        // Send to backend
                        try {
                          const response = await fetch(`/api/meetings/${resolvedParams.id}/availability`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              participantName: participant,
                              availableDates: currentAvailability.availableDates,
                              unavailableDates: currentAvailability.unavailableDates,
                              isLocked: newIsLocked
                            })
                          });
                          
                          if (!response.ok) {
                            // Rollback on error
                            await fetchMeetingData();
                          }
                        } catch (error) {
                          console.error('Error updating lock status:', error);
                          // Rollback on error
                          await fetchMeetingData();
                        }
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
                
                // 해당 날짜가 TOP 3에 있는지 확인
                const topDateInfo = topDates.find(td => td.date === cell.date);
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`px-2 py-1.5 relative transition-all duration-300 ${
                      highlightedDate === cell.date 
                        ? 'bg-yellow-500 shadow-lg scale-105 z-20' 
                        : 'bg-black'
                    }`}
                    style={{ position: 'sticky', left: 0, zIndex: highlightedDate === cell.date ? 20 : 10 }}
                    data-date-row={cell.date}
                    data-month={cell.month}
                  >
                    <div className="flex flex-col items-end justify-center">
                      <span className={`text-[10px] ${highlightedDate === cell.date ? 'text-black' : 'text-white'}`}>{dayOfWeek}</span>
                      <span className={`text-lg font-black leading-tight ${highlightedDate === cell.date ? 'text-black' : 'text-white'}`}>{dayNumber}</span>
                    </div>
                    {topDateInfo && (
                      <div className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        topDateInfo.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                        topDateInfo.rank === 2 ? 'bg-gray-300 text-gray-700' :
                        'bg-orange-400 text-orange-900'
                      }`}>
                        {topDateInfo.rank}
                      </div>
                    )}
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
      
      {/* 스크롤 인디케이터 */}
      {topDates.length > 0 && (
        <div 
          className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-50"
        >
          {topDates.map((item) => {
            const position = datePositions[item.date];
            const isAbove = position !== undefined && position < scrollTop;
            const isBelow = position !== undefined && position > scrollTop + clientHeight;
            const isVisible = !isAbove && !isBelow;
            
            const date = new Date(item.date + 'T00:00:00');
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            
            return (
              <button
                key={item.date}
                onClick={() => {
                  const container = scrollContainerRef.current;
                  if (container && position !== undefined) {
                    container.scrollTo({ top: position - 50, behavior: 'smooth' });
                    setHighlightedDate(item.date);
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg shadow-lg transition-all cursor-pointer hover:scale-110 ${
                  item.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                  item.rank === 2 ? 'bg-gray-300 text-gray-700' :
                  'bg-orange-400 text-orange-900'
                }`}
                title={`${item.rank}순위: ${dateStr} (${item.count}명)`}
              >
                <span className="text-xs font-bold">{item.rank}</span>
                {isVisible ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : isAbove ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 하단 플로팅 버튼 (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* 확장된 메뉴 */}
        {showFabMenu && (
          <div className="absolute bottom-14 right-0 flex flex-col gap-2 mb-2">
            <button
              onClick={() => {
                const meetingUrl = `${window.location.origin}/meeting/${resolvedParams.id}`;
                navigator.clipboard.writeText(meetingUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
                setShowFabMenu(false);
              }}
              className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
              title={copiedLink ? '복사됨!' : '링크 복사'}
            >
              <Link className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => {
                setShowEditModal(true);
                setShowFabMenu(false);
              }}
              className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
              title="일정 수정"
            >
              <Calendar className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => {
                router.push('/');
                setShowFabMenu(false);
              }}
              className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
              title="새 약속"
            >
              <PlusCircle className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => {
                setShowCreatorModal(true);
                setShowFabMenu(false);
              }}
              className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
              title="정보"
            >
              <Info className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
        
        {/* 메인 FAB 버튼 */}
        <button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={`w-12 h-12 bg-gray-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center ${
            showFabMenu ? 'rotate-45' : ''
          }`}
        >
          {showFabMenu ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* 일정 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">일정 수정</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <MeetingTitleInput 
                value={editingTitle}
                onChange={setEditingTitle}
                disabled={isUpdating}
              />
            </div>
            
            <div className="mb-4">
              <ParticipantsInput
                participants={editingParticipants}
                onParticipantsChange={setEditingParticipants}
                disabled={isUpdating}
                label="참여자 관리"
                placeholder="추가할 참여자 이름을 입력하세요"
              />
            </div>
            
            <DateSelector 
              selectedDates={editingDates}
              onDatesChange={setEditingDates}
              disabled={isUpdating}
            />
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpdateDates}
                disabled={isUpdating || editingDates.length === 0}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold disabled:bg-gray-300 transition-colors"
              >
                {isUpdating ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      <AboutModal isOpen={showCreatorModal} onClose={() => setShowCreatorModal(false)} />

    </div>
  );
}