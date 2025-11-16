'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { Meeting, Availability } from '@/lib/types';

interface UseMeetingDataProps {
  meetingId: string;
  onError?: (error: string) => void;
}

interface UseMeetingDataReturn {
  meeting: Meeting | null;
  availabilities: Availability[];
  setAvailabilities: React.Dispatch<React.SetStateAction<Availability[]>>;
  isLoading: boolean;
  lockedParticipants: Set<string>;
  setLockedParticipants: React.Dispatch<React.SetStateAction<Set<string>>>;
  fetchMeetingData: (preserveLocalLockState?: boolean) => Promise<void>;
  availabilityMap: Map<string, Availability>;
  allParticipants: string[];
}

export function useMeetingData({
  meetingId,
  onError,
}: UseMeetingDataProps): UseMeetingDataReturn {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lockedParticipants, setLockedParticipants] = useState<Set<string>>(
    new Set()
  );
  const [participantOrder, setParticipantOrder] = useState<string[]>([]);
  const isInitialLoadRef = useRef(true);
  const lockedParticipantsRef = useRef<Set<string>>(new Set());
  const onErrorRef = useRef(onError);

  // Keep refs in sync with props/state
  lockedParticipantsRef.current = lockedParticipants;
  onErrorRef.current = onError;

  const fetchMeetingData = useCallback(
    async (preserveLocalLockState = false) => {
      try {
        const response = await fetch(`/api/meetings/${meetingId}`);
        if (!response.ok) {
          throw new Error('Meeting not found');
        }
        const data = await response.json();
        setMeeting(data.meeting);

        // If preserveLocalLockState is true, maintain current client's lock state
        if (preserveLocalLockState) {
          const currentLocked = new Set(lockedParticipantsRef.current);
          setAvailabilities(
            data.availabilities.map((a: Availability) => ({
              ...a,
              isLocked: currentLocked.has(a.participantName) || a.isLocked,
            }))
          );
        } else {
          setAvailabilities(data.availabilities);

          // Set initial lock state and participant order (on first load only)
          if (isInitialLoadRef.current && data.availabilities.length > 0) {
            const locked = new Set<string>();
            data.availabilities.forEach((a: Availability) => {
              if (a.isLocked) {
                locked.add(a.participantName);
              }
            });
            setLockedParticipants(locked);

            // Sort participants on initial load
            const participantNames = data.availabilities.map((a: Availability) => a.participantName) as string[];
            const sortedParticipants = Array.from(new Set(participantNames))
              .map((name: string) => {
                const availability = data.availabilities.find(
                  (a: Availability) => a.participantName === name
                );
                const isLocked = locked.has(name);

                // Calculate undecided count
                const totalDates = data.meeting?.dates.length || 0;
                const availableCount = availability?.availableDates.length || 0;
                const unavailableCount =
                  availability?.unavailableDates?.length || 0;
                const undecidedCount =
                  totalDates - availableCount - unavailableCount;

                return { name, isLocked, undecidedCount };
              })
              .sort((a, b) => {
                // 1. Sort by locked status (unlocked first)
                if (a.isLocked !== b.isLocked) {
                  return a.isLocked ? 1 : -1;
                }
                // 2. Sort by undecided count (more undecided first)
                return b.undecidedCount - a.undecidedCount;
              })
              .map((p) => p.name);

            setParticipantOrder(sortedParticipants);
            isInitialLoadRef.current = false;
          }
        }
      } catch (error) {
        console.error('Error fetching meeting:', error);
        onErrorRef.current?.('Meeting not found');
      } finally {
        setIsLoading(false);
      }
    },
    [meetingId] // Only depend on meetingId for stable reference
  );

  // Create Map for O(1) lookup (solves O(N²) problem)
  const availabilityMap = useMemo(() => {
    return new Map(availabilities.map((a) => [a.participantName, a]));
  }, [availabilities]);

  // Get ordered participant list
  const allParticipants = useMemo(() => {
    if (participantOrder.length > 0) {
      const currentParticipants = new Set(
        availabilities.map((a) => a.participantName)
      );
      const orderSet = new Set(participantOrder);

      return [
        ...participantOrder.filter((name) => currentParticipants.has(name)),
        ...Array.from(currentParticipants).filter(
          (name) => !orderSet.has(name)
        ),
      ];
    }
    return Array.from(new Set(availabilities.map((a) => a.participantName)));
  }, [availabilities, participantOrder]);

  return {
    meeting,
    availabilities,
    setAvailabilities,
    isLoading,
    lockedParticipants,
    setLockedParticipants,
    fetchMeetingData,
    availabilityMap,
    allParticipants,
  };
}
