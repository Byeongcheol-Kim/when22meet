'use client';

import { useMemo } from 'react';
import { Meeting, Availability, TimeSlotValue, TIME_SLOTS } from '@/lib/types';

type ParticipantStatus = 'available' | 'unavailable' | 'undecided';

export interface GridCell {
  type:
    | 'header-corner'
    | 'header-participant'
    | 'date'
    | 'date-separator' // 시간대 모드에서 날짜 구분 행 (월 구분과 유사)
    | 'time-slot' // 시간대 레이블 셀
    | 'status'
    | 'month-separator'
    | 'add-input';
  content?: string;
  date?: string;
  participant?: string;
  status?: ParticipantStatus;
  month?: string;
  timeSlot?: TimeSlotValue; // 시간대 값
  timeSlotLabel?: string; // 시간대 레이블 (표시용)
  dateSlotKey?: string; // "YYYY-MM-DD:timeSlot" 형식의 키
}

export interface TopDate {
  date: string;
  timeSlot?: TimeSlotValue;
  timeSlotLabel?: string;
  dateSlotKey: string; // "YYYY-MM-DD" 또는 "YYYY-MM-DD:timeSlot"
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
  locale?: string;
}

// 시간대 레이블 가져오기
function getTimeSlotLabel(slotValue: TimeSlotValue, locale: string = 'ko'): string {
  const slot = TIME_SLOTS.find((s) => s.value === slotValue);
  if (!slot) return slotValue;
  return locale === 'en' ? slot.labelEn : slot.label;
}

// 상태 확인 헬퍼 함수
function getStatus(
  availability: Availability | undefined,
  key: string
): ParticipantStatus {
  if (!availability) return 'undecided';
  if (availability.availableDates.includes(key)) return 'available';
  if (availability.unavailableDates?.includes(key)) return 'unavailable';
  return 'undecided';
}

export function useMeetingGrid({
  meeting,
  availabilities,
  availabilityMap,
  allParticipants,
  currentMonth,
  t,
  locale = 'ko',
}: UseMeetingGridProps) {
  // 시간대 활성화 여부 확인
  const hasTimeSlots = useMemo(() => {
    return (
      meeting?.timeSlotEnabled === true &&
      Array.isArray(meeting?.timeSlots) &&
      meeting.timeSlots.length > 0
    );
  }, [meeting]);

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

      if (hasTimeSlots && meeting.timeSlots) {
        // 시간대 모드: 날짜 구분 행 + 시간대별 서브행

        // 1. 날짜 구분 행 추가 (월 구분과 유사)
        const dateSeparatorRow: GridCell[] = [
          {
            type: 'date-separator',
            content: `${dateObj.getDate()} ${dayNames[dateObj.getDay()]}`,
            date: date,
            month: currentDateMonth,
          },
        ];
        // 빈 셀 추가 (참여자 열)
        for (let i = 0; i < participants.length; i++) {
          dateSeparatorRow.push({ type: 'date-separator', date: date });
        }
        result.push(dateSeparatorRow);

        // 2. 시간대별 서브행 추가
        meeting.timeSlots.forEach((slot) => {
          const dateSlotKey = `${date}:${slot}`;
          const timeSlotLabel = getTimeSlotLabel(slot, locale);

          const row: GridCell[] = [
            {
              type: 'time-slot',
              content: timeSlotLabel,
              date: date,
              month: currentDateMonth,
              timeSlot: slot,
              timeSlotLabel: timeSlotLabel,
              dateSlotKey: dateSlotKey,
            },
          ];

          // Add each participant's status using Map for O(1) lookup
          participants.forEach((name) => {
            const availability = availabilityMap.get(name);
            const status = getStatus(availability, dateSlotKey);

            row.push({
              type: 'status',
              status,
              participant: name,
              date: date,
              timeSlot: slot,
              dateSlotKey: dateSlotKey,
            });
          });

          result.push(row);
        });
      } else {
        // 기존 날짜 전용 모드
        const dateRow: GridCell[] = [
          {
            type: 'date',
            content: `${dateObj.getDate()} ${dayNames[dateObj.getDay()]}`,
            date: date,
            month: currentDateMonth,
            dateSlotKey: date,
          },
        ];

        // Add each participant's status using Map for O(1) lookup
        participants.forEach((name) => {
          const availability = availabilityMap.get(name);
          const status = getStatus(availability, date);

          dateRow.push({
            type: 'status',
            status,
            participant: name,
            date: date,
            dateSlotKey: date,
          });
        });

        result.push(dateRow);
      }
    });

    return result;
  }, [meeting, availabilityMap, allParticipants, currentMonth, t, hasTimeSlots, locale]);

  // Calculate Top 3 dates/slots with O(N) complexity using Map
  const topDates = useMemo((): TopDate[] => {
    if (!meeting || availabilities.length === 0) return [];

    const dateScores: { [key: string]: number } = {};

    if (hasTimeSlots && meeting.timeSlots) {
      // 시간대 모드: date:slot 키로 집계
      meeting.dates.forEach((date) => {
        meeting.timeSlots!.forEach((slot) => {
          const key = `${date}:${slot}`;
          let count = 0;
          availabilities.forEach((availability) => {
            if (availability.availableDates.includes(key)) {
              count++;
            }
          });
          dateScores[key] = count;
        });
      });
    } else {
      // 날짜 전용 모드
      meeting.dates.forEach((date) => {
        let count = 0;
        availabilities.forEach((availability) => {
          if (availability.availableDates.includes(date)) {
            count++;
          }
        });
        dateScores[date] = count;
      });
    }

    // Sort by score and extract TOP 3
    return Object.entries(dateScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .filter(([, count]) => count > 0)
      .map(([key, count], index) => {
        const parts = key.split(':');
        const date = parts[0];
        const timeSlot = parts.length > 1 ? (parts[1] as TimeSlotValue) : undefined;

        return {
          date,
          timeSlot,
          timeSlotLabel: timeSlot ? getTimeSlotLabel(timeSlot, locale) : undefined,
          dateSlotKey: key,
          count,
          rank: (index + 1) as 1 | 2 | 3,
        };
      });
  }, [meeting, availabilities, hasTimeSlots, locale]);

  return {
    gridData,
    topDates,
    hasTimeSlots,
  };
}
