import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function PageLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Trigger loader on initial page load and every route change
    setLoading(true);
    setFadeOut(false);

    const displayDuration = isFirstRender.current ? 750 : 500;
    isFirstRender.current = false;

    const timer = setTimeout(() => {
      setFadeOut(true);
      const removeTimer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(removeTimer);
    }, displayDuration);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (!loading) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        background: '#F6FAF6',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
        opacity: fadeOut ? 0 : 1,
        visibility: fadeOut ? 'hidden' : 'visible',
        transition: 'opacity 400ms ease, visibility 400ms ease',
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      <div
        className="jansetu-loader"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" width="75" height="75">
          <circle cx="32" cy="32" r="30" fill="#EFF9EE" />
          <path
            className="bridge-arc"
            d="M12 34 Q32 12 52 34"
            stroke="#1F3A24"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <line
            x1="10"
            y1="43"
            x2="54"
            y2="43"
            stroke="#C9EAC7"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: '1.1rem',
            fontWeight: 750,
            color: '#1F3A24',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          JanSetu <span style={{ color: '#6FBF73' }}>AI</span>
        </div>
      </div>

      <style>{`
        .bridge-arc {
          stroke-dasharray: 63;
          stroke-dashoffset: 63;
          animation: bridgeDraw 1.4s ease-in-out infinite;
        }

        @keyframes bridgeDraw {
          0%   { stroke-dashoffset: 63;  opacity: 0.3; }
          50%  { stroke-dashoffset: 0;   opacity: 1;   }
          100% { stroke-dashoffset: -63; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
