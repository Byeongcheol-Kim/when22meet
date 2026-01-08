// Generate 30-minute time slots for 24 hours (48 slots total)
function generateTimeSlots() {
  const slots: { value: string; label: string; labelEn: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? '오전' : '오후';
      const ampmEn = hour < 12 ? 'AM' : 'PM';
      const label = `${ampm} ${hour12}:${String(minute).padStart(2, '0')}`;
      const labelEn = `${hour12}:${String(minute).padStart(2, '0')} ${ampmEn}`;
      slots.push({ value, label, labelEn });
    }
  }
  return slots;
}

// 30-minute interval time slots (00:00 ~ 23:30)
export const TIME_SLOTS = generateTimeSlots();

export type TimeSlotValue = string; // "HH:MM" format (e.g., "09:00", "14:30")

// Time slot shortcuts for quick selection
export const TIME_SLOT_SHORTCUTS = [
  {
    id: 'dawn',
    label: '새벽',
    labelEn: 'Dawn',
    description: '00:00 ~ 05:30',
    slots: ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30'],
  },
  {
    id: 'morning',
    label: '오전',
    labelEn: 'Morning',
    description: '06:00 ~ 11:30',
    slots: ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  },
  {
    id: 'early_afternoon',
    label: '이른 오후',
    labelEn: 'Early Afternoon',
    description: '12:00 ~ 14:30',
    slots: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'],
  },
  {
    id: 'late_afternoon',
    label: '늦은 오후',
    labelEn: 'Late Afternoon',
    description: '15:00 ~ 17:30',
    slots: ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
  },
  {
    id: 'evening',
    label: '저녁',
    labelEn: 'Evening',
    description: '18:00 ~ 20:30',
    slots: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'],
  },
  {
    id: 'late_night',
    label: '심야',
    labelEn: 'Late Night',
    description: '21:00 ~ 23:30',
    slots: ['21:00', '21:30', '22:00', '22:30', '23:00', '23:30'],
  },
] as const;

export type TimeSlotShortcutId = (typeof TIME_SLOT_SHORTCUTS)[number]['id'];

export interface TimeSlot {
  value: string;
  label: string;
}

export interface Meeting {
  id: string;
  title: string;
  dates: string[];
  participants: string[]; // List of participants
  createdAt: string;
  expiresAt: string;
  updatedAt?: string;
  locale?: string; // Language preference (ko or en)
  timeSlotEnabled?: boolean; // Whether time slots are enabled
  timeSlots?: TimeSlotValue[]; // Selected time slots (if enabled)
  consecutiveSlotCount?: number; // Number of consecutive time slots for recommendation (default: 1)
}

export interface Availability {
  participantName: string;
  availableDates: string[]; // List of available dates (YYYY-MM-DD or YYYY-MM-DD:timeSlot)
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
