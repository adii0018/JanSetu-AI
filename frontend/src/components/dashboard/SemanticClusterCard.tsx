import React, { useState, useMemo } from 'react';
import { Layers, ChevronDown, ChevronUp, Cpu, Users, Sparkles, Search, Filter, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import type { SemanticCluster } from '../../services/types';

interface SemanticClusterCardProps {
  clusters: SemanticCluster[];
  loading?: boolean;
}

export function SemanticClusterCard({ clusters, loading = false }: SemanticClusterCardProps) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'merged' | 'urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedCluster((prev) => (prev === id ? null : id));
  };

  // Filter clusters based on active tab & search query
  const filteredClusters = useMemo(() => {
    let result = clusters;
    if (activeTab === 'merged') {
      result = result.filter((c) => c.count > 1);
    } else if (activeTab === 'urgent') {
      result = result.filter((c) => c.avg_urgency >= 50);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.cluster_name.toLowerCase().includes(term) ||
          c.category.toLowerCase().includes(term) ||
          c.location.toLowerCase().includes(term) ||
          c.sample_texts.some((t) => t.toLowerCase().includes(term))
      );
    }
    return result;
  }, [clusters, activeTab, searchTerm]);

  // Aggregate stats
  const totalMergedCount = useMemo(
    () => clusters.filter((c) => c.count > 1).reduce((acc, c) => acc + c.count, 0),
    [clusters]
  );

  if (loading) {
    return (
      <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
          <div>
            <div className="skeleton" style={{ width: 240, height: 20, borderRadius: 6, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: 340, height: 14, borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="skeleton" style={{ width: '100%', height: 72, borderRadius: 14 }} />
          <div className="skeleton" style={{ width: '100%', height: 72, borderRadius: 14 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: 20, border: '1px solid var(--border)' }}>
      {/* ── Header Bar ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--deep-moss)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(18, 53, 36, 0.25)',
              flexShrink: 0,
            }}
          >
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                🤖 AI Auto-Grouped Problem Clusters
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  background: 'var(--leaf-pale)',
                  color: 'var(--deep-moss)',
                  border: '1px solid var(--leaf-light)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 14,
                }}
              >
                <Sparkles size={11} /> TF-IDF VECTOR MATCHING
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-soft)', margin: '0.2rem 0 0 0' }}>
              Cosine similarity vector algorithms auto-detect and group duplicate citizen complaints in real-time across 10+ Indian languages.
            </p>
          </div>
        </div>

        {/* Realtime Stats Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', padding: '0.4rem 0.75rem', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--ink-soft)', fontWeight: 600 }}>TOTAL CLUSTERS</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>{clusters.length}</div>
          </div>
          <div style={{ background: 'var(--leaf-pale)', border: '1px solid var(--leaf-light)', padding: '0.4rem 0.75rem', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--deep-moss)', fontWeight: 600 }}>MERGED DUPES</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep-moss)' }}>{totalMergedCount} reports</div>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs & Search Bar ──────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: 12 }}>
          {[
            { id: 'all', label: `All Clusters (${clusters.length})` },
            { id: 'merged', label: `🔗 Merged Dupes Only (${clusters.filter((c) => c.count > 1).length})` },
            { id: 'urgent', label: `⚡ High Urgency` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 8,
                fontSize: '0.78125rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                color: activeTab === tab.id ? 'var(--ink)' : 'var(--ink-soft)',
                border: 'none',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 160ms ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: 260 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)' }} />
          <input
            type="text"
            placeholder="Search problem clusters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.75rem 0.4rem 2.2rem',
              fontSize: '0.8125rem',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: '#F8FAFC',
              outline: 'none',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
      </div>

      {/* ── Cluster List ─────────────────────────────────────── */}
      {filteredClusters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#F8FAFC', borderRadius: 14, border: '1px border-dashed var(--border)', color: 'var(--ink-soft)', fontSize: '0.875rem' }}>
          No problem clusters found matching current filter/search.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredClusters.map((c) => {
            const isExpanded = expandedCluster === c.cluster_id;
            const isMulti = c.count > 1;

            // Urgency Badge styling
            let urgencyColor = '#25D366';
            let urgencyBg = '#E7FCE9';
            if (c.avg_urgency >= 70) {
              urgencyColor = '#C0392B';
              urgencyBg = '#FADBD8';
            } else if (c.avg_urgency >= 45) {
              urgencyColor = '#D97706';
              urgencyBg = '#FEF3C7';
            }

            return (
              <div
                key={c.cluster_id}
                style={{
                  border: isMulti ? '1.5px solid var(--moss)' : '1px solid var(--border)',
                  borderRadius: 14,
                  background: isMulti ? '#F4FBF5' : '#FFFFFF',
                  transition: 'all 200ms ease',
                  overflow: 'hidden',
                  boxShadow: isMulti ? '0 2px 8px rgba(37, 211, 102, 0.08)' : 'none',
                }}
              >
                {/* Cluster Header Row */}
                <div
                  onClick={() => toggleExpand(c.cluster_id)}
                  style={{
                    padding: '0.95rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                    {/* Category Pill */}
                    <div
                      style={{
                        padding: '0.35rem 0.7rem',
                        borderRadius: 8,
                        background: isMulti ? 'var(--deep-moss)' : '#475569',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {c.category}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem' }}>
                          {c.cluster_name}
                        </span>

                        {isMulti && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              background: '#128C7E',
                              color: '#FFFFFF',
                              padding: '0.15rem 0.55rem',
                              borderRadius: 12,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            <Layers size={10} /> {c.count} DUPES MERGED BY AI
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78125rem', color: 'var(--ink-soft)', marginTop: 4, display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap' }}>
                        <span>📍 Location: <b>{c.location || 'Pan-India'}</b></span>
                        <span style={{ color: isMulti ? 'var(--deep-moss)' : 'var(--ink-soft)', fontWeight: isMulti ? 700 : 500 }}>
                          🔥 Priority Multiplier: <b>x{c.demand_multiplier}</b>
                        </span>
                        <span style={{ color: urgencyColor, background: urgencyBg, padding: '0.1rem 0.45rem', borderRadius: 8, fontWeight: 700, fontSize: '0.72rem' }}>
                          ⚡ Urgency {c.avg_urgency}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: isMulti ? 'var(--deep-moss)' : 'var(--ink)',
                        background: '#FFFFFF',
                        padding: '0.35rem 0.8rem',
                        borderRadius: 20,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Users size={14} /> {c.count} {c.count === 1 ? 'Report' : 'Reports'}
                    </span>

                    {isExpanded ? <ChevronUp size={18} color="var(--ink-soft)" /> : <ChevronDown size={18} color="var(--ink-soft)" />}
                  </div>
                </div>

                {/* Expanded Original Complaint Texts with Vector Cosine Similarity Details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderTop: '1px solid var(--border)',
                      background: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.78125rem', fontWeight: 700, color: 'var(--deep-moss)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CheckCircle2 size={14} /> Citizen Complaints Auto-Merged Into This Intent Cluster:
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontFamily: 'monospace' }}>
                        Embedding Vector Match Threshold: &gt;0.25 Cosine
                      </span>
                    </div>

                    {c.sample_texts.map((text, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 10,
                          background: '#F8FAFC',
                          borderLeft: '4px solid var(--moss)',
                          border: '1px solid var(--border)',
                          borderLeftWidth: 4,
                          fontSize: '0.84375rem',
                          color: 'var(--ink)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 700, color: 'var(--deep-moss)', marginRight: 6 }}>
                            Citizen #{idx + 1}:
                          </span>
                          "{text}"
                        </div>
                        {c.complaint_ids[idx] && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              background: '#FFFFFF',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 6,
                              border: '1px solid var(--border)',
                              color: 'var(--ink-soft)',
                            }}
                          >
                            {c.complaint_ids[idx]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

