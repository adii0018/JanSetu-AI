import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, BarChart3, Sparkles, MessageCircle, FilePlus, ShieldCheck, Activity, ExternalLink, User as UserIcon, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { playNav, playClick } from '../../utils/sounds';
import { useAuth } from '../../context/AuthContext';

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, openAuthModal } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: '12px',
        zIndex: 100,
        maxWidth: '1220px',
        margin: '0 auto',
        padding: '0 1rem',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          background: scrolled ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          border: '1px solid rgba(18, 53, 36, 0.12)',
          boxShadow: scrolled
            ? '0 12px 36px rgba(18, 53, 36, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)'
            : '0 8px 24px rgba(18, 53, 36, 0.06)',
          height: 66,
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ── Brand Logo & Title ───────────────────────────────── */}
        <NavLink
          to="/"
          onClick={playNav}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
        >
          {/* Glowing AI Emblem */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 34 Q32 12 52 34" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none"/>
              <circle cx="16" cy="34" r="3.5" fill="#6FBF73"/>
              <circle cx="48" cy="34" r="3.5" fill="#6FBF73"/>
              <line x1="16" y1="36.5" x2="16" y2="44" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
              <line x1="48" y1="36.5" x2="48" y2="44" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"/>
              <line x1="10" y1="44" x2="54" y2="44" stroke="#6FBF73" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: 'var(--ink)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                JanSetu <span style={{ color: '#25D366' }}>AI</span>
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.7rem',
                color: 'var(--ink-soft)',
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              Next-Gen Civic Tech Platform
            </div>
          </div>
        </NavLink>

        {/* ── Main Nav Pills ───────────────────────────────────── */}
        <nav
          aria-label="Main navigation"
          style={{
            display: 'flex',
            background: 'rgba(18, 53, 36, 0.05)',
            borderRadius: 30,
            padding: '4px',
            gap: '4px',
            border: '1px solid rgba(18, 53, 36, 0.08)',
          }}
        >
          <NavLink
            to="/"
            end
            onClick={playNav}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1.15rem',
              borderRadius: 24,
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              background: isActive
                ? 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)'
                : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--ink-soft)',
              boxShadow: isActive ? '0 4px 14px rgba(18, 53, 36, 0.22)' : 'none',
              transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
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
              gap: '0.45rem',
              padding: '0.45rem 1.15rem',
              borderRadius: 24,
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              background: isActive
                ? 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)'
                : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--ink-soft)',
              boxShadow: isActive ? '0 4px 14px rgba(18, 53, 36, 0.22)' : 'none',
              transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
              whiteSpace: 'nowrap',
            })}
          >
            <BarChart3 size={14} aria-hidden="true" />
            Open Analytics
          </NavLink>
        </nav>

        {/* ── Status Indicator & Actions ───────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
              padding: '0.45rem 0.9rem',
              borderRadius: 24,
              background: '#25D366',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: 750,
              fontSize: '0.8125rem',
              boxShadow: '0 3px 12px rgba(37, 211, 102, 0.35)',
              transition: 'transform 180ms ease, boxShadow 180ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 211, 102, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 3px 12px rgba(37, 211, 102, 0.35)';
            }}
          >
            <MessageCircle size={15} /> WhatsApp Bot
          </a>

          {/* User Auth Profile Dropdown / Sign In Trigger */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => { playClick(); setDropdownOpen(!dropdownOpen); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 24,
                  background: 'rgba(18, 53, 36, 0.06)',
                  border: '1px solid rgba(18, 53, 36, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 750,
                    fontSize: '0.8rem',
                  }}
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    user.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {user.full_name.split(' ')[0]}
                </span>
                {user.is_verified && (
                  <span title="Verified Citizen" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <ShieldCheck size={14} color="#059669" />
                  </span>
                )}
                <ChevronDown size={14} color="var(--ink-soft)" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 230,
                    background: '#FFFFFF',
                    borderRadius: 18,
                    boxShadow: '0 12px 36px rgba(18, 53, 36, 0.15)',
                    border: '1px solid rgba(18, 53, 36, 0.12)',
                    padding: '0.65rem',
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--border)', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink)' }}>{user.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    {user.is_verified && (
                      <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
                        <ShieldCheck size={12} /> Aadhaar Verified
                      </span>
                    )}
                  </div>

                  <NavLink
                    to="/profile"
                    onClick={() => { playNav(); setDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 12,
                      textDecoration: 'none',
                      color: 'var(--ink)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      transition: 'background 120ms ease',
                    }}
                    className="dropdown-item"
                  >
                    <UserIcon size={15} color="var(--moss)" /> My Profile & Aadhaar
                  </NavLink>

                  <button
                    onClick={() => {
                      playClick();
                      logout();
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 12,
                      border: 'none',
                      background: 'transparent',
                      color: '#DC2626',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: 2,
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { playClick(); openAuthModal('login'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 1rem',
                borderRadius: 24,
                background: 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 750,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(18, 53, 36, 0.25)',
                transition: 'transform 180ms ease, boxShadow 180ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(18, 53, 36, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 3px 12px rgba(18, 53, 36, 0.25)';
              }}
            >
              <LogIn size={15} /> Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
}


