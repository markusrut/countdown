'use client';

import { useState, useEffect } from 'react';
import { calculateRemainingTime } from '../utils/time';
import type { RemainingTime } from '../types';

interface Props {
  targetDate: string;
  timezone: string;
}

const formatNumber = (num: number) => num.toString().padStart(2, '0');

export const MiniCountdown = ({ targetDate, timezone }: Props) => {
  const [timeLeft, setTimeLeft] = useState<RemainingTime>(
    calculateRemainingTime(targetDate, timezone)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateRemainingTime(targetDate, timezone));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, timezone]);

  const timeBlocks = [
    { label: 'Y', value: timeLeft.years },
    { label: 'M', value: timeLeft.months },
    { label: 'D', value: timeLeft.days },
    { label: 'h', value: timeLeft.hours },
    { label: 'm', value: timeLeft.minutes },
    { label: 's', value: timeLeft.seconds },
  ].filter((block, i, arr) => {
    if (block.value > 0) return true;
    const hasLargerUnit = arr.slice(0, i).some(b => b.value > 0);
    return hasLargerUnit || i >= 4; // Always keep minutes and seconds at minimum
  });

  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      alignItems: 'baseline',
      fontFamily: 'var(--font-display)',
      fontWeight: '600',
      color: timeLeft.isPast ? 'var(--color-accent)' : 'inherit'
    }}>
      {timeLeft.isPast && <span>-</span>}
      {timeBlocks.map((block, i) => (
        <div key={block.label} style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span style={{ fontSize: '1.2rem' }}>{formatNumber(block.value)}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{block.label}</span>
        </div>
      ))}
    </div>
  );
};
