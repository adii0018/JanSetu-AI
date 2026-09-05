import React, { useState } from 'react';
import { Search, ThumbsUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getComplaintByTrackingId, upvoteComplaint } from '../../services/api';
import type { Complaint } from '../../services/types';

const CATEGORY_EMOJI: Record<string, string> = {
  'Water Supply': '💧',
  'Road': '🛣️',
  'Electricity': '⚡',
  'Sanitation': '🧹',
  'Health': '🏥',
  'Education': '📚',
  'Other': '📌',
};

const STATUS_COLORS: Record<string, string> = {
  submitted: 'var(--indigo)',
  under_review: 'var(--saffron-deep)',
  approved: 'var(--teal)',
  resolved: 'var(--teal)',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted ✅',
  under_review: 'Under Review 🔍',
  approved: 'Approved 🎉',
  resolved: 'Resolved 🏆',
};

export function TrackComplaint() {
  const [trackingId, setTrackingId] = useState('');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = trackingId.trim().toUpperCase();
    if (!id) return;

    setLoading(true);
    setError(null);
    setComplaint(null);
    setUpvoted(false);

    try {
      const data = await getComplaintByTrackingId(id);
      setComplaint(data);
      setUpvoteCount(data.upvote_count ?? 0);
    } catch {
      setError(`No complaint found with ID "${id}". Please check and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!complaint || upvoted) return;
    setUpvoting(true);
    try {
      const updated = await upvoteComplaint(complaint.tracking_id);
      setUpvoteCount(updated.upvote_count ?? upvoteCount + 1);
      setUpvoted(true);
    } catch {
      // silently fail
    } finally {
      setUpvoting(false);
    }
  };

  const emoji = complaint ? (CATEGORY_EMOJI[complaint.category] ?? '📌') : '';

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, var(--indigo-light) 0%, #fff 100%)',
        border: '1px solid var(--line)',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.05rem',
            marginBottom: '0.25rem',
            color: 'var(--ink)',
          }}
        >
          🔍 Track &amp; Support a Complaint
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
          Enter a complaint ID to check status, or upvote if you have the same problem.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            id="tracking-id-input"
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="e.g. JS-12345"
            style={{
              width: '100%',
              padding: '0.6rem 0.875rem 0.6rem 2.5rem',
              border: '1px solid var(--line)',
              borderRadius: 'var(--control-radius)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              color: 'var(--ink)',
              background: '#fff',
              outline: 'none',
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--indigo)';
              e.target.style.boxShadow = '0 0 0 3px var(--indigo-light)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--line)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              pointerEvents: 'none',
            }}
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !trackingId.trim()}
          style={{ flexShrink: 0, padding: '0.6rem 1.125rem' }}
        >
          {loading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Track'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'var(--coral-light)',
            borderRadius: 'var(--control-radius)',
            color: 'var(--coral)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-body)',
            animation: 'fade-slide-up 200ms ease',
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Complaint card */}
      {complaint && !error && (
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 'var(--control-radius)',
            padding: '1rem',
            animation: 'fade-slide-up 250ms ease',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.35rem' }}>{emoji}</span>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: 'var(--ink)',
                  }}
                >
                  {complaint.category}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  ID: <strong style={{ color: 'var(--indigo)' }}>{complaint.tracking_id}</strong>
                </div>
              </div>
            </div>

            {/* Status badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.2rem 0.65rem',
                borderRadius: 20,
                fontSize: '0.72rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: '#fff',
                background: STATUS_COLORS[complaint.status] ?? 'var(--muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {STATUS_LABELS[complaint.status] ?? complaint.status}
            </span>
          </div>

          {/* Complaint text */}
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--ink)',
              lineHeight: 1.55,
              marginBottom: '0.75rem',
              padding: '0.625rem 0.875rem',
              background: 'var(--paper)',
              borderRadius: 6,
              borderLeft: '3px solid var(--indigo)',
            }}
          >
            {complaint.raw_text}
          </p>

          {/* Urgency + meta */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              fontSize: '0.78rem',
              color: 'var(--muted)',
              marginBottom: '0.875rem',
              flexWrap: 'wrap',
            }}
          >
            <span>⚡ Urgency: <strong style={{ color: complaint.urgency >= 75 ? 'var(--coral)' : 'var(--ink)' }}>{complaint.urgency}/100</strong></span>
            <span>🗣️ {complaint.language}</span>
            <span>📅 {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Upvote button */}
          <button
            id="upvote-btn"
            onClick={handleUpvote}
            disabled={upvoted || upvoting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.125rem',
              borderRadius: 'var(--control-radius)',
              border: `2px solid ${upvoted ? 'var(--teal)' : 'var(--indigo)'}`,
              background: upvoted ? 'var(--teal-light)' : 'var(--indigo-light)',
              color: upvoted ? 'var(--teal)' : 'var(--indigo)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: upvoted ? 'default' : 'pointer',
              transition: 'all 200ms ease',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {upvoting ? (
              <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : upvoted ? (
              <CheckCircle size={15} />
            ) : (
              <ThumbsUp size={15} />
            )}
            {upvoted
              ? `Supported! ${upvoteCount} people have this problem`
              : upvoting
              ? 'Saving…'
              : `👍 I have this problem too (${upvoteCount} already)`}
          </button>
        </div>
      )}
    </div>
  );
}
