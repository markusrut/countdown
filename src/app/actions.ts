'use server';

import { getServerSession } from 'next-auth';
import { GET } from './api/auth/[...nextauth]/route';
import { getOrCreateClientId } from '../lib/cookies';
import { prisma } from '../lib/prisma';
import { fromZonedTime } from 'date-fns-tz';

const generateShortCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

async function getUniqueShortCode() {
  let isUnique = false;
  let shortCode = '';
  while (!isUnique) {
    shortCode = generateShortCode();
    const existing = await prisma.event.findUnique({ where: { shortCode } });
    if (!existing) {
      isUnique = true;
    }
  }
  return shortCode;
}

export async function createEvent(data: { title: string; targetDate: string; timezone: string }) {
  const session = await getServerSession(GET as any) as any;
  let userId = null;
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user) {
      userId = user.id;
    }
  }

  const clientId = await getOrCreateClientId();
  const shortCode = await getUniqueShortCode();

  const event = await prisma.event.create({
    data: {
      title: data.title,
      targetDate: fromZonedTime(data.targetDate, data.timezone),
      timezone: data.timezone,
      shortCode: shortCode,
      userId: userId || null,
      clientId: userId ? null : clientId,
    },
  });

  return event;
}

export async function migrateGuestData() {
  const session = await getServerSession(GET as any) as any;
  if (!session?.user?.email) return;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return;

  const clientId = await getOrCreateClientId();

  // Find all events owned by this client ID that don't have a userId yet
  await prisma.event.updateMany({
    where: { 
      clientId: clientId,
      userId: null
    },
    data: {
      userId: user.id,
      clientId: null, // clear it out
    }
  });
}

export async function getUserEvents() {
  const session = await getServerSession(GET as any) as any;

  if (!session?.user?.email) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      events: { orderBy: { createdAt: 'desc' } },
      savedCountdowns: {
        include: {
          event: true
        },
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!user) return [];

  const ownedEvents = user.events.map(e => ({ ...e, isOwner: true }));
  const savedEvents = user.savedCountdowns.map(sc => ({ ...sc.event, isOwner: false }));

  // Sort combined array by createdAt desc
  const allEvents = [...ownedEvents, ...savedEvents].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  return allEvents;
}

export async function deleteEvent(id: string) {
  const session = await getServerSession(GET as any) as any;
  const cookieClientId = await getOrCreateClientId();

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Check if owner via user login
  let isOwner = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user && event.userId === user.id) {
      isOwner = true;
    }
  }
  
  // Check if owner via client cookie
  if (!isOwner && event.clientId === cookieClientId) {
    isOwner = true;
  }

  if (!isOwner) {
    throw new Error('Unauthorized to delete this event');
  }

  await prisma.event.delete({
    where: { id },
  });

  return { success: true };
}

export async function updateEvent(id: string, data: { title: string; targetDate: string; timezone: string }) {
  const session = await getServerSession(GET as any) as any;
  const cookieClientId = await getOrCreateClientId();

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Check if owner via user login
  let isOwner = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user && event.userId === user.id) {
      isOwner = true;
    }
  }
  
  // Check if owner via client cookie
  if (!isOwner && event.clientId === cookieClientId) {
    isOwner = true;
  }

  if (!isOwner) {
    throw new Error('Unauthorized to update this event');
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      title: data.title,
      targetDate: fromZonedTime(data.targetDate, data.timezone),
      timezone: data.timezone,
    },
  });

  return updatedEvent;
}

export async function saveExternalCountdown(eventId: string) {
  const session = await getServerSession(GET as any) as any;
  if (!session?.user?.email) throw new Error('Not authenticated');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) throw new Error('User not found');

  // Prevent saving own event
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.userId === user.id) return; 

  await prisma.savedCountdown.upsert({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId: eventId
      }
    },
    update: {},
    create: {
      userId: user.id,
      eventId: eventId
    }
  });
  return { success: true };
}

export async function removeSavedCountdown(eventId: string) {
  const session = await getServerSession(GET as any) as any;
  if (!session?.user?.email) throw new Error('Not authenticated');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) throw new Error('User not found');

  try {
    await prisma.savedCountdown.delete({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId
        }
      }
    });
  } catch (err) {
    // Ignore error if it didn't exist
  }
  return { success: true };
}

export async function checkIsSaved(eventId: string) {
  const session = await getServerSession(GET as any) as any;
  if (!session?.user?.email) return false;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return false;

  const saved = await prisma.savedCountdown.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId: eventId
      }
    }
  });

  return !!saved;
}
