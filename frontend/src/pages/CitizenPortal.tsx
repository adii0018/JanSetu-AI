import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, Cpu, Send, ShieldCheck, MapPin, CheckCircle2, Clock, TrendingUp, Bot, Zap, Award, Users, MessageCircle, FileSpreadsheet, ArrowRight, Star } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { ComplaintForm } from '../components/citizen/ComplaintForm';
import { AiConsole } from '../components/citizen/AiConsole';
import { TrackComplaint } from '../components/citizen/TrackComplaint';
import { HotspotMap } from '../components/dashboard/HotspotMap';
import { getMapData, getGeoClusters } from '../services/api';
import type { MapWard, GeoClustersResponse } from '../services/types';
import type { ConsoleState } from '../components/citizen/AiConsole';
import { playClick } from '../utils/sounds';

const INITIAL_CONSOLE: ConsoleState = {
  phase: 'idle',
  lines: [],
  result: null,
  errorMsg: null,
};

const DYNAMIC_PHRASES = [
  'in Any Local Dialect',
  'in 22 Indian Languages',
  'via Voice, Photo or Text',
  'with Instant AI Parsing',
  'for Direct Ward Action',
];

type LoadState<T> = { data: T | null; loading: boolean; error: string | null };
function init<T>(): LoadState<T> { return { data: null, loading: true, error: null }; }

export function CitizenPortal() {
  const [consoleState, setConsoleState] = useState<ConsoleState>(INITIAL_CONSOLE);
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');
  const [phraseIndex, setPhraseIndex] = useState(0);

  const [mapData, setMapData] = useState<LoadState<MapWard[]>>(init());
  const [geoClusters, setGeoClusters] = useState<LoadState<GeoClustersResponse>>(init());

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % DYNAMIC_PHRASES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const fetchMapData = useCallback(async () => {
    setMapData((s) => ({ ...s, loading: true, error: null }));
    setGeoClusters((s) => ({ ...s, loading: true, error: null }));
    await Promise.allSettled([
      getMapData()
        .then((data) => setMapData({ data, loading: false, error: null }))
        .catch((e) => setMapData({ data: null, loading: false, error: e.message })),
      getGeoClusters()
        .then((data) => setGeoClusters({ data, loading: false, error: null }))
        .catch((e) => setGeoClusters({ data: null, loading: false, error: e.message })),
    ]);
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

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
            <circle cx="100" cy="100" r="92" fill="url(#sunAura)" />
            <circle cx="100" cy="100" r="46" fill="url(#sunGlow)" className="sun-core" />
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
          </svg>
        </div>

        <PageContainer style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.95rem',
                borderRadius: 100,
                background: 'rgba(37, 211, 102, 0.12)',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                color: '#123524',
                fontSize: '0.78125rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '1.1rem',
              }}
            >
              <Sparkles size={14} color="#25D366" />
              AI-POWERED CITIZEN INTAKE PORTAL
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
                fontWeight: 800,
                color: 'var(--ink)',
                lineHeight: 1.18,
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              Speak or Type Your Civic Voice{' '}
              <span style={{ display: 'inline-block', position: 'relative' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={DYNAMIC_PHRASES[phraseIndex]}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #123524 0%, #25D366 50%, #2E6B3E 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 2px 10px rgba(37, 211, 102, 0.2))',
                    }}
                  >
                    {DYNAMIC_PHRASES[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--ink-soft)',
                marginTop: '0.95rem',
                maxWidth: 680,
                marginInline: 'auto',
                lineHeight: 1.6,
                fontWeight: 450,
              }}
            >
              JanSetu AI accepts voice notes, photos, and free-form text in 22 Indian languages. It automatically classifies urgency, tags the municipality ward, and triggers immediate action.
            </p>

            {/* Feature Pills under Subtitle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '1.75rem',
                flexWrap: 'wrap',
              }}
            >
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
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#25D366', fontSize: '0.72rem' }}>{n}.</span>
                      <span style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '0.84rem' }}>{label}</span>
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--ink-soft)', fontWeight: 450 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>

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
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '100%',
              animation: 'waveFlowRight 16s linear infinite',
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

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '100%',
              animation: 'waveFlowLeft 10s linear infinite',
            }}
          >
            <svg
              viewBox="0 0 2400 120"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <path
                d="M 0,45 Q 300,100 600,45 T 1200,45 T 1800,45 T 2400,45 L 2400,120 L 0,120 Z"
                fill="var(--paper, #F9FAFC)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── NEW FEATURE 1: Live Impact Telemetry Counter Strip ───────────── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(18,53,36,0.08)', padding: '1.25rem 0' }}>
        <PageContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {[
              { val: '1,420+', label: 'Complaints Resolved', Icon: CheckCircle2, color: '#16A34A' },
              { val: '4.2 Hrs', label: 'Avg Resolution Speed', Icon: Clock, color: '#2563EB' },
              { val: '28 States', label: 'Pan-India Ward Coverage', Icon: MapPin, color: '#D97706' },
              { val: '98.4%', label: 'Verified Citizen Rating', Icon: Award, color: '#9333EA' },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.5rem 1rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `color-mix(in srgb, ${stat.color} 12%, #FFFFFF)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <stat.Icon size={20} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 850, fontSize: '1.25rem', color: '#123524', lineHeight: 1.1 }}>{stat.val}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
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
      <PageContainer style={{ marginTop: '2.5rem' }}>
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

        {/* ── NEW FEATURE 2: How JanSetu AI Works (Interactive 4-Step Pipeline) ───── */}
        <div style={{ marginTop: '4rem', background: '#FFFFFF', borderRadius: 28, border: '1px solid rgba(18, 53, 36, 0.1)', padding: '2.5rem 2rem', boxShadow: '0 10px 35px rgba(0,0,0,0.03)' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#25D366', background: 'rgba(37, 211, 102, 0.12)', border: '1px solid rgba(37, 211, 102, 0.3)', padding: '0.25rem 0.75rem', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              HOW IT WORKS
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, color: '#123524', marginTop: '0.65rem' }}>
              3-Step Automated Civic Pipeline
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: 4 }}>
              From citizen voice dictation to municipal officer dispatch in real time
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                step: '01',
                title: 'Multilingual Voice & Text Intake',
                desc: 'Parses 22 Indian languages, voice notes, and photos seamlessly with instant transcription.',
                Icon: Mic,
                color: '#10B981',
                imgSrc: '/images/pipeline/step1.jpg',
                badgeText: '22 Dialects Voice AI',
              },
              {
                step: '02',
                title: 'NVIDIA AI & LLM Entity Parsing',
                desc: 'Extracts exact problem category, urgency score (0-100), and GPS ward geolocation.',
                Icon: Cpu,
                color: '#8B5CF6',
                imgSrc: '/images/pipeline/step2.jpg',
                badgeText: 'NVIDIA NeMo LLM',
              },
              {
                step: '03',
                title: 'ViaSocket Multi-System Sync',
                desc: 'Syncs live tickets instantly to Google Sheets database & Municipal Officer Dashboard.',
                Icon: FileSpreadsheet,
                color: '#F59E0B',
                imgSrc: '/images/pipeline/step3.jpg',
                badgeText: 'ViaSocket Webhook Relay',
              },
            ].map((card) => (
              <div
                key={card.step}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 22,
                  padding: '1.25rem',
                  border: '1px solid rgba(18, 53, 36, 0.1)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                  position: 'relative',
                  transition: 'all 220ms ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 32px rgba(18, 53, 36, 0.12)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = card.color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(18, 53, 36, 0.1)';
                }}
              >
                <div>
                  {/* Image container */}
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 14, overflow: 'hidden', marginBottom: '1.1rem', background: '#F1F5F9', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <img
                      src={card.imgSrc}
                      alt={card.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(18, 53, 36, 0.85)', backdropFilter: 'blur(6px)', padding: '2px 8px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.02em' }}>
                      {card.badgeText}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in srgb, ${card.color} 15%, #FFFFFF)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <card.Icon size={18} color={card.color} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'rgba(18, 53, 36, 0.2)' }}>{card.step}</span>
                  </div>

                  <h4 style={{ fontWeight: 800, fontSize: '0.94rem', color: '#123524', marginBottom: 5, lineHeight: 1.35 }}>{card.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* ── Pan-India Ward Hotspot Map Section on Landing Page ───── */}
        <div style={{ marginTop: '3.5rem' }}>
          <HotspotMap
            data={mapData.data ?? []}
            geoClusters={geoClusters.data?.clusters ?? []}
            loading={mapData.loading}
            error={mapData.error}
            onRetry={fetchMapData}
          />
        </div>
      </PageContainer>

      <style>{`
        @keyframes waveFlowLeft {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes waveFlowRight {
          0% { transform: translate3d(0, 0, 0); }
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
