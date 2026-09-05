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
          color: '#C0392B',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-body)',
          padding: '0.5rem 0.75rem',
          background: '#FDECEA',
          borderRadius: 10,
        }}
      >
        <AlertCircle size={15} aria-hidden="true" />
        <span style={{ flex: 1 }}>{message}</span>
        {onRetry && (
          <button
            className="btn-ghost"
            onClick={onRetry}
            style={{ padding: '0.2rem 0.625rem', fontSize: '0.78rem', borderRadius: 'var(--radius-pill)' }}
          >
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
        gap: '0.875rem',
        padding: '2.5rem',
        textAlign: 'center',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#FDECEA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertCircle size={24} color="#C0392B" aria-hidden="true" />
      </div>
      <p style={{ fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{message}</p>
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
  style?: React.CSSProperties;
}

export function Skeleton({ height = 20, width = '100%', style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className="skeleton"
      style={{ height, width, ...style }}
    />
  );
}
