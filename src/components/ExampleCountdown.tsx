"use client";

import { useState, useEffect } from 'react';
import { MiniCountdown } from './MiniCountdown';
import { Calendar } from 'lucide-react';

interface Holiday {
  name: string;
  month: number; // 1-12
  day: number;
  timezone: string;
}

const HOLIDAYS: Holiday[] = [
  { name: "New Year's in Tokyo", month: 1, day: 1, timezone: "Asia/Tokyo" },
  { name: "Halloween in New York", month: 10, day: 31, timezone: "America/New_York" },
  { name: "Midsummer in Stockholm", month: 6, day: 21, timezone: "Europe/Stockholm" },
  { name: "Christmas in London", month: 12, day: 25, timezone: "Europe/London" },
  { name: "St. Patrick's Day in Dublin", month: 3, day: 17, timezone: "Europe/Dublin" },
  { name: "Diwali in Mumbai", month: 11, day: 1, timezone: "Asia/Kolkata" }, 
];

const getNextHolidays = (count: number = 3): { id: string; name: string; targetDate: string; timezone: string }[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const upcoming = HOLIDAYS.map((h, i) => {
    let year = currentYear;
    // If the holiday month/day has already passed this year, it happens next year
    if (h.month < currentMonth || (h.month === currentMonth && h.day <= currentDay)) {
      year = currentYear + 1;
    }
    
    const monthStr = String(h.month).padStart(2, '0');
    const dayStr = String(h.day).padStart(2, '0');
    const targetDateStr = `${year}-${monthStr}-${dayStr}T00:00`;
    
    return {
      id: `example-${i}`,
      ...h,
      year,
      targetDateStr
    };
  }).sort((a, b) => a.targetDateStr.localeCompare(b.targetDateStr));

  return upcoming.slice(0, count).map(target => ({
    id: target.id,
    name: target.name,
    targetDate: target.targetDateStr,
    timezone: target.timezone,
  }));
};

export const ExampleCountdown = () => {
  const [events, setEvents] = useState<{ id: string; name: string; targetDate: string; timezone: string }[]>([]);

  useEffect(() => {
    setEvents(getNextHolidays(3));
  }, []);

  if (events.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', pointerEvents: 'none' }}>
      {events.map((event, index) => (
        <div 
          key={event.id}
          className="glass-panel animate-fade-in"
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            animationDelay: `${index * 150}ms`,
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: 0, textAlign: 'left' }}>
             <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {event.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={12} />
                {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  timeZone: event.timezone
                }).format(new Date(event.targetDate))}
              </div>
              <span>•</span>
              <span>{event.timezone}</span>
            </div>
          </div>

          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MiniCountdown 
              targetDate={event.targetDate} 
              timezone={event.timezone} 
            />
          </div>
        </div>
      ))}
    </div>
  );
};
