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
  const targetDateInTz = new Date(targetDateStr);
  
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

/**
 * Formats the fallback title for a countdown, omitting the time if it is exactly 00:00 midnight.
 */
export const formatFallbackTitle = (targetDate: string | Date, timezone: string): string => {
  const date = new Date(targetDate);
  const fullFormat = new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false, 
    timeZone: timezone 
  }).format(date).replace(',', '');

  // If the time is exactly midnight, just return the date portion.
  // Note: some browsers might format midnight as "24:00" in hour12: false.
  if (fullFormat.endsWith(' 00:00') || fullFormat.endsWith(' 24:00')) {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      day: 'numeric', 
      timeZone: timezone 
    }).format(date);
  }
  
  return fullFormat;
};
