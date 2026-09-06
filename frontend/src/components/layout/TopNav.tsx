import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, BarChart3, Sparkles, MessageCircle, FilePlus, ShieldCheck, Activity, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { playNav } from '../../utils/sounds';

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(255, 255, 255, 0.92)' : '#FFFFFF',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(18, 53, 36, 0.12)' : 'rgba(0, 0, 0, 0.06)'}`,
        boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.05)' : 'none',
        transition: 'all 300ms ease',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 1.5rem',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* ── Brand Logo & Tagline ──────────────────────────────── */}
        <NavLink
          to="/"
          onClick={playNav}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}
        >
          {/* Glowing AI Emblem */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(18, 53, 36, 0.25)',
              flexShrink: 0,
              position: 'relative',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 750,
                  fontSize: '1.2rem',
                  color: 'var(--ink)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                JanSetu <span style={{ color: 'var(--moss)' }}>AI</span>
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  background: '#E7FCE9',
                  color: '#128C7E',
                  border: '1px solid #B8F2C2',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                🇮🇳 28 STATES LIVE
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.72rem',
                color: 'var(--ink-soft)',
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              Next-Gen Civic Tech & AI Governance Platform
            </div>
          </div>
        </NavLink>

        {/* ── Main Nav Pills ───────────────────────────────────── */}
        <nav
          aria-label="Main navigation"
          style={{
            display: 'flex',
            background: '#F1F5F9',
            borderRadius: 'var(--radius-pill)',
            padding: '4px',
            gap: '3px',
            border: '1px solid var(--border)',
          }}
        >
          <NavLink
            to="/"
            end
            onClick={playNav}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.1rem',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 650,
              fontSize: '0.8125rem',
              background: isActive ? 'var(--deep-moss)' : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--ink-soft)',
              boxShadow: isActive ? '0 2px 8px rgba(18, 53, 36, 0.2)' : 'none',
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap',
            })}
          >
            <MessageSquare size={14} aria-hidden="true" />
            Citizen Intake
          </NavLink>

          <NavLink
            to="/dashboard"
            onClick={playNav}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1.1rem',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 650,
              fontSize: '0.8125rem',
              background: isActive ? 'var(--deep-moss)' : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--ink-soft)',
              boxShadow: isActive ? '0 2px 8px rgba(18, 53, 36, 0.2)' : 'none',
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap',
            })}
          >
            <BarChart3 size={14} aria-hidden="true" />
            Open Analytics
          </NavLink>
        </nav>

        {/* ── Status Indicator & Actions ───────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Realtime Live Engine Status Badge */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 650,
              background: '#E7FCE9',
              color: 'var(--deep-moss)',
              padding: '0.35rem 0.75rem',
              borderRadius: 20,
              border: '1px solid #B8F2C2',
            }}
            className="desk-status-pill"
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#25D366',
                boxShadow: '0 0 0 2px rgba(37, 211, 102, 0.3)',
                animation: 'pulse 2s infinite',
              }}
            />
            AI Engine Online
          </div>

          {/* Live Govt Google Sheet Link Button */}
          <a
            href="https://docs.google.com/spreadsheets/d/1cC8YMVKnjgc5Gq9h4T_dvx4u1PFgfqXvUTMi_gc9Rn0/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playNav}
            title="Open Live Updating Govt Google Sheet"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              background: '#0F9D58',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              boxShadow: '0 2px 10px rgba(15, 157, 88, 0.3)',
              transition: 'transform 160ms ease, boxShadow 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <FileSpreadsheet size={15} /> Govt Google Sheet
          </a>

          {/* Official WhatsApp Bot Link Button */}
          <a
            href="https://wa.me/918800001915?text=Hi%20JanSetu%20AI%20I%20want%20to%20file%20a%20complaint"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playNav}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              background: '#25D366',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              boxShadow: '0 2px 10px rgba(37, 211, 102, 0.3)',
              transition: 'transform 160ms ease, boxShadow 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <MessageCircle size={15} /> WhatsApp Bot
          </a>
        </div>
      </div>

      <style>{`
        @media (min-width: 960px) {
          .desk-status-pill { display: inline-flex !important; }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </header>
  );
}

