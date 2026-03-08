'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CountdownDisplay } from './CountdownDisplay';
import { ArrowLeft, BookmarkPlus, BookmarkCheck, LogIn, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { saveExternalCountdown, removeSavedCountdown, deleteEvent } from '../app/actions';
import type { CountdownEvent } from '../types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface Props {
  eventData: CountdownEvent;
  eventId: string;
  shareUrl: string;
  isOwner: boolean;
  isLoggedIn: boolean;
  initialIsSaved: boolean;
}

export const PublicCountdownView = ({ 
  eventData, 
  eventId, 
  shareUrl, 
  isOwner, 
  isLoggedIn, 
  initialIsSaved 
}: Props) => {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleSave = async () => {
    if (!isLoggedIn) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await removeSavedCountdown(eventId);
        setIsSaved(false);
      } else {
        await saveExternalCountdown(eventId);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle save state", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link 
          href="/" 
          className="btn-ghost" 
          style={{ textDecoration: 'none'}}
        >
          <ArrowLeft size={16} /> {isOwner && isLoggedIn ? 'My Countdowns' : isLoggedIn ? 'My Countdowns' : 'Create Another'}
        </Link>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isOwner && (
            <>
              <a 
                href={`/c/${eventData.shortCode}/edit`}
                className="btn-ghost" 
                style={{ textDecoration: 'none' }}
              >
                <Edit2 size={16} /> Edit
              </a>
              <button 
                onClick={() => setIsDeleting(true)}
                className="btn-ghost" 
                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <Trash2 size={16} /> Delete
              </button>
            </>
          )}

          {!isOwner && isLoggedIn && (
            <button 
              onClick={handleToggleSave}
              disabled={isSaving}
              className="btn-ghost" 
              style={{ 
                color: isSaved ? '#10b981' : 'var(--text-secondary)',
                borderColor: isSaved ? 'rgba(16, 185, 129, 0.3)' : 'var(--glass-border)',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />} 
              {isSaved ? 'Remove from saved' : 'Save to my list'}
            </button>
          )}
          
          {!isOwner && !isLoggedIn && (
            <Link 
              href="/api/auth/signin" 
              className="btn-ghost" 
              style={{ textDecoration: 'none' }}
              title="Log in to save"
            >
              <LogIn size={16} /> Log in to save
            </Link>
          )}
        </div>
      </div>

      <CountdownDisplay 
        event={eventData} 
        shareUrl={shareUrl} 
      />
      {/* Log in nudges for non-owners */}
      {!isLoggedIn && !isOwner && (
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
          Want to save this countdown? <Link href="/api/auth/signin" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>Log in</Link> to keep track of it.
        </div>
      )}

      {isDeleting && (
        <DeleteConfirmationModal
          eventName={eventData.name}
          onConfirm={async () => {
            try {
              await deleteEvent(eventId);
              router.push('/');
            } catch (err) {
              alert('Failed to delete event');
            }
          }}
          onCancel={() => setIsDeleting(false)}
        />
      )}
    </>
  );
};
