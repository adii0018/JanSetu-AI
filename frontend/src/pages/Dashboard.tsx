import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, FileText, MapPin, AlertTriangle, TrendingUp, RotateCcw } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/dashboard/StatCard';
import { PriorityList } from '../components/dashboard/PriorityList';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { LiveFeed } from '../components/dashboard/LiveFeed';
import { useToast } from '../components/ui/Toast';
import {
  getDashboardSummary,
  getDashboardPriorities,
  getDashboardCategories,
  getComplaints,
  getWards,
  resetDemo,
} from '../services/api';
import type {
  DashboardSummary,
  PriorityRow,
  CategoryCount,
  Complaint,
  Ward,
} from '../services/types';

type LoadState<T> = { data: T | null; loading: boolean; error: string | null };

function init<T>(): LoadState<T> {
  return { data: null, loading: true, error: null };
}

export function Dashboard() {
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [summary, setSummary] = useState<LoadState<DashboardSummary>>(init());
  const [priorities, setPriorities] = useState<LoadState<PriorityRow[]>>(init());
  const [categories, setCategories] = useState<LoadState<CategoryCount[]>>(init());
  const [complaints, setComplaints] = useState<LoadState<Complaint[]>>(init());
  const [wards, setWards] = useState<LoadState<Ward[]>>(init());

  const fetchAll = useCallback(async () => {
    setSummary((s) => ({ ...s, loading: true, error: null }));
    setPriorities((s) => ({ ...s, loading: true, error: null }));
    setCategories((s) => ({ ...s, loading: true, error: null }));
    setComplaints((s) => ({ ...s, loading: true, error: null }));
    setWards((s) => ({ ...s, loading: true, error: null }));

    await Promise.allSettled([
      getDashboardSummary()
        .then((data) => setSummary({ data, loading: false, error: null }))
        .catch((e) => setSummary({ data: null, loading: false, error: e.message })),
      getDashboardPriorities()
        .then((data) => setPriorities({ data, loading: false, error: null }))
        .catch((e) => setPriorities({ data: null, loading: false, error: e.message })),
      getDashboardCategories()
        .then((data) => setCategories({ data, loading: false, error: null }))
        .catch((e) => setCategories({ data: null, loading: false, error: e.message })),
      getComplaints(25)
        .then((data) => setComplaints({ data, loading: false, error: null }))
        .catch((e) => setComplaints({ data: null, loading: false, error: e.message })),
      getWards()
        .then((data) => setWards({ data, loading: false, error: null }))
        .catch((e) => setWards({ data: null, loading: false, error: e.message })),
    ]);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetDemo();
      showToast('Demo data reset successfully.', 'success');
      await fetchAll();
    } catch {
      showToast('Reset failed. Please try again.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const s = summary.data;

  return (
    <PageContainer>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-block',
              padding: '0.2rem 0.75rem',
              background: 'var(--indigo-light)',
              borderRadius: 20,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.75rem',
              color: 'var(--indigo)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '0.375rem',
            }}
          >
            Policymaker Dashboard
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}
          >
            AI-Ranked Investment Priorities
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Real-time demand signals from citizens, weighted by infrastructure and budget gaps.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-ghost"
          aria-label="Refresh dashboard data"
          style={{ flexShrink: 0 }}
        >
          <RefreshCw
            size={15}
            aria-hidden="true"
            style={refreshing ? { animation: 'spin 0.8s linear infinite' } : undefined}
          />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard
          label="Total Requests"
          value={s?.total_requests ?? 0}
          Icon={FileText}
          color="var(--indigo)"
          loading={summary.loading}
        />
        <StatCard
          label="Areas Covered"
          value={s?.wards_covered ?? 0}
          Icon={MapPin}
          color="var(--teal)"
          loading={summary.loading}
        />
        <StatCard
          label="High-Urgency Open"
          value={s?.high_urgency_count ?? 0}
          Icon={AlertTriangle}
          color="var(--coral)"
          loading={summary.loading}
        />
        <StatCard
          label="Top Category"
          value={s?.top_category ?? '—'}
          Icon={TrendingUp}
          color="var(--saffron-deep)"
          loading={summary.loading}
        />
      </div>

      {/* Main two-column section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.45fr 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left: Priority ranking */}
        <PriorityList
          rows={priorities.data ?? []}
          loading={priorities.loading}
          error={priorities.error}
          onRetry={fetchAll}
        />

        {/* Right: Category chart + Live feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CategoryChart
            data={categories.data ?? []}
            loading={categories.loading}
            error={categories.error}
            onRetry={fetchAll}
          />
          <LiveFeed
            complaints={complaints.data ?? []}
            wards={wards.data ?? []}
            loading={complaints.loading}
            error={complaints.error}
            onRetry={fetchAll}
          />

          {/* Reset demo */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="btn-ghost"
              aria-label="Reset demo data and re-seed sample complaints"
              style={{ fontSize: '0.8125rem', color: 'var(--coral)' }}
            >
              <RotateCcw
                size={13}
                aria-hidden="true"
                style={resetting ? { animation: 'spin 0.8s linear infinite' } : undefined}
              />
              {resetting ? 'Resetting…' : 'Reset demo data'}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          .dash-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </PageContainer>
  );
}
