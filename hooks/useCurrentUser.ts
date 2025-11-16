'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'when2meet_user_';
const ROLE_KEY_PREFIX = 'when2meet_role_';

export type UserRole = 'participant' | 'organizer';

interface UseCurrentUserProps {
  meetingId: string;
  participants: string[];
  lockedParticipants?: Set<string>;
}

interface UseCurrentUserReturn {
  currentUser: string | null;
  userRole: UserRole;
  setCurrentUser: (user: string, role?: UserRole) => void;
  clearCurrentUser: () => void;
  isUserSelected: boolean;
  needsSelection: boolean;
  isOrganizer: boolean;
}

export function useCurrentUser({
  meetingId,
  participants,
}: UseCurrentUserProps): UseCurrentUserReturn {
  const [currentUser, setCurrentUserState] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('participant');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !meetingId) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${meetingId}`;
    const savedUser = localStorage.getItem(storageKey);

    if (savedUser === '__organizer__') {
      // Organizer mode (not tied to specific participant)
      setCurrentUserState('__organizer__');
      setUserRole('organizer');
    } else if (savedUser && participants.includes(savedUser)) {
      // User exists in localStorage and is still a valid participant
      setCurrentUserState(savedUser);

      // Load role
      const roleKey = `${ROLE_KEY_PREFIX}${meetingId}`;
      const savedRole = localStorage.getItem(roleKey);
      if (savedRole === 'organizer' || savedRole === 'participant') {
        setUserRole(savedRole);
      }
    } else if (savedUser && !participants.includes(savedUser) && savedUser !== '__organizer__') {
      // User was saved but is no longer a participant (removed)
      localStorage.removeItem(storageKey);
      setCurrentUserState(null);
    }

    setIsInitialized(true);
  }, [meetingId, participants]);

  // Set current user and persist to localStorage
  const setCurrentUser = useCallback(
    (user: string, role: UserRole = 'participant') => {
      if (typeof window === 'undefined' || !meetingId) return;

      const storageKey = `${STORAGE_KEY_PREFIX}${meetingId}`;
      const roleKey = `${ROLE_KEY_PREFIX}${meetingId}`;

      localStorage.setItem(storageKey, user);
      localStorage.setItem(roleKey, role);
      setCurrentUserState(user);
      setUserRole(role);
    },
    [meetingId]
  );

  // Clear current user from localStorage
  const clearCurrentUser = useCallback(() => {
    if (typeof window === 'undefined' || !meetingId) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${meetingId}`;
    const roleKey = `${ROLE_KEY_PREFIX}${meetingId}`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(roleKey);
    setCurrentUserState(null);
    setUserRole('participant');
  }, [meetingId]);

  // Check if a valid user is selected
  const isUserSelected =
    currentUser === '__organizer__' ||
    (currentUser !== null && participants.includes(currentUser));

  // Check if user selection is needed (initialized but no valid user selected)
  const needsSelection = isInitialized && !isUserSelected && participants.length > 0;

  const isOrganizer = userRole === 'organizer';

  return {
    currentUser,
    userRole,
    setCurrentUser,
    clearCurrentUser,
    isUserSelected,
    needsSelection,
    isOrganizer,
  };
}
