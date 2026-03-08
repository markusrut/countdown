import { cookies } from 'next/headers';
import crypto from 'crypto';

const CLIENT_ID_COOKIE = 'countdown_client_id';

export async function getOrCreateClientId(): Promise<string> {
  const cookieStore = await cookies();
  let clientId = cookieStore.get(CLIENT_ID_COOKIE)?.value;

  if (!clientId) {
    clientId = crypto.randomUUID();
    // In a real app we'd set options like maxAge, httpOnly, etc.
    cookieStore.set(CLIENT_ID_COOKIE, clientId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  return clientId;
}

export async function getClientId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CLIENT_ID_COOKIE)?.value;
}
