"use client";

import { useState, useEffect } from 'react';
import type { CountdownEvent, RemainingTime } from '../types';
import { calculateRemainingTime } from '../utils/time';
import { formatFallbackTitle } from '../utils/time';
import { Calendar, Copy, Check, ArrowLeft, Edit3 } from 'lucide-react';

interface Props {
  event: CountdownEvent;
  shareUrl: string;
  actionButtons?: React.ReactNode;
}

const formatNumber = (num: number) => num.toString().padStart(2, '0');

export const CountdownDisplay = ({ event, shareUrl, actionButtons }: Props) => {
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState<RemainingTime>(
    calculateRemainingTime(event.targetDate, event.timezone)
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateRemainingTime(event.targetDate, event.timezone));
    }, 1000);
    return () => clearInterval(timer);
  }, [event.targetDate, event.timezone]);

  useEffect(() => {
    // Generate a short format of the active countdown for the tab title, omitting seconds
    const activeBlocks = [
      { label: 'y', value: timeLeft.years },
      { label: 'mo', value: timeLeft.months },
      { label: 'd', value: timeLeft.days },
      { label: 'h', value: timeLeft.hours },
      { label: 'm', value: timeLeft.minutes },
    ];

    const hasLargerUnit = (idx: number, arr: {label: string, value: number}[]) => arr.slice(0, idx).some(b => b.value > 0);
    
    const visibleBlocks = activeBlocks.filter((block, i, arr) => {
      if (block.value > 0) return true;
      if (block.label === 'm') return true; // always show at least minutes if everything else is 0
      return hasLargerUnit(i, arr);
    });

    const shortTimeStr = visibleBlocks.slice(0, 3).map(b => `${b.value}${b.label}`).join(' ');
    
    const prefix = timeLeft.isPast ? '-' : '';
    document.title = `${prefix}${shortTimeStr}`;

    // Reset title on unmount
    return () => {
      document.title = 'Countdown Magic';
    };
  }, [timeLeft, event.name]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeBlocks = [
    { label: 'Years', value: timeLeft.years },
    { label: 'Months', value: timeLeft.months },
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ].filter((block, i, arr) => {
    // Hide leading zero blocks (e.g. if years = 0, hide years block, but keep minutes even if 0 if hours > 0)
    if (block.value > 0) return true;
    const hasLargerUnit = arr.slice(0, i).some(b => b.value > 0);
    return hasLargerUnit || i >= 4; // Always show at least Minutes and Seconds
  });

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', position: 'relative' }}>
        
        {actionButtons && (
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', zIndex: 10 }}>
            {actionButtons}
          </div>
        )}
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', fontWeight: 700 }}>
          {event.name || (isClient ? formatFallbackTitle(event.targetDate, event.timezone) : '')}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          <Calendar size={18} />
          <span>{isClient ? new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: event.timezone
          }).format(new Date(event.targetDate)) : ''}</span>
          <span style={{ margin: '0 0.5rem' }}>•</span>
          <span>{event.timezone}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isClient && timeBlocks.map((block, index) => {
            // Find the index of the first block that actually renders (is not filtered out)
            // But since timeBlocks IS the filtered array, the first element is index 0.
            const isLargestUnit = index === 0;
            const displayValue = (timeLeft.isPast && isLargestUnit && block.value !== 0) 
              ? `-${formatNumber(block.value)}` 
              : formatNumber(block.value);

            return (
              <div 
                key={block.label} 
                style={{
                  background: 'var(--bg-base)',
                  border: `1px solid ${timeLeft.isPast ? 'rgba(239, 68, 68, 0.5)' : 'var(--glass-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  minWidth: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                <div style={{ fontSize: '3.5rem', fontWeight: '800', fontFamily: 'var(--font-display)', lineHeight: '1', marginBottom: '0.5rem', color: timeLeft.isPast ? '#ef4444' : 'var(--text-primary)' }}>
                  {displayValue}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {block.label}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>Share this countdown</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <input 
              readOnly 
              value={shareUrl} 
              className="input-base" 
              style={{ maxWidth: '400px', textAlign: 'center', color: 'var(--color-secondary)' }}
            />
            <button onClick={handleCopy} className="btn-primary" style={{ padding: '0.75rem' }}>
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
