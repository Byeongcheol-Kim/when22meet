import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { Meeting, StoredAvailability } from '@/lib/types';
import { saveMeeting, saveAvailability } from '@/lib/utils/redis';
import {
  CONFIG,
  REDIS_KEYS,
  VALIDATION_PATTERNS,
} from '@/lib/constants/config';

// Update participant availability
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { participantName, availableDates, statusUpdate, isLocked } = body;

    if (!participantName || !availableDates) {
      return NextResponse.json(
        { error: 'Participant name and available dates are required' },
        { status: 400 }
      );
    }

    // Validate participant name length
    if (participantName.length > CONFIG.MAX_PARTICIPANT_NAME_LENGTH) {
      return NextResponse.json(
        {
          error: `Participant name is too long (max ${CONFIG.MAX_PARTICIPANT_NAME_LENGTH} characters)`,
        },
        { status: 400 }
      );
    }

    // Prevent Redis key injection using centralized pattern
    if (VALIDATION_PATTERNS.REDIS_UNSAFE_CHARS.test(participantName)) {
      return NextResponse.json(
        { error: 'Invalid characters in participant name' },
        { status: 400 }
      );
    }

    // Check if meeting exists and update participants list
    const meetingData = await redis.get(REDIS_KEYS.meeting(id));
    if (!meetingData) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetingData as Meeting;

    // Add participant to meeting if not already there
    if (!meeting.participants.includes(participantName)) {
      meeting.participants.push(participantName);
      await saveMeeting(meeting);
    }

    // Get existing data to preserve timestamp and unavailable dates
    const existingData = await redis.get(
      REDIS_KEYS.availability(id, participantName)
    );
    let existingParsed: StoredAvailability | null = null;
    let timestamp = Date.now();
    let currentUnavailableDates: string[] = [];
    let currentIsLocked = false;

    if (existingData) {
      existingParsed = existingData as StoredAvailability;
      // Preserve timestamp from existing data
      if (existingParsed) {
        timestamp = existingParsed.timestamp || timestamp;
        currentUnavailableDates = existingParsed.unavailableDates || [];
        currentIsLocked = existingParsed.isLocked || false;
      }
    }

    // Update locked status if provided
    if (isLocked !== undefined) {
      currentIsLocked = isLocked;
    }

    // Update unavailable dates based on status update
    if (statusUpdate) {
      if (statusUpdate.status === 'unavailable') {
        // Add to unavailable list
        if (!currentUnavailableDates.includes(statusUpdate.date)) {
          currentUnavailableDates.push(statusUpdate.date);
        }
      } else {
        // Remove from unavailable list (for available or undecided)
        currentUnavailableDates = currentUnavailableDates.filter(
          (d) => d !== statusUpdate.date
        );
      }
    }

    // Save availability with timestamp for ordering using centralized utility
    await saveAvailability(id, participantName, {
      dates: availableDates,
      unavailableDates: currentUnavailableDates,
      timestamp: timestamp,
      isLocked: currentIsLocked,
    });

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}