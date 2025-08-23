import { nanoid } from 'nanoid';

export function generateMeetingId(): string {
  return nanoid(8);
}

export const DEFAULT_TIME_SLOTS = [
  '오전',
  '점심',
  '오후',
  '저녁'
];