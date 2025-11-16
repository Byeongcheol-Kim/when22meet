'use client';

import { memo } from 'react';
import { DATE_COLUMN_COLORS, getStatusClasses, getTopDateClasses, getDayOfWeekColor } from '@/lib/constants/colors';

type ParticipantStatus = 'available' | 'unavailable' | 'undecided';

interface TopDateInfo {
  rank: 1 | 2 | 3;
}

interface DateCellProps {
  date: string;
  content: string;
  month: string;
  highlightedDate: string | null;
  topDateInfo?: TopDateInfo;
}

export const DateCell = memo(function DateCell({
  date,
  content,
  highlightedDate,
  topDateInfo,
}: DateCellProps) {
  const dateObj = new Date(date + 'T00:00:00');
  const dayNumber = String(dateObj.getDate()).padStart(2, '0');
  const dayOfWeek = content.split(' ')[1];
  const day = dateObj.getDay();
  const dayColor = getDayOfWeekColor(day, highlightedDate === date);

  return (
    <div
      className={`px-2 py-1.5 relative transition-all duration-300 ${
        highlightedDate === date
          ? `${DATE_COLUMN_COLORS.highlighted.bg} shadow-lg scale-105 z-20`
          : DATE_COLUMN_COLORS.bg
      }`}
      style={{ position: 'sticky', left: 0, zIndex: highlightedDate === date ? 20 : 10 }}
      data-date-row={date}
    >
      <div className="flex flex-col items-end justify-center">
        <span className={`text-[10px] ${dayColor}`}>{dayOfWeek}</span>
        <span className={`text-lg font-black leading-tight ${dayColor}`}>{dayNumber}</span>
      </div>
      {topDateInfo && (
        <div className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
          getTopDateClasses(topDateInfo.rank, 'indicator')
        }`}>
          {topDateInfo.rank}
        </div>
      )}
    </div>
  );
});

interface StatusCellProps {
  status: ParticipantStatus;
  participant: string;
  date: string;
  isLocked: boolean;
  onStatusClick: (participant: string, date: string, status: ParticipantStatus) => void;
  t: (key: string) => string;
}

export const StatusCell = memo(function StatusCell({
  status,
  participant,
  date,
  isLocked,
  onStatusClick,
  t,
}: StatusCellProps) {
  const isEditable = !isLocked;

  return (
    <div className="px-2 py-2 bg-white">
      <button
        onClick={() => {
          if (isEditable) {
            onStatusClick(participant, date, status);
          }
        }}
        disabled={!isEditable}
        className={`w-full h-10 rounded-md flex items-center justify-center text-sm font-medium transition-all ${
          getStatusClasses(status, isEditable)
        }`}
      >
        {status === 'available'
          ? t('meeting.status.available')
          : status === 'unavailable'
            ? t('meeting.status.unavailable')
            : t('meeting.status.undecided')}
      </button>
    </div>
  );
});

interface ParticipantHeaderProps {
  name: string;
  isLocked: boolean;
  onToggleLock: (participant: string) => void;
}

export const ParticipantHeader = memo(function ParticipantHeader({
  name,
  isLocked,
  onToggleLock,
}: ParticipantHeaderProps) {
  return (
    <div
      className={`px-2 py-1 text-center text-sm font-bold ${
        isLocked ? 'bg-gray-50' : 'bg-white'
      }`}
      style={{ position: 'sticky', top: 0, zIndex: 20 }}
    >
      <button
        onClick={() => onToggleLock(name)}
        className={`w-full ${
          isLocked ? 'text-gray-500' : 'text-gray-800 hover:text-blue-500 transition-colors'
        }`}
      >
        {name}
        {isLocked && <span className="ml-1 text-xs">✓</span>}
      </button>
    </div>
  );
});

interface MonthSeparatorProps {
  content: string;
  isFirst?: boolean;
}

export const MonthSeparator = memo(function MonthSeparator({
  content,
  isFirst = false,
}: MonthSeparatorProps) {
  if (isFirst) {
    return (
      <div
        className={`px-2 py-1 ${DATE_COLUMN_COLORS.bg}`}
        style={{ position: 'sticky', left: 0, zIndex: 10 }}
      >
        <div className="flex flex-col items-end justify-center">
          <span className={`text-xs font-medium ${DATE_COLUMN_COLORS.header.year}`}>
            {content.split('\n')[0]}
          </span>
          <span className={`text-sm font-bold ${DATE_COLUMN_COLORS.header.month}`}>
            {content.split('\n')[1]}
          </span>
        </div>
      </div>
    );
  }

  return <div className="bg-gray-50" />;
});

interface HeaderCornerProps {
  content: string;
}

export const HeaderCorner = memo(function HeaderCorner({ content }: HeaderCornerProps) {
  return (
    <div
      className={`px-2 py-1 ${DATE_COLUMN_COLORS.header.bg}`}
      style={{ position: 'sticky', top: 0, left: 0, zIndex: 30 }}
    >
      <div className="flex flex-col items-end justify-center">
        <span className={`text-xs font-medium ${DATE_COLUMN_COLORS.header.year}`}>
          {content.split('\n')[0]}
        </span>
        <span className={`text-sm font-bold ${DATE_COLUMN_COLORS.header.month}`}>
          {content.split('\n')[1]}
        </span>
      </div>
    </div>
  );
});
