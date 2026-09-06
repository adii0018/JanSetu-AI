import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ChevronDown, Mic, MicOff, MessageCircle, Sparkles, Edit3, Send, Bot, User as UserIcon, CheckCircle2, Volume2, Globe } from 'lucide-react';
import { LanguageChips } from './LanguageChips';
import { getWards, submitComplaint } from '../../services/api';
import type { Ward, Complaint, Channel } from '../../services/types';
import type { ConsoleState } from './AiConsole';
import { ErrorState } from '../ui/ErrorState';
import { playClick, playSubmit, playSuccess, playError } from '../../utils/sounds';
import { useAuth } from '../../context/AuthContext';

interface ComplaintFormProps {
  onConsoleUpdate: (state: ConsoleState) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1.1rem',
  border: '1.5px solid rgba(18, 53, 36, 0.12)',
  borderRadius: 20,
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  color: 'var(--ink)',
  background: '#FFFFFF',
  appearance: 'none',
  outline: 'none',
  transition: 'all 200ms ease',
};

export function ComplaintForm({ onConsoleUpdate }: ComplaintFormProps) {
  const { user } = useAuth();
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
        user_id: user?.id,
        user_email: user?.email,
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
      style={{
        background: '#FFFFFF',
        borderRadius: 28,
        border: '1px solid rgba(18, 53, 36, 0.12)',
        boxShadow: '0 16px 45px rgba(18, 53, 36, 0.08), 0 2px 10px rgba(0, 0, 0, 0.02)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Top Chat Header Bar ───────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #123524 0%, #1F3A24 50%, #2E6B3E 100%)',
          padding: '1.25rem 1.6rem',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* AI Avatar with Pulse Indicator */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #25D366 0%, #6FBF73 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
              }}
            >
              <Bot size={24} color="#123524" />
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#25D366',
                border: '2px solid #123524',
                boxShadow: '0 0 8px #25D366',
              }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FFFFFF', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              JanSetu AI Civic Assistant
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  background: 'rgba(37, 211, 102, 0.25)',
                  color: '#C9EAC7',
                  border: '1px solid rgba(37, 211, 102, 0.4)',
                  padding: '0.12rem 0.55rem',
                  borderRadius: 100,
                  textTransform: 'uppercase',
                }}
              >
                LIVE CHAT
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(201, 234, 199, 0.88)', marginTop: 2 }}>
              Speak or type in your language — AI automatically categorizes & routes your issue.
            </div>
          </div>
        </div>

        {/* Top Channel Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.12)', color: '#FFFFFF', padding: '0.3rem 0.7rem', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
            💬 Multilingual Chat
          </span>
        </div>
      </div>

      {/* ── Chat Body & Conversation Thread ─────────────────────────── */}
      <div style={{ padding: '1.5rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#F8FAFC' }}>
        
        {/* AI Assistant Opening Message Bubble */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(18, 53, 36, 0.2)',
            }}
          >
            <Sparkles size={17} color="#25D366" />
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '4px 20px 20px 20px',
              padding: '1rem 1.25rem',
              border: '1px solid rgba(18, 53, 36, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              maxWidth: '90%',
            }}
          >
            <div style={{ fontWeight: 750, fontSize: '0.85rem', color: '#123524', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              JanSetu AI
              <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748B' }}>• Just now</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.55 }}>
              Namaste! Main aapka civic AI assistant hoon. Apni samasya <b>voice me bole</b> ya <b>hindi/english me type kare</b>. Niche sample chips par tap karke bhi start kar sakte hain!
            </div>
          </div>
        </div>

        {/* Quick Sample Prompts as Interactive Chat Chips */}
        <div style={{ marginLeft: '2.75rem', display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
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
                fontSize: '0.78rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 100,
                background: '#FFFFFF',
                border: '1px solid rgba(18, 53, 36, 0.15)',
                color: '#123524',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'all 160ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F0FFF4';
                e.currentTarget.style.borderColor = '#25D366';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(18, 53, 36, 0.15)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Real-time Listening Waveform Visualizer Bubble */}
        {isListening && (
          <div style={{ marginLeft: '2.75rem' }}>
            <div
              style={{
                padding: '0.75rem 1.1rem',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.85rem', color: '#DC2626', fontWeight: 700 }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#DC2626', boxShadow: '0 0 10px #DC2626', animation: 'pulse 0.8s infinite' }} />
                🔴 Listening… speak naturally in your language
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {[0.4, 0.9, 0.5, 1.0, 0.6, 0.8, 0.4].map((h, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: 3.5,
                      height: 18 * h,
                      borderRadius: 2,
                      background: '#DC2626',
                      animation: `pulse 0.6s infinite ease-in-out alternate ${idx * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Language Selection Chips Bar */}
        <div style={{ marginLeft: '2.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Globe size={13} color="#25D366" /> Preferred Language:
          </div>
          <LanguageChips value={language} onChange={setLanguage} />
        </div>

        {/* ── Interactive Horizontal Chat Input Bar ──────────────────── */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              border: `2px solid ${isListening ? '#DC2626' : text.length > 0 ? '#123524' : 'rgba(18, 53, 36, 0.18)'}`,
              padding: '0.65rem 0.85rem 0.65rem 1.1rem',
              boxShadow: text.length > 0 ? '0 8px 24px rgba(18, 53, 36, 0.12)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
              transition: 'all 200ms ease',
            }}
          >
            <textarea
              id="complaint-text"
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setUsedVoice(false);
              }}
              placeholder="Type your complaint here, or tap the Mic button to speak in Hindi/English/local language…"
              required
              minLength={10}
              maxLength={2000}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: '#1E293B',
                resize: 'none',
              }}
            />

            {/* Input Action Controls Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', marginTop: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.9rem',
                    borderRadius: 100,
                    background: isListening ? '#DC2626' : 'linear-gradient(135deg, #F0862E 0%, #D97706 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: isListening ? '0 0 0 3px rgba(220, 38, 38, 0.25)' : '0 3px 12px rgba(240, 134, 46, 0.35)',
                    transition: 'all 180ms ease',
                  }}
                >
                  {isListening ? (
                    <>
                      <MicOff size={13} /> Stop Dictating
                    </>
                  ) : (
                    <>
                      <Mic size={13} /> Dictate Voice
                    </>
                  )}
                </button>

                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                  {usedVoice ? '🎙️ Speech Transcribed' : '✍️ Text Input'}
                </span>
              </div>

              {/* Chat Send Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>{text.length}/2000</span>

                <button
                  type="submit"
                  disabled={!isReady}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.25rem',
                    borderRadius: 100,
                    background: isReady ? 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)' : '#E2E8F0',
                    color: isReady ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    cursor: isReady ? 'pointer' : 'not-allowed',
                    boxShadow: isReady ? '0 4px 16px rgba(18, 53, 36, 0.3)' : 'none',
                    transition: 'all 200ms ease',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting…
                    </>
                  ) : (
                    <>
                      Send <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp Bot Quick Banner underneath */}
          <div
            style={{
              padding: '0.75rem 1.1rem',
              background: '#F0FDF4',
              borderRadius: 18,
              border: '1px solid #DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <MessageCircle size={18} color="#25D366" />
              <span style={{ fontSize: '0.8125rem', color: '#14532D', fontWeight: 600 }}>
                WhatsApp Bot Available: <b>+91 88000 01915</b>
              </span>
            </div>
            <a
              href="https://wa.me/918800001915?text=Hi%20JanSetu%20I%20want%20to%20file%20a%20complaint"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.78rem',
                fontWeight: 750,
                color: '#25D366',
                textDecoration: 'none',
              }}
            >
              Open WhatsApp →
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
