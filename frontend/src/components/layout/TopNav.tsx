import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, BarChart3, Leaf } from 'lucide-react';
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
        background: scrolled ? 'rgba(255,255,255,0.94)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(31,58,36,0.12)' : 'transparent'}`,
        transition: 'background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 2rem',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Logo mark */}
          <div
            aria-hidden="true"
            style={{
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="38" height="38" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="32" fill="#EFF9EE"/>
              <path d="M12 34 Q32 12 52 34" stroke="#1F3A24" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
              <circle cx="16" cy="34" r="2.6" fill="#1F3A24"/>
              <circle cx="48" cy="34" r="2.6" fill="#1F3A24"/>
              <line x1="16" y1="36.5" x2="16" y2="43" stroke="#2E6B3E" strokeWidth="3.6" strokeLinecap="round"/>
              <line x1="48" y1="36.5" x2="48" y2="43" stroke="#2E6B3E" strokeWidth="3.6" strokeLinecap="round"/>
              <line x1="10" y1="43" x2="54" y2="43" stroke="#6FBF73" strokeWidth="3.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '1.125rem',
                color: 'var(--ink)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              JanSetu
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.6875rem',
                color: 'var(--ink-soft)',
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}
            >
              AI for Public Infrastructure
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          aria-label="Main navigation"
          style={{
            display: 'flex',
            background: 'var(--leaf-pale)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px',
            gap: '2px',
          }}
        >
          <NavLink
            to="/"
            end
            onClick={playNav}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              background: isActive ? 'var(--deep-moss)' : 'transparent',
              color: isActive ? '#fff' : 'var(--moss)',
              transition: 'background 200ms ease, color 200ms ease',
              whiteSpace: 'nowrap',
            })}
          >
            <MessageSquare size={13} aria-hidden="true" />
            Citizen Portal
          </NavLink>
          <NavLink
            to="/dashboard"
            onClick={playNav}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              background: isActive ? 'var(--deep-moss)' : 'transparent',
              color: isActive ? '#fff' : 'var(--moss)',
              transition: 'background 200ms ease, color 200ms ease',
              whiteSpace: 'nowrap',
            })}
          >
            <BarChart3 size={13} aria-hidden="true" />
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
