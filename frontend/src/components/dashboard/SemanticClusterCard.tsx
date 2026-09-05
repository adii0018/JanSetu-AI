import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Cpu, Users, AlertCircle, Sparkles } from 'lucide-react';
import type { SemanticCluster } from '../../services/types';

interface SemanticClusterCardProps {
  clusters: SemanticCluster[];
  loading?: boolean;
}

export function SemanticClusterCard({ clusters, loading = false }: SemanticClusterCardProps) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCluster((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 220, height: 24, borderRadius: 6 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="skeleton" style={{ width: '100%', height: 64, borderRadius: 12 }} />
          <div className="skeleton" style={{ width: '100%', height: 64, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--leaf-pale)',
              color: 'var(--deep-moss)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--leaf-light)',
            }}
          >
            <Cpu size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', margin: 0, fontFamily: 'var(--font-heading)' }}>
              🤖 AI Auto-Grouped Problem Clusters
            </h3>
            <p style={{ fontSize: '0.78125rem', color: 'var(--ink-soft)', margin: 0 }}>
              NLP TF-IDF Vector Embeddings auto-detect & merge duplicate civic complaints in real-time
            </p>
          </div>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.72rem',
            fontWeight: 700,
            background: 'var(--moss)',
            color: '#FFFFFF',
            padding: '0.3rem 0.75rem',
            borderRadius: 20,
            letterSpacing: '0.02em',
          }}
        >
          <Sparkles size={12} /> ML ACTIVE
        </span>
      </div>

      {/* Cluster List */}
      {clusters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--ink-soft)', fontSize: '0.875rem' }}>
          No problem clusters detected yet. Submit complaints to see AI grouping in action.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {clusters.map((c) => {
            const isExpanded = expandedCluster === c.cluster_id;
            const isMulti = c.count > 1;

            return (
              <div
                key={c.cluster_id}
                style={{
                  border: isMulti ? '1.5px solid var(--moss)' : '1px solid var(--border)',
                  borderRadius: 12,
                  background: isMulti ? 'var(--leaf-pale)' : '#F9FAFB',
                  transition: 'all 200ms ease',
                  overflow: 'hidden',
                }}
              >
                {/* Cluster Summary Row */}
                <div
                  onClick={() => toggleExpand(c.cluster_id)}
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        padding: '0.4rem 0.65rem',
                        borderRadius: 8,
                        background: isMulti ? 'var(--deep-moss)' : 'var(--ink-soft)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.category}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.9375rem' }}>
                          {c.cluster_name}
                        </span>

                        {isMulti && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              background: '#25D366',
                              color: '#FFFFFF',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 12,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            <Layers size={10} /> MERGED BY AI
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78125rem', color: 'var(--ink-soft)', marginTop: 3, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>📍 Location: <strong>{c.location || 'Pan-India'}</strong></span>
                        <span>👥 Demand Weight: <strong>x{c.demand_multiplier}</strong></span>
                        <span>⚡ Urgency: <strong>{c.avg_urgency}/100</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: isMulti ? 'var(--deep-moss)' : 'var(--ink)',
                        background: '#FFFFFF',
                        padding: '0.35rem 0.75rem',
                        borderRadius: 20,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Users size={14} /> {c.count} {c.count === 1 ? 'Complaint' : 'Complaints'}
                    </span>

                    {isExpanded ? <ChevronUp size={18} color="var(--ink-soft)" /> : <ChevronDown size={18} color="var(--ink-soft)" />}
                  </div>
                </div>

                {/* Expanded Original Complaint Texts */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderTop: '1px solid var(--border)',
                      background: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ fontSize: '0.78125rem', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      📋 Original Citizen Complaints Grouped into this Cluster:
                    </div>

                    {c.sample_texts.map((text, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 8,
                          background: 'var(--leaf-pale)',
                          borderLeft: '4px solid var(--deep-moss)',
                          fontSize: '0.84375rem',
                          color: 'var(--ink)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600, color: 'var(--deep-moss)', marginRight: 6 }}>
                            Citizen #{idx + 1}:
                          </span>
                          "{text}"
                        </div>
                        {c.complaint_ids[idx] && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontFamily: 'monospace',
                              background: '#FFFFFF',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 4,
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
