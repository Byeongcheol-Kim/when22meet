'use client';

import { useCallback, useRef } from 'react';
import { Availability } from '@/lib/types';

type ParticipantStatus = 'available' | 'unavailable' | 'undecided';

interface UseMeetingActionsProps {
  meetingId: string;
  availabilities: Availability[];
  setAvailabilities: React.Dispatch<React.SetStateAction<Availability[]>>;
  lockedParticipants: Set<string>;
  setLockedParticipants: React.Dispatch<React.SetStateAction<Set<string>>>;
  fetchMeetingData: (preserveLocalLockState?: boolean) => Promise<void>;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
  t: (key: string) => string;
}

export function useMeetingActions({
  meetingId,
  availabilities,
  setAvailabilities,
  lockedParticipants,
  setLockedParticipants,
  fetchMeetingData,
  onError,
  t,
}: UseMeetingActionsProps) {
  // Use refs for values that change frequently to avoid recreating callbacks
  const availabilitiesRef = useRef(availabilities);
  const lockedParticipantsRef = useRef(lockedParticipants);
  const onErrorRef = useRef(onError);
  const tRef = useRef(t);
  const setAvailabilitiesRef = useRef(setAvailabilities);

  // Keep refs in sync
  availabilitiesRef.current = availabilities;
  lockedParticipantsRef.current = lockedParticipants;
  onErrorRef.current = onError;
  tRef.current = t;
  setAvailabilitiesRef.current = setAvailabilities;

  const handleAddParticipant = useCallback(
    async (participantName: string) => {
      if (!participantName.trim()) {
        onErrorRef.current?.(tRef.current('meeting.alerts.enterName'));
        return false;
      }

      if (participantName.trim().length > 10) {
        onErrorRef.current?.(tRef.current('meeting.alerts.nameTooLong'));
        return false;
      }

      // Optimistic update - add new participant immediately
      const newAvailability: Availability = {
        participantName: participantName.trim(),
        availableDates: [],
        unavailableDates: [],
        timestamp: Date.now(),
        isLocked: false,
      };
      setAvailabilitiesRef.current((prev) => [...prev, newAvailability]);

      try {
        const response = await fetch(
          `/api/meetings/${meetingId}/availability`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantName: participantName.trim(),
              availableDates: [],
            }),
          }
        );

        if (response.ok) {
          return true;
        }
        // Rollback on error
        setAvailabilitiesRef.current((prev) =>
          prev.filter((a) => a.participantName !== participantName.trim())
        );
        return false;
      } catch (error) {
        console.error('Error adding participant:', error);
        // Rollback on error
        setAvailabilitiesRef.current((prev) =>
          prev.filter((a) => a.participantName !== participantName.trim())
        );
        onErrorRef.current?.(tRef.current('meeting.alerts.addParticipantFailed'));
        return false;
      }
    },
    [meetingId]
  );

  const handleStatusClick = useCallback(
    async (
      participant: string,
      date: string,
      currentStatus: ParticipantStatus
    ) => {
      // Status cycle: undecided -> available -> unavailable -> undecided
      let newStatus: ParticipantStatus;
      if (currentStatus === 'undecided') {
        newStatus = 'available';
      } else if (currentStatus === 'available') {
        newStatus = 'unavailable';
      } else {
        newStatus = 'undecided';
      }

      // Find current participant's availability
      const currentAvailability = availabilitiesRef.current.find(
        (a) => a.participantName === participant
      );
      const currentAvailableDates = currentAvailability?.availableDates || [];
      const currentUnavailableDates = currentAvailability?.unavailableDates || [];

      // Calculate new dates
      let newAvailableDates = currentAvailableDates.filter((d) => d !== date);
      let newUnavailableDates = currentUnavailableDates.filter((d) => d !== date);

      if (newStatus === 'available') {
        newAvailableDates.push(date);
      } else if (newStatus === 'unavailable') {
        newUnavailableDates.push(date);
      }

      // Optimistic update - update local state immediately
      setAvailabilitiesRef.current((prev) =>
        prev.map((a) =>
          a.participantName === participant
            ? { ...a, availableDates: newAvailableDates, unavailableDates: newUnavailableDates }
            : a
        )
      );

      try {
        const response = await fetch(
          `/api/meetings/${meetingId}/availability`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantName: participant,
              availableDates: newAvailableDates,
              unavailableDates: newStatus === 'unavailable' ? [date] : [],
              statusUpdate: { date, status: newStatus },
              isLocked: lockedParticipantsRef.current.has(participant),
            }),
          }
        );

        if (!response.ok) {
          // Rollback on error
          setAvailabilitiesRef.current((prev) =>
            prev.map((a) =>
              a.participantName === participant
                ? { ...a, availableDates: currentAvailableDates, unavailableDates: currentUnavailableDates }
                : a
            )
          );
          onErrorRef.current?.(tRef.current('meeting.alerts.updateFailed'));
        }
      } catch (error) {
        console.error('Error updating status:', error);
        // Rollback on error
        setAvailabilitiesRef.current((prev) =>
          prev.map((a) =>
            a.participantName === participant
              ? { ...a, availableDates: currentAvailableDates, unavailableDates: currentUnavailableDates }
              : a
          )
        );
        onErrorRef.current?.(tRef.current('meeting.alerts.networkError'));
      }
    },
    [meetingId]
  );

  const handleToggleLock = useCallback(
    async (participant: string) => {
      const currentAvailability = availabilitiesRef.current.find(
        (a) => a.participantName === participant
      );
      if (!currentAvailability) return;

      const newIsLocked = !lockedParticipantsRef.current.has(participant);

      // Optimistic update
      setLockedParticipants((prev) => {
        const newSet = new Set(prev);
        if (newIsLocked) {
          newSet.add(participant);
        } else {
          newSet.delete(participant);
        }
        return newSet;
      });

      // Send to backend
      try {
        const response = await fetch(
          `/api/meetings/${meetingId}/availability`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantName: participant,
              availableDates: currentAvailability.availableDates,
              unavailableDates: currentAvailability.unavailableDates,
              isLocked: newIsLocked,
            }),
          }
        );

        if (!response.ok) {
          // Rollback on error
          setLockedParticipants((prev) => {
            const newSet = new Set(prev);
            if (newIsLocked) {
              newSet.delete(participant);
            } else {
              newSet.add(participant);
            }
            return newSet;
          });
        }
      } catch (error) {
        console.error('Error updating lock status:', error);
        // Rollback on error
        setLockedParticipants((prev) => {
          const newSet = new Set(prev);
          if (newIsLocked) {
            newSet.delete(participant);
          } else {
            newSet.add(participant);
          }
          return newSet;
        });
      }
    },
    [meetingId, setLockedParticipants]
  );

  const handleUpdateMeeting = useCallback(
    async (title: string, dates: string[], participants: string[]) => {
      if (dates.length === 0) {
        onErrorRef.current?.(tRef.current('meeting.alerts.selectDates'));
        return false;
      }

      if (!title.trim()) {
        onErrorRef.current?.(tRef.current('meeting.alerts.enterTitle'));
        return false;
      }

      try {
        const response = await fetch(`/api/meetings/${meetingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            dates: dates.sort(),
            participants,
          }),
        });

        if (response.ok) {
          // Fetch new data after major update (dates/participants change)
          await fetchMeetingData(true);
          return true;
        } else {
          onErrorRef.current?.(tRef.current('meeting.edit.updateFailed'));
          return false;
        }
      } catch (error) {
        console.error('Error updating dates:', error);
        onErrorRef.current?.(tRef.current('meeting.alerts.updateScheduleFailed'));
        return false;
      }
    },
    [meetingId, fetchMeetingData]
  );

  return {
    handleAddParticipant,
    handleStatusClick,
    handleToggleLock,
    handleUpdateMeeting,
  };
}
