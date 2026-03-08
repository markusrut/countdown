'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { EventForm } from '../components/EventForm';
import { Header } from '../components/Header';
import { Dashboard } from '../components/Dashboard';
import { Loader2 } from 'lucide-react';
import type { CountdownEvent } from '../types';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 2rem 2rem 2rem' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <EventForm onSubmit={handleCreateEvent} />
        </div>
      </div>
    </div>
  );
}
