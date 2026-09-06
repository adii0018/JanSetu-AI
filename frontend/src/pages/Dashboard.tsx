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
      {/* ── Dynamic Executive Hero strip with floating clouds ───────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #132417 0%, #1F3A24 50%, #16241A 100%)',
          padding: '3.5rem 0 4.25rem',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Animated Twinkling Stars Backdrop */}
        <div aria-hidden="true" className="stars-container">
          {/* Shooting Star Accent */}
          <div className="shooting-star" />

          {/* Twinkling Star SVG Icons */}
          <svg style={{ position: 'absolute', top: '15%', left: '8%' }} className="star-twinkle" width="16" height="16" viewBox="0 0 24 24" fill="#C9EAC7">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
          </svg>
          <svg style={{ position: 'absolute', top: '45%', left: '18%' }} className="star-twinkle star-delay-1" width="12" height="12" viewBox="0 0 24 24" fill="#FFF2A8">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
          </svg>
          <svg style={{ position: 'absolute', top: '25%', left: '42%' }} className="star-twinkle star-delay-2" width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
          </svg>
          <svg style={{ position: 'absolute', top: '70%', left: '30%' }} className="star-twinkle star-delay-3" width="10" height="10" viewBox="0 0 24 24" fill="#6FBF73">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
          </svg>
          <svg style={{ position: 'absolute', top: '20%', left: '68%' }} className="star-twinkle star-delay-1" width="14" height="14" viewBox="0 0 24 24" fill="#F0862E">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
          </svg>
          <svg style={{ position: 'absolute', top: '60%', left: '82%' }} className="star-twinkle star-delay-4" width="16" height="16" viewBox="0 0 24 24" fill="#FFF8DC">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
          </svg>
          <svg style={{ position: 'absolute', top: '12%', left: '88%' }} className="star-twinkle star-delay-2" width="10" height="10" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
          </svg>
        </div>

        {/* Animated Sleek Glowing Crescent Moon in Corner */}
        <div aria-hidden="true" className="moon-container">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="crescentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#FFF4D0" />
                <stop offset="75%" stopColor="#F5D061" />
                <stop offset="100%" stopColor="#E09F3E" />
              </linearGradient>
              <radialGradient id="moonGlowAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 238, 175, 0.4)" />
                <stop offset="50%" stopColor="rgba(111, 191, 115, 0.15)" />
                <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
              </radialGradient>
            </defs>
            {/* Moonlight Ambient Halo */}
            <circle cx="100" cy="100" r="90" fill="url(#moonGlowAura)" />
            
            {/* Sleek Crescent Moon Group */}
            <g className="moon-core">
              {/* Crescent Moon Path */}
              <path
                d="M110 40 C145 40 170 68 170 102 C170 136 142 164 108 164 C76 164 52 142 46 112 C62 126 84 132 108 126 C134 119 148 94 142 68 C138 54 126 44 110 40 Z"
                fill="url(#crescentGradient)"
                style={{ filter: 'drop-shadow(0 0 16px rgba(245, 208, 97, 0.6))' }}
              />
              {/* Companion Sparkle Star nested in crescent */}
              <path
                d="M82 62 L84 69 L91 71 L84 73 L82 80 L80 73 L73 71 L80 69 Z"
                fill="#FFF4D0"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255, 244, 208, 0.9))' }}
                className="star-twinkle"
              />
            </g>
          </svg>
        </div>

        {/* Dynamic Ambient Radial Light Spots */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-120px',
            right: '5%',
            width: '600px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(111, 191, 115, 0.18) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '10%',
            width: '450px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(240, 134, 46, 0.12) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              {/* Eyebrow & Live Operational Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                <div className="eyebrow" style={{ color: 'var(--leaf)' }}>
                  Policymaker Intelligence Dashboard
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(111, 191, 115, 0.15)', color: '#C9EAC7', border: '1px solid rgba(111, 191, 115, 0.3)', padding: '0.15rem 0.6rem', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6FBF73', animation: 'pulse 1.5s infinite' }} />
                  LIVE DEMAND AGGREGATOR • PAN-INDIA 28 STATES & 8 UTs
                </span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 340,
                  fontSize: 'clamp(2.1rem, 4.5vw, 3rem)',
                  color: '#fff',
                  lineHeight: 1.12,
                  letterSpacing: '-0.03em',
                  maxWidth: 620,
                }}
              >
                AI-ranked investment{' '}
                <em style={{ fontStyle: 'italic', fontWeight: 480, color: 'var(--leaf-light)', background: 'linear-gradient(90deg, #C9EAC7, #6FBF73, #F0862E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  priorities & clusters
                </em>
              </h1>

              <p style={{ color: 'rgba(201,234,199,0.82)', fontSize: '1rem', marginTop: '0.85rem', maxWidth: 540, lineHeight: 1.6 }}>
                Real-time civic demand signals extracted by AI entity recognition, grouped into spatial clusters and weighted by infrastructure gaps.
              </p>

              {/* Feature highlight pills */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                {[
                  { label: '🤖 Geo-Spatial Clustering' },
                  { label: '📊 Dynamic Priority Scoring' },
                  { label: '⚡ Real-time Ward Feed' },
                ].map(({ label }) => (
                  <span
                    key={label}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: 'rgba(255, 255, 255, 0.07)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 100,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Refresh & Reset Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap' }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-ghost"
                aria-label="Refresh dashboard data"
                style={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(111,191,115,0.4)',
                  background: 'rgba(111,191,115,0.15)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <RefreshCw
                  size={15}
                  aria-hidden="true"
                  style={refreshing ? { animation: 'spin 0.8s linear infinite' } : undefined}
                />
                {refreshing ? 'Refreshing…' : 'Refresh Data'}
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="btn-ghost"
                aria-label="Reset demo data"
                style={{
                  color: '#FFB8B8',
                  borderColor: 'rgba(255,120,100,0.4)',
                  background: 'rgba(255,120,100,0.12)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <RotateCcw
                  size={15}
                  aria-hidden="true"
                  style={resetting ? { animation: 'spin 0.8s linear infinite' } : undefined}
                />
                {resetting ? 'Resetting…' : 'Reset Demo'}
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
