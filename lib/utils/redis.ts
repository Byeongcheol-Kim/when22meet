// Redis utility functions for optimized queries
// Solves N+1 query problem by using bulk operations

import redis from '@/lib/redis';
import { Meeting, Availability, StoredAvailability } from '@/lib/types';
import { REDIS_KEYS, CONFIG } from '@/lib/constants/config';

/**
 * Fetch all availabilities for a meeting using bulk MGET operation
 * This solves the N+1 query problem by fetching all data in a single round-trip
 */
export async function fetchMeetingAvailabilities(
  meetingId: string
): Promise<Availability[]> {
  // Get all availability keys for this meeting
  const keys = await redis.keys(REDIS_KEYS.availabilityPattern(meetingId));

  if (keys.length === 0) {
    return [];
  }

  // Use MGET to fetch all values in a single call (solves N+1 problem)
  const values = await redis.mget<(StoredAvailability | string[] | null)[]>(...keys);

  const availabilities: Availability[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const data = values[i];

    if (data) {
      const participantName = key.split(':')[2];
      const parsedData = data;

      // Handle both old format (array) and new format (object with timestamp)
      if (Array.isArray(parsedData)) {
        availabilities.push({
          participantName,
          availableDates: parsedData,
          unavailableDates: [],
          timestamp: 0, // Old entries without timestamp
          isLocked: false,
        });
      } else {
        availabilities.push({
          participantName,
          availableDates: parsedData.dates || [],
          unavailableDates: parsedData.unavailableDates || [],
          timestamp: parsedData.timestamp || 0,
          isLocked: parsedData.isLocked || false,
        });
      }
    }
  }

  // Sort by timestamp (newest first)
  availabilities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return availabilities;
}

/**
 * Fetch meeting with all availabilities in optimized way
 */
export async function fetchMeetingWithAvailabilities(
  meetingId: string
): Promise<{ meeting: Meeting; availabilities: Availability[] } | null> {
  const meetingData = await redis.get(REDIS_KEYS.meeting(meetingId));

  if (!meetingData) {
    return null;
  }

  const meeting = meetingData as Meeting;
  const availabilities = await fetchMeetingAvailabilities(meetingId);

  return { meeting, availabilities };
}

/**
 * Get current participant names for a meeting
 */
export async function getMeetingParticipants(meetingId: string): Promise<string[]> {
  const keys = await redis.keys(REDIS_KEYS.availabilityPattern(meetingId));
  return keys.map((key: string) => key.replace(`availability:${meetingId}:`, ''));
}

/**
 * Calculate top dates (most available dates) from availabilities
 */
export function calculateTopDates(
  meeting: Meeting,
  availabilities: Availability[],
  limit: number = 3
): Array<{ date: string; count: number; rank: number }> {
  if (availabilities.length === 0) {
    return [];
  }

  // Create a map for O(1) lookups
  const availabilityMap = new Map(
    availabilities.map((a) => [a.participantName, new Set(a.availableDates)])
  );

  // Calculate scores
  const dateScores: { [date: string]: number } = {};

  for (const date of meeting.dates) {
    let count = 0;
    for (const availability of availabilities) {
      const dateSet = availabilityMap.get(availability.participantName);
      if (dateSet && dateSet.has(date)) {
        count++;
      }
    }
    dateScores[date] = count;
  }

  // Sort and extract top dates
  return Object.entries(dateScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .filter(([, count]) => count > 0)
    .map(([date, count], index) => ({
      date,
      count,
      rank: index + 1,
    }));
}

/**
 * Save meeting data with TTL
 */
export async function saveMeeting(meeting: Meeting): Promise<void> {
  await redis.setex(
    REDIS_KEYS.meeting(meeting.id),
    CONFIG.MEETING_TTL_SECONDS,
    meeting
  );
}

/**
 * Save availability data with TTL
 */
export async function saveAvailability(
  meetingId: string,
  participantName: string,
  data: StoredAvailability
): Promise<void> {
  await redis.setex(
    REDIS_KEYS.availability(meetingId, participantName),
    CONFIG.MEETING_TTL_SECONDS,
    data
  );
}

/**
 * Delete availability for a participant
 */
export async function deleteAvailability(
  meetingId: string,
  participantName: string
): Promise<void> {
  await redis.del(REDIS_KEYS.availability(meetingId, participantName));
}
