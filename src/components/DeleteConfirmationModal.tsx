'use client';

import { X, Trash2 } from 'lucide-react';

interface Props {
  eventName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isRemoveOnly?: boolean;
}

export const DeleteConfirmationModal = ({ eventName, onConfirm, onCancel, isRemoveOnly }: Props) => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem'
      }}
      onClick={onCancel}
    >
      <div 
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '2rem',
          position: 'relative',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%'
          }}
          title="Close"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: '#ef4444' }}>
          <Trash2 size={48} />
        </div>

        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.5rem' }}>
          {isRemoveOnly ? 'Remove Countdown' : 'Delete Countdown'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.5 }}>
          {isRemoveOnly ? 'Are you sure you want to remove ' : 'Are you sure you want to delete '}
          <strong style={{ color: 'var(--text-primary)'}}>"{eventName}"</strong>? 
          {isRemoveOnly ? ' It will be removed from your dashboard.' : ' This action cannot be undone.'}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={onCancel} 
            className="btn-primary" 
            style={{ 
              flex: 1, 
              background: 'transparent', 
              boxShadow: 'none', 
              border: '1px solid var(--glass-border)', 
              color: 'var(--text-secondary)' 
            }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="btn-primary" 
            style={{ 
              flex: 1, 
              background: '#ef4444', 
              color: 'white' 
            }}
          >
            {isRemoveOnly ? 'Remove' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
