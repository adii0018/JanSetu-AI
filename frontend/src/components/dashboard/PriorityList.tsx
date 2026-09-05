import React, { useEffect, useState } from 'react';
import type { PriorityRow } from '../../services/types';
import { ErrorState } from '../ui/ErrorState';

interface PriorityListProps {
  rows: PriorityRow[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const SEGMENT_COLORS = {
  demand: 'var(--moss)',
  infra: '#C0392B',
  budget: '#C67F1E',
};

function PriorityRowItem({ row, index }: { row: PriorityRow; index: number }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80 * index + 150);
    return () => clearTimeout(t);
  }, [index]);

  const wDemand = row.demand_score * 0.45;
  const wInfra  = row.infra_gap * 0.30;
  const wBudget = row.budget_gap * 0.25;
  const totalW = wDemand + wInfra + wBudget || 1;
  const demandW = (wDemand / totalW) * 100;
  const infraW  = (wInfra / totalW) * 100;
  const budgetW = (wBudget / totalW) * 100;

  const isTop = index === 0;

  return (
    <div
      style={{
        padding: '1rem 1.125rem',
        borderRadius: '14px',
        background: isTop ? 'var(--leaf-pale)' : 'transparent',
        border: isTop ? '1px solid var(--leaf-light)' : '1px solid transparent',
        transition: 'background 160ms ease, border-color 160ms ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        if (!isTop) {
          (e.currentTarget as HTMLDivElement).style.background = 'var(--leaf-pale)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--leaf-light)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isTop) {
          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
        }
      }}
    >
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Rank badge */}
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: isTop ? 'var(--deep-moss)' : 'var(--leaf-light)',
              color: isTop ? '#fff' : 'var(--moss)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            {index + 1}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'var(--ink)',
            }}
          >
            {row.ward_name}
          </span>
          {isTop && (
            <span className="tag tag-moss" style={{ fontSize: '0.68rem' }}>
              Top Priority
            </span>
          )}
        </div>

        {/* Score */}
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '1.25rem',
            color: isTop ? 'var(--deep-moss)' : 'var(--ink)',
            letterSpacing: '-0.03em',
          }}
        >
          {Math.round(row.priority_score)}
        </span>
      </div>

      {/* Segmented bar */}
      <div
        style={{ display: 'flex', height: 7, borderRadius: 4, overflow: 'hidden', background: 'var(--leaf-light)', gap: 2 }}
        role="img"
        aria-label={`Priority breakdown: demand ${Math.round(row.demand_score)}, infra gap ${row.infra_gap}, budget gap ${row.budget_gap}`}
      >
        <div style={{ width: animated ? `${demandW}%` : '0%', background: SEGMENT_COLORS.demand, borderRadius: '4px 0 0 4px', transition: 'width 700ms cubic-bezier(0.34,1,0.64,1)' }} />
        <div style={{ width: animated ? `${infraW}%` : '0%', background: SEGMENT_COLORS.infra, transition: 'width 700ms cubic-bezier(0.34,1,0.64,1) 80ms' }} />
        <div style={{ width: animated ? `${budgetW}%` : '0%', background: SEGMENT_COLORS.budget, borderRadius: '0 4px 4px 0', transition: 'width 700ms cubic-bezier(0.34,1,0.64,1) 160ms' }} />
      </div>

      {/* Caption */}
      <div style={{ marginTop: '0.35rem', fontSize: '0.74rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>
        {row.complaint_count} reports · demand {Math.round(row.demand_score)} · infra gap {row.infra_gap} · budget gap {row.budget_gap}
      </div>
    </div>
  );
}

export function PriorityList({ rows, loading, error, onRetry }: PriorityListProps) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '0.25rem' }}>
        <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Priority ranking by area</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
          Investment priorities
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginTop: '0.25rem' }}>
          Score = demand × 0.45 + infra gap × 0.30 + budget gap × 0.25
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={onRetry} />}

      {!loading && !error && rows.length === 0 && (
        <p style={{ color: 'var(--ink-soft)', textAlign: 'center', padding: '2rem 0' }}>No ward data yet.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {rows.map((row, i) => (
              <PriorityRowItem key={row.ward_name} row={row} index={i} />
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            {[
              { label: 'Demand', color: SEGMENT_COLORS.demand },
              { label: 'Infra gap', color: SEGMENT_COLORS.infra },
              { label: 'Budget gap', color: SEGMENT_COLORS.budget },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} aria-hidden="true" />
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
