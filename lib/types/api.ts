// API response types for type safety
import { Meeting, Availability } from '@/lib/types';

// Meeting API responses
export interface CreateMeetingResponse {
  success: boolean;
  meetingId: string;
  meeting: Meeting;
}

export interface GetMeetingResponse {
  meeting: Meeting;
  availabilities: Availability[];
}

export interface UpdateMeetingResponse {
  success: boolean;
  meeting: Meeting;
}

export interface DeleteMeetingResponse {
  success: boolean;
  message: string;
}

// Availability API responses
export interface UpdateAvailabilityResponse {
  success: boolean;
  message: string;
}

// URL Shortener API responses
export interface ShortenUrlResponse {
  success: boolean;
  shortUrl: string;
  code: string;
}

// Error response
export interface ApiErrorResponse {
  error: string;
  details?: string;
}

// Status update payload
export interface StatusUpdatePayload {
  date: string;
  status: 'available' | 'unavailable' | 'undecided';
}

// Availability update request
export interface UpdateAvailabilityRequest {
  participantName: string;
  availableDates: string[];
  unavailableDates?: string[];
  statusUpdate?: StatusUpdatePayload;
  isLocked?: boolean;
}

// Meeting update request
export interface UpdateMeetingRequest {
  title?: string;
  dates: string[];
  participants?: string[];
}

// Create meeting request
export interface CreateMeetingRequest {
  title: string;
  dates: string[];
  participants: string[];
  locale?: string;
}
