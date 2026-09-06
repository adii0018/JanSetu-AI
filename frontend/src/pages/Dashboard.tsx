import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, FileText, MapPin, AlertTriangle, TrendingUp, RotateCcw, FileSpreadsheet, Sparkles, ShieldCheck, Activity, Cpu, Layers } from 'lucide-react';
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
          padding: '3.5rem 0 5.25rem',
          position: 'relative',
          overflow: 'hidden',
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

        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ flex: '1 1 560px', maxWidth: 720 }}>
              {/* Eyebrow & Live Operational Status Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#6FBF73',
                    background: 'rgba(111, 191, 115, 0.12)',
                    border: '1px solid rgba(111, 191, 115, 0.35)',
                    padding: '0.28rem 0.75rem',
                    borderRadius: 100,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Sparkles size={13} color="#6FBF73" />
                  Policy Intelligence
                </span>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'rgba(37, 211, 102, 0.12)',
                    color: '#C9EAC7',
                    border: '1px solid rgba(37, 211, 102, 0.35)',
                    padding: '0.28rem 0.75rem',
                    borderRadius: 100,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 0 12px rgba(37, 211, 102, 0.25)',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#25D366', boxShadow: '0 0 8px #25D366', animation: 'pulse 1.5s infinite' }} />
                  LIVE • PAN-INDIA DEMAND AGGREGATOR
                </span>
              </div>

              {/* Precise Glowing Hero Title */}
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'clamp(2.1rem, 4.2vw, 3.1rem)',
                  color: '#FFFFFF',
                  lineHeight: 1.14,
                  letterSpacing: '-0.03em',
                  margin: 0,
                  textShadow: '0 4px 24px rgba(0, 0, 0, 0.7)',
                }}
              >
                AI Civic Investment Priorities{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #C9EAC7 30%, #6FBF73 70%, #F0862E 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 16px rgba(111, 191, 115, 0.45))',
                    fontStyle: 'normal',
                  }}
                >
                  & Spatial Clusters
                </span>
              </h1>

              {/* Precise Subtitle */}
              <p
                style={{
                  color: 'rgba(201, 234, 199, 0.92)',
                  fontSize: '1rem',
                  marginTop: '0.85rem',
                  maxWidth: 600,
                  lineHeight: 1.6,
                  fontWeight: 400,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
                }}
              >
                Real-time civic demand signals parsed by AI, spatially clustered, and weighted by infrastructure gaps for smart budget allocation.
              </p>

              {/* Floating Feature Highlight Pills */}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Geo-Spatial Clusters', Icon: MapPin, color: '#6FBF73' },
                  { label: 'Priority Engine', Icon: TrendingUp, color: '#F0862E' },
                  { label: 'Live Ward Feed', Icon: Activity, color: '#60A5FA' },
                  { label: 'AI Recognition', Icon: Cpu, color: '#A78BFA' },
                ].map(({ label, Icon, color }) => (
                  <span
                    key={label}
                    style={{
                      fontSize: '0.78125rem',
                      fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.07)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '0.35rem 0.8rem',
                      borderRadius: 100,
                      backdropFilter: 'blur(6px)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 200ms ease',
                      cursor: 'default',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLSpanElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLSpanElement).style.background = 'rgba(255, 255, 255, 0.15)';
                      (e.currentTarget as HTMLSpanElement).style.borderColor = 'rgba(255, 255, 255, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLSpanElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLSpanElement).style.background = 'rgba(255, 255, 255, 0.07)';
                      (e.currentTarget as HTMLSpanElement).style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    <Icon size={14} color={color} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Side Open Floating Action Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Govt Google Sheet Link Button */}
              <a
                href="https://docs.google.com/spreadsheets/d/1cC8YMVKnjgc5Gq9h4T_dvx4u1PFgfqXvUTMi_gc9Rn0/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.1rem',
                  borderRadius: 100,
                  background: 'linear-gradient(135deg, rgba(15, 157, 88, 0.35) 0%, rgba(15, 157, 88, 0.55) 100%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(37, 211, 102, 0.6)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(15, 157, 88, 0.3)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px) scale(1.02)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 22px rgba(37, 211, 102, 0.45)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0) scale(1)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(15, 157, 88, 0.3)';
                }}
              >
                <FileSpreadsheet size={16} color="#25D366" />
                Live Govt Sheet
              </a>

              {/* Refresh Data Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.1rem',
                  borderRadius: 100,
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.22)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <RefreshCw
                  size={15}
                  color="#6FBF73"
                  style={refreshing ? { animation: 'spin 0.8s linear infinite' } : undefined}
                />
                {refreshing ? 'Refreshing…' : 'Refresh Telemetry'}
              </button>

              {/* Reset Demo Button */}
              <button
                onClick={handleReset}
                disabled={resetting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.1rem',
                  borderRadius: 100,
                  background: 'rgba(255, 120, 100, 0.15)',
                  color: '#FFB8B8',
                  border: '1px solid rgba(255, 120, 100, 0.4)',
                  fontWeight: 650,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.02)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 120, 100, 0.28)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 120, 100, 0.15)';
                }}
              >
                <RotateCcw
                  size={14}
                  style={resetting ? { animation: 'spin 0.8s linear infinite' } : undefined}
                />
                {resetting ? 'Resetting…' : 'Reset Demo Data'}
              </button>
            </div>
          </div>

          {/* Dynamic Telemetry Stat Cards inside Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
              marginTop: '2.75rem',
            }}
          >
            <StatCard label="Total Requests" value={s?.total_requests ?? 0} Icon={FileText} color="#6FBF73" loading={summary.loading} dark />
            <StatCard label="Areas Covered" value={s?.wards_covered ?? 0} Icon={MapPin} color="#6FBF73" loading={summary.loading} dark />
            <StatCard label="High Urgency" value={s?.high_urgency_count ?? 0} Icon={AlertTriangle} color="#FF6B6B" loading={summary.loading} dark />
            <StatCard label="Top Category" value={s?.top_category ?? '—'} Icon={TrendingUp} color="#F0862E" loading={summary.loading} dark />
          </motion.div>
        </div>

        {/* Dynamic Animated Flowing Wavy Bottom Divider */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: '100%',
            height: '52px',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {/* Layer 1: Ambient Glowing Translucent Back Wave */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '100%',
              animation: 'waveFlowRight 18s linear infinite',
              willChange: 'transform',
            }}
          >
            <svg
              viewBox="0 0 2400 120"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <path
                d="M 0,30 Q 300,90 600,30 T 1200,30 T 1800,30 T 2400,30 L 2400,120 L 0,120 Z"
                fill="rgba(111, 191, 115, 0.2)"
              />
            </svg>
          </div>

          {/* Layer 2: Glowing Neon Green Accent Curve Line Wave */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '100%',
              animation: 'waveFlowLeft 14s linear infinite',
              willChange: 'transform',
            }}
          >
            <svg
              viewBox="0 0 2400 120"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <path
                d="M 0,40 Q 300,10 600,40 T 1200,40 T 1800,40 T 2400,40"
                fill="none"
                stroke="#6FBF73"
                strokeWidth="3.5"
                strokeOpacity="0.65"
                style={{ filter: 'drop-shadow(0 0 10px rgba(111, 191, 115, 0.8))' }}
              />
            </svg>
          </div>

          {/* Layer 3: Main Page Background Wavy Fluid Transition */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '100%',
              animation: 'waveFlowLeft 10s linear infinite',
              willChange: 'transform',
            }}
          >
            <svg
              viewBox="0 0 2400 120"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <path
                d="M 0,45 Q 300,100 600,45 T 1200,45 T 1800,45 T 2400,45 L 2400,120 L 0,120 Z"
                fill="var(--bg-page, #F9FAFC)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <PageContainer>
        {/* Hotspot Map — full width at top */}
        <div style={{ marginTop: '2rem' }}>
          <HotspotMap
            data={mapData.data ?? []}
            geoClusters={geoClusters.data?.clusters ?? []}
            loading={mapData.loading}
            error={mapData.error}
            onRetry={fetchAll}
          />
        </div>

        {/* Two-column grid */}
        <div
          className="dash-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: '1.5rem',
            alignItems: 'start',
            marginTop: '1.75rem',
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
      </PageContainer>

      <style>{`
        @keyframes waveFlowLeft {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes waveFlowRight {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
