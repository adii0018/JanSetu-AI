import React, { useRef, useEffect } from 'react';
import type { Complaint } from '../../services/types';
import { Badge, urgencyVariant } from '../ui/Badge';
import { Skeleton } from '../ui/ErrorState';
import { ErrorState } from '../ui/ErrorState';
import { MapPin } from 'lucide-react';
import { TTSReader } from '../ui/TTSReader';

interface LiveFeedProps {
  complaints: Complaint[];
  wards: { id: number; name: string }[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function FeedRow({ complaint, wardName }: { complaint: Complaint; wardName: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0, flexWrap: 'wrap' }}>
          <MapPin size={12} color="var(--muted)" aria-hidden="true" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
            {wardName}
          </span>
          <Badge variant={urgencyVariant(complaint.urgency)} size="sm">
            {complaint.category}
          </Badge>
          <TTSReader
            compact
            text={`Complaint at ${wardName}. ${complaint.raw_text}`}
            defaultLang="hi-IN"
            label="Listen"
          />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', flexShrink: 0 }}>
          {relativeTime(complaint.created_at)}
        </span>
      </div>
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--muted)',
          fontFamily: 'var(--font-body)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.5,
        }}
      >
        {complaint.raw_text}
      </p>
    </div>
  );
}

export function LiveFeed({ complaints, wards, loading, error, onRetry }: LiveFeedProps) {
  const wardMap = React.useMemo(
    () => Object.fromEntries(wards.map((w) => [w.id, w.name])),
    [wards]
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep scroll at top when new complaints arrive
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [complaints.length]);

  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem' }}>
          Live request feed
        </h2>
        {!loading && (
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {complaints.length} entries
          </span>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={52} />)}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={onRetry} compact />}

      {!loading && !error && (
        <div style={{ position: 'relative' }}>
          <div
            ref={scrollRef}
            style={{
              maxHeight: 320,
              overflowY: 'auto',
              paddingRight: '0.25rem',
            }}
          >
            {complaints.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', padding: '1.5rem 0', textAlign: 'center' }}>
                No complaints yet.
              </p>
            ) : (
              complaints.map((c) => (
                <FeedRow key={c.id} complaint={c} wardName={wardMap[c.ward_id] ?? `Ward ${c.ward_id}`} />
              ))
            )}
          </div>
          {/* Fade-out gradient hint */}
          {complaints.length > 4 && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: '0.25rem',
                height: 48,
                background: 'linear-gradient(to bottom, transparent, var(--panel))',
                pointerEvents: 'none',
                borderRadius: '0 0 10px 10px',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
