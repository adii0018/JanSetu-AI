import React from 'react';
import { playTick } from '../../utils/sounds';

const LANGUAGES = [
  'Hindi + English', 'Hindi', 'English', 'Marathi', 'Gujarati', 
  'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Malayalam', 'Punjabi'
];

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
            onClick={() => {
              playTick();
              onChange(lang);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.3rem 0.875rem',
              borderRadius: 'var(--radius-pill)',
              border: `1.5px solid ${isActive ? 'var(--moss)' : 'var(--border)'}`,
              background: isActive ? 'var(--leaf-pale)' : '#fff',
              color: isActive ? 'var(--moss)' : 'var(--ink-soft)',
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
