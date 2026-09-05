import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';
import { Badge, urgencyVariant } from '../ui/Badge';
import { ResultStamp } from './ResultStamp';
import { TTSReader } from '../ui/TTSReader';
import type { Complaint } from '../../services/types';
import { playClick } from '../../utils/sounds';

interface ConsoleState {
  phase: 'idle' | 'thinking' | 'done' | 'error';
  lines: string[];
  result: Complaint | null;
  errorMsg: string | null;
}

interface AiConsoleProps {
  state: ConsoleState;
}

const PROCESSING_LINES = [
  '▸ Receiving input payload…',
  '▸ Normalising text encoding (UTF-8)…',
  '▸ Detecting category via NLP classifier…',
  '▸ Estimating urgency score…',
  '▸ Tagging geographic location…',
  '▸ Correlating with infra & budget data…',
  '▸ Computing priority weight…',
  '▸ Writing to demand database…',
];

function useTypingLines(
  phase: ConsoleState['phase'],
  result: Complaint | null
): string[] {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (phase === 'idle') {
      setVisibleLines([]);
      indexRef.current = 0;
      return;
    }

    if (phase === 'thinking') {
      setVisibleLines([]);
      indexRef.current = 0;

      const showNext = () => {
        const i = indexRef.current;
        if (i >= PROCESSING_LINES.length) return;
        setVisibleLines((prev) => [...prev, PROCESSING_LINES[i]]);
        indexRef.current = i + 1;
        timerRef.current = setTimeout(showNext, 380);
      };
      timerRef.current = setTimeout(showNext, 180);
    }

    if (phase === 'done' && result) {
      // Show final reconciled lines
      setVisibleLines([
        ...PROCESSING_LINES,
        `  → Category: ${result.category}`,
        `  → Urgency score: ${result.urgency}/100`,
        `  → Confidence: ${result.confidence}%`,
        `✓ Added to demand database`,
      ]);
    }

    if (phase === 'error') {
      setVisibleLines(['✗ API error — see error state below.']);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, result]);

  return visibleLines;
}

export function AiConsole({ state }: AiConsoleProps) {
  const { phase, result, errorMsg } = state;
  const visibleLines = useTypingLines(phase, result);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLines]);

  const handleCopyId = () => {
    if (!result?.tracking_id) return;
    playClick();
    navigator.clipboard.writeText(result.tracking_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isThinking = phase === 'thinking';

  return (
    <div
      style={{
        background: '#132517',
        border: '1.5px solid rgba(111, 191, 115, 0.3)',
        borderRadius: 20,
        padding: '1.25rem',
        boxShadow: '0 12px 36px rgba(19, 37, 23, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minHeight: 460,
        color: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '0.875rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} color="var(--leaf)" aria-hidden="true" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78125rem',
              color: 'var(--leaf-light)',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            AI Reasoning — live trace
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {isThinking && (
            <span style={{ fontSize: '0.72rem', color: 'var(--leaf)', fontFamily: 'var(--font-mono)' }}>
              Executing AI Pipeline…
            </span>
          )}
          <div
            aria-label="Processing Status"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isThinking ? 'var(--leaf)' : phase === 'done' ? '#4ADE80' : 'rgba(255,255,255,0.3)',
              boxShadow: isThinking ? '0 0 10px #6FBF73' : 'none',
            }}
          />
        </div>
      </div>

      {/* Console body */}
      <div
        style={{
          flex: 1,
          maxHeight: 220,
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          lineHeight: 1.8,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          paddingRight: '0.25rem',
        }}
      >
        {phase === 'idle' && (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontSize: '0.875rem' }}>
            ⚡ Enter a complaint on the left to see live AI classification &amp; priority scoring trace…
          </div>
        )}

        {phase === 'error' && errorMsg && (
          <div
            role="alert"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              padding: '0.875rem 1rem',
              background: 'rgba(214,69,69,0.18)',
              border: '1px solid rgba(214,69,69,0.35)',
              borderRadius: 12,
              color: '#FF9E9E',
            }}
          >
            <span style={{ fontWeight: 600 }}>✗ Submission failed</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{errorMsg}</span>
          </div>
        )}

        {(phase === 'thinking' || phase === 'done') &&
          visibleLines.map((line, i) => {
            const isSuccess = line.startsWith('✓');
            const isResult = line.startsWith('  →');
            return (
              <div
                key={i}
                style={{
                  color: isSuccess
                    ? '#4ADE80'
                    : isResult
                    ? 'var(--leaf-pale)'
                    : 'rgba(255,255,255,0.55)',
                  fontWeight: isSuccess ? 600 : 400,
                }}
              >
                {line}
              </div>
            );
          })}

        <div ref={bottomRef} />
      </div>

      {/* Result reveal */}
      {phase === 'done' && result && (
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fade-slide-up 300ms ease forwards',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <ResultStamp visible={true} />

            {/* Badges */}
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              <Badge variant="ok">{result.category}</Badge>
              <Badge variant={urgencyVariant(result.urgency)}>
                Urgency {result.urgency}/100
              </Badge>
            </div>
          </div>

          {/* Tracking ID Copy Box */}
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(111,191,115,0.2)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: '0.06em',
                }}
              >
                OFFICIAL TRACKING ID
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--leaf-light)',
                  letterSpacing: '0.05em',
                  marginTop: 2,
                }}
              >
                {result.tracking_id}
              </div>
            </div>

            <button
              onClick={handleCopyId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                background: copied ? 'var(--moss)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>

          {/* AI Voice Reader */}
          <div>
            {(() => {
              const isEnglish = result.language?.toLowerCase().includes('english') && !result.language?.toLowerCase().includes('hindi');
              const ttsText = isEnglish
                ? `Your complaint regarding ${result.category} has been successfully logged. Your tracking ID is ${result.tracking_id}. Our AI priority engine has queued it for action.`
                : `Aapki ${result.category} ki shikayat darj kar li gayi hai. Aapka tracking ID ${result.tracking_id} hai. Hum jald hi iska samadhan karenge.`;
              return (
                <TTSReader
                  text={ttsText}
                  defaultLang={isEnglish ? 'en-IN' : 'hi-IN'}
                />
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export type { ConsoleState };
