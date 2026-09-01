import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { CategoryCount } from '../../services/types';
import { Skeleton } from '../ui/ErrorState';
import { ErrorState } from '../ui/ErrorState';

interface CategoryChartProps {
  data: CategoryCount[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Water Supply': '#2B3A67',
  Road: '#D64545',
  Health: '#1F8A70',
  Electricity: '#E8A33D',
  Education: '#6B48C8',
  Sanitation: '#C67F1E',
  'General / Other': '#726C60',
};

function getColor(category: string) {
  return CATEGORY_COLORS[category] ?? '#2B3A67';
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: CategoryCount }[] }) => {
  if (!active || !payload?.length) return null;
  const { category, count } = payload[0].payload;
  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        padding: '0.5rem 0.875rem',
        fontFamily: 'var(--font-body)',
        fontSize: '0.8125rem',
      }}
    >
      <strong style={{ color: 'var(--ink)' }}>{category}</strong>
      <div style={{ color: 'var(--muted)' }}>{count} complaints</div>
    </div>
  );
};

export function CategoryChart({ data, loading, error, onRetry }: CategoryChartProps) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem' }}>
        Requests by category
      </h2>

      {loading && <Skeleton height={200} />}
      {error && <ErrorState message={error} onRetry={onRetry} compact />}

      {!loading && !error && data.length === 0 && (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.875rem' }}>
          No category data yet.
        </p>
      )}

      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted)', fontFamily: 'var(--font-body)' }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="category"
              width={100}
              tick={{ fontSize: 11, fill: 'var(--muted)', fontFamily: 'var(--font-body)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--indigo-light)' }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
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
