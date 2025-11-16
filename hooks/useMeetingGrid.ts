'use client';

import { useMemo } from 'react';
import { Meeting, Availability } from '@/lib/types';

type ParticipantStatus = 'available' | 'unavailable' | 'undecided';

export interface GridCell {
  type:
    | 'header-corner'
    | 'header-participant'
    | 'date'
    | 'status'
    | 'month-separator'
    | 'add-input';
  content?: string;
  date?: string;
  participant?: string;
  status?: ParticipantStatus;
  month?: string;
}

interface TopDate {
  date: string;
  count: number;
  rank: number;
}

interface UseMeetingGridProps {
  meeting: Meeting | null;
  availabilities: Availability[];
  availabilityMap: Map<string, Availability>;
  allParticipants: string[];
  currentMonth: string;
  t: (key: string) => string;
}

export function useMeetingGrid({
  meeting,
  availabilities,
  availabilityMap,
  allParticipants,
  currentMonth,
  t,
}: UseMeetingGridProps) {
  // Calculate grid data with O(1) lookups
  const gridData = useMemo(() => {
    if (!meeting) return [];

    const participants = allParticipants;
    const result: GridCell[][] = [];

    // Use first date's month as default
    let defaultYear = '';
    let defaultMonth = '';
    if (meeting.dates.length > 0) {
      const firstDate = new Date(meeting.dates[0] + 'T00:00:00');
      defaultYear = String(firstDate.getFullYear());
      defaultMonth = String(firstDate.getMonth() + 1).padStart(2, '0');
    }

    // Parse current month
    const [currentYear, currentMonthOnly] = currentMonth
      ? currentMonth.split('.')
      : [defaultYear, defaultMonth];

    // Generate header row
    const headerRow: GridCell[] = [
      {
        type: 'header-corner',
        content: `${currentYear || defaultYear}\n${currentMonthOnly || defaultMonth}`,
      },
    ];

    // Add participant headers
    participants.forEach((name) => {
      headerRow.push({
        type: 'header-participant',
        content: name,
        participant: name,
      });
    });

    result.push(headerRow);

    // Generate rows by date
    let lastMonth = '';
    meeting.dates.forEach((date) => {
      const dateObj = new Date(date + 'T00:00:00');
      const currentDateMonth = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      // Use short day names from translation
      const dayNames = Array.from({ length: 7 }, (_, i) =>
        t(`dayNames.short.${i}`)
      );

      // Add separator when month changes
      if (lastMonth && lastMonth !== currentDateMonth) {
        const [year, month] = currentDateMonth.split('.');
        const separatorRow: GridCell[] = [
          {
            type: 'month-separator',
            content: `${year}\n${month}`,
            month: currentDateMonth,
          },
        ];
        // Add empty cells for participants
        for (let i = 0; i < participants.length; i++) {
          separatorRow.push({ type: 'month-separator' });
        }
        result.push(separatorRow);
      }
      lastMonth = currentDateMonth;

      // Generate date row
      const dateRow: GridCell[] = [
        {
          type: 'date',
          content: `${dateObj.getDate()} ${dayNames[dateObj.getDay()]}`,
          date: date,
          month: currentDateMonth,
        },
      ];

      // Add each participant's status using Map for O(1) lookup
      participants.forEach((name) => {
        const availability = availabilityMap.get(name);
        let status: ParticipantStatus;

        if (!availability) {
          // Newly added participant
          status = 'undecided';
        } else if (availability.availableDates.includes(date)) {
          // Available
          status = 'available';
        } else if (availability.unavailableDates?.includes(date)) {
          // Explicitly unavailable
          status = 'unavailable';
        } else {
          // Undecided (not selected yet)
          status = 'undecided';
        }

        dateRow.push({
          type: 'status',
          status,
          participant: name,
          date: date,
        });
      });

      result.push(dateRow);
    });

    return result;
  }, [meeting, availabilityMap, allParticipants, currentMonth, t]);

  // Calculate Top 3 dates with O(N) complexity using Map
  const topDates = useMemo((): TopDate[] => {
    if (!meeting || availabilities.length === 0) return [];

    const dateScores: { [date: string]: number } = {};

    // Calculate number of available people for each date
    meeting.dates.forEach((date) => {
      let count = 0;
      availabilities.forEach((availability) => {
        if (availability.availableDates.includes(date)) {
          count++;
        }
      });
      dateScores[date] = count;
    });

    // Sort by score and extract TOP 3
    return Object.entries(dateScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .filter(([, count]) => count > 0)
      .map(([date, count], index) => ({
        date,
        count,
        rank: index + 1,
      }));
  }, [meeting, availabilities]);

  return {
    gridData,
    topDates,
  };
}
