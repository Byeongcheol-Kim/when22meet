'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Meeting } from '@/lib/types';
import { formatYearMonth, parseStringToDate } from '@/lib/utils/date';
import { CONFIG } from '@/lib/constants/config';

interface UseScrollManagerProps {
  meeting: Meeting | null;
}

interface UseScrollManagerReturn {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  currentMonth: string;
  currentVisibleDate: string | null; // 현재 보이는 날짜 (시간대 모드용)
  hasScrolled: boolean; // 스크롤이 발생했는지 여부
  datePositions: { [date: string]: number };
  scrollTop: number;
  clientHeight: number;
  highlightedDate: string | null;
  setHighlightedDate: (date: string | null) => void;
  scrollToDate: (date: string) => void;
}

export function useScrollManager({
  meeting,
}: UseScrollManagerProps): UseScrollManagerReturn {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentVisibleDate, setCurrentVisibleDate] = useState<string | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [datePositions, setDatePositions] = useState<{ [date: string]: number }>(
    {}
  );
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);

  // Set initial month only (not date - date shows only when scrolling)
  useEffect(() => {
    if (meeting && meeting.dates.length > 0) {
      const firstDate = parseStringToDate(meeting.dates[0]);
      if (!currentMonth) {
        setCurrentMonth(formatYearMonth(firstDate));
      }
    }
  }, [meeting, currentMonth]);

  // Scroll handler for month and date display with throttling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !meeting) return;

    let rafId: number | null = null;
    const SCROLL_THRESHOLD = 10; // 스크롤이 10px 이상 발생해야 날짜 표시

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const scrollTopValue = container.scrollTop;

        // 스크롤이 threshold 이상 발생했을 때만 날짜 표시
        if (scrollTopValue > SCROLL_THRESHOLD) {
          if (!hasScrolled) {
            setHasScrolled(true);
          }

          // date-separator 또는 date 행 중 현재 보이는 것 찾기
          const dateRows = container.querySelectorAll('[data-date-row]');
          let visibleDate: string | null = null;

          for (const row of dateRows) {
            if (row instanceof HTMLElement) {
              const rowTop = row.offsetTop;
              // 헤더 높이를 고려하여 현재 뷰포트에 보이는 날짜 찾기
              if (rowTop <= scrollTopValue + CONFIG.HEADER_HEIGHT_PX + 10) {
                visibleDate = row.getAttribute('data-date-row');
              } else {
                break;
              }
            }
          }

          if (visibleDate) {
            // dateSlotKey에서 date 부분만 추출 (예: "2026-01-09:12:00" -> "2026-01-09")
            const datePart = visibleDate.split(':')[0];
            if (datePart !== currentVisibleDate) {
              setCurrentVisibleDate(datePart);
            }

            const date = parseStringToDate(datePart);
            const month = formatYearMonth(date);
            if (month !== currentMonth) {
              setCurrentMonth(month);
            }
          }
        } else {
          // 스크롤이 맨 위로 돌아오면 날짜 숨김
          if (hasScrolled) {
            setHasScrolled(false);
            setCurrentVisibleDate(null);
          }
        }

        setScrollTop(scrollTopValue);
        setClientHeight(container.clientHeight);

        rafId = null;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [meeting, currentMonth, currentVisibleDate, hasScrolled]);

  // Calculate date positions
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !meeting) return;

    const updatePositions = () => {
      const positions: { [date: string]: number } = {};
      const dateRows = container.querySelectorAll('[data-date-row]');
      dateRows.forEach((row) => {
        if (row instanceof HTMLElement) {
          const dateAttr = row.getAttribute('data-date-row');
          if (dateAttr) {
            positions[dateAttr] = row.offsetTop;
          }
        }
      });
      setDatePositions(positions);
    };

    // Delay to ensure DOM is rendered
    const timer = setTimeout(updatePositions, 100);

    return () => clearTimeout(timer);
  }, [meeting]);

  // Auto-remove highlight
  useEffect(() => {
    if (highlightedDate) {
      const timer = setTimeout(() => {
        setHighlightedDate(null);
      }, CONFIG.HIGHLIGHT_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [highlightedDate]);

  const scrollToDate = useCallback(
    (date: string) => {
      const container = scrollContainerRef.current;
      const position = datePositions[date];
      if (container && position !== undefined) {
        container.scrollTo({ top: position - 50, behavior: 'smooth' });
        setHighlightedDate(date);
      }
    },
    [datePositions]
  );

  return {
    scrollContainerRef,
    currentMonth,
    currentVisibleDate,
    hasScrolled,
    datePositions,
    scrollTop,
    clientHeight,
    highlightedDate,
    setHighlightedDate,
    scrollToDate,
  };
}
