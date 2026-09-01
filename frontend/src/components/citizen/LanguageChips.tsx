import React from 'react';

const LANGUAGES = ['Hindi + English', 'Hindi', 'English', 'Marathi', 'Gujarati', 'Tamil'];

interface LanguageChipsProps {
  value: string;
  onChange: (lang: string) => void;
}

export function LanguageChips({ value, onChange }: LanguageChipsProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Language preference"
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}
    >
      {LANGUAGES.map((lang) => {
        const isActive = value === lang;
        return (
          <button
            key={lang}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(lang)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.3rem 0.875rem',
              borderRadius: 9999,
              border: `1.5px solid ${isActive ? 'var(--indigo)' : 'var(--line)'}`,
              background: isActive ? 'var(--indigo-light)' : 'transparent',
              color: isActive ? 'var(--indigo)' : 'var(--muted)',
              fontFamily: 'var(--font-body)',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {lang}
          </button>
        );
      })}
    </div>
  );
}
