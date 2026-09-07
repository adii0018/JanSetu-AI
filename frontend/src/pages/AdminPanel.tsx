import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Users, FileText, CheckCircle, Clock, AlertTriangle,
  RefreshCw, LogOut, ChevronDown, Search, BarChart3, Eye, X, MapPin,
  TrendingUp, RotateCcw, FileSpreadsheet, Sparkles, Activity, Cpu, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/dashboard/StatCard';
import { PriorityList } from '../components/dashboard/PriorityList';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { LiveFeed } from '../components/dashboard/LiveFeed';
import { HotspotMap } from '../components/dashboard/HotspotMap';
import { SemanticClusterCard } from '../components/dashboard/SemanticClusterCard';
import { useToast } from '../components/ui/Toast';
import { playClick } from '../utils/sounds';
import { useAuth } from '../context/AuthContext';
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

const ADMIN_KEY = 'jansetu-admin-2026';
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';

// ─── Admin Specific Types ─────────────────────────────────────
interface AdminComplaint {
  id: number;
  tracking_id: string;
  user_email: string;
  raw_text: string;
  category: string;
  urgency: number;
  confidence: number;
  status: string;
  channel: string;
  language: string;
  upvote_count: number;
  ward_name: string;
  created_at: string;
}

interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  city_ward: string;
  is_verified: boolean;
  created_at: string;
}

type LoadState<T> = { data: T | null; loading: boolean; error: string | null };
function init<T>(): LoadState<T> { return { data: null, loading: true, error: null }; }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  submitted:    { label: 'Submitted',    color: '#C67F1E', bg: '#FEF3E2' },
  under_review: { label: 'Under Review', color: '#1D4ED8', bg: '#EFF6FF' },
  approved:     { label: 'Approved',     color: '#059669', bg: '#ECFDF5' },
  resolved:     { label: 'Resolved',     color: '#16A34A', bg: '#F0FFF4' },
};

function urgencyColor(u: number) {
  if (u >= 75) return '#DC2626';
  if (u >= 50) return '#D97706';
  return '#059669';
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.65rem',
      borderRadius: 100, fontSize: '0.72rem', fontWeight: 700,
      color: cfg.color, background: cfg.bg,
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Main Admin Panel Component ───────────────────────────────
export function AdminPanel() {
  const { showToast } = useToast();
  const { openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'complaints' | 'users'>('analytics');

  // Admin Authorization Guard State
  const [isAuthenticated] = useState<boolean>(
    () => localStorage.getItem('jansetu_admin_auth') === 'true'
  );

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login');
      window.location.replace('/?login=required');
    }
  }, [isAuthenticated, openAuthModal]);

  // Open Analytics State
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [summary, setSummary] = useState<LoadState<DashboardSummary>>(init());
  const [priorities, setPriorities] = useState<LoadState<PriorityRow[]>>(init());
  const [categories, setCategories] = useState<LoadState<CategoryCount[]>>(init());
  const [complaintsData, setComplaintsData] = useState<LoadState<Complaint[]>>(init());
  const [wards, setWards] = useState<LoadState<Ward[]>>(init());
  const [mapData, setMapData] = useState<LoadState<MapWard[]>>(init());
  const [semanticClusters, setSemanticClusters] = useState<LoadState<SemanticClustersResponse>>(init());
  const [geoClusters, setGeoClusters] = useState<LoadState<GeoClustersResponse>>(init());

  // Admin Management State
  const [adminComplaints, setAdminComplaints] = useState<AdminComplaint[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const headers = { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY };

  // Fetch Open Analytics Telemetry
  const fetchAnalytics = useCallback(async () => {
    setSummary((s) => ({ ...s, loading: true, error: null }));
    setPriorities((s) => ({ ...s, loading: true, error: null }));
    setCategories((s) => ({ ...s, loading: true, error: null }));
    setComplaintsData((s) => ({ ...s, loading: true, error: null }));
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
        .then((data) => setComplaintsData({ data, loading: false, error: null }))
        .catch((e) => setComplaintsData({ data: null, loading: false, error: e.message })),
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

  // Fetch Admin Complaints List
  const fetchAdminComplaints = useCallback(async () => {
    let url = `${BASE_URL}/api/admin/complaints?limit=100`;
    if (statusFilter) url += `&status_filter=${statusFilter}`;
    try {
      const r = await fetch(url, { headers });
      if (r.ok) {
        const d = await r.json();
        setAdminComplaints(d.complaints);
      }
    } catch (e) {
      console.error('Failed to fetch admin complaints:', e);
    }
  }, [statusFilter]);

  // Fetch Admin Users List
  const fetchAdminUsers = useCallback(async () => {
    try {
      const r = await fetch(`${BASE_URL}/api/admin/users?limit=200`, { headers });
      if (r.ok) {
        const d = await r.json();
        setAdminUsers(d.users);
      }
    } catch (e) {
      console.error('Failed to fetch admin users:', e);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
      fetchAdminComplaints();
      fetchAdminUsers();
    }
  }, [isAuthenticated, fetchAnalytics, fetchAdminComplaints, fetchAdminUsers]);

  const handleAdminLogout = () => {
    playClick();
    localStorage.removeItem('jansetu_admin_auth');
    showToast('Logged out of JanSetu Admin Portal', 'info');
    window.location.href = '/';
  };

  const handleRefresh = async () => {
    playClick();
    setRefreshing(true);
    await Promise.all([fetchAnalytics(), fetchAdminComplaints(), fetchAdminUsers()]);
    setRefreshing(false);
    showToast('Admin Dashboard refreshed.', 'success');
  };

  const handleReset = async () => {
    playClick();
    setResetting(true);
    try {
      await resetDemo();
      showToast('Demo data reset.', 'success');
      await handleRefresh();
    } catch {
      showToast('Reset failed. Try again.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleStatusUpdate = async (trackingId: string, newStatus: string) => {
    setUpdatingId(trackingId);
    try {
      const r = await fetch(`${BASE_URL}/api/admin/complaints/${trackingId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (r.ok) {
        setAdminComplaints((prev) =>
          prev.map((c) => (c.tracking_id === trackingId ? { ...c, status: newStatus } : c))
        );
        showToast(`Updated ${trackingId} status to ${newStatus}`, 'success');
        await fetchAnalytics();
      }
    } catch (e) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAdminComplaints = adminComplaints.filter(
    (c) =>
      c.tracking_id.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.ward_name.toLowerCase().includes(search.toLowerCase()) ||
      c.user_email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAdminUsers = adminUsers.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.city_ward.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return null;
  }

  const s = summary.data;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper, #F9FAFC)', paddingBottom: '3rem' }}>
      {/* ── Admin Floating Curved Capsule Top Navigation ─────────────── */}
      <header
        style={{
          position: 'sticky',
          top: '12px',
          zIndex: 100,
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 1rem',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            border: '1px solid rgba(18, 53, 36, 0.12)',
            boxShadow: '0 12px 36px rgba(18, 53, 36, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
            padding: '0.4rem 1rem',
            minHeight: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Logo & Admin Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(37, 211, 102, 0.25)',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--ink, #123524)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem', lineHeight: 1.2 }}>
                JanSetu <span style={{ color: '#25D366' }}>AI Admin</span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    background: 'rgba(37, 211, 102, 0.12)',
                    color: '#123524',
                    border: '1px solid rgba(37, 211, 102, 0.35)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 100,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  OFFICER
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '3px',
              background: 'rgba(18, 53, 36, 0.05)',
              padding: '3px',
              borderRadius: 100,
              border: '1px solid rgba(18, 53, 36, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => { playClick(); setActiveTab('analytics'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.9rem',
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.78rem',
                fontFamily: 'var(--font-body)',
                background: activeTab === 'analytics' ? 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)' : 'transparent',
                color: activeTab === 'analytics' ? '#FFFFFF' : 'var(--ink-soft, #475569)',
                boxShadow: activeTab === 'analytics' ? '0 4px 14px rgba(18, 53, 36, 0.22)' : 'none',
                transition: 'all 200ms ease',
              }}
            >
              <BarChart3 size={13} /> Open Analytics
            </button>
            <button
              type="button"
              onClick={() => { playClick(); setActiveTab('complaints'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.9rem',
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.78rem',
                fontFamily: 'var(--font-body)',
                background: activeTab === 'complaints' ? 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)' : 'transparent',
                color: activeTab === 'complaints' ? '#FFFFFF' : 'var(--ink-soft, #475569)',
                boxShadow: activeTab === 'complaints' ? '0 4px 14px rgba(18, 53, 36, 0.22)' : 'none',
                transition: 'all 200ms ease',
              }}
            >
              <FileText size={13} /> Complaints ({adminComplaints.length})
            </button>
            <button
              type="button"
              onClick={() => { playClick(); setActiveTab('users'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.9rem',
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.78rem',
                fontFamily: 'var(--font-body)',
                background: activeTab === 'users' ? 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)' : 'transparent',
                color: activeTab === 'users' ? '#FFFFFF' : 'var(--ink-soft, #475569)',
                boxShadow: activeTab === 'users' ? '0 4px 14px rgba(18, 53, 36, 0.22)' : 'none',
                transition: 'all 200ms ease',
              }}
            >
              <Users size={13} /> Citizens ({adminUsers.length})
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 100,
                border: '1px solid rgba(18, 53, 36, 0.12)',
                background: 'rgba(18, 53, 36, 0.05)',
                color: 'var(--ink, #123524)',
                fontSize: '0.75rem',
                fontWeight: 650,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <RefreshCw size={13} color="#25D366" style={refreshing ? { animation: 'spin 0.8s linear infinite' } : undefined} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              onClick={handleAdminLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 100,
                border: 'none',
                background: '#FEF2F2',
                color: '#DC2626',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <LogOut size={13} /> Exit Admin
            </button>
          </div>
        </div>
      </header>

      {/* ── TAB 1: FULL OPEN ANALYTICS DASHBOARD ──────────────────────── */}
      {activeTab === 'analytics' && (
        <>
          {/* Executive Hero Banner with Wavy Fluid Divider & Starry Crescent Moon */}
          <div
            style={{
              background: 'linear-gradient(135deg, #132417 0%, #1F3A24 50%, #16241A 100%)',
              marginTop: '-76px',
              paddingTop: '9rem',
              paddingBottom: '5.25rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Animated Twinkling Stars Backdrop */}
            <div aria-hidden="true" className="stars-container">
              <div className="shooting-star" />
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
                <circle cx="100" cy="100" r="90" fill="url(#moonGlowAura)" />
                <g className="moon-core">
                  <path
                    d="M110 40 C145 40 170 68 170 102 C170 136 142 164 108 164 C76 164 52 142 46 112 C62 126 84 132 108 126 C134 119 148 94 142 68 C138 54 126 44 110 40 Z"
                    fill="url(#crescentGradient)"
                    style={{ filter: 'drop-shadow(0 0 16px rgba(245, 208, 97, 0.6))' }}
                  />
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
                      }}
                    >
                      & Spatial Clusters
                    </span>
                  </h1>

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
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        <Icon size={14} color={color} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Floating Action Controls */}
                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
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
                    }}
                  >
                    <FileSpreadsheet size={16} color="#25D366" />
                    Live Govt Sheet
                  </a>
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
                    }}
                  >
                    <RotateCcw size={14} style={resetting ? { animation: 'spin 0.8s linear infinite' } : undefined} />
                    {resetting ? 'Resetting…' : 'Reset Demo Data'}
                  </button>
                </div>
              </div>

              {/* Dynamic Telemetry Stat Cards inside Hero */}
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
                    fill="var(--paper, #F9FAFC)"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Open Analytics Visualizations */}
          <PageContainer>
            {/* Hotspot Map — full width at top */}
            <div style={{ marginTop: '2rem' }}>
              <HotspotMap
                data={mapData.data ?? []}
                geoClusters={geoClusters.data?.clusters ?? []}
                loading={mapData.loading}
                error={mapData.error}
                onRetry={fetchAnalytics}
              />
            </div>

            {/* Two-column grid: Priority List & Charts */}
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
                onRetry={fetchAnalytics}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <CategoryChart
                  data={categories.data ?? []}
                  loading={categories.loading}
                  error={categories.error}
                  onRetry={fetchAnalytics}
                />
                <LiveFeed
                  complaints={complaintsData.data ?? []}
                  wards={wards.data ?? []}
                  loading={complaintsData.loading}
                  error={complaintsData.error}
                  onRetry={fetchAnalytics}
                />
              </div>
            </div>

            {/* Semantic AI Auto-Grouped Clusters */}
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
      )}

      {/* ── TAB 2: COMPLAINTS MANAGEMENT ────────────────────────────── */}
      {activeTab === 'complaints' && (
        <PageContainer>
          <div style={{ marginTop: '3.5rem', background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(18,53,36,0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(18,53,36,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)', margin: 0 }}>Citizen Complaints Management</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', margin: '0.2rem 0 0' }}>Review complaints and update status (Submitted → Under Review → Approved → Resolved)</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', borderRadius: 12, border: '1px solid rgba(18,53,36,0.12)', background: '#FAFAFA' }}>
                  <Search size={14} color="var(--ink-soft)" />
                  <input
                    type="text" placeholder="Search complaints..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--ink)', width: 220, fontFamily: 'var(--font-body)' }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '0.45rem 0.85rem', borderRadius: 12, border: '1px solid rgba(18,53,36,0.12)', background: '#FAFAFA', fontSize: '0.8125rem', fontFamily: 'var(--font-body)', color: 'var(--ink)', cursor: 'pointer' }}
                >
                  <option value="">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Tracking ID', 'Ward', 'Category', 'Urgency', 'Current Status', 'Date', 'Update Status'].map((h) => (
                      <th key={h} style={{ padding: '0.85rem 1.1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 800, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminComplaints.map((c, i) => (
                    <React.Fragment key={c.tracking_id}>
                      <tr
                        style={{ borderTop: '1px solid rgba(18,53,36,0.06)', cursor: 'pointer', transition: 'background 120ms', background: expandedId === c.tracking_id ? '#F0FFF4' : i % 2 === 0 ? '#FFFFFF' : '#FAFCFA' }}
                        onClick={() => setExpandedId(expandedId === c.tracking_id ? null : c.tracking_id)}
                      >
                        <td style={{ padding: '0.85rem 1.1rem', fontSize: '0.8125rem', fontWeight: 800, color: '#123524', whiteSpace: 'nowrap' }}>{c.tracking_id}</td>
                        <td style={{ padding: '0.85rem 1.1rem', fontSize: '0.8125rem', color: 'var(--ink)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ward_name}</td>
                        <td style={{ padding: '0.85rem 1.1rem', fontSize: '0.8125rem', color: 'var(--ink)', whiteSpace: 'nowrap' }}>{c.category}</td>
                        <td style={{ padding: '0.85rem 1.1rem' }}>
                          <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 800, color: '#FFFFFF', background: urgencyColor(c.urgency) }}>
                            {c.urgency}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.1rem' }}><StatusBadge status={c.status} /></td>
                        <td style={{ padding: '0.85rem 1.1rem', fontSize: '0.75rem', color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{c.created_at}</td>
                        <td style={{ padding: '0.85rem 1.1rem' }}>
                          <select
                            value={c.status}
                            onChange={(e) => { e.stopPropagation(); handleStatusUpdate(c.tracking_id, e.target.value); }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={updatingId === c.tracking_id}
                            style={{
                              padding: '0.35rem 0.7rem', borderRadius: 10, fontSize: '0.78rem',
                              border: '1px solid rgba(18,53,36,0.2)', background: '#FFFFFF',
                              cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)', color: 'var(--ink)',
                              opacity: updatingId === c.tracking_id ? 0.5 : 1,
                            }}
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                      {expandedId === c.tracking_id && (
                        <tr style={{ background: '#F0FFF4' }}>
                          <td colSpan={7} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(18,53,36,0.08)' }}>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--ink)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 700 }}>Citizen:</span> {c.user_email} &nbsp;|&nbsp;
                              <span style={{ fontWeight: 700 }}>Channel:</span> {c.channel} &nbsp;|&nbsp;
                              <span style={{ fontWeight: 700 }}>Language:</span> {c.language} &nbsp;|&nbsp;
                              <span style={{ fontWeight: 700 }}>Upvotes:</span> {c.upvote_count}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#374151', background: '#FFFFFF', borderRadius: 12, padding: '0.85rem 1rem', border: '1px solid rgba(18,53,36,0.12)' }}>
                              {c.raw_text}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredAdminComplaints.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.875rem' }}>
                        No complaints match your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </PageContainer>
      )}

      {/* ── TAB 3: REGISTERED CITIZENS ───────────────────────────────── */}
      {activeTab === 'users' && (
        <PageContainer>
          <div style={{ marginTop: '3.5rem', background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(18,53,36,0.1)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(18,53,36,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)', margin: 0 }}>Registered Citizens Directory</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', margin: '0.2rem 0 0' }}>Citizens registered on JanSetu AI with Aadhaar verification status</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', borderRadius: 12, border: '1px solid rgba(18,53,36,0.12)', background: '#FAFAFA' }}>
                <Search size={14} color="var(--ink-soft)" />
                <input
                  type="text" placeholder="Search citizens..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--ink)', width: 240, fontFamily: 'var(--font-body)' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['# ID', 'Citizen Name', 'Email Address', 'City / Ward', 'Aadhaar Verification', 'Joined Date'].map((h) => (
                      <th key={h} style={{ padding: '0.85rem 1.1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 800, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminUsers.map((u, i) => (
                    <tr key={u.id} style={{ borderTop: '1px solid rgba(18,53,36,0.06)', background: i % 2 === 0 ? '#FFFFFF' : '#FAFCFA' }}>
                      <td style={{ padding: '0.85rem 1.1rem', fontSize: '0.75rem', color: 'var(--ink-soft)' }}>#{u.id}</td>
                      <td style={{ padding: '0.85rem 1.1rem', fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink)' }}>{u.full_name}</td>
                      <td style={{ padding: '0.85rem 1.1rem', fontSize: '0.8125rem', color: 'var(--ink-soft)' }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1.1rem', fontSize: '0.8125rem', color: 'var(--ink)' }}>{u.city_ward}</td>
                      <td style={{ padding: '0.85rem 1.1rem' }}>
                        {u.is_verified ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', borderRadius: 100, padding: '0.2rem 0.65rem' }}>
                            <ShieldCheck size={12} /> Verified
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', background: '#F3F4F6', borderRadius: 100, padding: '0.2rem 0.65rem' }}>
                            Unverified
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1.1rem', fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{u.created_at}</td>
                    </tr>
                  ))}
                  {filteredAdminUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-soft)' }}>No registered citizens found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </PageContainer>
      )}
    </div>
  );
}
