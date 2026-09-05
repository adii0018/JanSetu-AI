import React from 'react';
import { Edit3, Mic, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { playTick } from '../../utils/sounds';

export type InputMode = 'text' | 'voice' | 'whatsapp';

interface ModeSelectorProps {
  value: InputMode;
  onChange: (mode: InputMode) => void;
}

interface ModeOption {
  id: InputMode;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  accentColor: string;
}

const MODES: ModeOption[] = [
  {
    id: 'text',
    title: 'Text Entry',
    subtitle: 'Type in Hindi, English or Hinglish',
    badge: 'NLP INTENT',
    badgeColor: 'var(--deep-moss)',
    icon: <Edit3 size={20} />,
    accentColor: 'var(--moss)',
  },
  {
    id: 'voice',
    title: 'AI Voice',
    subtitle: 'Speak naturally in your language',
    badge: 'NEURAL SPEECH',
    badgeColor: '#D97706',
    icon: <Mic size={20} />,
    accentColor: '#D97706',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Bot',
    subtitle: '+91 88000 01915 (Zero Download)',
    badge: 'LIVE BOT',
    badgeColor: '#25D366',
    icon: <MessageSquare size={20} />,
    accentColor: '#25D366',
  },
];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Input mode"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
        marginTop: '0.25rem',
      }}
    >
      {MODES.map((mode) => {
        const isActive = value === mode.id;

        return (
          <motion.button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playTick();
              onChange(mode.id);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '0.875rem 1rem',
              borderRadius: 14,
              border: isActive ? `2px solid ${mode.accentColor}` : '1.5px solid var(--border)',
              background: isActive
                ? mode.id === 'whatsapp'
                  ? '#E7FCE9'
                  : 'var(--leaf-pale)'
                : '#FFFFFF',
              boxShadow: isActive
                ? `0 6px 20px ${mode.accentColor}22`
                : '0 2px 8px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 200ms ease',
              position: 'relative',
              outline: 'none',
              minHeight: 110,
            }}
          >
            {/* Active Checkmark Pill */}
            {isActive && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  color: mode.accentColor,
                }}
              >
                <CheckCircle2 size={16} />
              </motion.div>
            )}

            {/* Icon + Title */}
            <div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: isActive ? mode.accentColor : 'var(--leaf-pale)',
                  color: isActive ? '#FFFFFF' : mode.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                  transition: 'all 200ms ease',
                }}
              >
                {mode.icon}
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: 'var(--ink)',
                  lineHeight: 1.2,
                }}
              >
                {mode.title}
              </div>
            </div>

            {/* Subtitle & Badge */}
            <div style={{ marginTop: '0.5rem', width: '100%' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--ink-soft)',
                  lineHeight: 1.3,
                  marginBottom: '0.35rem',
                }}
              >
                {mode.subtitle}
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 10,
                  background: isActive ? mode.badgeColor : 'var(--border)',
                  color: isActive ? '#FFFFFF' : 'var(--ink-soft)',
                  transition: 'all 200ms ease',
                }}
              >
                {isActive && <Sparkles size={8} />} {mode.badge}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
