import React, { useState } from 'react';
import { Search, ThumbsUp, CheckCircle, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { getComplaintByTrackingId, upvoteComplaint } from '../../services/api';
import type { Complaint } from '../../services/types';
import { playClick, playTick } from '../../utils/sounds';

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
  submitted: 'var(--moss)',
  under_review: '#D97706',
  approved: 'var(--deep-moss)',
  resolved: 'var(--deep-moss)',
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
  const [idCopied, setIdCopied] = useState(false);

  const handleCopyId = () => {
    if (!complaint?.tracking_id) return;
    playClick();
    navigator.clipboard.writeText(complaint.tracking_id);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = trackingId.trim().toUpperCase();
    if (!id) return;
    playClick();

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
    playTick();
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
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 20,
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div className="eyebrow" style={{ marginBottom: '0.25rem' }}>
          <span className="eyebrow-dot" />
          <span>Status Tracker</span>
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '1.25rem',
            color: 'var(--ink)',
            marginTop: 0,
          }}
        >
          Track &amp; Support a Complaint
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', margin: 0, marginTop: '0.25rem' }}>
          Enter a tracking ID (e.g. JS-12345) to check status, or upvote if you have the same issue.
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
              padding: '0.65rem 0.875rem 0.65rem 2.5rem',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              color: 'var(--ink)',
              background: '#fff',
              outline: 'none',
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--moss)';
              e.target.style.boxShadow = '0 0 0 3px rgba(111,191,115,0.25)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-soft)',
              pointerEvents: 'none',
            }}
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !trackingId.trim()}
          style={{ flexShrink: 0, padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-pill)' }}
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
            background: '#FDF2F2',
            border: '1px solid #F87171',
            borderRadius: 14,
            color: '#B91C1C',
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
            background: 'var(--leaf-pale)',
            border: '1.5px solid var(--leaf-light)',
            borderRadius: 16,
            padding: '1.125rem',
            animation: 'fade-slide-up 250ms ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.35rem' }}>{emoji}</span>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'var(--ink)',
                  }}
                >
                  {complaint.category}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 2 }}>
                  ID: <strong style={{ color: 'var(--moss)' }}>{complaint.tracking_id}</strong>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Copy tracking ID"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 2,
                      cursor: 'pointer',
                      color: idCopied ? 'var(--moss)' : 'var(--ink-soft)',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {idCopied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Status badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.72rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: '#fff',
                background: STATUS_COLORS[complaint.status] ?? 'var(--moss)',
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
              padding: '0.75rem 0.875rem',
              background: '#fff',
              borderRadius: 10,
              borderLeft: '4px solid var(--moss)',
              margin: 0,
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
              color: 'var(--ink-soft)',
              flexWrap: 'wrap',
            }}
          >
            <span>⚡ Urgency: <strong style={{ color: complaint.urgency >= 75 ? '#C0392B' : 'var(--ink)' }}>{complaint.urgency}/100</strong></span>
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
              padding: '0.6rem 1.125rem',
              borderRadius: 'var(--radius-pill)',
              border: `1.5px solid ${upvoted ? 'var(--deep-moss)' : 'var(--moss)'}`,
              background: upvoted ? 'var(--deep-moss)' : '#fff',
              color: upvoted ? '#fff' : 'var(--moss)',
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
