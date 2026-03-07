export interface CountdownEvent {
  name: string;
  targetDate: string; // ISO string in UTC or specific timezone
  timezone: string; // IANA timezone string e.g., 'America/New_York'
  shortCode?: string;
}

export interface RemainingTime {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}
