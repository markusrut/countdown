'use client';

import { useRouter } from 'next/navigation';
import { EventForm } from './EventForm';
import { updateEvent } from '../app/actions';
import type { CountdownEvent } from '../types';
import { useState } from 'react';

interface Props {
  eventId: string;
  initialEvent: CountdownEvent;
}

export const EditFormWrapper = ({ eventId, initialEvent }: Props) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSaveEdit = async (updatedData: CountdownEvent) => {
    try {
      setError(null);
      await updateEvent(eventId, {
        title: updatedData.name,
        targetDate: updatedData.targetDate,
        timezone: updatedData.timezone,
      });
      // Force a hard navigation to clear the router cache so the display page shows fresh data
      window.location.href = `/c/${initialEvent.shortCode}`;
    } catch (err) {
      console.error(err);
      setError('Failed to update event');
    }
  };

  return (
    <>
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <EventForm 
        initialEvent={initialEvent} 
        onSubmit={handleSaveEdit} 
      />
    </>
  );
};
