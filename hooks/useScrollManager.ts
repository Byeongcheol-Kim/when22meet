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
  const [datePositions, setDatePositions] = useState<{ [date: string]: number }>(
    {}
  );
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);

  // Set initial month
  useEffect(() => {
    if (meeting && meeting.dates.length > 0 && !currentMonth) {
      const firstDate = parseStringToDate(meeting.dates[0]);
      setCurrentMonth(formatYearMonth(firstDate));
    }
  }, [meeting, currentMonth]);

  // Scroll handler for month display with throttling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !meeting) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const scrollTopValue = container.scrollTop;
        const rowHeight = CONFIG.ROW_HEIGHT_PX;

        // Calculate visible date index from scroll position
        const visibleIndex = Math.floor(
          (scrollTopValue + CONFIG.HEADER_HEIGHT_PX) / rowHeight
        );
        const dateIndex = Math.max(
          0,
          Math.min(visibleIndex - 1, meeting.dates.length - 1)
        );

        if (meeting.dates[dateIndex]) {
          const date = parseStringToDate(meeting.dates[dateIndex]);
          const month = formatYearMonth(date);

          if (month !== currentMonth) {
            setCurrentMonth(month);
          }
        }

        setScrollTop(scrollTopValue);
        setClientHeight(container.clientHeight);

        rafId = null;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    // Set initial value
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [meeting, currentMonth]);

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
    datePositions,
    scrollTop,
    clientHeight,
    highlightedDate,
    setHighlightedDate,
    scrollToDate,
  };
}
