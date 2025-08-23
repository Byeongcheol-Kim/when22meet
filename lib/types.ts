export interface Meeting {
  id: string;
  title: string;
  dates: string[];
  participants: string[]; // 참가자 목록
  createdAt: string;
  expiresAt: string;
}

export interface Availability {
  participantName: string;
  availableDates: string[]; // 참가 가능한 날짜 목록
}

export interface TimeSlot {
  value: string;
  label: string;
}