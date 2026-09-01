import React, { useEffect, useState } from 'react';
import type { PriorityRow } from '../../services/types';
import { Skeleton } from '../ui/ErrorState';
import { ErrorState } from '../ui/ErrorState';

interface PriorityListProps {
  rows: PriorityRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const SEGMENT_COLORS = {
  demand: 'var(--indigo)',
  infra: 'var(--coral)',
  budget: 'var(--saffron)',
};

function PriorityRowItem({ row, index }: { row: PriorityRow; index: number }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 60 * index + 120);
    return () => clearTimeout(t);
  }, [index]);

  const total = row.demand_score + row.infra_gap + row.budget_gap;
  const demandW = total > 0 ? (row.demand_score / total) * 100 : 0;
  const infraW = total > 0 ? (row.infra_gap / total) * 100 : 0;
  const budgetW = total > 0 ? (row.budget_gap / total) * 100 : 0;

  return (
    <div
      style={{
        padding: '0.875rem 1rem',
        borderRadius: 8,
        transition: 'background 150ms ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--indigo-light)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
    >
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: index === 0 ? 'var(--saffron)' : 'var(--indigo-light)',
              color: index === 0 ? '#fff' : 'var(--indigo)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '0.6875rem',
              flexShrink: 0,
            }}
          >
            {index + 1}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)' }}>
            {row.ward_name}
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.125rem',
            color: index === 0 ? 'var(--coral)' : 'var(--ink)',
            letterSpacing: '-0.02em',
          }}
        >
          {Math.round(row.priority_score)}
        </span>
      </div>

      {/* Stacked bar */}
      <div
        style={{
          display: 'flex',
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
          background: 'var(--line)',
          gap: 2,
        }}
        role="img"
        aria-label={`Priority breakdown for ${row.ward_name}: demand ${Math.round(row.demand_score)}, infra gap ${row.infra_gap}, budget gap ${row.budget_gap}`}
      >
        <div
          style={{
            width: animated ? `${demandW}%` : '0%',
            background: SEGMENT_COLORS.demand,
            borderRadius: '4px 0 0 4px',
            transition: 'width 700ms cubic-bezier(0.34,1,0.64,1)',
          }}
        />
        <div
          style={{
            width: animated ? `${infraW}%` : '0%',
            background: SEGMENT_COLORS.infra,
            transition: 'width 700ms cubic-bezier(0.34,1,0.64,1) 100ms',
          }}
        />
        <div
          style={{
            width: animated ? `${budgetW}%` : '0%',
            background: SEGMENT_COLORS.budget,
            borderRadius: '0 4px 4px 0',
            transition: 'width 700ms cubic-bezier(0.34,1,0.64,1) 180ms',
          }}
        />
      </div>

      {/* Caption */}
      <div
        style={{
          marginTop: '0.35rem',
          fontSize: '0.75rem',
          color: 'var(--muted)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {row.complaint_count} reports · demand {Math.round(row.demand_score)} · infra gap {row.infra_gap} · budget gap {row.budget_gap}
      </div>
    </div>
  );
}

export function PriorityList({ rows, loading, error, onRetry }: PriorityListProps) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>
          Priority ranking by area
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
          Score = demand × 0.45 + infra gap × 0.30 + budget gap × 0.25
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={68} />)}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={onRetry} />}

      {!loading && !error && rows.length === 0 && (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>No ward data yet.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {rows.map((row, i) => (
              <PriorityRowItem key={row.ward_name} row={row} index={i} />
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--line)' }}>
            {[
              { label: 'Demand score', color: SEGMENT_COLORS.demand },
              { label: 'Infra gap', color: SEGMENT_COLORS.infra },
              { label: 'Budget gap', color: SEGMENT_COLORS.budget },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
