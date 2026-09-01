import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ message = 'Something went wrong.', onRetry, compact }: ErrorStateProps) {
  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--coral)',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-body)',
        }}
      >
        <AlertCircle size={15} aria-hidden="true" />
        <span>{message}</span>
        {onRetry && (
          <button className="btn-ghost" onClick={onRetry} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--muted)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <AlertCircle size={32} color="var(--coral)" aria-hidden="true" />
      <p style={{ fontWeight: 500, color: 'var(--ink)' }}>{message}</p>
      {onRetry && (
        <button className="btn-ghost" onClick={onRetry}>
          <RefreshCw size={14} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────

interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ height = 20, width = '100%', style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        height,
        width,
        background: 'linear-gradient(90deg, var(--line) 25%, var(--indigo-light) 50%, var(--line) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s ease infinite',
        borderRadius: 'var(--control-radius)',
        ...style,
      }}
    />
  );
}


