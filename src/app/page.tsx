'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { EventForm } from '../components/EventForm';
import { Header } from '../components/Header';
import { Dashboard } from '../components/Dashboard';
import { ExampleCountdown } from '../components/ExampleCountdown';
import { Loader2 } from 'lucide-react';
import type { CountdownEvent } from '../types';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const handleCreateEvent = (event: CountdownEvent) => {
    if (event.shortCode) {
      router.push(`/c/${event.shortCode}`);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // Logged-in view
  if (status === 'authenticated') {
    return (
      <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin text-primary" size={40} /></div>}>
        <Dashboard />
      </Suspense>
    );
  }

  // Guest view (landing page)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 2rem 2rem 2rem' }}>
        
        {!showForm ? (
          <>
            <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem' }}>
              <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                Count down to the <br/>
                <span style={{ color: 'var(--color-accent)' }}>moments that matter.</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                Create beautiful, shareable countdowns for your upcoming events, trips, and holidays.
              </p>
              <button 
                onClick={() => setShowForm(true)}
                className="btn-primary"
                style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '50px' }}
              >
                Create Your First Countdown
              </button>
            </div>
            
            <div style={{ width: '100%', maxWidth: '800px' }}>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                For example...
              </p>
              <ExampleCountdown />
            </div>
          </>
        ) : (
          <div style={{ width: '100%', maxWidth: '600px', marginTop: '40px' }}>
            <button 
              onClick={() => setShowForm(false)}
              className="btn-ghost"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}
            >
              ← Back
            </button>
            <EventForm onSubmit={handleCreateEvent} />
          </div>
        )}

      </div>
    </div>
  );
}
