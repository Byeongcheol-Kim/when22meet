export interface Meeting {
  id: string;
  title: string;
  dates: string[];
  participants: string[]; // List of participants
  createdAt: string;
  expiresAt: string;
  updatedAt?: string;
  locale?: string; // Language preference (ko or en)
}

export interface Availability {
  participantName: string;
  availableDates: string[]; // List of available dates
  unavailableDates?: string[]; // List of explicitly unavailable dates (undecided if not present)
  timestamp?: number;
  isLocked?: boolean; // Whether schedule is finalized
}

// Availability data structure stored in Redis
export interface StoredAvailability {
  dates: string[];
  unavailableDates?: string[];
  timestamp?: number;
  isLocked?: boolean;
}

export interface TimeSlot {
  value: string;
  label: string;
}