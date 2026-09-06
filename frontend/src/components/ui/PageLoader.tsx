import React, { useEffect, useState } from 'react';

export function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Smoothly fade out and remove loader on initial site load
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 500);

    const removeTimer = setTimeout(() => {
      setLoading(false);
    }, 850);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(180deg, #EFF9EE 0%, #FFFFFF 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999,
        opacity: fadeOut ? 0 : 1,
        visibility: fadeOut ? 'hidden' : 'visible',
        transition: 'opacity 350ms ease, visibility 350ms ease',
        pointerEvents: fadeOut ? 'none' : 'auto',
        overflow: 'hidden',
      }}
    >
      {/* Prominent Floating Background Snowflakes */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[
          { left: '8%', delay: '0s', duration: '6s', size: 36, color: '#6FBF73' },
          { left: '22%', delay: '1.5s', duration: '7s', size: 42, color: '#25D366' },
          { left: '38%', delay: '0.4s', duration: '5.5s', size: 32, color: '#1F3A24' },
          { left: '54%', delay: '2.2s', duration: '7.5s', size: 40, color: '#2E6B3E' },
          { left: '70%', delay: '1.0s', duration: '6.5s', size: 36, color: '#6FBF73' },
          { left: '86%', delay: '0.2s', duration: '7s', size: 44, color: '#25D366' },
        ].map((flake, idx) => (
          <svg
            key={idx}
            viewBox="0 0 24 24"
            fill="none"
            stroke={flake.color}
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{
              position: 'absolute',
              top: '-50px',
              left: flake.left,
              width: flake.size,
              height: flake.size,
              opacity: 0.8,
              filter: 'drop-shadow(0 4px 12px rgba(37, 211, 102, 0.3))',
              animation: `snowFall ${flake.duration} linear infinite`,
              animationDelay: flake.delay,
              willChange: 'transform',
            }}
          >
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
            <path d="M12 5 L9 8 M12 5 L15 8" />
            <path d="M12 19 L9 16 M12 19 L15 16" />
            <circle cx="12" cy="12" r="3" fill={flake.color} fillOpacity="0.3" />
          </svg>
        ))}
      </div>

      {/* Seamless Center Loader — 1:1 Matched with index.html */}
      <div
        className="jansetu-loader"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" width="95" height="95">
          <circle cx="32" cy="32" r="30" fill="#EFF9EE" stroke="#C9EAC7" strokeWidth="1.5" />
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
            stroke="#25D366"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#1F3A24',
            letterSpacing: '0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          JanSetu <span style={{ color: '#25D366' }}>AI</span>
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

        @keyframes snowFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          15% {
            opacity: 0.85;
          }
          85% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(105vh) rotate(360deg);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}
