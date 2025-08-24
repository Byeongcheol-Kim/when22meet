import { nanoid } from 'nanoid';

export function generateMeetingId(): string {
  return nanoid(8);
}