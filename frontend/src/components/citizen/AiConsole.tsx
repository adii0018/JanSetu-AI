import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';
import { Badge, urgencyVariant } from '../ui/Badge';
import { ResultStamp } from './ResultStamp';
import { TTSReader } from '../ui/TTSReader';
import type { Complaint } from '../../services/types';

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
        timerRef.current = setTimeout(showNext, 420);
      };
      timerRef.current = setTimeout(showNext, 200);
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLines]);

  const isThinking = phase === 'thinking';

  return (
    <div
      className="card-dark"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 460 }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '0.875rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={15} color="var(--saffron)" aria-hidden="true" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            AI Reasoning — live trace
          </span>
        </div>
        {isThinking && (
          <div
            aria-label="Processing"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--teal)',
              animation: 'pulse-dot 1.5s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* Console body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          lineHeight: 1.8,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {phase === 'idle' && (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
            Waiting for a request…
          </span>
        )}

        {phase === 'error' && errorMsg && (
          <div
            role="alert"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(214,69,69,0.15)',
              border: '1px solid rgba(214,69,69,0.3)',
              borderRadius: 'var(--control-radius)',
              color: '#ff9e9e',
            }}
          >
            <span>✗ Submission failed</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{errorMsg}</span>
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
                    ? '#4ade80'
                    : isResult
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(255,255,255,0.45)',
                  fontWeight: isSuccess ? 600 : 400,
                  animation: 'fade-slide-up 200ms ease forwards',
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
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
          }}
        >
          <ResultStamp visible={true} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.04em',
              }}
            >
              TRACKING ID
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--saffron)',
                letterSpacing: '0.05em',
              }}
            >
              {result.tracking_id}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge variant="indigo">{result.category}</Badge>
            <Badge variant={urgencyVariant(result.urgency)}>
              Urgency {result.urgency}/100
            </Badge>
          </div>

          {/* NVIDIA TTS Voice Reader */}
          <div style={{ marginTop: '0.5rem' }}>
            <TTSReader
              text={`Aapki shikayat darj kar li gayi hai. Tracking ID ${result.tracking_id}. Category: ${result.category}. Details: ${result.raw_text}`}
              defaultLang="hi-IN"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export type { ConsoleState };
