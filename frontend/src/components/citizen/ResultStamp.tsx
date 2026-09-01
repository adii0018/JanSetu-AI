import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ResultStampProps {
  visible: boolean;
}

export function ResultStamp({ visible }: ResultStampProps) {
  if (!visible) return null;

  return (
    <div
      aria-label="AI Verified and Logged"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        border: '2px dashed var(--saffron)',
        borderRadius: 8,
        transform: 'rotate(-3deg)',
        background: 'rgba(232, 163, 61, 0.08)',
        animation: 'stamp-reveal 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}
    >
      <CheckCircle2 size={16} color="var(--saffron-deep)" aria-hidden="true" />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '0.8125rem',
          color: 'var(--saffron-deep)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        AI Verified &amp; Logged
      </span>
    </div>
  );
}
