'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EventForm } from './EventForm';
import { Loader2, Plus, Calendar, Trash2, Edit2, Share2, ExternalLink, BookmarkMinus, BookmarkCheck } from 'lucide-react';
import { getUserEvents, deleteEvent, updateEvent, migrateGuestData, removeSavedCountdown } from '../app/actions';
import type { CountdownEvent } from '../types';
import { MiniCountdown } from './MiniCountdown';
import { ShareModal } from './ShareModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { Header } from './Header';
import { formatInTimeZone } from 'date-fns-tz';

type DbEvent = {
  id: string;
  title: string;
  targetDate: Date;
  timezone: string;
  shortCode: string;
  userId: string | null;
  createdAt: Date;
  isOwner?: boolean;
};

export const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharingEvent, setSharingEvent] = useState<DbEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<DbEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getUserEvents();
      setEvents(data);
      return data;
    } catch (err) {
      console.error(err);
      setError('Failed to load events');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        await migrateGuestData();
      } catch (err) {
        // Migration might fail if no db yet, etc.
      }
      await fetchEvents();
    };
    initData();
  }, []);

  const handleDeleteClick = (event: DbEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingEvent(event);
  };

  const confirmDelete = async () => {
    if (!deletingEvent) return;
    
    try {
      if (deletingEvent.isOwner === false) {
        await removeSavedCountdown(deletingEvent.id);
      } else {
        await deleteEvent(deletingEvent.id);
      }
      setEvents(events.filter(ev => ev.id !== deletingEvent.id));
      setDeletingEvent(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete/remove event');
    }
  };

  const handleEdit = (event: DbEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/c/${event.shortCode}/edit`);
  };

  const handleShare = (event: DbEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSharingEvent(event);
  };



  const handleCreateNew = async (newData: CountdownEvent) => {
    if (newData.shortCode) {
      router.push(`/c/${newData.shortCode}`);
    } else {
      await fetchEvents();
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // Create Mode
  if (isCreating) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 2rem 2rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <button 
              onClick={() => {
                setIsCreating(false);
              }}
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginBottom: '1.5rem', background: 'transparent', boxShadow: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
            >
              ← Cancel
            </button>
            <EventForm 
              onSubmit={handleCreateNew} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ flex: 1, width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '0 1rem 2rem' }}>
        {error ? (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Calendar size={48} style={{ color: 'var(--glass-border)', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>No countdowns yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Create your first countdown to track an upcoming event.
          </p>
          <button onClick={() => setIsCreating(true)} className="btn-primary">
            Create Countdown
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((event) => (
            <div 
              key={event.id}
              onClick={() => router.push(`/c/${event.shortCode}`)}
              className="glass-panel"
              style={{
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem'
              }}
            >
              
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                 <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {event.title || new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: event.timezone }).format(new Date(event.targetDate)).replace(',', '')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    {new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: event.timezone
                    }).format(new Date(event.targetDate))}
                  </div>
                  <span>•</span>
                  <span>{event.timezone}</span>
                </div>
              </div>

              <div style={{ flex: '0 0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MiniCountdown 
                  targetDate={event.targetDate.toISOString()} 
                  timezone={event.timezone} 
                />
              </div>

              <div style={{ flex: '0 0 auto', display: 'flex', gap: '0.75rem', alignItems: 'center', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1.5rem' }}>
                <button 
                  onClick={(e) => handleShare(event, e)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition-fast)' }}
                  title="Share"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.color = 'var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Share2 size={18} />
                </button>
                {event.isOwner !== false ? (
                  <button 
                    onClick={(e) => handleEdit(event, e)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition-fast)' }}
                    title="Edit"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      e.currentTarget.style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <Edit2 size={18} />
                  </button>
                ) : (
                  <div 
                    style={{ color: '#10b981', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Saved Event"
                  >
                    <BookmarkCheck size={18} />
                  </div>
                )}
                <button 
                  onClick={(e) => handleDeleteClick(event, e)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--transition-fast)' }}
                  title={event.isOwner === false ? "Remove Saved Countdown" : "Delete"}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {event.isOwner === false ? <BookmarkMinus size={18} /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button for New Event */}
      {!loading && !isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            borderRadius: '50px',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
            zIndex: 40,
            fontSize: '1.05rem'
          }}
        >
          <Plus size={20} /> Create Countdown
        </button>
      )}

      {sharingEvent && (
        <ShareModal 
          url={`${window.location.origin}/c/${sharingEvent.shortCode}`} 
          eventName={sharingEvent.title} 
          onClose={() => setSharingEvent(null)} 
        />
      )}

      {deletingEvent && (
        <DeleteConfirmationModal
          eventName={deletingEvent.title}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingEvent(null)}
          isRemoveOnly={deletingEvent.isOwner === false}
        />
      )}
      </div>
    </div>
  );
};
