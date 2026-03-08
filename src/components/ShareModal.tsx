'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface Props {
  url: string;
  eventName: string;
  onClose: () => void;
}

export const ShareModal = ({ url, eventName, onClose }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '2rem',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
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

        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
          Share: {eventName}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Copy this link to share your countdown with others.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            readOnly 
            value={url} 
            className="input-base" 
            style={{ flex: 1, color: 'var(--color-secondary)' }}
            onClick={(e) => e.currentTarget.select()}
          />
          <button onClick={handleCopy} className="btn-primary" style={{ padding: '0.75rem' }}>
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};
