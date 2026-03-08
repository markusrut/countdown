import { notFound, redirect } from 'next/navigation';
import { Header } from '../../../../components/Header';
import { getServerSession } from 'next-auth';
import { GET } from '../../../api/auth/[...nextauth]/route';
import { getClientId } from '../../../../lib/cookies';
import { EditFormWrapper } from '../../../../components/EditFormWrapper';
import type { CountdownEvent } from '../../../../types';

export default async function EditCountdownPage({ params }: { params: { shortCode: string } }) {
  const { prisma } = await import('../../../../lib/prisma');
  const { shortCode } = await params;
  
  const event = await prisma.event.findUnique({
    where: { shortCode: shortCode },
  });

  if (!event) {
    notFound();
  }

  const session = await getServerSession(GET as any) as any;
  const cookieClientId = await getClientId();
  
  let isOwner = false;
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user && event.userId === user.id) {
      isOwner = true;
    }
  } else if (cookieClientId && event.clientId === cookieClientId) {
    isOwner = true;
  }

  if (!isOwner) {
    // Redirect unauthorized users back to the display page
    redirect(`/c/${shortCode}`);
  }

  const initialEvent: CountdownEvent = {
    name: event.title,
    // Provide absolute UTC date string for the form to parse
    targetDate: event.targetDate.toISOString(),
    timezone: event.timezone,
    shortCode: event.shortCode
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 2rem 2rem 2rem' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <a 
            href={`/c/${shortCode}`}
            className="btn-primary"
            style={{ display: 'inline-block', padding: '0.5rem 1rem', fontSize: '0.9rem', marginBottom: '1.5rem', background: 'transparent', boxShadow: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            ← Cancel
          </a>
          {/* Note: In a Server Component page, we can't easily pass the complex handleSaveEdit client function directly if it uses closures/router context.
              However, we can make EventForm trigger a client-side wrapper, OR use a small intermediate Client Component wrapper. */}
          <EditFormWrapper eventId={event.id} initialEvent={initialEvent} />
        </div>
      </div>
    </div>
  );
}
