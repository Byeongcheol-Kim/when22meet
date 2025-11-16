'use client';

import { useCallback } from 'react';
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
  const handleAddParticipant = useCallback(
    async (participantName: string) => {
      if (!participantName.trim()) {
        onError?.(t('meeting.alerts.enterName'));
        return false;
      }

      if (participantName.trim().length > 10) {
        onError?.(t('meeting.alerts.nameTooLong'));
        return false;
      }

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
          await fetchMeetingData(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error adding participant:', error);
        onError?.(t('meeting.alerts.addParticipantFailed'));
        return false;
      }
    },
    [meetingId, fetchMeetingData, onError, t]
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
      const currentAvailability = availabilities.find(
        (a) => a.participantName === participant
      );
      const currentAvailableDates = currentAvailability?.availableDates || [];
      const currentUnavailableDates =
        currentAvailability?.unavailableDates || [];

      // Optimistic UI - Update status immediately
      const optimisticAvailabilities = availabilities.map((a) => {
        if (a.participantName === participant) {
          let newAvailableDates = [...currentAvailableDates];
          let newUnavailableDates = [...currentUnavailableDates];

          // Remove from all lists first
          newAvailableDates = newAvailableDates.filter((d) => d !== date);
          newUnavailableDates = newUnavailableDates.filter((d) => d !== date);

          // Add to appropriate list
          if (newStatus === 'available') {
            newAvailableDates.push(date);
          } else if (newStatus === 'unavailable') {
            newUnavailableDates.push(date);
          }

          return {
            ...a,
            availableDates: newAvailableDates,
            unavailableDates: newUnavailableDates,
          };
        }
        return a;
      });

      // Optimistic update
      setAvailabilities(optimisticAvailabilities);

      // Calculate final dates for API
      let newAvailableDates = [...currentAvailableDates];
      newAvailableDates = newAvailableDates.filter((d) => d !== date);
      if (newStatus === 'available') {
        newAvailableDates.push(date);
      }

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
              isLocked: lockedParticipants.has(participant),
            }),
          }
        );

        if (!response.ok) {
          // Rollback on error, but preserve lock state
          await fetchMeetingData(true);
          onError?.(t('meeting.alerts.updateFailed'));
        }
      } catch (error) {
        console.error('Error updating status:', error);
        // Rollback on error, but preserve lock state
        await fetchMeetingData(true);
        onError?.(t('meeting.alerts.networkError'));
      }
    },
    [
      availabilities,
      setAvailabilities,
      lockedParticipants,
      meetingId,
      fetchMeetingData,
      onError,
      t,
    ]
  );

  const handleToggleLock = useCallback(
    async (participant: string) => {
      const currentAvailability = availabilities.find(
        (a) => a.participantName === participant
      );
      if (!currentAvailability) return;

      const newIsLocked = !lockedParticipants.has(participant);

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
          await fetchMeetingData();
        }
      } catch (error) {
        console.error('Error updating lock status:', error);
        // Rollback on error
        await fetchMeetingData();
      }
    },
    [
      availabilities,
      lockedParticipants,
      setLockedParticipants,
      meetingId,
      fetchMeetingData,
    ]
  );

  const handleUpdateMeeting = useCallback(
    async (title: string, dates: string[], participants: string[]) => {
      if (dates.length === 0) {
        onError?.(t('meeting.alerts.selectDates'));
        return false;
      }

      if (!title.trim()) {
        onError?.(t('meeting.alerts.enterTitle'));
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
          await fetchMeetingData(true);
          return true;
        } else {
          onError?.(t('meeting.edit.updateFailed'));
          return false;
        }
      } catch (error) {
        console.error('Error updating dates:', error);
        onError?.(t('meeting.alerts.updateScheduleFailed'));
        return false;
      }
    },
    [meetingId, fetchMeetingData, onError, t]
  );

  return {
    handleAddParticipant,
    handleStatusClick,
    handleToggleLock,
    handleUpdateMeeting,
  };
}
