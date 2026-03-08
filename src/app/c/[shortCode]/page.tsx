import { notFound } from 'next/navigation';
import { Header } from '../../../components/Header';
import { PublicCountdownView } from '../../../components/PublicCountdownView';
import { getServerSession } from 'next-auth';
import { GET } from '../../api/auth/[...nextauth]/route';
import { getClientId } from '../../../lib/cookies';
import { checkIsSaved } from '../../actions';

export default async function ShortLinkPage({ params }: { params: { shortCode: string } }) {
  const { prisma } = await import('../../../lib/prisma');
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
  let isLoggedIn = false;
  
  if (session?.user?.email) {
    isLoggedIn = true;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user && event.userId === user.id) {
      isOwner = true;
    }
  } else if (cookieClientId && event.clientId === cookieClientId) {
    isOwner = true;
  }

  const isSaved = isLoggedIn && !isOwner ? await checkIsSaved(event.id) : false;

  // Convert Prisma Event to the frontend CountdownEvent type expectation
  const eventData = {
    name: event.title,
    // Pass the absolute UTC date string directly
    targetDate: event.targetDate.toISOString(), 
    timezone: event.timezone,
    shortCode: event.shortCode
  };

  const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/c/${shortCode}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 2rem 2rem 2rem' }}>
        <PublicCountdownView 
          eventData={eventData}
          eventId={event.id}
          shareUrl={shareUrl}
          isOwner={isOwner}
          isLoggedIn={isLoggedIn}
          initialIsSaved={isSaved}
        />
      </div>
    </div>
  );
}
