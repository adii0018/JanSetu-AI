import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { Skeleton } from '../ui/ErrorState';

interface StatCardProps {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  color?: string;
  suffix?: string;
  loading?: boolean;
}

export function StatCard({ label, value, Icon, color = 'var(--indigo)', suffix = '', loading }: StatCardProps) {
  const numeric = typeof value === 'number' ? value : 0;
  const isNumeric = typeof value === 'number';
  const counted = useCountUp(numeric, 900, !loading && isNumeric);

  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--muted)',
            fontFamily: 'var(--font-body)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </span>
        <div
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={17} color={color} />
        </div>
      </div>

      {loading ? (
        <Skeleton height={36} width="60%" />
      ) : (
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: 'var(--ink)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {isNumeric ? `${counted}${suffix}` : value}
        </div>
      )}
    </div>
  );
}
