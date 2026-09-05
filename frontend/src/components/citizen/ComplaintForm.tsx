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
    <div className="card" style={{ background: '#FFFFFF', borderRadius: 20, padding: '1.5rem', border: '1px solid var(--border)' }}>
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Header Feature Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.875rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>
              Unified Multi-Modal Intake
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--ink-soft)' }}>
              Type text or speak using voice in any Indian language
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'var(--leaf-pale)', color: 'var(--deep-moss)', padding: '0.25rem 0.55rem', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Edit3 size={10} /> TEXT
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'var(--leaf-pale)', color: '#D97706', padding: '0.25rem 0.55rem', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Mic size={10} /> VOICE
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#E7FCE9', color: '#128C7E', padding: '0.25rem 0.55rem', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <MessageCircle size={10} /> BOT
            </span>
          </div>
        </div>

        {/* 1. Language Chips */}
        <div>
          <label style={labelStyle}>Preferred Language</label>
          <LanguageChips value={language} onChange={setLanguage} />
        </div>

        {/* 2. Ward Select Grouped by State/City */}
        <div>
          <label htmlFor="ward-select" style={labelStyle}>Your City Ward / Location (Pan-India)</label>
          {wardsLoading ? (
            <SkeletonLine />
          ) : wardsError ? (
            <ErrorState message={wardsError} onRetry={loadWards} compact />
          ) : (
            <div style={{ position: 'relative' }}>
              <select
                id="ward-select"
                value={wardId}
                onChange={(e) => setWardId(e.target.value ? Number(e.target.value) : '')}
                style={{ ...inputStyle, paddingRight: '2.5rem', cursor: 'pointer' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--moss)'; e.target.style.boxShadow = '0 0 0 3px rgba(111,191,115,0.25)'; }}
                onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">🤖 AI Auto-Detect Location from Text (e.g. Rajwada, Andheri, CP, Whitefield)</option>
                {Object.entries(
                  wards.reduce<Record<string, Ward[]>>((acc, w) => {
                    const parts = w.name.split(' - ');
                    const groupName = parts.length > 1 ? parts[0] : 'Other Regions';
                    if (!acc[groupName]) acc[groupName] = [];
                    acc[groupName].push(w);
                    return acc;
                  }, {})
                ).map(([group, groupWards]) => (
                  <optgroup key={group} label={`📍 ${group}`}>
                    {groupWards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown
                size={16}
                aria-hidden="true"
                style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)', pointerEvents: 'none' }}
              />
            </div>
          )}
        </div>

        {/* 3. Multi-Modal Problem Description Box */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label htmlFor="complaint-text" style={{ ...labelStyle, marginBottom: 0 }}>
              Describe the problem (Type or Speak)
            </label>

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleListening}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.75rem',
                borderRadius: 20,
                background: isListening ? '#C0392B' : 'var(--leaf-pale)',
                border: isListening ? '1.5px solid #C0392B' : '1px solid var(--leaf-light)',
                color: isListening ? '#FFFFFF' : 'var(--deep-moss)',
                fontWeight: 600,
                fontSize: '0.78125rem',
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              <span>{isListening ? 'Stop Recording' : 'Dictate with Voice'}</span>
            </button>
          </div>

          {/* Real-time Listening Waveform Visualizer */}
          {isListening && (
            <div
              style={{
                padding: '0.625rem 1rem',
                background: 'rgba(192, 57, 43, 0.08)',
                border: '1px solid rgba(192, 57, 43, 0.3)',
                borderRadius: 12,
                marginBottom: '0.625rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#C0392B', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#C0392B', animation: 'pulse 0.8s infinite' }} />
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
                      background: '#C0392B',
                      animation: `pulse 0.6s infinite ease-in-out alternate ${idx * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick-Fill Sample Chips */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
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
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 14,
                  background: 'var(--leaf-pale)',
                  border: '1px solid var(--leaf-light)',
                  color: 'var(--deep-moss)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 150ms ease',
                }}
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
            placeholder="Type your complaint here, or tap the 'Dictate with Voice' microphone button above to speak in Hindi/Hinglish/English…"
            required
            minLength={10}
            maxLength={2000}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--moss)'; e.target.style.boxShadow = '0 0 0 3px rgba(111,191,115,0.25)'; }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '0.25rem' }}>
            <span>{usedVoice ? '🎙️ Speech transcribed into text' : '✍️ Text input active'}</span>
            <span>{text.length}/2000</span>
          </div>
        </div>

        {/* 4. WhatsApp Bot Intake Banner */}
        <div
          style={{
            padding: '0.875rem 1.125rem',
            background: '#E7FCE9',
            borderRadius: 14,
            border: '1px solid #25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#128C7E', fontSize: '0.84375rem' }}>
                Prefer WhatsApp? Chat with Bot (+91 88000 01915)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#075E54' }}>
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
              padding: '0.35rem 0.75rem',
              borderRadius: 16,
              background: '#128C7E',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Launch WhatsApp →
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary"
          disabled={!isReady}
          style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '0.25rem' }}
        >
          {submitting && <Loader2 size={16} aria-hidden="true" style={{ animation: 'spin 0.8s linear infinite' }} />}
          {submitting ? 'Submitting…' : 'Submit complaint →'}
        </button>
      </form>
    </div>
  );
}
