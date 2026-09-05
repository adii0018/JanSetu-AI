import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronDown, Mic, MicOff } from 'lucide-react';
import { ModeSelector } from './ModeSelector';
import type { InputMode } from './ModeSelector';
import { LanguageChips } from './LanguageChips';
import { getWards, submitComplaint } from '../../services/api';
import type { Ward, Complaint } from '../../services/types';
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
  const [mode, setMode] = useState<InputMode>('text');
  const [language, setLanguage] = useState('Hindi + English');
  const [wardId, setWardId] = useState<number | ''>('');
  const [text, setText] = useState('');
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
      };
      rec.lang = LANG_MAP[language] || 'hi-IN';
      rec.onresult = (event: any) => {
        let t = '';
        for (let i = 0; i < event.results.length; i++) t += event.results[i][0].transcript;
        if (t.trim()) setText(t);
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
    if (!recognitionInstance) { alert('Use Chrome or Edge for voice.'); return; }
    if (isListening) {
      try { recognitionInstance.stop(); } catch { /* ignore */ }
      setIsListening(false);
    } else {
      try { recognitionInstance.start(); setIsListening(true); } catch (err) { console.error(err); }
    }
  };

  const loadWards = useCallback(async () => {
    setWardsLoading(true); setWardsError(null);
    try { setWards(await getWards()); } catch { setWardsError('Could not load wards.'); } finally { setWardsLoading(false); }
  }, []);

  useEffect(() => { loadWards(); }, [loadWards]);

  const isReady = (mode === 'text' || mode === 'voice') && text.trim().length >= 10 && wardId !== '' && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;
    playSubmit();
    if (isListening && recognitionInstance) { try { recognitionInstance.stop(); } catch { /* ignore */ } setIsListening(false); }
    setSubmitting(true);
    onConsoleUpdate({ phase: 'thinking', lines: [], result: null, errorMsg: null });
    try {
      const result: Complaint = await submitComplaint({ ward_id: wardId as number, raw_text: text.trim(), language, channel: mode === 'voice' ? 'voice' : 'text' });
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
    <div className="card">
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Input channel */}
        <div>
          <label style={labelStyle} id="mode-label">Input channel</label>
          <ModeSelector value={mode} onChange={setMode} />
        </div>

        {mode === 'whatsapp' ? (
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--leaf-pale)',
              borderRadius: 16,
              border: '1px solid var(--leaf-light)',
              textAlign: 'center',
              color: 'var(--ink-soft)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
            }}
          >
            WhatsApp channel coming soon — switch to <strong style={{ color: 'var(--moss)' }}>Text</strong> or <strong style={{ color: 'var(--moss)' }}>Voice</strong> to submit today.
          </div>
        ) : (
          <>
            {/* Language */}
            <div>
              <label style={labelStyle}>Language</label>
              <LanguageChips value={language} onChange={setLanguage} />
            </div>

            {/* Voice widget */}
            {mode === 'voice' && (
              <div
                style={{
                  padding: '1.5rem',
                  background: 'var(--leaf-pale)',
                  border: '1.5px solid var(--leaf-light)',
                  borderRadius: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                  {isListening
                    ? '🔴 Listening… speak your complaint clearly'
                    : 'Tap microphone to record your complaint'}
                </div>

                <button
                  type="button"
                  onClick={toggleListening}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    background: isListening ? '#C0392B' : 'var(--deep-moss)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isListening
                      ? '0 0 0 10px rgba(192,57,43,0.18)'
                      : '0 8px 28px rgba(31,58,36,0.32)',
                    transition: 'all 220ms ease',
                  }}
                >
                  {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                </button>

                <div style={{ fontSize: '0.8125rem', color: 'var(--ink-soft)' }}>
                  {isListening ? 'Transcribing in real time…' : speechSupported ? 'Hindi · Hinglish · English' : 'Use Chrome or Edge for best results'}
                </div>
              </div>
            )}

            {/* Ward select */}
            <div>
              <label htmlFor="ward-select" style={labelStyle}>Your ward / area</label>
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
                    required
                    style={{ ...inputStyle, paddingRight: '2.5rem', cursor: 'pointer' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--moss)'; e.target.style.boxShadow = '0 0 0 3px rgba(111,191,115,0.25)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  >
                    <option value="">Select your ward…</option>
                    {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)', pointerEvents: 'none' }}
                  />
                </div>
              )}
            </div>

            {/* Complaint textarea */}
            <div>
              <label htmlFor="complaint-text" style={labelStyle}>Describe the problem</label>
              <textarea
                id="complaint-text"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Hamare mohalle mein 10 din se paani ki supply nahi aa rahi… / The road near school has broken patches…"
                required
                minLength={10}
                maxLength={2000}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--moss)'; e.target.style.boxShadow = '0 0 0 3px rgba(111,191,115,0.25)'; }}
                onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '0.25rem' }}>
                {text.length}/2000
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={!isReady}
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
            >
              {submitting && <Loader2 size={16} aria-hidden="true" style={{ animation: 'spin 0.8s linear infinite' }} />}
              {submitting ? 'Submitting…' : 'Submit complaint →'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
