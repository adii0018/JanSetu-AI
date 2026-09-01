import React from 'react';

type BadgeVariant = 'indigo' | 'saffron' | 'teal' | 'coral' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  indigo: { background: 'var(--indigo-light)', color: 'var(--indigo)' },
  saffron: { background: 'var(--saffron-light)', color: 'var(--saffron-deep)' },
  teal: { background: 'var(--teal-light)', color: 'var(--teal)' },
  coral: { background: 'var(--coral-light)', color: 'var(--coral)' },
  muted: { background: 'var(--line)', color: 'var(--muted)' },
};

export function Badge({ children, variant = 'indigo', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '0.2rem 0.6rem' : '0.3rem 0.75rem',
        borderRadius: 20,
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}

export function urgencyVariant(urgency: number): BadgeVariant {
  if (urgency >= 70) return 'coral';
  if (urgency >= 50) return 'saffron';
  return 'teal';
}
