import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ComplaintForm } from '../components/citizen/ComplaintForm';
import { AiConsole } from '../components/citizen/AiConsole';
import { TrackComplaint } from '../components/citizen/TrackComplaint';
import type { ConsoleState } from '../components/citizen/AiConsole';

const INITIAL_CONSOLE: ConsoleState = {
  phase: 'idle',
  lines: [],
  result: null,
  errorMsg: null,
};

export function CitizenPortal() {
  const [consoleState, setConsoleState] = useState<ConsoleState>(INITIAL_CONSOLE);
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '0.625rem 1rem',
    border: 'none',
    borderBottom: `2px solid ${active ? 'var(--deep-moss)' : 'transparent'}`,
    background: 'transparent',
    fontFamily: 'var(--font-body)',
    fontWeight: active ? 600 : 500,
    fontSize: '0.9375rem',
    color: active ? 'var(--deep-moss)' : 'var(--ink-soft)',
    cursor: 'pointer',
    transition: 'all 160ms ease',
  });

  return (
    <>
      {/* ── Hero section with blob ─────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '3.5rem 0 4rem',
          background: '#fff',
        }}
      >
        {/* Organic blob — background visual */}
        <div
          aria-hidden="true"
          className="blob"
          style={{
            width: 520,
            height: 420,
            top: '-80px',
            right: '-60px',
            opacity: 0.55,
          }}
        />
        <div
          aria-hidden="true"
          className="blob"
          style={{
            width: 280,
            height: 240,
            bottom: '-40px',
            left: '5%',
            opacity: 0.35,
            animationDuration: '18s',
            animationDelay: '-6s',
            borderRadius: '62% 38% 44% 56% / 48% 56% 44% 52%',
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <div className="eyebrow" style={{ marginBottom: '0.875rem' }}>
            Citizen Portal
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 340,
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              color: 'var(--ink)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              maxWidth: 620,
              marginBottom: '1rem',
            }}
          >
            What needs attention{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 480, color: 'var(--moss)' }}>
              in your area?
            </em>
          </h1>

          <p style={{ color: 'var(--ink-soft)', fontSize: '1.0625rem', maxWidth: 500, lineHeight: 1.65 }}>
            Speak, type, or send it exactly how you'd tell a neighbour. Your complaint goes directly into the AI-ranked priority queue.
          </p>

          {/* Step pills */}
          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            {[
              { n: '01', label: 'Select channel & language' },
              { n: '02', label: 'Describe the problem' },
              { n: '03', label: 'AI classifies & queues it' },
            ].map(({ n, label }) => (
              <div
                key={n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--leaf-pale)',
                  border: '1px solid var(--leaf-light)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.35rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 480, color: 'var(--leaf)', fontSize: '0.75rem' }}>{n}</span>
                <span style={{ color: 'var(--moss)', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile tab switcher ────────────────────────────────── */}
      <div
        className="mobile-tabs"
        style={{
          display: 'none',
          borderBottom: '1px solid var(--border)',
          background: '#fff',
        }}
      >
        <button style={tabStyle(activeTab === 'submit')} onClick={() => setActiveTab('submit')}>
          📝 Submit complaint
        </button>
        <button style={tabStyle(activeTab === 'track')} onClick={() => setActiveTab('track')}>
          🔍 Track &amp; Upvote
        </button>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <PageContainer>
        <div
          className="citizen-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
            gap: '1.75rem',
            alignItems: 'start',
          }}
        >
          {/* Left — Complaint Form */}
          <div className={`citizen-panel ${activeTab === 'submit' ? 'panel-visible' : 'panel-hidden'}`}>
            <ComplaintForm onConsoleUpdate={setConsoleState} />
          </div>

          {/* Right — AI Console + Track */}
          <div
            className={`citizen-panel ${activeTab === 'track' ? 'panel-visible' : 'panel-hidden'}`}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div>
              <AiConsole state={consoleState} />
            </div>
            <TrackComplaint />
          </div>
        </div>
      </PageContainer>

      <style>{`
        @media (max-width: 720px) {
          .mobile-tabs { display: flex !important; }
          .citizen-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .citizen-panel { display: block !important; }
          .panel-hidden { display: none !important; }
          .panel-visible { display: block !important; }
        }
        @media (min-width: 721px) {
          .citizen-panel { display: block !important; }
        }
      `}</style>
    </>
  );
}
