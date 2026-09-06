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
  dark?: boolean;
}

export function StatCard({ label, value, Icon, color = 'var(--moss)', suffix = '', loading, dark }: StatCardProps) {
  const numeric = typeof value === 'number' ? value : 0;
  const isNumeric = typeof value === 'number';
  const counted = useCountUp(numeric, 900, !loading && isNumeric);

  if (loading) {
    return (
      <div
        className="card"
        style={{
          minHeight: 110,
          background: dark ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(135deg, var(--leaf-pale) 0%, #fff 100%)',
          backdropFilter: dark ? 'blur(12px)' : undefined,
          border: dark ? '1px solid rgba(255, 255, 255, 0.14)' : undefined,
        }}
      >
        <div className="skeleton" style={{ height: 12, width: '55%', marginBottom: '1.25rem', background: dark ? 'rgba(255, 255, 255, 0.15)' : undefined }} />
        <div className="skeleton" style={{ height: 36, width: '40%', background: dark ? 'rgba(255, 255, 255, 0.15)' : undefined }} />
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
        background: dark ? 'rgba(255, 255, 255, 0.07)' : '#fff',
        backdropFilter: dark ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: dark ? 'blur(12px)' : undefined,
        border: dark ? '1px solid rgba(255, 255, 255, 0.16)' : undefined,
        boxShadow: dark ? '0 8px 24px rgba(0, 0, 0, 0.25)' : 'var(--shadow-card)',
        transition: 'box-shadow 220ms ease, transform 220ms ease, background 220ms ease',
        cursor: 'default',
        padding: '1.25rem',
        borderRadius: 16,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = dark ? '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 16px rgba(111, 191, 115, 0.3)' : 'var(--shadow-card-hover)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        if (dark) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 255, 255, 0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = dark ? '0 8px 24px rgba(0, 0, 0, 0.25)' : 'var(--shadow-card)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        if (dark) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255, 255, 255, 0.07)';
      }}
    >
      {/* Icon */}
      <div
        aria-hidden="true"
        style={{
          width: 42,
          height: 42,
          borderRadius: '12px',
          background: dark ? 'rgba(255, 255, 255, 0.12)' : `color-mix(in srgb, ${color} 14%, var(--leaf-pale))`,
          border: dark ? '1px solid rgba(255, 255, 255, 0.18)' : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={19} color={dark ? (color === 'var(--moss)' || color === 'var(--leaf)' ? '#6FBF73' : color) : color} />
      </div>

      {/* Value */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
            color: dark ? '#FFFFFF' : 'var(--ink)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            marginBottom: '0.375rem',
            textShadow: dark ? '0 2px 10px rgba(0,0,0,0.5)' : undefined,
          }}
        >
          {isNumeric ? `${counted}${suffix}` : value}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: dark ? 'rgba(201, 234, 199, 0.85)' : 'var(--ink-soft)',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
