import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import type { CategoryCount } from '../../services/types';
import { ErrorState } from '../ui/ErrorState';

interface CategoryChartProps {
  data: CategoryCount[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Water Supply': '#2E6B3E',
  'Road':          '#C0392B',
  'Health':        '#1F8A70',
  'Electricity':   '#C67F1E',
  'Education':     '#5856D6',
  'Sanitation':    '#6FBF73',
  'General / Other': '#8A9E8D',
};

function getColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? '#2E6B3E';
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: CategoryCount }[] }) => {
  if (!active || !payload?.length) return null;
  const { category, count } = payload[0].payload;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '0.625rem 1rem',
        fontFamily: 'var(--font-body)',
        fontSize: '0.8125rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <strong style={{ color: 'var(--ink)' }}>{category}</strong>
      <div style={{ color: 'var(--ink-soft)', marginTop: 2 }}>{count} complaints</div>
    </div>
  );
};

export function CategoryChart({ data, loading, error, onRetry }: CategoryChartProps) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: '0.4rem' }}>Breakdown</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          Requests by category
        </h2>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[80, 55, 65, 40, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 6 }} />
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={onRetry} compact />}

      {!loading && !error && data.length === 0 && (
        <p style={{ color: 'var(--ink-soft)', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.875rem' }}>
          No category data yet.
        </p>
      )}

      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={96}
              tick={{ fontSize: 11, fill: 'var(--ink-soft)', fontFamily: 'var(--font-body)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--leaf-pale)' }} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={16}>
              {data.map((entry) => (
                <Cell key={entry.category} fill={getColor(entry.category)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
