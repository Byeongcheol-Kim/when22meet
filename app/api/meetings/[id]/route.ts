import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { Meeting, StoredAvailability } from '@/lib/types';

// Get meeting details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meetingData = await redis.get(`meeting:${id}`);
    
    if (!meetingData) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const meeting = meetingData as Meeting;
    
    // Get all availabilities for this meeting
    const availabilityKeys = await redis.keys(`availability:${id}:*`);
    const availabilities = [];
    
    for (const key of availabilityKeys) {
      const data = await redis.get(key);
      if (data) {
        const participantName = key.split(':')[2];
        const parsedData = data as StoredAvailability | string[];
        
        // Handle both old format (array) and new format (object with timestamp)
        if (Array.isArray(parsedData)) {
          availabilities.push({
            participantName,
            availableDates: parsedData,
            unavailableDates: [],
            timestamp: 0, // Old entries without timestamp
            isLocked: false
          });
        } else {
          availabilities.push({
            participantName,
            availableDates: parsedData.dates || [],
            unavailableDates: parsedData.unavailableDates || [],
            timestamp: parsedData.timestamp || 0,
            isLocked: parsedData.isLocked || false
          });
        }
      }
    }
    
    // Sort by timestamp (newest first)
    availabilities.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      meeting,
      availabilities
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
    const meetingData = await redis.get(`meeting:${id}`);
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

    // Save updated meeting with same TTL
    await redis.setex(
      `meeting:${id}`,
      18 * 30 * 24 * 60 * 60, // 18 months
      meeting
    );

    // Handle participant updates if provided
    if (participants !== undefined) {
      // Get current availabilities
      const availabilityKeys = await redis.keys(`availability:${id}:*`);
      const currentParticipants = availabilityKeys.map((key: string) => 
        key.replace(`availability:${id}:`, '')
      );

      // Add new participants
      for (const participantName of participants) {
        if (!currentParticipants.includes(participantName)) {
          const availability = {
            participantName,
            availableDates: [],
            unavailableDates: [],
            isLocked: false
          };
          await redis.setex(
            `availability:${id}:${participantName}`,
            18 * 30 * 24 * 60 * 60, // 18 months
            availability
          );
        }
      }

      // Remove participants that are no longer in the list
      for (const currentParticipant of currentParticipants) {
        if (!participants.includes(currentParticipant)) {
          await redis.del(`availability:${id}:${currentParticipant}`);
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