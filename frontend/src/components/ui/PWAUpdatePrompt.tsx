import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * PWAUpdatePrompt
 *
 * Shows a small, non-intrusive toast banner at the bottom of the screen when
 * a new version of JanSetu is available (i.e., a new service worker is waiting
 * to take control).
 *
 * The user can:
 *  - Click "Update now" to reload with the new version immediately.
 *  - Click "Later" to dismiss for this session.
 *
 * Design: matches the JanSetu design system (deep-moss palette, pill buttons).
 * No UI changes to the rest of the app.
 */
export const PWAUpdatePrompt: React.FC = () => {
  const [show, setShow] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 minutes while the app is open
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('[PWA] Service worker registration error:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShow(true);
    }
  }, [needRefresh]);

  if (!show) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: '#1F3A24',
        color: '#fff',
        padding: '0.875rem 1.25rem',
        borderRadius: '100px',
        boxShadow: '0 8px 32px rgba(31, 58, 36, 0.45)',
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontSize: '0.875rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        maxWidth: 'calc(100vw - 2rem)',
      }}
    >
      {/* Bridge icon */}
      <svg width="20" height="20" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#EFF9EE" stroke="#C9EAC7" strokeWidth="1.5" />
        <path d="M12 34 Q32 14 52 34" stroke="#1F3A24" strokeWidth="5" strokeLinecap="round" fill="none" />
        <line x1="10" y1="43" x2="54" y2="43" stroke="#6FBF73" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <span>A new version of JanSetu is ready.</span>

      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: '#6FBF73',
          color: '#1F3A24',
          border: 'none',
          borderRadius: '100px',
          padding: '0.4rem 1rem',
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontWeight: 600,
          fontSize: '0.8125rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          minHeight: '36px',
        }}
      >
        Update now
      </button>

      <button
        onClick={() => setShow(false)}
        aria-label="Dismiss update notification"
        style={{
          background: 'transparent',
          color: 'rgba(255,255,255,0.65)',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '36px',
          minWidth: '36px',
          borderRadius: '50%',
        }}
      >
        ✕
      </button>
    </div>
  );
};
