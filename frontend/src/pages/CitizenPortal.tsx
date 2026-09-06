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
      {/* ── Dynamic Hero section with floating clouds ─────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '4rem 0 4.5rem',
          background: 'linear-gradient(180deg, #EFF9EE 0%, #FFFFFF 100%)',
          borderBottom: '1px solid rgba(31, 58, 36, 0.08)',
        }}
      >
        {/* Animated Floating Clouds Overlay */}
        <div aria-hidden="true" className="clouds-container">
          <svg className="cloud cloud-1" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 50 C18 50 12 44 12 36 C12 29 17 23 24 23 C26 15 35 9 46 9 C57 9 66 16 68 26 C75 26 82 32 82 40 C82 46 76 50 68 50 Z" fill="rgba(111, 191, 115, 0.3)"/>
          </svg>
          <svg className="cloud cloud-2" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 50 C18 50 12 44 12 36 C12 29 17 23 24 23 C26 15 35 9 46 9 C57 9 66 16 68 26 C75 26 82 32 82 40 C82 46 76 50 68 50 Z" fill="rgba(46, 107, 62, 0.2)"/>
          </svg>
          <svg className="cloud cloud-3" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 50 C18 50 12 44 12 36 C12 29 17 23 24 23 C26 15 35 9 46 9 C57 9 66 16 68 26 C75 26 82 32 82 40 C82 46 76 50 68 50 Z" fill="rgba(255, 215, 0, 0.2)"/>
          </svg>
        </div>

        {/* Ambient Radial Background Glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-100px',
            right: '10%',
            width: '500px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255, 200, 60, 0.3) 0%, rgba(111, 191, 115, 0.15) 45%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Animated Glowing Sun in Corner */}
        <div aria-hidden="true" className="sun-container">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <defs>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF4B8" />
                <stop offset="40%" stopColor="#FFC837" />
                <stop offset="85%" stopColor="#F0862E" />
                <stop offset="100%" stopColor="rgba(240, 134, 46, 0.1)" />
              </radialGradient>
              <radialGradient id="sunAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 210, 60, 0.45)" />
                <stop offset="60%" stopColor="rgba(240, 134, 46, 0.18)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </radialGradient>
            </defs>
            {/* Sun Outer Aura */}
            <circle cx="100" cy="100" r="92" fill="url(#sunAura)" />
            {/* Rotating Sun Rays */}
            <g className="sun-rays" stroke="#F0862E" strokeWidth="3.5" strokeLinecap="round" opacity="0.8">
              <line x1="100" y1="22" x2="100" y2="34" />
              <line x1="100" y1="166" x2="100" y2="178" />
              <line x1="22" y1="100" x2="34" y2="100" />
              <line x1="166" y1="100" x2="178" y2="100" />
              <line x1="45" y1="45" x2="54" y2="54" />
              <line x1="146" y1="146" x2="155" y2="155" />
              <line x1="45" y1="155" x2="54" y2="146" />
              <line x1="146" y1="54" x2="155" y2="45" />
            </g>
            {/* Pulsating Sun Core */}
            <circle className="sun-core" cx="100" cy="100" r="42" fill="url(#sunGlow)" />
          </svg>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
          {/* Eyebrow & Live Status Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div className="eyebrow" style={{ color: 'var(--moss)' }}>
              Citizen Portal Intake
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(37, 211, 102, 0.12)', color: '#075E54', border: '1px solid rgba(37, 211, 102, 0.3)', padding: '0.15rem 0.55rem', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#25D366', animation: 'pulse 1.5s infinite' }} />
              🇮🇳 28 States & 8 UTs Active
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 340,
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              color: 'var(--ink)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              maxWidth: 640,
              marginBottom: '1rem',
            }}
          >
            What needs attention{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 480, color: 'var(--moss)', background: 'linear-gradient(90deg, #1F3A24, #2E6B3E, #6FBF73)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              in your area?
            </em>
          </h1>

          <p style={{ color: 'var(--ink-soft)', fontSize: '1.0625rem', maxWidth: 540, lineHeight: 1.65 }}>
            Speak, type, or send it exactly how you'd tell a neighbour. Your complaint is automatically processed by AI entity recognition (NER) across India.
          </p>

          {/* Step pills */}
          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            {[
              { n: '01', label: 'Choose language & dictation' },
              { n: '02', label: 'Describe civic problem' },
              { n: '03', label: 'AI extracts location & queues priority' },
            ].map(({ n, label }) => (
              <div
                key={n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--surface-card)',
                  border: '1px solid rgba(31, 58, 36, 0.15)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.4rem 0.95rem',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(31, 58, 36, 0.05)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--moss)', fontSize: '0.75rem' }}>{n}</span>
                <span style={{ color: 'var(--ink)' }}>{label}</span>
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
