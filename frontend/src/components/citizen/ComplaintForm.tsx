import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronDown, Mic, MicOff, MessageCircle, Sparkles, Edit3, Volume2 } from 'lucide-react';
import { LanguageChips } from './LanguageChips';
import { getWards, submitComplaint } from '../../services/api';
import type { Ward, Complaint, Channel } from '../../services/types';
import type { ConsoleState } from './AiConsole';
import { ErrorState } from '../ui/ErrorState';
import { playClick, playSubmit, playSuccess, playError } from '../../utils/sounds';

interface ComplaintFormProps {
  onConsoleUpdate: (state: ConsoleState) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-control)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  color: 'var(--ink)',
  background: '#fff',
  appearance: 'none',
  outline: 'none',
  transition: 'border-color 160ms ease, box-shadow 160ms ease',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: 'var(--ink)',
  marginBottom: '0.5rem',
};

function SkeletonLine({ width = '100%', height = 42 }: { width?: string; height?: number }) {
  return <div className="skeleton" style={{ height, width, borderRadius: 10 }} />;
}

export function ComplaintForm({ onConsoleUpdate }: ComplaintFormProps) {
  const [language, setLanguage] = useState('Hindi + English');
  const [wardId, setWardId] = useState<number | ''>('');
  const [text, setText] = useState('');
  const [usedVoice, setUsedVoice] = useState(false);
  const [wards, setWards] = useState<Ward[]>([]);
  const [wardsLoading, setWardsLoading] = useState(true);
  const [wardsError, setWardsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [showManualWard, setShowManualWard] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      const LANG_MAP: Record<string, string> = {
        'Hindi + English': 'hi-IN',
        'Hindi': 'hi-IN',
        'English': 'en-IN',
        'Marathi': 'mr-IN',
        'Gujarati': 'gu-IN',
        'Tamil': 'ta-IN',
        'Telugu': 'te-IN',
        'Bengali': 'bn-IN',
        'Kannada': 'kn-IN',
        'Malayalam': 'ml-IN',
        'Punjabi': 'pa-IN',
      };
      rec.lang = LANG_MAP[language] || 'hi-IN';
      rec.onresult = (event: any) => {
        let t = '';
        for (let i = 0; i < event.results.length; i++) t += event.results[i][0].transcript;
        if (t.trim()) {
          setText(t);
          setUsedVoice(true);
        }
      };
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      setRecognitionInstance(rec);
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }
  }, [language]);

  const toggleListening = () => {
    playClick();
    if (!recognitionInstance) {
      alert('Voice dictation requires Chrome or Edge browser.');
      return;
    }
    if (isListening) {
      try { recognitionInstance.stop(); } catch { /* ignore */ }
      setIsListening(false);
    } else {
      try {
        recognitionInstance.start();
        setIsListening(true);
        setUsedVoice(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const loadWards = useCallback(async () => {
    setWardsLoading(true); setWardsError(null);
    try { setWards(await getWards()); } catch { setWardsError('Could not load wards.'); } finally { setWardsLoading(false); }
  }, []);

  useEffect(() => { loadWards(); }, [loadWards]);

  const isReady = text.trim().length >= 10 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;
    playSubmit();
    if (isListening && recognitionInstance) {
      try { recognitionInstance.stop(); } catch { /* ignore */ }
      setIsListening(false);
    }
    setSubmitting(true);
    onConsoleUpdate({ phase: 'thinking', lines: [], result: null, errorMsg: null });

    const channel: Channel = usedVoice ? 'voice' : 'text';

    try {
      const result: Complaint = await submitComplaint({
        ward_id: wardId ? (wardId as number) : 0,
        raw_text: text.trim(),
        language,
        channel,
      });
      playSuccess();
      onConsoleUpdate({ phase: 'done', lines: [], result, errorMsg: null });
    } catch (err: unknown) {
      playError();
      onConsoleUpdate({ phase: 'error', lines: [], result: null, errorMsg: err instanceof Error ? err.message : 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="card intake-card-wrapper"
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-card)',
        padding: '1.75rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Accent Bar */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, var(--navy-deep) 0%, var(--navy) 50%, var(--saffron) 100%)',
        }}
      />

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
        
        {/* Header Feature Badges & Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'var(--navy-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-primary)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={22} color="#FFFFFF" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--navy-deep)', letterSpacing: '-0.02em' }}>
                  Unified Multi-Modal Intake
                </span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    background: 'var(--saffron-pale)',
                    color: 'var(--saffron-deep)',
                    border: '1px solid var(--saffron-light)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--saffron)', animation: 'pulse 1.5s infinite' }} />
                  AI Engine Live
                </span>
              </div>
              <div style={{ fontSize: '0.78125rem', color: 'var(--ink-soft)', marginTop: 2, fontWeight: 500 }}>
                Multilingual Voice, Text & WhatsApp Intake across 28 States & 8 UTs
              </div>
            </div>
          </div>

          {/* Intake Channel Badges */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--chip-bg)', color: 'var(--navy-deep)', border: '1px solid var(--border)', padding: '0.3rem 0.65rem', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Edit3 size={11} color="var(--navy-deep)" /> TEXT
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--saffron-pale)', color: 'var(--saffron-deep)', border: '1px solid var(--saffron-light)', padding: '0.3rem 0.65rem', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Mic size={11} color="var(--saffron-deep)" /> VOICE
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--navy-tint)', color: 'var(--navy-deep)', border: '1px solid var(--border)', padding: '0.3rem 0.65rem', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MessageCircle size={11} color="var(--navy-deep)" /> WHATSAPP BOT
            </span>
          </div>
        </div>

        {/* 1. Language Chips */}
        <div>
          <label style={labelStyle}>Preferred Language</label>
          <LanguageChips value={language} onChange={setLanguage} />
        </div>

        {/* 2. Multi-Modal Problem Description Box */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label htmlFor="complaint-text" style={{ ...labelStyle, marginBottom: 0 }}>
              Describe the problem (Type or Speak)
            </label>

            {/* Mic Toggle Button (Saffron Accent, 0 6px 16px rgba(240,134,46,0.35)) */}
            <button
              type="button"
              onClick={toggleListening}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1.05rem',
                borderRadius: 'var(--radius-pill)',
                background: isListening ? '#DC2626' : 'var(--saffron)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                boxShadow: isListening
                  ? '0 0 0 3px rgba(220, 38, 38, 0.25), 0 4px 14px rgba(220, 38, 38, 0.4)'
                  : 'var(--shadow-secondary)',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isListening ? '#B91C1C' : 'var(--saffron-deep)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isListening ? '#DC2626' : 'var(--saffron)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isListening ? (
                <>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      boxShadow: '0 0 0 2px rgba(255,255,255,0.4)',
                      animation: 'pulse 1s infinite',
                    }}
                  />
                  <MicOff size={14} />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic size={14} color="#FFFFFF" />
                  <span>Dictate with Voice</span>
                </>
              )}
            </button>
          </div>

          {/* Real-time Listening Waveform Visualizer */}
          {isListening && (
            <div
              style={{
                padding: '0.625rem 1rem',
                background: 'var(--saffron-pale)',
                border: '1px solid var(--saffron-light)',
                borderRadius: 14,
                marginBottom: '0.625rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--saffron-deep)', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--saffron)', animation: 'pulse 0.8s infinite' }} />
                🔴 Listening… speak naturally in your language
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {[0.4, 0.9, 0.5, 1.0, 0.6, 0.8, 0.4].map((h, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: 3,
                      height: 16 * h,
                      borderRadius: 2,
                      background: 'var(--saffron-deep)',
                      animation: `pulse 0.6s infinite ease-in-out alternate ${idx * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick-Fill Sample Chips */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
            {[
              '💧 10 din se paani nahi aa raha',
              '🛣️ Potholes near school causing accidents',
              '⚡ Electric wire sparking on main road',
              '🧹 Drainage overflow near market area',
            ].map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  playClick();
                  const cleanSample = sample.replace(/^[^a-zA-Z0-9\u0900-\u097F]+/, '').trim();
                  setText(cleanSample);
                  setUsedVoice(false);
                }}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--chip-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 160ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--saffron-pale)'; e.currentTarget.style.borderColor = 'var(--saffron-light)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--chip-bg)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {sample}
              </button>
            ))}
          </div>

          <textarea
            id="complaint-text"
            rows={5}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setUsedVoice(false);
            }}
            placeholder="Type your complaint here, or tap the 'Dictate with Voice' button to speak in Hindi/Hinglish/English…"
            required
            minLength={10}
            maxLength={2000}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 125, borderRadius: 16 }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--navy-deep)'; e.target.style.boxShadow = '0 0 0 3px rgba(22,41,79,0.15)'; }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem', color: 'var(--ink-soft)', marginTop: '0.35rem', fontWeight: 500 }}>
            <span>{usedVoice ? '🎙️ Speech transcribed into text' : '✍️ Text input active'}</span>
            <span>{text.length}/2000</span>
          </div>
        </div>

        {/* 3. Secondary Panel: WhatsApp Bot Intake Banner (#F0F3FA) */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--navy-tint)',
            borderRadius: 16,
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--navy-deep)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)', flexShrink: 0 }}>
              <MessageCircle size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--navy-deep)', fontSize: '0.875rem' }}>
                Prefer WhatsApp? Chat with Bot (+91 88000 01915)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 500 }}>
                Send voice notes or messages directly on WhatsApp — zero app download required.
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/918800001915?text=Hi%20JanSetu%20I%20want%20to%20file%20a%20complaint"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClick()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--navy-deep)',
              color: '#FFFFFF',
              fontSize: '0.78125rem',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-primary)',
              transition: 'all 160ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--navy)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--navy-deep)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Launch WhatsApp →
          </a>
        </div>

        {/* Primary CTA Submit Button (Navy Deep, Pill, 0 10px 26px rgba(22,41,79,0.3)) */}
        <button
          type="submit"
          className="btn-primary"
          disabled={!isReady}
          style={{
            width: '100%',
            padding: '0.95rem',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-pill)',
            background: isReady ? 'var(--navy-deep)' : 'var(--chip-bg)',
            color: isReady ? '#FFFFFF' : 'var(--ink-soft)',
            boxShadow: isReady ? 'var(--shadow-primary)' : 'none',
            cursor: isReady ? 'pointer' : 'not-allowed',
            marginTop: '0.25rem',
            transition: 'all 200ms ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => {
            if (isReady) {
              e.currentTarget.style.background = 'var(--navy)';
              e.currentTarget.style.boxShadow = '0 14px 32px rgba(22, 41, 79, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (isReady) {
              e.currentTarget.style.background = 'var(--navy-deep)';
              e.currentTarget.style.boxShadow = 'var(--shadow-primary)';
            }
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={18} aria-hidden="true" style={{ animation: 'spin 0.8s linear infinite' }} />
              <span>Analyzing & Submitting Complaint…</span>
            </>
          ) : (
            <>
              <Sparkles size={18} color={isReady ? 'var(--saffron)' : 'var(--ink-soft)'} />
              <span>Submit Complaint →</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
