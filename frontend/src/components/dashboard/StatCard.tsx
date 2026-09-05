import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

interface StatCardProps {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  color?: string;
  suffix?: string;
  loading?: boolean;
}

export function StatCard({ label, value, Icon, color = 'var(--moss)', suffix = '', loading }: StatCardProps) {
  const numeric = typeof value === 'number' ? value : 0;
  const isNumeric = typeof value === 'number';
  const counted = useCountUp(numeric, 900, !loading && isNumeric);

  if (loading) {
    return (
      <div
        className="card"
        style={{
          minHeight: 110,
          background: 'linear-gradient(135deg, var(--leaf-pale) 0%, #fff 100%)',
        }}
      >
        <div className="skeleton" style={{ height: 12, width: '55%', marginBottom: '1.25rem' }} />
        <div className="skeleton" style={{ height: 36, width: '40%' }} />
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: '#fff',
        transition: 'box-shadow 220ms ease, transform 220ms ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card-hover)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Icon */}
      <div
        aria-hidden="true"
        style={{
          width: 42,
          height: 42,
          borderRadius: '12px',
          background: `color-mix(in srgb, ${color} 14%, var(--leaf-pale))`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={19} color={color} />
      </div>

      {/* Value */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
            color: 'var(--ink)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            marginBottom: '0.375rem',
          }}
        >
          {isNumeric ? `${counted}${suffix}` : value}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--ink-soft)',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
