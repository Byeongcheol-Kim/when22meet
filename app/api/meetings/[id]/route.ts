import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { Meeting } from '@/lib/types';
import {
  fetchMeetingWithAvailabilities,
  getMeetingParticipants,
  saveMeeting,
  saveAvailability,
  deleteAvailability,
} from '@/lib/utils/redis';
import { REDIS_KEYS } from '@/lib/constants/config';

// Get meeting details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use optimized bulk fetch (solves N+1 query problem)
    const result = await fetchMeetingWithAvailabilities(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      meeting: result.meeting,
      availabilities: result.availabilities
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}

// Update meeting dates
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, dates, participants } = body;

    if (!dates || dates.length === 0) {
      return NextResponse.json(
        { error: 'Dates are required' },
        { status: 400 }
      );
    }

    if (title !== undefined && !title.trim()) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    // Get existing meeting
    const meetingData = await redis.get(REDIS_KEYS.meeting(id));
    if (!meetingData) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetingData as Meeting;

    // Update fields
    if (title !== undefined) {
      meeting.title = title.trim();
    }
    meeting.dates = dates;
    meeting.updatedAt = new Date().toISOString();

    // Save updated meeting with centralized TTL
    await saveMeeting(meeting);

    // Handle participant updates if provided
    if (participants !== undefined) {
      // Get current participants using optimized method
      const currentParticipants = await getMeetingParticipants(id);

      // Add new participants
      for (const participantName of participants) {
        if (!currentParticipants.includes(participantName)) {
          await saveAvailability(id, participantName, {
            dates: [],
            unavailableDates: [],
            timestamp: Date.now(),
            isLocked: false,
          });
        }
      }

      // Remove participants that are no longer in the list
      for (const currentParticipant of currentParticipants) {
        if (!participants.includes(currentParticipant)) {
          await deleteAvailability(id, currentParticipant);
        }
      }
    }

    return NextResponse.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}