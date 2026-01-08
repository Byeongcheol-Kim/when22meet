import { NextRequest, NextResponse } from 'next/server';
import { generateMeetingId } from '@/lib/utils';
import { Meeting, TIME_SLOTS, TimeSlotValue } from '@/lib/types';
import { saveMeeting, saveAvailability } from '@/lib/utils/redis';
import { CONFIG } from '@/lib/constants/config';

// Valid time slot values for validation
const VALID_TIME_SLOTS = TIME_SLOTS.map((slot) => slot.value);

// Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      dates,
      participants = [],
      locale = 'ko',
      timeSlotEnabled = false,
      timeSlots = [],
      consecutiveSlotCount = 1,
    } = body;

    if (!title || !dates || dates.length === 0) {
      return NextResponse.json(
        { error: 'Title and dates are required' },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.length > CONFIG.MAX_MEETING_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title is too long (max ${CONFIG.MAX_MEETING_TITLE_LENGTH} characters)` },
        { status: 400 }
      );
    }

    // Validate dates array length
    if (dates.length > CONFIG.MAX_DATES) {
      return NextResponse.json(
        { error: `Too many dates selected (max ${CONFIG.MAX_DATES})` },
        { status: 400 }
      );
    }

    // Validate time slots if enabled
    if (timeSlotEnabled) {
      if (!timeSlots || timeSlots.length === 0) {
        return NextResponse.json(
          { error: 'At least one time slot must be selected when time slots are enabled' },
          { status: 400 }
        );
      }
      // Validate each time slot value
      const invalidSlots = timeSlots.filter(
        (slot: string) => !VALID_TIME_SLOTS.includes(slot as TimeSlotValue)
      );
      if (invalidSlots.length > 0) {
        return NextResponse.json(
          { error: `Invalid time slot values: ${invalidSlots.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const meetingId = generateMeetingId();
    const meeting: Meeting = {
      id: meetingId,
      title,
      dates,
      participants: [], // Initially empty array
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + CONFIG.MEETING_TTL_SECONDS * 1000).toISOString(),
      locale, // Save user's language preference
      timeSlotEnabled: timeSlotEnabled || undefined,
      timeSlots: timeSlotEnabled ? (timeSlots as TimeSlotValue[]) : undefined,
      consecutiveSlotCount: timeSlotEnabled && consecutiveSlotCount > 1 ? consecutiveSlotCount : undefined,
    };

    // Save to Redis with centralized TTL
    await saveMeeting(meeting);

    // If participants were provided, add them as availabilities
    if (participants && participants.length > 0) {
      const timestamp = Date.now();
      for (const participantName of participants) {
        await saveAvailability(meetingId, participantName, {
          dates: [],
          unavailableDates: [],
          timestamp, // CRITICAL: Include timestamp for proper sorting
          isLocked: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      meetingId,
      meeting,
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}