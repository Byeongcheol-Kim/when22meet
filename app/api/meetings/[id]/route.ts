import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

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

    const meeting = JSON.parse(meetingData);
    
    // Get all availabilities for this meeting
    const availabilityKeys = await redis.keys(`availability:${id}:*`);
    const availabilities = [];
    
    for (const key of availabilityKeys) {
      const data = await redis.get(key);
      if (data) {
        const participantName = key.split(':')[2];
        const parsedData = JSON.parse(data);
        
        // Handle both old format (array) and new format (object with timestamp)
        if (Array.isArray(parsedData)) {
          availabilities.push({
            participantName,
            availableDates: parsedData,
            unavailableDates: [],
            timestamp: 0 // Old entries without timestamp
          });
        } else {
          availabilities.push({
            participantName,
            availableDates: parsedData.dates || [],
            unavailableDates: parsedData.unavailableDates || [],
            timestamp: parsedData.timestamp || 0
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