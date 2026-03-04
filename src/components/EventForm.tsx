import { useState } from 'react';
import type { CountdownEvent } from '../types';
import { getUserTimezone } from '../utils/time';
import { Rocket, Edit3 } from 'lucide-react';
import Select from 'react-select';

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
  // If initialEvent exists, parse date and time out of targetDate ("YYYY-MM-DDTHH:mm")
  const initialDate = initialEvent ? initialEvent.targetDate.split('T')[0] : getTodayDateString();
  const initialTime = initialEvent && initialEvent.targetDate.includes('T') ? initialEvent.targetDate.split('T')[1] : '00:00';

  const [name, setName] = useState(initialEvent?.name || '');
  const [dateStr, setDateStr] = useState(initialDate);
  const [timeStr, setTimeStr] = useState(initialTime);
  const [timezone, setTimezone] = useState(initialEvent?.timezone || getUserTimezone());
  const [placeholderText] = useState(() => PLACEHOLDER_IDEAS[Math.floor(Math.random() * PLACEHOLDER_IDEAS.length)]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr || !timezone) return;
    
    // Combine date and time (standard datetime-local format)
    const finalTime = timeStr || '00:00';
    const targetDate = `${dateStr}T${finalTime}`;

    onSubmit({
      name,
      targetDate,
      timezone,
    });
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
          <Select
            options={TIMEZONE_OPTIONS}
            value={TIMEZONE_OPTIONS.find(opt => opt.value === timezone)}
            onChange={(selected) => setTimezone(selected?.value || getUserTimezone())}
            styles={{
              control: (base, state) => ({
                ...base,
                background: 'rgba(0, 0, 0, 0.2)',
                borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--glass-border)',
                boxShadow: state.isFocused ? '0 0 0 2px var(--color-primary-glow)' : 'none',
                minHeight: '46px',
                borderRadius: 'var(--radius-md)',
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
                background: '#111827',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white'
              }),
              option: (base, state) => ({
                ...base,
                background: state.isFocused ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              })
            }}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Search for locations e.g. "CET", "Europe/London", "America/New_York".
          </p>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          {initialEvent ? <Edit3 size={20} /> : <Rocket size={20} />}
          {initialEvent ? 'Save Changes' : "Start Countdown"}
        </button>
      </form>
    </div>
  );
};
