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
          className="btn-ghost"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => signIn('github')} 
      className="btn-primary"
    >
      Sign in with GitHub
    </button>
  );
};
