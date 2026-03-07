'use server';

import { getServerSession } from 'next-auth';
import { GET } from './api/auth/[...nextauth]/route';

// A simple utility to generate a random 6-character short code.
const generateShortCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export async function createEvent(data: { title: string; targetDate: string; timezone: string }) {
  const { prisma } = await import('../lib/prisma');
  const session = await getServerSession(GET as any) as any;

  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  let isUnique = false;
  let shortCode = '';

  // Retry generating a shortcode in case of rare collision
  while (!isUnique) {
    shortCode = generateShortCode();
    const existing = await prisma.event.findUnique({ where: { shortCode } });
    if (!existing) {
      isUnique = true;
    }
  }

  const event = await prisma.event.create({
    data: {
      title: data.title,
      targetDate: new Date(data.targetDate),
      timezone: data.timezone,
      shortCode: shortCode,
      userId: user.id,
    },
  });

  return event;
}

export async function getUserEvents() {
  const { prisma } = await import('../lib/prisma');
  const session = await getServerSession(GET as any) as any;

  if (!session?.user?.email) {
    return [];
  }

  const userGroups = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { events: { orderBy: { createdAt: 'desc' } } },
  });

  return userGroups?.events || [];
}
