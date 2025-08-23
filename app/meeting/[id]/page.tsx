'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Meeting, Availability } from '@/lib/types';
import { Plus, UserPlus } from 'lucide-react';

type ParticipantStatus = 'available' | 'unavailable' | 'undecided';

interface DateRow {
  date: string;
  dayOfWeek: string;
  dayNumber: string;
  participants: { [name: string]: ParticipantStatus };
}

interface MonthGroup {
  yearMonth: string;
  dates: DateRow[];
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
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
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
      // 모든 날짜를 미정으로 설정 (빈 배열로 전송하면 서버에서 모두 미정으로 처리)
      const response = await fetch(`/api/meetings/${resolvedParams.id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: newParticipantName.trim(),
          availableDates: [] // 빈 배열 = 모든 날짜 미정
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
    const scrollTop = container.scrollTop;
    const containerTop = container.getBoundingClientRect().top;
    
    // 모든 날짜 행을 확인하여 현재 보이는 첫 번째 날짜의 월을 찾기
    const dateRows = container.querySelectorAll('[data-date]');
    let foundMonth = '';
    
    for (let i = 0; i < dateRows.length; i++) {
      const row = dateRows[i] as HTMLElement;
      const rect = row.getBoundingClientRect();
      
      // 현재 뷰포트에 보이는 첫 번째 행 찾기
      if (rect.top >= containerTop - 10 && rect.top <= containerTop + 100) {
        const date = row.getAttribute('data-date');
        if (date) {
          const dateObj = new Date(date + 'T00:00:00');
          foundMonth = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
          break;
        }
      }
    }
    
    // 월 구분 행도 체크
    if (!foundMonth) {
      const monthRows = container.querySelectorAll('[data-month]');
      for (let i = monthRows.length - 1; i >= 0; i--) {
        const row = monthRows[i] as HTMLElement;
        const rect = row.getBoundingClientRect();
        
        if (rect.top <= containerTop + 60) {
          foundMonth = row.getAttribute('data-month') || '';
          break;
        }
      }
    }
    
    if (foundMonth && foundMonth !== currentMonth) {
      setCurrentMonth(foundMonth);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!meeting) return null;

  // 날짜를 월별로 그룹화
  const groupDatesByMonth = (): MonthGroup[] => {
    const groups: MonthGroup[] = [];
    let currentGroup: MonthGroup | null = null;

    // 모든 참여자 이름 수집
    const allParticipants = Array.from(new Set(availabilities.map(a => a.participantName)));

    meeting.dates.forEach(date => {
      const dateObj = new Date(date + 'T00:00:00');
      const yearMonth = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      
      // 날짜별 참여자 상태 매핑
      const participants: { [name: string]: ParticipantStatus } = {};
      allParticipants.forEach(name => {
        const availability = availabilities.find(a => a.participantName === name);
        if (availability?.availableDates.includes(date)) {
          participants[name] = 'available';
        } else {
          participants[name] = 'unavailable';
        }
      });

      const dateRow: DateRow = {
        date,
        dayOfWeek: dayNames[dateObj.getDay()],
        dayNumber: String(dateObj.getDate()).padStart(2, '0'),
        participants
      };

      if (!currentGroup || currentGroup.yearMonth !== yearMonth) {
        currentGroup = { yearMonth, dates: [dateRow] };
        groups.push(currentGroup);
      } else {
        currentGroup.dates.push(dateRow);
      }
    });

    return groups;
  };

  const monthGroups = groupDatesByMonth();
  const allParticipants = Array.from(new Set(availabilities.map(a => a.participantName)));
  const firstMonth = monthGroups[0]?.yearMonth || '';

  return (
    <div className="min-h-screen bg-white relative">
      {/* 상단 고정 헤더 */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
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

        {/* 테이블 헤더 (참여자 이름) */}
        <div className="flex border-t border-gray-200">
          <div className="w-20 flex-shrink-0 px-2 py-2 bg-gray-50 border-r border-gray-200">
            <span className="text-xs font-medium text-gray-600">
              {currentMonth || firstMonth}
            </span>
          </div>
          <div 
            ref={horizontalScrollRef}
            className="flex-1 overflow-x-auto"
            onScroll={(e) => {
              // 헤더의 스크롤 위치를 본문에도 동기화
              if (scrollContainerRef.current) {
                const scrollableRows = scrollContainerRef.current.querySelectorAll('.scrollable-row');
                scrollableRows.forEach(row => {
                  (row as HTMLElement).scrollLeft = e.currentTarget.scrollLeft;
                });
              }
            }}
          >
            <div className="flex" style={{ minWidth: 'max-content' }}>
              {allParticipants.map(name => (
                <div key={name} className="w-[100px] px-2 py-2 text-center border-r border-gray-200">
                  <span className="text-xs font-medium text-gray-700">{name}</span>
                </div>
              ))}
              {/* 참여자 추가 입력 필드 */}
              {showAddInput && (
                <div className={`flex items-center gap-2 px-2 py-1 border-r border-gray-200 transition-all duration-300 ${
                  showAddInput ? 'w-[150px] opacity-100' : 'w-0 opacity-0'
                }`}>
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
              )}
              {allParticipants.length === 0 && !showAddInput && (
                <div className="flex-1 px-2 py-2 text-center text-gray-400 text-xs">
                  참여자 없음
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 스크롤 가능한 테이블 본문 */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-y-auto"
        style={{ height: 'calc(100vh - 120px)' }}
      >
        {monthGroups.map((group, groupIndex) => (
          <div key={group.yearMonth}>
            {/* 월 구분 행 */}
            {groupIndex > 0 && (
              <div 
                data-month={group.yearMonth}
                className="flex bg-gray-100 border-b border-gray-300"
              >
                <div className="w-full px-4 py-2">
                  <span className="text-sm font-bold text-gray-700">{group.yearMonth}</span>
                </div>
              </div>
            )}
            
            {/* 날짜별 행 */}
            {group.dates.map(dateRow => (
              <div key={dateRow.date} data-date={dateRow.date} className="flex border-b border-gray-200">
                {/* 날짜/요일 열 (고정) */}
                <div className="w-20 flex-shrink-0 px-2 py-3 bg-white border-r border-gray-200">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold">{dateRow.dayNumber}</span>
                    <span className="text-xs text-gray-500">{dateRow.dayOfWeek}</span>
                  </div>
                </div>
                
                {/* 참여자별 상태 */}
                <div 
                  className="flex-1 overflow-x-hidden scrollable-row"
                  onScroll={(e) => {
                    // 본문의 스크롤 위치를 헤더와 다른 행들에도 동기화
                    if (horizontalScrollRef.current) {
                      horizontalScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
                    }
                    const allScrollableRows = document.querySelectorAll('.scrollable-row');
                    allScrollableRows.forEach(row => {
                      if (row !== e.currentTarget) {
                        (row as HTMLElement).scrollLeft = e.currentTarget.scrollLeft;
                      }
                    });
                  }}
                >
                  <div className="flex" style={{ minWidth: 'max-content' }}>
                    {allParticipants.map(name => {
                      const status = dateRow.participants[name];
                      return (
                        <div 
                          key={`${dateRow.date}-${name}`}
                          className="w-[100px] px-2 py-3 border-r border-gray-200"
                        >
                          <div className={`
                            h-8 rounded flex items-center justify-center text-xs font-medium
                            ${status === 'available' ? 'bg-[#FFE5B4] text-gray-700' : 
                              status === 'unavailable' ? 'bg-[#9CA3AF] text-white' : 
                              'bg-[#E5E7EB] text-gray-500'}
                          `}>
                            {status === 'available' ? '참여' : 
                             status === 'unavailable' ? '불참' : '미정'}
                          </div>
                        </div>
                      );
                    })}
                    {/* 새 참여자를 위한 빈 셀 (추가 중일 때) */}
                    {showAddInput && (
                      <div className="w-[150px] px-2 py-3 border-r border-gray-200">
                        <div className="h-8 rounded bg-[#E5E7EB] flex items-center justify-center text-xs font-medium text-gray-500">
                          미정
                        </div>
                      </div>
                    )}
                    {allParticipants.length === 0 && !showAddInput && (
                      <div className="w-[100px] px-2 py-3 text-center">
                        <div className="h-8 flex items-center justify-center text-xs text-gray-400">
                          -
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
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