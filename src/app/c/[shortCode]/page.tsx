import { notFound } from 'next/navigation';
import { CountdownDisplay } from '../../../components/CountdownDisplay';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AuthButton } from '../../../components/AuthButton';

export default async function ShortLinkPage({ params }: { params: { shortCode: string } }) {
  const { prisma } = await import('../../../lib/prisma');
  const { shortCode } = await params;
  
  const event = await prisma.event.findUnique({
    where: { shortCode: shortCode },
  });

  if (!event) {
    notFound();
  }

  // Convert Prisma Event to the frontend CountdownEvent type expectation
  const eventData = {
    name: event.title,
    // Truncate milliseconds and 'Z' if present, to simulate the local format
    targetDate: event.targetDate.toISOString().split('.')[0], 
    timezone: event.timezone
  };

  const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/c/${shortCode}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
        <AuthButton />
      </div>
      <CountdownDisplay 
        event={eventData} 
        onReset={() => {}} // Disabled the native reset in direct link mode to prevent awkward clearing behavior
        onEdit={() => {}} // Read-only for visitors 
        shareUrl={shareUrl} 
      />
      <div style={{ marginTop: '2rem' }}>
        <Link 
          href="/" 
          className="btn-primary" 
          style={{ background: 'transparent', boxShadow: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={18} /> Create Your Own
        </Link>
      </div>
    </div>
  );
}
