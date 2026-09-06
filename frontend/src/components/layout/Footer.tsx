import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, BarChart3, MessageCircle, Sparkles, ShieldCheck, Cpu, MapPin, Layers, ExternalLink, Landmark, ShipWheel, Code2, FileSpreadsheet } from 'lucide-react';
import { playNav } from '../../utils/sounds';

export function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #EFF9EE 0%, #E5F5E3 100%)',
        color: 'var(--ink)',
        padding: '4rem 0 2rem',
        marginTop: '4rem',
        borderTop: '1px solid rgba(31, 58, 36, 0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Soft Ambient Light Glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(111, 191, 115, 0.25) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        {/* Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            paddingBottom: '3rem',
            borderBottom: '1px solid rgba(31, 58, 36, 0.12)',
          }}
        >
          {/* Column 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #1F3A24 0%, #2E6B3E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(31, 58, 36, 0.18)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 34 Q32 12 52 34" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none"/>
                  <circle cx="16" cy="34" r="3.5" fill="#6FBF73"/>
                  <circle cx="48" cy="34" r="3.5" fill="#6FBF73"/>
                  <line x1="16" y1="36.5" x2="16" y2="44" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="48" y1="36.5" x2="48" y2="44" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="10" y1="44" x2="54" y2="44" stroke="#6FBF73" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--deep-moss)' }}>
                  JanSetu <span style={{ color: 'var(--moss)' }}>AI</span>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-soft)' }}>
                  Next-Gen Civic Tech & AI Platform
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Bridging the gap between Indian citizens and responsive public administration using multilingual AI, location entity detection (NER), and real-time open analytics.
            </p>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#FFFFFF', color: 'var(--deep-moss)', padding: '0.2rem 0.6rem', borderRadius: 10, border: '1px solid rgba(31, 58, 36, 0.15)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                🇮🇳 28 States & 8 UTs
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#FFFFFF', color: 'var(--deep-moss)', padding: '0.2rem 0.6rem', borderRadius: 10, border: '1px solid rgba(31, 58, 36, 0.15)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                🗣️ 22 Languages
              </span>
            </div>

            {/* Dynamic Animated Creator Badge for Aditya Singh Rajput */}
            <div
              className="creator-card"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(31, 58, 36, 0.18)',
                padding: '0.65rem 0.95rem',
                borderRadius: 14,
                boxShadow: '0 6px 20px rgba(31, 58, 36, 0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 300ms ease',
                width: '100%',
                maxWidth: 320,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1F3A24 0%, #2E6B3E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(31, 58, 36, 0.2)',
                  color: '#FFD700',
                  flexShrink: 0,
                }}
              >
                <ShipWheel size={19} />
              </div>
              <div>
                <div style={{ fontSize: '0.64rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-soft)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Code2 size={11} color="var(--moss)" /> Lead Architect & Developer
                </div>
                <a
                  href="https://linkedin.com/in/adii001n/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Aditya Singh Rajput on LinkedIn"
                  className="dynamic-dev-name"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 850,
                    fontSize: '0.96rem',
                    letterSpacing: '0.04em',
                    background: 'linear-gradient(90deg, #1F3A24 0%, #2E6B3E 25%, #D6701D 50%, #2E6B3E 75%, #1F3A24 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'shimmerName 3.5s linear infinite',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    cursor: 'pointer',
                  }}
                >
                  ADITYA SINGH RAJPUT
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#D6701D" style={{ filter: 'drop-shadow(0 0 4px rgba(214,112,29,0.4))', flexShrink: 0 }}>
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.88a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--deep-moss)', marginBottom: '1rem' }}>
              JanSetu Portals
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <NavLink
                  to="/"
                  onClick={playNav}
                  style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 160ms' }}
                >
                  <MessageSquare size={14} color="var(--moss)" /> Citizen Complaint Intake
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard"
                  onClick={playNav}
                  style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 160ms' }}
                >
                  <BarChart3 size={14} color="var(--moss)" /> Policymaker Dashboard
                </NavLink>
              </li>
              <li>
                <a
                  href="https://docs.google.com/spreadsheets/d/1cC8YMVKnjgc5Gq9h4T_dvx4u1PFgfqXvUTMi_gc9Rn0/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0F9D58', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <FileSpreadsheet size={14} color="#0F9D58" /> Live Govt Google Sheet <ExternalLink size={11} opacity={0.7} />
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/918800001915?text=Hi%20JanSetu%20AI%20I%20want%20to%20file%20a%20complaint"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#075E54', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <MessageCircle size={14} color="#25D366" /> WhatsApp AI Bot (+91 88000 01915)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Official Govt of India Portals */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--deep-moss)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Landmark size={15} color="var(--moss)" /> Govt Portals
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { name: 'National Portal of India', url: 'https://www.india.gov.in/' },
                { name: 'CPGRAMS Grievance Portal', url: 'https://pgportal.gov.in/' },
                { name: 'Digital India Initiative', url: 'https://www.digitalindia.gov.in/' },
                { name: 'MyGov Citizen Platform', url: 'https://www.mygov.in/' },
                { name: 'BHASHINI Language Mission', url: 'https://bhashini.gov.in/' },
                { name: 'Smart Cities Mission', url: 'https://smartcities.gov.in/' },
              ].map(({ name, url }) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 160ms' }}
                  >
                    <span>{name}</span>
                    <ExternalLink size={12} style={{ opacity: 0.7, color: 'var(--moss)' }} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: AI & Tech Engine */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--deep-moss)', marginBottom: '1rem' }}>
              AI & Tech Innovations
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem', color: 'var(--ink-soft)', fontWeight: 500 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Cpu size={14} color="var(--moss)" /> Multilingual Voice Dictation
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} color="var(--moss)" /> Universal Pan-India NER
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={14} color="var(--moss)" /> TF-IDF Semantic Auto-Grouping
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="var(--moss)" /> Priority Ranking Engine
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--moss)" />
            <span>© {new Date().getFullYear()} <b>JanSetu AI</b>. Designed & Engineered by <a href="https://linkedin.com/in/adii001n/" target="_blank" rel="noopener noreferrer" title="View Aditya Singh Rajput on LinkedIn" className="dynamic-dev-name" style={{ fontWeight: 800, background: 'linear-gradient(90deg, #1F3A24, #D6701D, #2E6B3E, #1F3A24)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmerName 3.5s linear infinite', textDecoration: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>ADITYA SINGH RAJPUT <svg width="11" height="11" viewBox="0 0 24 24" fill="#D6701D" style={{ verticalAlign: 'middle' }}><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.88a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Z"/></svg></a>.</span>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-soft)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              india.gov.in <ExternalLink size={10} color="var(--moss)" />
            </a>
            <a href="https://pgportal.gov.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-soft)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              CPGRAMS <ExternalLink size={10} color="var(--moss)" />
            </a>
            <span>28 States & 8 UTs Enabled</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmerName {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .creator-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(31, 58, 36, 0.15) !important;
          border-color: rgba(46, 107, 62, 0.4) !important;
        }
      `}</style>
    </footer>
  );
}
