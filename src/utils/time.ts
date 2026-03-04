import { intervalToDuration, isBefore } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import type { RemainingTime } from '../types';

/**
 * Calculates the exact remaining time until the target date.
 * The target date is considered to be in the event's specified timezone.
 *
 * @param targetDateStr ISO string of the target time
 * @param eventTimezone IANA timezone string (e.g., 'Europe/Stockholm')
 * @returns RemainingTime object
 */
export const calculateRemainingTime = (
  targetDateStr: string,
  eventTimezone: string
): RemainingTime => {
  const now = new Date();
  
  // The targetDateStr usually comes from a datetime-local input, 
  // which does not have timezone information. We treat it as wall-clock time
  // in the specified eventTimezone.
  const targetDateInTz = fromZonedTime(targetDateStr, eventTimezone);
  
  const isPast = isBefore(targetDateInTz, now);
  
  // Calculate the absolute duration between the two dates, regardless of which is first
  const duration = intervalToDuration({
    start: isPast ? targetDateInTz : now,
    end: isPast ? now : targetDateInTz,
  });
  
  return {
    years: duration.years || 0,
    months: duration.months || 0,
    days: duration.days || 0,
    hours: duration.hours || 0,
    minutes: duration.minutes || 0,
    seconds: duration.seconds || 0,
    isPast,
  };
};

/**
 * Helper to get the current local timezone of the user
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
