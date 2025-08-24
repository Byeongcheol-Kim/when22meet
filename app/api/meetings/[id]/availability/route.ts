import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

// Update participant availability
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { participantName, availableDates, unavailableDates, statusUpdate, isLocked } = body;

    if (!participantName || !availableDates) {
      return NextResponse.json(
        { error: 'Participant name and available dates are required' },
        { status: 400 }
      );
    }

    // Check if meeting exists and update participants list
    const meetingData = await redis.get(`meeting:${id}`);
    if (!meetingData) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = JSON.parse(meetingData);
    
    // Add participant to meeting if not already there
    if (!meeting.participants.includes(participantName)) {
      meeting.participants.push(participantName);
      await redis.setex(
        `meeting:${id}`,
        18 * 30 * 24 * 60 * 60, // 18개월
        JSON.stringify(meeting)
      );
    }

    // Get existing data to preserve timestamp and unavailable dates
    const existingData = await redis.get(`availability:${id}:${participantName}`);
    let existingParsed: any = null;
    let timestamp = Date.now();
    let currentUnavailableDates: string[] = [];
    let currentIsLocked = false;
    
    if (existingData) {
      existingParsed = JSON.parse(existingData);
      // Preserve timestamp from existing data
      timestamp = existingParsed.timestamp || timestamp;
      currentUnavailableDates = existingParsed.unavailableDates || [];
      currentIsLocked = existingParsed.isLocked || false;
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
        currentUnavailableDates = currentUnavailableDates.filter(d => d !== statusUpdate.date);
      }
    }
    
    // Save availability with timestamp for ordering
    await redis.setex(
      `availability:${id}:${participantName}`,
      18 * 30 * 24 * 60 * 60, // 18개월
      JSON.stringify({
        dates: availableDates,
        unavailableDates: currentUnavailableDates,
        timestamp: timestamp,
        isLocked: currentIsLocked
      })
    );

    return NextResponse.json({ 
      success: true,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}