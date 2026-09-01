import React from 'react';
import { Type, Mic, MessageCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

export type InputMode = 'text' | 'voice' | 'whatsapp';

interface ModeSelectorProps {
  value: InputMode;
  onChange: (mode: InputMode) => void;
}

type IconComp = React.FC<{ size?: number; 'aria-hidden'?: boolean }>;

const modes: { id: InputMode; label: string; Icon: IconComp }[] = [
  { id: 'text', label: 'Text', Icon: ({ size, ...rest }) => <Type size={size} {...rest} /> },
  { id: 'voice', label: 'Voice', Icon: ({ size, ...rest }) => <Mic size={size} {...rest} /> },
  { id: 'whatsapp', label: 'WhatsApp', Icon: ({ size, ...rest }) => <MessageCircle size={size} {...rest} /> },
];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Input mode"
      style={{
        display: 'flex',
        gap: 4,
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--control-radius)',
        padding: 3,
      }}
    >
      {modes.map(({ id, label, Icon }) => {
        const isActive = value === id;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              border: 'none',
              borderRadius: 6,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              background: isActive ? 'var(--indigo)' : 'transparent',
              color: isActive ? '#fff' : 'var(--muted)',
              transition: 'background 150ms ease, color 150ms ease',
              position: 'relative',
            }}
          >
            <Icon size={14} aria-hidden={true} />
            {label}
            {id === 'whatsapp' && isActive && (
              <span style={{ marginLeft: 4 }}>
                <Badge variant="saffron" size="sm">Coming soon</Badge>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
