'use client';

import React from 'react';
import { formatMonthDay } from '@/lib/utils/date';
import { Availability } from '@/lib/types';

interface AvailabilityGridProps {
  dates: string[];
  availabilities: Availability[];
  currentParticipant: string;
  onCellClick: (participantName: string, date: string) => void;
  onParticipantLockToggle: (participantName: string) => void;
  topDates: Array<{ date: string; count: number; rank: number }>;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export default function AvailabilityGrid({
  dates,
  availabilities,
  currentParticipant,
  onCellClick,
  onParticipantLockToggle,
  topDates,
  scrollContainerRef
}: AvailabilityGridProps) {
  const getRankBadge = (date: string) => {
    const topDate = topDates.find(td => td.date === date);
    if (!topDate) return null;
    
    const colors = {
      1: 'bg-yellow-400 text-yellow-900',
      2: 'bg-gray-300 text-gray-700', 
      3: 'bg-orange-400 text-orange-900'
    };
    
    return (
      <div className={`absolute -top-1 -right-1 w-5 h-5 ${colors[topDate.rank as keyof typeof colors]} rounded-full flex items-center justify-center text-xs font-bold z-10`}>
        {topDate.rank}
      </div>
    );
  };

  return (
    <div ref={scrollContainerRef} className="overflow-x-auto overflow-y-visible">
      <div className="inline-block min-w-full">
        <div className="grid" style={{ 
          gridTemplateColumns: `120px repeat(${dates.length}, 45px)`,
          minWidth: 'max-content'
        }}>
          {/* Header row - month/date display */}
          <div className="h-14 sticky left-0 z-30 bg-gray-800 flex items-center justify-end pr-3">
            <div className="text-right">
              <div className="text-yellow-400 text-xs font-medium">날짜</div>
            </div>
          </div>
          
          {dates.map((date, index) => {
            const dateObj = new Date(date);
            const day = dateObj.getDate();
            const isLastOfMonth = index === dates.length - 1 || 
              new Date(dates[index + 1]).getMonth() !== dateObj.getMonth();
            
            return (
              <div
                key={date}
                className={`h-14 bg-gray-800 flex flex-col items-center justify-center text-white relative ${
                  isLastOfMonth ? 'border-r-2 border-gray-600' : ''
                }`}
              >
                {getRankBadge(date)}
                <div className="text-xs font-semibold">{formatMonthDay(dateObj)}</div>
                <div className="text-sm">{day}</div>
              </div>
            );
          })}

          {/* Participant rows */}
          {availabilities.map((availability) => {
            const isCurrentParticipant = availability.participantName === currentParticipant;
            
            return (
              <React.Fragment key={availability.participantName}>
                <div className="h-10 sticky left-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between px-3">
                  <span className={`text-sm ${isCurrentParticipant ? 'font-bold text-blue-600' : 'font-semibold'}`}>
                    {availability.participantName}
                  </span>
                  {isCurrentParticipant && (
                    <button
                      onClick={() => onParticipantLockToggle(availability.participantName)}
                      className={`px-2 py-0.5 text-xs rounded transition-colors ${
                        availability.isLocked
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {availability.isLocked ? '확정됨' : '확정'}
                    </button>
                  )}
                </div>
                
                {dates.map((date, dateIndex) => {
                  const isAvailable = availability.availableDates.includes(date);
                  const isUnavailable = availability.unavailableDates?.includes(date);
                  const isLastOfMonth = dateIndex === dates.length - 1 || 
                    new Date(dates[dateIndex + 1]).getMonth() !== new Date(date).getMonth();
                  
                  return (
                    <button
                      key={`${availability.participantName}-${date}`}
                      onClick={() => onCellClick(availability.participantName, date)}
                      disabled={availability.isLocked && !isCurrentParticipant}
                      className={`h-10 border-b border-gray-200 transition-all ${
                        isLastOfMonth ? 'border-r-2 border-gray-300' : 'border-r border-gray-100'
                      } ${
                        isAvailable
                          ? 'bg-green-400 hover:bg-green-500'
                          : isUnavailable
                          ? 'bg-gray-300 hover:bg-gray-400'
                          : 'bg-gray-50 hover:bg-gray-100'
                      } ${
                        availability.isLocked && !isCurrentParticipant
                          ? 'cursor-not-allowed opacity-70'
                          : 'cursor-pointer'
                      }`}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}