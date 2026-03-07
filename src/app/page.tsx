'use client';

import { useState, useEffect } from 'react';
import type { CountdownEvent } from '../types';
import { encodeEventState, decodeEventState } from '../utils/url';
import { EventForm } from '../components/EventForm';
import { CountdownDisplay } from '../components/CountdownDisplay';
import { AuthButton } from '../components/AuthButton';
import { ArrowLeft } from 'lucide-react';

export default function Home() {
  const [activeEvent, setActiveEvent] = useState<CountdownEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Read state from URL hash on mount and when hash changes
    const readStateFromUrl = () => {
      const hash = window.location.hash;
      if (hash) {
        const decoded = decodeEventState(hash);
        if (decoded) {
          setActiveEvent(decoded);
          setIsEditing(false); // Cancel edit mode if URL changes externally
          return;
        }
      }
      setActiveEvent(null);
    };

    readStateFromUrl();
    window.addEventListener('hashchange', readStateFromUrl);
    return () => window.removeEventListener('hashchange', readStateFromUrl);
  }, []);

  const handleCreateEvent = (event: CountdownEvent) => {
    const hash = encodeEventState(event);
    window.location.hash = `c=${hash}`;
    setIsEditing(false);
  };

  const handleReset = () => {
    window.location.hash = ''; // Clear hash
    setIsEditing(false);
  };

  // Prevent hydration mismatch by returning null until client-side code runs
  if (!isClient) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
        <AuthButton />
      </div>
      {activeEvent && !isEditing ? (
        <CountdownDisplay 
          event={activeEvent} 
          onReset={handleReset} 
          onEdit={() => setIsEditing(true)}
          shareUrl={window.location.href} 
        />
      ) : (
        <div style={{ width: '100%', maxWidth: '600px' }}>
          {isEditing && (
            <button 
              onClick={() => setIsEditing(false)}
              className="btn-primary"
              style={{ marginBottom: '1.5rem', background: 'transparent', boxShadow: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={18} /> Cancel Edit
            </button>
          )}
          <EventForm initialEvent={activeEvent || undefined} onSubmit={handleCreateEvent} />
        </div>
      )}
    </div>
  );
}
