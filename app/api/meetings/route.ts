import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { generateMeetingId } from '@/lib/utils';
import { Meeting } from '@/lib/types';

// Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, dates, participants = [] } = body;

    if (!title || !dates || dates.length === 0) {
      return NextResponse.json(
        { error: 'Title and dates are required' },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.length > 100) {
      return NextResponse.json(
        { error: 'Title is too long (max 100 characters)' },
        { status: 400 }
      );
    }

    // Validate dates array length
    if (dates.length > 365) {
      return NextResponse.json(
        { error: 'Too many dates selected (max 365)' },
        { status: 400 }
      );
    }

    const meetingId = generateMeetingId();
    const meeting: Meeting = {
      id: meetingId,
      title,
      dates,
      participants: [], // Initially empty array
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 18 months
    };

    // Save to Redis with 18-month TTL
    await redis.setex(
      `meeting:${meetingId}`,
      18 * 30 * 24 * 60 * 60, // 18 months
      meeting
    );

    // If participants were provided, add them as availabilities
    if (participants && participants.length > 0) {
      for (const participantName of participants) {
        const availability = {
          participantName,
          availableDates: [],
          unavailableDates: [],
          isLocked: false
        };
        await redis.setex(
          `availability:${meetingId}:${participantName}`,
          18 * 30 * 24 * 60 * 60, // 18 months
          availability
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      meetingId,
      meeting 
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}