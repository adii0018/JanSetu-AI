import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronDown, Mic, MicOff } from 'lucide-react';
import { ModeSelector } from './ModeSelector';
import type { InputMode } from './ModeSelector';
import { LanguageChips } from './LanguageChips';
import { getWards, submitComplaint } from '../../services/api';
import type { Ward, Complaint } from '../../services/types';
import type { ConsoleState } from './AiConsole';
import { ErrorState, Skeleton } from '../ui/ErrorState';

interface ComplaintFormProps {
  onConsoleUpdate: (state: ConsoleState) => void;
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
      rec.lang = language.includes('Hindi') ? 'hi-IN' : 'en-IN';

      rec.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setText(currentTranscript);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      setRecognitionInstance(rec);
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionInstance) {
      alert('Speech recognition is not supported by your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      try {
        recognitionInstance.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        recognitionInstance.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const loadWards = useCallback(async () => {
    setWardsLoading(true);
    setWardsError(null);
    try {
      const data = await getWards();
      setWards(data);
    } catch {
      setWardsError('Could not load wards. Please refresh.');
    } finally {
      setWardsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWards();
  }, [loadWards]);

  const isReady = (mode === 'text' || mode === 'voice') && text.trim().length >= 10 && wardId !== '' && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;

    if (isListening && recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    setSubmitting(true);
    onConsoleUpdate({ phase: 'thinking', lines: [], result: null, errorMsg: null });

    try {
      const result: Complaint = await submitComplaint({
        ward_id: wardId as number,
        raw_text: text.trim(),
        language,
        channel: mode === 'voice' ? 'voice' : 'text',
      });
      onConsoleUpdate({ phase: 'done', lines: [], result, errorMsg: null });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      onConsoleUpdate({ phase: 'error', lines: [], result: null, errorMsg: msg });
    } finally {
      setSubmitting(false);
    }
  };


  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: 'var(--ink)',
    marginBottom: '0.375rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid var(--line)',
    borderRadius: 'var(--control-radius)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    color: 'var(--ink)',
    background: 'var(--panel)',
    appearance: 'none',
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  };

  return (
    <div className="card">
      {/* Page title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(1.35rem, 3vw, 1.75rem)',
            color: 'var(--ink)',
            lineHeight: 1.2,
            marginBottom: '0.5rem',
          }}
        >
          What needs attention in your area?
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', lineHeight: 1.55 }}>
          Speak, type, or send it exactly how you would to a neighbour.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Mode selector */}
        <div>
          <label style={labelStyle} id="mode-label">Input channel</label>
          <ModeSelector value={mode} onChange={setMode} />
        </div>

        {mode === 'whatsapp' ? (
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--saffron-light)',
              borderRadius: 'var(--control-radius)',
              border: '1px solid var(--line)',
              textAlign: 'center',
              color: 'var(--muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
            }}
          >
            WhatsApp channel is coming soon. Switch to <strong>Text</strong> or <strong>Voice</strong> to submit your complaint today.
          </div>
        ) : (
          <>
            {/* Language */}
            <div>
              <label style={labelStyle}>Language</label>
              <LanguageChips value={language} onChange={setLanguage} />
            </div>

            {/* Voice Recording Widget when mode === 'voice' */}
            {mode === 'voice' && (
              <div
                style={{
                  padding: '1.25rem',
                  background: 'var(--indigo-light)',
                  border: '1px solid var(--indigo)',
                  borderRadius: 'var(--control-radius)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 600 }}>
                  {isListening
                    ? '🔴 Listening… Speak your complaint clearly (NVIDIA / Web Voice ASR Active)'
                    : 'Click microphone to record your complaint by voice'}
                </div>

                <button
                  type="button"
                  onClick={toggleListening}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: isListening ? 'var(--coral)' : 'var(--indigo)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isListening
                      ? '0 0 0 8px rgba(224, 86, 36, 0.25)'
                      : '0 4px 14px rgba(45, 49, 142, 0.3)',
                    transition: 'all 200ms ease',
                  }}
                >
                  {isListening ? <MicOff size={28} /> : <Mic size={28} />}
                </button>

                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                  {isListening
                    ? 'Speak now… Transcribing in real time'
                    : speechSupported
                    ? 'Supported Languages: Hindi, Hinglish, English'
                    : 'Voice recording works best on Chrome / Edge browsers'}
                </div>
              </div>
            )}

            {/* Ward select */}
            <div>
              <label htmlFor="ward-select" style={labelStyle}>
                Your ward / area
              </label>
              {wardsLoading ? (
                <Skeleton height={42} />
              ) : wardsError ? (
                <ErrorState message={wardsError} onRetry={loadWards} compact />
              ) : (
                <div style={{ position: 'relative' }}>
                  <select
                    id="ward-select"
                    value={wardId}
                    onChange={(e) => setWardId(e.target.value ? Number(e.target.value) : '')}
                    required
                    style={{
                      ...inputStyle,
                      paddingRight: '2.5rem',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLSelectElement).style.borderColor = 'var(--indigo)';
                      (e.target as HTMLSelectElement).style.boxShadow = '0 0 0 3px var(--indigo-light)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLSelectElement).style.borderColor = 'var(--line)';
                      (e.target as HTMLSelectElement).style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select your ward…</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--muted)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Complaint textarea */}
            <div>
              <label htmlFor="complaint-text" style={labelStyle}>
                Describe the problem
              </label>
              <textarea
                id="complaint-text"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Hamare mohalle mein 10 din se paani ki supply nahi aa rahi… / The road near school has broken patches causing accidents…"
                required
                minLength={10}
                maxLength={2000}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: 110,
                }}
                onFocus={(e) => {
                  (e.target as HTMLTextAreaElement).style.borderColor = 'var(--indigo)';
                  (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px var(--indigo-light)';
                }}
                onBlur={(e) => {
                  (e.target as HTMLTextAreaElement).style.borderColor = 'var(--line)';
                  (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
                }}
              />
              <div
                style={{
                  textAlign: 'right',
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  marginTop: '0.25rem',
                }}
              >
                {text.length}/2000
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={!isReady}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem' }}
            >
              {submitting && (
                <Loader2
                  size={16}
                  aria-hidden="true"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />
              )}
              {submitting ? 'Submitting…' : 'Submit complaint'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
