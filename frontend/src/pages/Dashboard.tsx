import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, FileText, MapPin, AlertTriangle, TrendingUp, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/dashboard/StatCard';
import { PriorityList } from '../components/dashboard/PriorityList';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { LiveFeed } from '../components/dashboard/LiveFeed';
import { HotspotMap } from '../components/dashboard/HotspotMap';
import { useToast } from '../components/ui/Toast';
import { playClick } from '../utils/sounds';
import {
  getDashboardSummary,
  getDashboardPriorities,
  getDashboardCategories,
  getComplaints,
  getWards,
  resetDemo,
  getMapData,
  getSemanticClusters,
  getGeoClusters,
} from '../services/api';
import type {
  DashboardSummary,
  PriorityRow,
  CategoryCount,
  Complaint,
  Ward,
  MapWard,
  SemanticClustersResponse,
  GeoClustersResponse,
} from '../services/types';
import { SemanticClusterCard } from '../components/dashboard/SemanticClusterCard';

type LoadState<T> = { data: T | null; loading: boolean; error: string | null };
function init<T>(): LoadState<T> { return { data: null, loading: true, error: null }; }

export function Dashboard() {
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [summary, setSummary] = useState<LoadState<DashboardSummary>>(init());
  const [priorities, setPriorities] = useState<LoadState<PriorityRow[]>>(init());
  const [categories, setCategories] = useState<LoadState<CategoryCount[]>>(init());
  const [complaints, setComplaints] = useState<LoadState<Complaint[]>>(init());
  const [wards, setWards] = useState<LoadState<Ward[]>>(init());
  const [mapData, setMapData] = useState<LoadState<MapWard[]>>(init());
  const [semanticClusters, setSemanticClusters] = useState<LoadState<SemanticClustersResponse>>(init());
  const [geoClusters, setGeoClusters] = useState<LoadState<GeoClustersResponse>>(init());

  const fetchAll = useCallback(async () => {
    setSummary((s) => ({ ...s, loading: true, error: null }));
    setPriorities((s) => ({ ...s, loading: true, error: null }));
    setCategories((s) => ({ ...s, loading: true, error: null }));
    setComplaints((s) => ({ ...s, loading: true, error: null }));
    setWards((s) => ({ ...s, loading: true, error: null }));
    setMapData((s) => ({ ...s, loading: true, error: null }));
    setSemanticClusters((s) => ({ ...s, loading: true, error: null }));
    setGeoClusters((s) => ({ ...s, loading: true, error: null }));

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
      getMapData()
        .then((data) => setMapData({ data, loading: false, error: null }))
        .catch((e) => setMapData({ data: null, loading: false, error: e.message })),
      getSemanticClusters()
        .then((data) => setSemanticClusters({ data, loading: false, error: null }))
        .catch((e) => setSemanticClusters({ data: null, loading: false, error: e.message })),
      getGeoClusters()
        .then((data) => setGeoClusters({ data, loading: false, error: null }))
        .catch((e) => setGeoClusters({ data: null, loading: false, error: e.message })),
    ]);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRefresh = async () => {
    playClick();
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
    showToast('Dashboard refreshed.', 'success');
  };

  const handleReset = async () => {
    playClick();
    setResetting(true);
    try {
      await resetDemo();
      showToast('Demo data reset.', 'success');
      await fetchAll();
    } catch {
      showToast('Reset failed. Try again.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const s = summary.data;

  return (
    <>
      {/* ── Dark Moss Hero strip ───────────────────────────────── */}
      <div
        style={{
          background: 'var(--deep-moss)',
          padding: '3rem 0 3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background blob */}
        <div
          aria-hidden="true"
          className="blob"
          style={{
            width: 380,
            height: 320,
            top: '-60px',
            right: '8%',
            opacity: 0.18,
            animationDuration: '16s',
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--leaf)', marginBottom: '0.75rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--leaf)', display: 'inline-block', flexShrink: 0 }} />
                Policymaker Dashboard
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 340,
                  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  color: '#fff',
                  lineHeight: 1.14,
                  letterSpacing: '-0.03em',
                  maxWidth: 560,
                }}
              >
                AI-ranked investment{' '}
                <em style={{ fontStyle: 'italic', fontWeight: 480, color: 'var(--leaf-light)' }}>
                  priorities
                </em>
              </h1>
              <p style={{ color: 'rgba(201,234,199,0.75)', fontSize: '0.9375rem', marginTop: '0.75rem', maxWidth: 480, lineHeight: 1.6 }}>
                Real-time demand signals from citizens, weighted by infrastructure and budget gaps.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap' }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-ghost"
                aria-label="Refresh dashboard data"
                style={{ color: 'var(--leaf-light)', borderColor: 'rgba(111,191,115,0.4)', background: 'rgba(111,191,115,0.08)' }}
              >
                <RefreshCw
                  size={14}
                  aria-hidden="true"
                  style={refreshing ? { animation: 'spin 0.8s linear infinite' } : undefined}
                />
                Refresh
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="btn-ghost"
                aria-label="Reset demo data"
                style={{ color: 'rgba(255,120,100,0.9)', borderColor: 'rgba(255,120,100,0.3)', background: 'rgba(255,120,100,0.07)' }}
              >
                <RotateCcw
                  size={14}
                  aria-hidden="true"
                  style={resetting ? { animation: 'spin 0.8s linear infinite' } : undefined}
                />
                {resetting ? 'Resetting…' : 'Reset demo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards (overlap the dark section) ─────────────── */}
      <div style={{ maxWidth: 1200, margin: '-2.25rem auto 0', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
          }}
        >
          <StatCard label="Total Requests" value={s?.total_requests ?? 0} Icon={FileText} color="var(--moss)" loading={summary.loading} />
          <StatCard label="Areas Covered" value={s?.wards_covered ?? 0} Icon={MapPin} color="var(--leaf)" loading={summary.loading} />
          <StatCard label="High Urgency" value={s?.high_urgency_count ?? 0} Icon={AlertTriangle} color="#C0392B" loading={summary.loading} />
          <StatCard label="Top Category" value={s?.top_category ?? '—'} Icon={TrendingUp} color="var(--moss)" loading={summary.loading} />
        </motion.div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <PageContainer>
        {/* Two-column grid */}
        <div
          className="dash-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: '1.5rem',
            alignItems: 'start',
            marginTop: '2rem',
          }}
        >
          <PriorityList
            rows={priorities.data ?? []}
            loading={priorities.loading}
            error={priorities.error}
            onRetry={fetchAll}
          />

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
          </div>
        </div>

        {/* Semantic AI Auto-Grouped Clusters — full width */}
        <div style={{ marginTop: '1.75rem' }}>
          <SemanticClusterCard
            clusters={semanticClusters.data?.clusters ?? []}
            loading={semanticClusters.loading}
          />
        </div>

        {/* Hotspot Map — full width */}
        <div style={{ marginTop: '1.75rem' }}>
          <HotspotMap
            data={mapData.data ?? []}
            geoClusters={geoClusters.data?.clusters ?? []}
            loading={mapData.loading}
            error={mapData.error}
            onRetry={fetchAll}
          />
        </div>
      </PageContainer>

      <style>{`
        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
