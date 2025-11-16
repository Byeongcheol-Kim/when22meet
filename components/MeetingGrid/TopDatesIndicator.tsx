'use client';

import { memo } from 'react';
import { getTopDateClasses } from '@/lib/constants/colors';

interface TopDate {
  date: string;
  count: number;
  rank: number;
}

interface TopDatesIndicatorProps {
  topDates: TopDate[];
  datePositions: { [date: string]: number };
  scrollTop: number;
  clientHeight: number;
  onDateClick: (date: string) => void;
  t: (key: string) => string;
}

export const TopDatesIndicator = memo(function TopDatesIndicator({
  topDates,
  datePositions,
  scrollTop,
  clientHeight,
  onDateClick,
  t,
}: TopDatesIndicatorProps) {
  if (topDates.length === 0) return null;

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-50">
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
            onClick={() => onDateClick(item.date)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg shadow-md transition-all cursor-pointer hover:scale-110 ${
              getTopDateClasses(item.rank as 1 | 2 | 3, 'badge')
            }`}
            title={t('meeting.topDatesLabel')
              .replace('{rank}', String(item.rank))
              .replace('{date}', dateStr)
              .replace('{count}', String(item.count))}
          >
            <span className="text-xs font-bold">
              {t('meeting.peopleCount').replace('{count}', String(item.count))}
            </span>
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
  );
});
