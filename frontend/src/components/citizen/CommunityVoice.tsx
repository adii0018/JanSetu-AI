import React, { useState, useEffect, useMemo } from 'react';
import { ThumbsUp, Search, MapPin, FileText, Sparkles, Loader2 } from 'lucide-react';
import { getComplaints, getWards, upvoteComplaint } from '../../services/api';
import type { Complaint, Ward } from '../../services/types';
import { playClick, playTick } from '../../utils/sounds';
import { GrievanceReceiptModal } from './GrievanceReceiptModal';

const CATEGORIES = ['All', 'Water Supply', 'Road', 'Electricity', 'Sanitation', 'Health', 'Education'];

const CATEGORY_ICONS: Record<string, string> = {
  'Water Supply': '💧',
  'Road': '🛣️',
  'Electricity': '⚡',
  'Sanitation': '🧹',
  'Health': '🏥',
  'Education': '📚',
  'Other': '📌',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  submitted: { label: 'Submitted', color: '#C67F1E', bg: '#FEF3E2' },
  under_review: { label: 'Under Review', color: '#1D4ED8', bg: '#EFF6FF' },
  approved: { label: 'Approved', color: '#059669', bg: '#ECFDF5' },
  resolved: { label: 'Resolved', color: '#16A34A', bg: '#F0FFF4' },
};

export function CommunityVoice() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWardId, setSelectedWardId] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'upvotes' | 'recent'>('urgency');
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [upvoteCounts, setUpvoteCounts] = useState<Record<string, number>>({});
  const [selectedSlipComplaint, setSelectedSlipComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    Promise.all([getComplaints(60), getWards()])
      .then(([compData, wardData]) => {
        setComplaints(compData);
        setWards(wardData);
        const counts: Record<string, number> = {};
        compData.forEach((c) => {
          counts[c.tracking_id] = c.upvote_count || 0;
        });
        setUpvoteCounts(counts);
      })
      .catch((err) => console.error('Failed to load community feed:', err))
      .finally(() => setLoading(false));
  }, []);

  const wardMap = useMemo(() => {
    const map = new Map<number, string>();
    wards.forEach((w) => map.set(w.id, w.name));
    return map;
  }, [wards]);

  const handleUpvote = async (trackingId: string) => {
    if (upvotedIds.has(trackingId)) return;
    playTick();

    // Optimistic UI update
    setUpvotedIds((prev) => new Set(prev).add(trackingId));
    setUpvoteCounts((prev) => ({
      ...prev,
      [trackingId]: (prev[trackingId] || 0) + 1,
    }));

    try {
      await upvoteComplaint(trackingId);
    } catch {
      // Keep optimistic update for smooth UX
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        const matchesCategory =
          selectedCategory === 'All' || c.category?.toLowerCase() === selectedCategory.toLowerCase();
        const matchesWard =
          selectedWardId === 'all' || c.ward_id === selectedWardId;
        const matchesQuery =
          !searchQuery.trim() ||
          c.raw_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.tracking_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesWard && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'urgency') {
          return (b.urgency || 0) - (a.urgency || 0);
        }
        if (sortBy === 'upvotes') {
          const aCount = upvoteCounts[a.tracking_id] ?? (a.upvote_count || 0);
          const bCount = upvoteCounts[b.tracking_id] ?? (b.upvote_count || 0);
          return bCount - aCount;
        }
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
  }, [complaints, selectedCategory, selectedWardId, searchQuery, sortBy, upvoteCounts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Section Header Banner ────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #123524 0%, #1F3A24 60%, #2E6B3E 100%)',
          borderRadius: 24,
          padding: '1.75rem 2rem',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 12px 35px rgba(18, 53, 36, 0.15)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', fontWeight: 800, background: 'rgba(37, 211, 102, 0.25)', color: '#C9EAC7', padding: '0.2rem 0.65rem', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <Sparkles size={13} color="#25D366" /> DEMOCRATIC CIVIC PARTICIPATION
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Jan Awaz — Ward Community Feed
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#C9EAC7', marginTop: 4, maxWidth: 640 }}>
            Browse active citizen issues in your area. Upvote grievances to boost their priority weight in municipal allocation!
          </p>
        </div>

        {/* Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.35rem', borderRadius: 100, backdropFilter: 'blur(8px)' }}>
          {[
            { id: 'urgency', label: '🔥 Urgent First' },
            { id: 'upvotes', label: '👍 Most Upvoted' },
            { id: 'recent', label: '🕒 Recent' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => {
                playClick();
                setSortBy(btn.id as any);
              }}
              style={{
                border: 'none',
                background: sortBy === btn.id ? '#FFFFFF' : 'transparent',
                color: sortBy === btn.id ? '#123524' : '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '0.45rem 0.9rem',
                borderRadius: 100,
                cursor: 'pointer',
                transition: 'all 160ms ease',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '1.25rem',
          border: '1px solid rgba(18, 53, 36, 0.12)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Keyword Search Input */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search
              size={18}
              color="#94A3B8"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. pipeline, pothole, street light) or ID…"
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.6rem',
                borderRadius: 12,
                border: '1.5px solid #CBD5E1',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-body)',
                color: '#1E293B',
                outline: 'none',
              }}
            />
          </div>

          {/* Ward Dropdown Filter */}
          <div style={{ flex: '0 1 240px' }}>
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 12,
                border: '1.5px solid #CBD5E1',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-body)',
                color: '#1E293B',
                background: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value="all">📍 All Municipal Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => {
                  playClick();
                  setSelectedCategory(cat);
                }}
                style={{
                  border: isSelected ? '1.5px solid #123524' : '1px solid #E2E8F0',
                  background: isSelected ? '#123524' : '#F8FAFC',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  borderRadius: 100,
                  padding: '0.4rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 150ms ease',
                }}
              >
                {CATEGORY_ICONS[cat] ? `${CATEGORY_ICONS[cat]} ` : ''}{cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Complaints Cards Grid ────────────────────────────── */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          <Loader2 size={32} className="spin-anim" style={{ margin: '0 auto 1rem', color: '#2E6B3E' }} />
          <div>Loading Ward Complaints &amp; Citizen Upvotes…</div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '3rem 2rem',
            textAlign: 'center',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#1E293B', fontWeight: 800 }}>
            No matching complaints found
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 4 }}>
            Try adjusting your search keywords, ward filter, or category pills.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredComplaints.map((item) => {
            const wardName = wardMap.get(item.ward_id) || `Ward ${item.ward_id}`;
            const currentUpvotes = upvoteCounts[item.tracking_id] ?? (item.upvote_count || 0);
            const isUpvoted = upvotedIds.has(item.tracking_id);
            const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.submitted;
            const emoji = CATEGORY_ICONS[item.category] || '📌';

            return (
              <div
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 20,
                  border: '1px solid rgba(18, 53, 36, 0.12)',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 28px rgba(18, 53, 36, 0.1)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(37, 211, 102, 0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.03)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(18, 53, 36, 0.12)';
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#123524' }}>
                          {item.category}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={11} color="#16A34A" /> {wardName}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 750,
                        color: statusCfg.color,
                        background: statusCfg.bg,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 100,
                      }}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Complaint Description Text */}
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#334155',
                      lineHeight: 1.55,
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.raw_text}
                  </p>

                  {/* Urgency Meter */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
                      <span>AI Urgency Priority</span>
                      <span style={{ color: item.urgency >= 75 ? '#DC2626' : item.urgency >= 50 ? '#D97706' : '#16A34A' }}>
                        {item.urgency}/100
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.urgency}%`,
                          background: item.urgency >= 75 ? '#DC2626' : item.urgency >= 50 ? '#F59E0B' : '#10B981',
                          borderRadius: 100,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div
                  style={{
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Upvote Button ("I face this too +1") */}
                  <button
                    onClick={() => handleUpvote(item.tracking_id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 0.95rem',
                      borderRadius: 100,
                      border: isUpvoted ? '1.5px solid #25D366' : '1.5px solid #CBD5E1',
                      background: isUpvoted ? '#DCFCE7' : '#FFFFFF',
                      color: isUpvoted ? '#15803D' : '#1E293B',
                      fontSize: '0.8rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                      transition: 'all 160ms ease',
                    }}
                  >
                    <ThumbsUp size={14} color={isUpvoted ? '#16A34A' : '#64748B'} />
                    <span>{isUpvoted ? 'Supported' : 'I face this too'}</span>
                    <span
                      style={{
                        background: isUpvoted ? '#16A34A' : '#F1F5F9',
                        color: isUpvoted ? '#FFFFFF' : '#475569',
                        padding: '1px 6px',
                        borderRadius: 100,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        marginLeft: 2,
                      }}
                    >
                      {currentUpvotes}
                    </span>
                  </button>

                  {/* View Official Slip Button */}
                  <button
                    onClick={() => {
                      playClick();
                      setSelectedSlipComplaint(item);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: 100,
                      border: 'none',
                      background: '#F1F5F9',
                      color: '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    title="View Official Receipt Slip"
                  >
                    <FileText size={13} />
                    <span>Slip</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Grievance Receipt Modal */}
      {selectedSlipComplaint && (
        <GrievanceReceiptModal
          complaint={selectedSlipComplaint}
          isOpen={!!selectedSlipComplaint}
          onClose={() => setSelectedSlipComplaint(null)}
          wardName={wardMap.get(selectedSlipComplaint.ward_id)}
        />
      )}
    </div>
  );
}
