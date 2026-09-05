import React, { useRef, useEffect, useState } from 'react';
import type { Complaint } from '../../services/types';
import { Badge, urgencyVariant } from '../ui/Badge';
import { Skeleton } from '../ui/ErrorState';
import { ErrorState } from '../ui/ErrorState';
import { MapPin, ThumbsUp } from 'lucide-react';
import { TTSReader } from '../ui/TTSReader';
import { upvoteComplaint } from '../../services/api';
import { playTick } from '../../utils/sounds';

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
  const [upvotes, setUpvotes] = useState(complaint.upvote_count ?? 0);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvoted || upvoting) return;
    playTick();
    setUpvoting(true);
    try {
      const updated = await upvoteComplaint(complaint.tracking_id);
      setUpvotes(updated.upvote_count ?? upvotes + 1);
      setUpvoted(true);
    } catch {
      // silently fail
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0, flexWrap: 'wrap' }}>
          <MapPin size={12} color="var(--ink-soft)" aria-hidden="true" />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Upvote button */}
          <button
            onClick={handleUpvote}
            disabled={upvoted || upvoting}
            title={upvoted ? 'Already supported' : 'I have this problem too'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${upvoted ? 'var(--moss)' : 'var(--border)'}`,
              background: upvoted ? 'var(--leaf-pale)' : '#fff',
              color: upvoted ? 'var(--moss)' : 'var(--ink-soft)',
              fontSize: '0.72rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: upvoted ? 'default' : 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (!upvoted) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--moss)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--moss)';
              }
            }}
            onMouseLeave={(e) => {
              if (!upvoted) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-soft)';
              }
            }}
          >
            <ThumbsUp size={11} />
            <span>{upvotes}</span>
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
            {relativeTime(complaint.created_at)}
          </span>
        </div>
      </div>
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--ink-soft)',
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
        <div className="eyebrow" style={{ marginBottom: 0 }}>
          <span className="eyebrow-dot" />
          <span>Live feed</span>
        </div>
        {!loading && (
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
            {complaints.length} entries
          </span>
        )}
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem', marginTop: '-0.25rem' }}>
        Recent Requests
      </h2>

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
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem', padding: '1.5rem 0', textAlign: 'center' }}>
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
                background: 'linear-gradient(to bottom, transparent, #ffffff)',
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
