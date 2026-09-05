import React from 'react';

type BadgeVariant = 'moss' | 'urgent' | 'medium' | 'ok' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  moss:   { background: 'var(--leaf-pale)', color: 'var(--moss)' },
  urgent: { background: '#FDECEA', color: '#C0392B' },
  medium: { background: '#FEF3E2', color: '#C67F1E' },
  ok:     { background: 'var(--leaf-pale)', color: 'var(--moss)' },
  muted:  { background: 'rgba(91,107,93,0.1)', color: 'var(--ink-soft)' },
};

export function Badge({ children, variant = 'moss', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '0.2rem 0.65rem' : '0.3rem 0.875rem',
        borderRadius: 'var(--radius-pill)',
        fontSize: size === 'sm' ? '0.72rem' : '0.8125rem',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}

export function urgencyVariant(urgency: number): BadgeVariant {
  if (urgency >= 70) return 'urgent';
  if (urgency >= 50) return 'medium';
  return 'ok';
}
