'use client';

import { signIn, signOut, useSession } from "next-auth/react";

export const AuthButton = () => {
  const { data: session } = useSession();

  if (session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {session.user?.name}
        </span>
        <button 
          onClick={() => signOut()} 
          style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => signIn('github')} 
      style={{ background: 'var(--color-primary)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 500 }}
    >
      Sign in with GitHub
    </button>
  );
};
