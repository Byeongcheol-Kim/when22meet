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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMeetingData();
  }, [resolvedParams.id]);

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
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('참가자 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    
    // 현재 보이는 첫 번째 날짜 찾기
    const dateElements = container.querySelectorAll('[data-date-row]');
    let foundMonth = '';
    
    for (let i = 0; i < dateElements.length; i++) {
      const element = dateElements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // 헤더 높이(약 40px) 고려
      if (rect.top >= containerRect.top + 40 && rect.top <= containerRect.top + 100) {
        const dateMonth = element.getAttribute('data-month');
        if (dateMonth) {
          foundMonth = dateMonth;
          break;
        }
      }
    }
    
    if (foundMonth && foundMonth !== currentMonth) {
      setCurrentMonth(foundMonth);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // 초기값 설정
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [meeting, availabilities]);

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
    
    // 헤더 행 생성
    const headerRow: GridCell[] = [
      { type: 'header-corner', content: currentMonth || '날짜' }
    ];
    
    // 참여자 헤더 추가
    allParticipants.forEach(name => {
      headerRow.push({ type: 'header-participant', content: name, participant: name });
    });
    
    // 참여자 추가 입력 헤더
    if (showAddInput) {
      headerRow.push({ type: 'add-input' });
    }
    
    gridData.push(headerRow);
    
    // 날짜별 행 생성
    let lastMonth = '';
    meeting.dates.forEach((date, index) => {
      const dateObj = new Date(date + 'T00:00:00');
      const currentMonth = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      
      // 월이 바뀌면 구분선 추가
      if (lastMonth && lastMonth !== currentMonth) {
        const separatorRow: GridCell[] = [
          { type: 'month-separator', content: currentMonth, month: currentMonth }
        ];
        // 참여자 수만큼 빈 셀 추가
        for (let i = 0; i < allParticipants.length + (showAddInput ? 1 : 0); i++) {
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
        const status: ParticipantStatus = availability?.availableDates.includes(date) 
          ? 'available' 
          : 'unavailable';
        
        dateRow.push({
          type: 'status',
          status,
          participant: name,
          date: date
        });
      });
      
      // 새 참여자 추가 중이면 미정 상태 셀 추가
      if (showAddInput) {
        dateRow.push({
          type: 'status',
          status: 'undecided',
          date: date
        });
      }
      
      gridData.push(dateRow);
    });
    
    // 첫 번째 날짜의 월을 초기값으로 설정
    if (!currentMonth && meeting.dates.length > 0) {
      const firstDate = new Date(meeting.dates[0] + 'T00:00:00');
      setCurrentMonth(`${firstDate.getFullYear()}.${String(firstDate.getMonth() + 1).padStart(2, '0')}`);
    }
    
    return gridData;
  };

  const gridData = buildGridData();
  const allParticipants = Array.from(new Set(availabilities.map(a => a.participantName)));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 정보 영역 - 이 부분은 스크롤되지 않음 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FFE5B4] rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">{availabilities.length}</span>
            </div>
            <span className="font-medium">전체 참여자 {availabilities.length}</span>
          </div>
          <button 
            onClick={() => setShowAddInput(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600"
          >
            추가 <Plus className="w-4 h-4" />
          </button>
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
              gridTemplateColumns: `80px ${allParticipants.map(() => '100px').join(' ')}${showAddInput ? ' 150px' : ''}`
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
                      className="px-2 py-2 font-bold text-sm text-gray-700 border-b border-r border-gray-300 bg-gray-100"
                      style={{ position: 'sticky', left: 0, zIndex: 10 }}
                    >
                      {cell.content}
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="bg-gray-100 border-b border-r border-gray-300"
                    />
                  );
                }
              }
              
              // 헤더 코너 (날짜/참여자 교차점)
              if (cell.type === 'header-corner') {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="px-2 py-2 text-xs font-medium text-gray-600 border-r border-b border-gray-200 bg-gray-50"
                    style={{ position: 'sticky', top: 0, left: 0, zIndex: 30 }}
                  >
                    {cell.content}
                  </div>
                );
              }
              
              // 참여자 헤더
              if (cell.type === 'header-participant') {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="px-2 py-2 text-center text-xs font-medium text-gray-700 border-r border-b border-gray-200 bg-white"
                    style={{ position: 'sticky', top: 0, zIndex: 20 }}
                  >
                    {cell.content}
                  </div>
                );
              }
              
              // 참여자 추가 입력
              if (cell.type === 'add-input') {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="px-2 py-1 border-r border-b border-gray-200 bg-white flex items-center gap-2"
                    style={{ position: 'sticky', top: 0, zIndex: 20 }}
                  >
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
                      placeholder="이름"
                      className="w-20 px-2 py-1 text-xs border rounded outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={handleAddParticipant}
                      disabled={isSubmitting || !newParticipantName.trim()}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                      추가
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
                    className="px-2 py-3 border-r border-b border-gray-200 bg-white"
                    style={{ position: 'sticky', left: 0, zIndex: 10 }}
                    data-date-row
                    data-month={cell.month}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold">{dayNumber}</span>
                      <span className="text-xs text-gray-500">{dayOfWeek}</span>
                    </div>
                  </div>
                );
              }
              
              // 상태 셀
              if (cell.type === 'status') {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="px-2 py-3 border-r border-b border-gray-200 bg-white"
                  >
                    <div className={`
                      h-8 rounded flex items-center justify-center text-xs font-medium
                      ${cell.status === 'available' ? 'bg-[#FFE5B4] text-gray-700' : 
                        cell.status === 'unavailable' ? 'bg-[#9CA3AF] text-white' : 
                        'bg-[#E5E7EB] text-gray-500'}
                    `}>
                      {cell.status === 'available' ? '참여' : 
                       cell.status === 'unavailable' ? '불참' : '미정'}
                    </div>
                  </div>
                );
              }
              
              return null;
            })
          ))}
          </div>
        </div>
      </div>

      {/* 플로팅 액션 버튼 */}
      <button
        onClick={() => setShowAddInput(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}