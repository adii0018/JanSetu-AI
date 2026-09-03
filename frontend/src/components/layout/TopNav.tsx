import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, BarChart3 } from 'lucide-react';

export function TopNav() {
  return (
    <header
      style={{
        background: 'var(--panel)',
        borderBottom: '1px solid var(--line)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '0 2rem',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
          <div
            aria-hidden="true"
            style={{
              width: 38,
              height: 38,
              background: 'linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)',
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: 'var(--saffron)',
                letterSpacing: '-0.02em',
              }}
            >
              JS
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--ink)',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              JanSetu
            </div>
            <div
              style={{
                fontSize: '0.6875rem',
                color: 'var(--muted)',
                fontWeight: 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Digital Public Infrastructure &amp; Governance
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav
          aria-label="Main navigation"
          style={{
            display: 'flex',
            background: 'var(--paper)',
            borderRadius: 'var(--control-radius)',
            border: '1px solid var(--line)',
            padding: 3,
            gap: 2,
          }}
        >
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.875rem',
              borderRadius: 6,
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              background: isActive ? 'var(--indigo)' : 'transparent',
              color: isActive ? '#fff' : 'var(--muted)',
              transition: 'background 150ms ease, color 150ms ease',
              whiteSpace: 'nowrap',
            })}
          >
            <MessageSquare size={14} aria-hidden="true" />
            Citizen Portal
          </NavLink>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.875rem',
              borderRadius: 6,
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              background: isActive ? 'var(--indigo)' : 'transparent',
              color: isActive ? '#fff' : 'var(--muted)',
              transition: 'background 150ms ease, color 150ms ease',
              whiteSpace: 'nowrap',
            })}
          >
            <BarChart3 size={14} aria-hidden="true" />
            Policymaker Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
