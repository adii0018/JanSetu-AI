import React, { useState } from 'react';
import { Sparkles, Mic, Cpu, Send, ShieldCheck } from 'lucide-react';
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
          padding: '4rem 0 5.25rem',
          background: 'linear-gradient(180deg, #EFF9EE 0%, #FFFFFF 100%)',
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
            background: 'radial-gradient(circle, rgba(255, 200, 60, 0.35) 0%, rgba(111, 191, 115, 0.18) 45%, rgba(255,255,255,0) 70%)',
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

        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
          {/* Eyebrow & Live Status Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--moss)',
                background: 'rgba(31, 58, 36, 0.08)',
                border: '1px solid rgba(31, 58, 36, 0.2)',
                padding: '0.28rem 0.75rem',
                borderRadius: 100,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(4px)',
              }}
            >
              <Sparkles size={13} color="var(--moss)" />
              AI Citizen Portal
            </span>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(37, 211, 102, 0.14)',
                color: '#075E54',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                padding: '0.28rem 0.75rem',
                borderRadius: 100,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(4px)',
                boxShadow: '0 0 12px rgba(37, 211, 102, 0.2)',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#25D366', boxShadow: '0 0 8px #25D366', animation: 'pulse 1.5s infinite' }} />
              PAN-INDIA MULTILINGUAL INTAKE (28 STATES & 8 UTs)
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(2.1rem, 4.5vw, 3.2rem)',
              color: 'var(--ink)',
              lineHeight: 1.14,
              letterSpacing: '-0.03em',
              maxWidth: 680,
              marginBottom: '0.85rem',
            }}
          >
            Voice & Text Civic Complaint Intake{' '}
            <span style={{ background: 'linear-gradient(90deg, #132417 0%, #2E6B3E 45%, #25D366 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'normal' }}>
              Powered by Multilingual AI
            </span>
          </h1>

          <p style={{ color: 'var(--ink-soft)', fontSize: '1.02rem', maxWidth: 620, lineHeight: 1.62, fontWeight: 450 }}>
            Describe any civic issue in your native language via voice dictation or text. AI instantly extracts location, urgency, and routes it directly to municipal officers.
          </p>

          {/* Enhanced Micro Step Pills */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { n: '01', label: 'Voice or Text Intake', desc: 'Dictate in your local dialect', Icon: Mic, color: '#10B981' },
              { n: '02', label: 'AI NER Parsing', desc: 'Extracts location & category', Icon: Cpu, color: '#8B5CF6' },
              { n: '03', label: 'Direct Priority Queue', desc: 'Instant ward officer routing', Icon: Send, color: '#F59E0B' },
            ].map(({ n, label, desc, Icon, color }) => (
              <div
                key={n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(31, 58, 36, 0.15)',
                  borderRadius: 16,
                  padding: '0.65rem 1.1rem',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  boxShadow: '0 6px 20px rgba(31, 58, 36, 0.06)',
                  transition: 'all 200ms ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(37, 211, 102, 0.4)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 25px rgba(37, 211, 102, 0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(31, 58, 36, 0.15)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(31, 58, 36, 0.06)';
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `color-mix(in srgb, ${color} 15%, #FFFFFF)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} color={color} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--moss)', fontSize: '0.72rem' }}>{n}.</span>
                    <span style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '0.84rem' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--ink-soft)', fontWeight: 450 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Flowing Wavy Bottom Divider */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: '100%',
            height: '46px',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {/* Layer 1: Soft Ambient Glow Wave */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '100%',
              animation: 'waveFlowRight 16s linear infinite',
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
                fill="rgba(37, 211, 102, 0.15)"
              />
            </svg>
          </div>

          {/* Layer 2: Main Page Background Wave */}
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
                fill="var(--bg-page, #F9FAFC)"
              />
            </svg>
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
        @keyframes waveFlowLeft {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes waveFlowRight {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
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
