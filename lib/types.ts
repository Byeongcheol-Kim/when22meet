export interface Meeting {
  id: string;
  title: string;
  dates: string[];
  participants: string[]; // 참가자 목록
  createdAt: string;
  expiresAt: string;
  updatedAt?: string;
}

export interface Availability {
  participantName: string;
  availableDates: string[]; // 참가 가능한 날짜 목록
  unavailableDates?: string[]; // 명시적으로 불참인 날짜 목록 (없으면 미정)
  timestamp?: number;
  isLocked?: boolean; // 스케줄 확정 여부
}

// Redis에 저장되는 Availability 데이터 구조
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