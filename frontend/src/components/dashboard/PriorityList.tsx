import React, { useEffect, useState, useMemo } from 'react';
import { Search, Info, ChevronDown, ChevronUp } from 'lucide-react';
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
  budget: '#D97706',
};

function PriorityRowItem({ row, index }: { row: PriorityRow; index: number }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 60 * Math.min(index, 6) + 100);
    return () => clearTimeout(t);
  }, [index]);

  const wDemand = row.demand_score * 0.45;
  const wInfra  = row.infra_gap * 0.30;
  const wBudget = row.budget_gap * 0.25;
  const totalW = wDemand + wInfra + wBudget || 1;
  const demandW = (wDemand / totalW) * 100;
  const infraW  = (wInfra / totalW) * 100;
  const budgetW = (wBudget / totalW) * 100;

  // Rank Styling
  let rankBadgeStyle: React.CSSProperties = {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    flexShrink: 0,
  };

  let rankContent = `${index + 1}`;
  let bgHover = '#F8FAFC';

  if (index === 0) {
    rankBadgeStyle = { ...rankBadgeStyle, background: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D' };
    rankContent = '🥇';
    bgHover = '#FFFBEB';
  } else if (index === 1) {
    rankBadgeStyle = { ...rankBadgeStyle, background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' };
    rankContent = '🥈';
  } else if (index === 2) {
    rankBadgeStyle = { ...rankBadgeStyle, background: '#FFEDD5', color: '#C2410C', border: '1px solid #FDBA74' };
    rankContent = '🥉';
  } else {
    rankBadgeStyle = { ...rankBadgeStyle, background: 'var(--leaf-pale)', color: 'var(--deep-moss)', border: '1px solid var(--border)' };
  }

  return (
    <div
      style={{
        padding: '0.65rem 0.85rem',
        borderRadius: '12px',
        background: index === 0 ? '#FFFBEB' : '#FFFFFF',
        border: index === 0 ? '1px solid #FCD34D' : '1px solid var(--border)',
        transition: 'all 160ms ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = bgHover;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = index === 0 ? '#FFFBEB' : '#FFFFFF';
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
      }}
    >
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <span style={rankBadgeStyle}>{rankContent}</span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 650,
              fontSize: '0.875rem',
              color: 'var(--ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.ward_name}
          </span>
          {index === 0 && (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#D97706', color: '#FFFFFF', padding: '0.15rem 0.45rem', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TOP PRIORITY
            </span>
          )}
        </div>

        {/* Priority Score */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: index === 0 ? '#D97706' : 'var(--ink)',
              letterSpacing: '-0.02em',
            }}
          >
            {Math.round(row.priority_score)}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--ink-soft)', marginLeft: 3 }}>pts</span>
        </div>
      </div>

      {/* Segmented bar */}
      <div
        style={{ display: 'flex', height: 6, borderRadius: 4, overflow: 'hidden', background: '#F1F5F9', gap: 1 }}
        role="img"
        aria-label={`Priority breakdown: demand ${Math.round(row.demand_score)}, infra gap ${row.infra_gap}, budget gap ${row.budget_gap}`}
      >
        <div style={{ width: animated ? `${demandW}%` : '0%', background: SEGMENT_COLORS.demand, borderRadius: '3px 0 0 3px', transition: 'width 600ms ease' }} />
        <div style={{ width: animated ? `${infraW}%` : '0%', background: SEGMENT_COLORS.infra, transition: 'width 600ms ease 60ms' }} />
        <div style={{ width: animated ? `${budgetW}%` : '0%', background: SEGMENT_COLORS.budget, borderRadius: '0 3px 3px 0', transition: 'width 600ms ease 120ms' }} />
      </div>

      {/* Compact Caption Metrics */}
      <div style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
        <span>📋 <b>{row.complaint_count}</b> complaints</span>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <span style={{ color: SEGMENT_COLORS.demand }}>Demand: <b>{Math.round(row.demand_score)}</b></span>
          <span style={{ color: SEGMENT_COLORS.infra }}>Infra Gap: <b>{row.infra_gap}</b></span>
          <span style={{ color: SEGMENT_COLORS.budget }}>Budget Gap: <b>{row.budget_gap}</b></span>
        </div>
      </div>
    </div>
  );
}

export function PriorityList({ rows, loading, error, onRetry }: PriorityListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase().trim();
    return rows.filter((r) => r.ward_name.toLowerCase().includes(term));
  }, [rows, searchTerm]);

  const visibleRows = useMemo(() => {
    if (showAll || searchTerm.trim()) return filteredRows;
    return filteredRows.slice(0, 5); // Default show Top 5 to keep height compact!
  }, [filteredRows, showAll, searchTerm]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#FFFFFF', borderRadius: 20, padding: '1.25rem', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: '0.2rem', color: 'var(--deep-moss)' }}>Priority Ranking By Area</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0 }}>
              Investment Priorities
            </h2>
          </div>

          {/* Formula Info Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.6rem',
              borderRadius: 12,
              background: showFormulaInfo ? 'var(--leaf-pale)' : '#F8FAFC',
              border: '1px solid var(--border)',
              color: 'var(--ink-soft)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Info size={13} />
            {showFormulaInfo ? 'Hide Formula' : 'Formula Info'}
          </button>
        </div>

        {/* Formula Explainer Banner */}
        {showFormulaInfo && (
          <div style={{ marginTop: '0.65rem', padding: '0.65rem 0.85rem', borderRadius: 10, background: '#F8FAFC', border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--ink)' }}>
            <div style={{ fontWeight: 650, marginBottom: '0.2rem', color: 'var(--deep-moss)' }}>
              🧮 Multi-Criteria Decision Analysis (MCDA) Scoring Model:
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#FFFFFF', padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid var(--border)', marginTop: 4 }}>
              Score = (Demand × 45%) + (Infra Gap × 30%) + (Budget Gap × 25%)
            </div>
          </div>
        )}
      </div>

      {/* Search Input Box */}
      {!loading && !error && rows.length > 0 && (
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)' }} />
          <input
            type="text"
            placeholder="Search area, city or ward..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.2rem',
              fontSize: '0.8125rem',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: '#F8FAFC',
              outline: 'none',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={onRetry} />}

      {!loading && !error && rows.length === 0 && (
        <p style={{ color: 'var(--ink-soft)', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.85rem' }}>No ward priority data available.</p>
      )}

      {/* List Container with Controlled Compact Scrollable Height */}
      {!loading && !error && filteredRows.length > 0 && (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: showAll ? '480px' : 'none',
              overflowY: showAll ? 'auto' : 'visible',
              paddingRight: showAll ? 4 : 0,
            }}
          >
            {visibleRows.map((row, i) => (
              <PriorityRowItem key={row.ward_name} row={row} index={i} />
            ))}
          </div>

          {/* Expand / Collapse Toggle Button */}
          {filteredRows.length > 5 && !searchTerm && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              style={{
                width: '100%',
                padding: '0.45rem',
                borderRadius: 10,
                background: 'var(--leaf-pale)',
                border: '1px solid var(--leaf-light)',
                color: 'var(--deep-moss)',
                fontWeight: 650,
                fontSize: '0.78125rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'background 160ms ease',
              }}
            >
              {showAll ? (
                <>Show Top 5 Only <ChevronUp size={14} /></>
              ) : (
                <>Show All {filteredRows.length} Areas <ChevronDown size={14} /></>
              )}
            </button>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border)', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontWeight: 600 }}>Breakdown Legend:</span>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Demand (45%)', color: SEGMENT_COLORS.demand },
                { label: 'Infra Gap (30%)', color: SEGMENT_COLORS.infra },
                { label: 'Budget Gap (25%)', color: SEGMENT_COLORS.budget },
              ].map(({ label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} aria-hidden="true" />
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
