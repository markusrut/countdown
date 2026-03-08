"use client";

import { useState, useEffect } from 'react';
import type { CountdownEvent } from '../types';
import { getUserTimezone } from '../utils/time';
import { Rocket, Edit3 } from 'lucide-react';
import Select from 'react-select';
import { useSession } from 'next-auth/react';

interface Props {
  initialEvent?: CountdownEvent;
  onSubmit: (event: CountdownEvent) => void;
}

// Common timezone aliases for better searchability
const TIMEZONE_ALIASES: Record<string, string[]> = {
  'UTC': ['UTC', 'GMT'],
  'Europe/London': ['BST'],
  'Europe/Paris': ['CET', 'CEST'],
  'Europe/Helsinki': ['EET', 'EEST'],
  'America/New_York': ['EST', 'EDT'],
  'America/Chicago': ['CST', 'CDT'],
  'America/Denver': ['MST', 'MDT'],
  'America/Los_Angeles': ['PST', 'PDT'],
  'Asia/Tokyo': ['JST'],
  'Asia/Kolkata': ['IST'],
  'Australia/Sydney': ['AEST', 'AEDT'],
  'Pacific/Auckland': ['NZST', 'NZDT'],
};

// Fallback timezones in case Intl is limited
const rawTimezones = Intl.supportedValuesOf 
  ? Intl.supportedValuesOf('timeZone') 
  : [getUserTimezone(), 'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

const TIMEZONE_OPTIONS = rawTimezones.map(tz => {
  const aliases = TIMEZONE_ALIASES[tz];
  const label = aliases ? `${tz} (${aliases.join(', ')})` : tz;
  return { value: tz, label };
});
// Add aliases that might not be in the browser's IANA list but are commonly requested
const extraOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'UTC', label: 'GMT' }
];
// Append extra options if they don't already exist with that exact label
extraOptions.forEach(opt => {
  if (!TIMEZONE_OPTIONS.some(existing => existing.label === opt.label)) {
    TIMEZONE_OPTIONS.unshift(opt);
  }
});

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PLACEHOLDER_IDEAS = [
  "Pizza night",
  "Product launch",
  "Summer vacation",
  "New Year's Eve",
  "Wedding day",
  "Graduation",
  "Birthday party",
  "Weekend getaway",
  "Final exam",
  "Marathon day",
  "Moving day",
  "Family reunion",
  "Game release",
  "Concert starts",
  "Anniversary",
  "Retirement",
  "Flight boarding",
  "Project deadline",
  "Road trip",
  "Festival kicks off"
];

export const EventForm = ({ initialEvent, onSubmit }: Props) => {
  const [name, setName] = useState(initialEvent?.name || '');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [timezone, setTimezone] = useState('');
  const [placeholderText, setPlaceholderText] = useState('My Countdown');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // If initialEvent exists, parse date and time out of targetDate ("YYYY-MM-DDTHH:mm")
    const initDate = initialEvent ? initialEvent.targetDate.split('T')[0] : getTodayDateString();
    const initTime = initialEvent && initialEvent.targetDate.includes('T') ? initialEvent.targetDate.split('T')[1] : '00:00';
    
    setDateStr(initDate);
    setTimeStr(initTime);
    setTimezone(initialEvent?.timezone || getUserTimezone());
    setPlaceholderText(PLACEHOLDER_IDEAS[Math.floor(Math.random() * PLACEHOLDER_IDEAS.length)]);
    setIsMounted(true);
  }, [initialEvent]);

  // Prevent rendering form elements that rely on variable state until mounted
  if (!initialEvent && !isMounted) {
    return <div className="animate-fade-in glass-panel" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '2.5rem', minHeight: '400px' }}></div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr || !timezone) return;
    
    // Combine date and time (standard datetime-local format)
    const finalTime = timeStr || '00:00';
    const targetDate = `${dateStr}T${finalTime}`;

    setIsSubmitting(true);

    if (!initialEvent) {
      try {
        const { createEvent } = await import('../app/actions');
        const newEvent = await createEvent({
          title: name,
          targetDate,
          timezone,
        });
        
        onSubmit({
          name,
          targetDate,
          timezone,
          shortCode: newEvent.shortCode
        });
      } catch (err) {
        console.error("Failed to save event", err);
        alert('Failed to save countdown. Please try again.');
      }
    } else {
      // Editing an existing event (Dashboard handles the actual update action)
      onSubmit({ name, targetDate, timezone });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '2.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {initialEvent ? 'Edit Countdown' : 'Create Countdown'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="input-base" 
            placeholder={placeholderText} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Date</label>
            <input 
              type="date" 
              required 
              value={dateStr} 
              onChange={(e) => setDateStr(e.target.value)}
              className="input-base" 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Time</label>
            <input 
              type="time" 
              value={timeStr} 
              onChange={(e) => setTimeStr(e.target.value)}
              className="input-base" 
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Timezone</label>
          {isMounted ? (
            <Select
              options={TIMEZONE_OPTIONS}
              value={TIMEZONE_OPTIONS.find(opt => opt.value === timezone)}
              onChange={(selected) => setTimezone(selected?.value || getUserTimezone())}
              styles={{
                control: (base, state) => ({
                  ...base,
                  background: 'var(--bg-base)',
                  borderColor: state.isFocused ? 'var(--text-secondary)' : 'var(--glass-border)',
                  boxShadow: 'none',
                  minHeight: '46px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-fast)'
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'var(--text-primary)',
                }),
                input: (base) => ({
                  ...base,
                  color: 'var(--text-primary)'
                }),
                menu: (base) => ({
                  ...base,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-subtle)'
                }),
                option: (base, state) => ({
                  ...base,
                  background: state.isFocused ? 'var(--bg-surface-hover)' : 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  ':active': {
                    background: 'var(--bg-surface-hover)'
                  }
                })
              }}
            />
          ) : (
            <div style={{ height: '46px', width: '100%', background: 'var(--bg-base)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)' }} />
          )}
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Search for locations e.g. "CET", "Europe/London", "America/New_York".
          </p>
        </div>

        <button disabled={isSubmitting} type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: isSubmitting ? 0.7 : 1 }}>
          {initialEvent ? <Edit3 size={20} /> : <Rocket size={20} />}
          {isSubmitting ? 'Saving...' : initialEvent ? 'Save Changes' : "Start Countdown"}
        </button>
      </form>
    </div>
  );
};
