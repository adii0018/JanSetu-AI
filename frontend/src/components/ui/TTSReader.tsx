import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2, Sparkles, Globe, FastForward } from 'lucide-react';
import { synthesizeTTS } from '../../services/api';
import { playClick, playTick } from '../../utils/sounds';

interface TTSReaderProps {
  text: string;
  defaultLang?: string;
  compact?: boolean;
  label?: string;
}

export const SUPPORTED_LANGS = [
  { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml-IN', label: 'Malayalam (മലയാളം)' },
  { code: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'en-IN', label: 'English' },
];

export const TTSReader: React.FC<TTSReaderProps> = ({
  text,
  defaultLang = 'hi-IN',
  compact = false,
  label = 'Suniye (Listen)',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<string>(defaultLang);
  const [speed, setSpeed] = useState<number>(1.0);
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const [isNvidiaEngine, setIsNvidiaEngine] = useState<boolean>(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop speech synthesis when component unmounts or text changes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  const handlePlayTTS = async () => {
    if (!text || !text.trim()) return;
    playClick();

    if (isPlaying) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    let textToSpeak = spokenText;

    try {
      // Call backend API powered by NVIDIA TTS key
      const res = await synthesizeTTS({
        text,
        language,
        speed,
      });

      if (res && res.spoken_text) {
        textToSpeak = res.spoken_text;
        setSpokenText(res.spoken_text);
        setIsNvidiaEngine(res.nvidia_active);
      }
    } catch (err) {
      console.warn('Backend TTS synthesis fallback to local synthesis:', err);
      textToSpeak = text;
      setIsNvidiaEngine(false);
    } finally {
      setIsLoading(false);
    }

    if (!textToSpeak) textToSpeak = text;

    // Use Web SpeechSynthesis API for natural audio output
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language;
      utterance.rate = speed;
      utterance.pitch = 1.0;

      // Select matching voice for Indian languages if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang.toLowerCase().includes(language.toLowerCase().slice(0, 2))
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error:', e);
        setIsPlaying(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      alert('Your browser does not support audio speech synthesis.');
    }
  };

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTick();
    const codes = SUPPORTED_LANGS.map((l) => l.code);
    const currIndex = codes.indexOf(language);
    const nextLang = codes[(currIndex + 1) % codes.length];
    setLanguage(nextLang);
    setSpokenText(null); // Reset cache for new language
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTick();
    const speeds = [0.8, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (isPlaying && utteranceRef.current) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const activeLangLabel = SUPPORTED_LANGS.find((l) => l.code === language)?.label || 'Hindi (हिन्दी)';

  if (compact) {
    return (
      <button
        onClick={handlePlayTTS}
        disabled={isLoading}
        title={isPlaying ? 'Stop Audio' : `Listen via Voice Reader (${activeLangLabel})`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.3rem 0.75rem',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.75rem',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          background: isPlaying ? 'var(--deep-moss)' : 'var(--leaf-pale)',
          color: isPlaying ? '#fff' : 'var(--moss)',
          border: '1px solid var(--leaf-light)',
          transition: 'all 180ms ease',
        }}
      >
        {isLoading ? (
          <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
        ) : isPlaying ? (
          <>
            <VolumeX size={13} />
            <span>Stop</span>
            <span style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 12, marginLeft: 4 }}>
              <span style={{ width: 2, height: 10, background: '#fff', animation: 'bounce 0.8s infinite 0ms' }} />
              <span style={{ width: 2, height: 12, background: '#fff', animation: 'bounce 0.8s infinite 150ms' }} />
              <span style={{ width: 2, height: 6, background: '#fff', animation: 'bounce 0.8s infinite 300ms' }} />
            </span>
          </>
        ) : (
          <>
            <Volume2 size={13} />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(18, 36, 22, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(111, 191, 115, 0.25)',
        borderRadius: 16,
        padding: '1rem 1.125rem',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              padding: '0.35rem',
              borderRadius: 8,
              background: 'rgba(111, 191, 115, 0.15)',
              color: 'var(--leaf)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Volume2 size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span>AI Voice Reader</span>
              {isNvidiaEngine && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: 'rgba(111, 191, 115, 0.2)',
                    color: '#6FBF73',
                    padding: '0.1rem 0.4rem',
                    borderRadius: 4,
                    border: '1px solid rgba(111, 191, 115, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={10} /> Smart Voice
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
              Spoken audio feedback in citizen's native language
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {/* Language Selector Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            title="Switch Spoken Language"
          >
            <Globe size={12} color="var(--leaf)" />
            <span>{activeLangLabel}</span>
          </button>

          {/* Speed Selector Button */}
          <button
            type="button"
            onClick={cycleSpeed}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            title="Speech Speed Multiplier"
          >
            <FastForward size={12} color="var(--leaf-light)" />
            <span>{speed}x</span>
          </button>
        </div>
      </div>

      {/* Main Play Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handlePlayTTS}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 600,
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            border: 'none',
            background: isPlaying ? '#C0392B' : 'var(--moss)',
            color: '#fff',
            boxShadow: isPlaying ? '0 4px 14px rgba(192,57,43,0.35)' : '0 4px 14px rgba(46,107,62,0.35)',
            transition: 'all 200ms ease',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
              <span>Processing Script…</span>
            </>
          ) : isPlaying ? (
            <>
              <VolumeX size={15} />
              <span>Stop Playing</span>
            </>
          ) : (
            <>
              <Volume2 size={15} />
              <span>Play Audio Announcement</span>
            </>
          )}
        </button>

        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 140 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--leaf)', fontFamily: 'var(--font-mono)', animation: 'pulse 1.5s infinite' }}>
              Playing audio…
            </span>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 14, marginLeft: 'auto' }}>
              <span style={{ width: 3, height: 12, background: 'var(--leaf)', borderRadius: 2, animation: 'bounce 0.8s infinite 0ms' }} />
              <span style={{ width: 3, height: 14, background: 'var(--leaf)', borderRadius: 2, animation: 'bounce 0.8s infinite 150ms' }} />
              <span style={{ width: 3, height: 8, background: 'var(--leaf)', borderRadius: 2, animation: 'bounce 0.8s infinite 300ms' }} />
              <span style={{ width: 3, height: 11, background: 'var(--leaf)', borderRadius: 2, animation: 'bounce 0.8s infinite 450ms' }} />
            </div>
          </div>
        )}
      </div>

      {spokenText && (
        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--leaf-pale)',
            fontStyle: 'italic',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '0.65rem 0.875rem',
            borderRadius: 10,
            borderLeft: '3px solid var(--leaf)',
            lineHeight: 1.5,
          }}
        >
          "{spokenText}"
        </div>
      )}
    </div>
  );
};

export default TTSReader;
