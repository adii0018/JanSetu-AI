import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { playTick } from '../../utils/sounds';

const PRIMARY_LANGS = ['English', 'Hindi',];

const OTHER_LANGS = [
  'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese'
];

interface LanguageChipsProps {
  value: string;
  onChange: (lang: string) => void;
}

export function LanguageChips({ value, onChange }: LanguageChipsProps) {
  const isPrimary = PRIMARY_LANGS.includes(value);
  const [showMore, setShowMore] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        {/* Primary Quick Chips */}
        {PRIMARY_LANGS.map((lang) => {
          const isActive = value === lang;
          return (
            <button
              key={lang}
              type="button"
              onClick={() => {
                playTick();
                onChange(lang);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.95rem',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${isActive ? 'var(--navy-deep)' : 'var(--border)'}`,
                background: isActive ? 'var(--navy-deep)' : 'var(--chip-bg)',
                color: isActive ? '#FFFFFF' : 'var(--ink)',
                fontFamily: 'var(--font-body)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 14px rgba(22, 41, 79, 0.25)' : 'none',
                transition: 'all 160ms ease',
              }}
            >
              {isActive && <Check size={12} strokeWidth={3} />}
              {lang}
            </button>
          );
        })}

        {/* Selected custom regional language chip if chosen */}
        {!isPrimary && (
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--navy-deep)',
              background: 'var(--navy-deep)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              boxShadow: '0 4px 14px rgba(22, 41, 79, 0.25)',
            }}
          >
            <Check size={12} strokeWidth={3} />
            {value}
          </button>
        )}

        {/* Toggle + More Languages */}
        <button
          type="button"
          onClick={() => {
            playTick();
            setShowMore(!showMore);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border)',
            background: showMore ? 'var(--navy-tint)' : 'var(--chip-bg)',
            color: 'var(--ink-soft)',
            fontSize: '0.78125rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 160ms ease',
          }}
        >
          <Globe size={13} />
          <span>{showMore ? 'Less' : '+ More Languages'}</span>
          <ChevronDown size={13} style={{ transform: showMore ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
        </button>
      </div>

      {/* Collapsible Regional Languages Panel */}
      {showMore && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
            padding: '0.75rem 0.95rem',
            background: 'var(--navy-tint)',
            borderRadius: 16,
            border: '1px solid var(--border)',
          }}
        >
          {OTHER_LANGS.map((lang) => {
            const isActive = value === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  playTick();
                  onChange(lang);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${isActive ? 'var(--navy-deep)' : 'var(--border)'}`,
                  background: isActive ? 'var(--navy-deep)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : 'var(--ink)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.78125rem',
                  cursor: 'pointer',
                }}
              >
                {lang}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
