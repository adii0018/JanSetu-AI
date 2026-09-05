import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2, Sparkles, Globe, FastForward } from 'lucide-react';
import { synthesizeTTS } from '../../services/api';

interface TTSReaderProps {
  text: string;
  defaultLang?: 'hi-IN' | 'en-IN';
  compact?: boolean;
  label?: string;
}

export const SUPPORTED_LANGS = [
  { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
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

      // Select matching voice for Hindi/English if available
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
    const codes = SUPPORTED_LANGS.map(l => l.code);
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
    const speeds = [0.8, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (isPlaying && utteranceRef.current) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handlePlayTTS}
        disabled={isLoading}
        title={isPlaying ? 'Stop Audio' : `Listen via NVIDIA TTS (${language === 'hi-IN' ? 'Hindi' : 'English'})`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all shadow-sm ${
          isPlaying
            ? 'bg-emerald-600 text-white animate-pulse'
            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
        ) : isPlaying ? (
          <>
            <VolumeX className="w-3.5 h-3.5 text-white" />
            <span>Stop</span>
            <span className="flex gap-0.5 items-end h-3 ml-1">
              <span className="w-0.5 h-2.5 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 h-3 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-1.5 bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3.5 text-white shadow-lg space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>NVIDIA Voice Reader</span>
              {isNvidiaEngine && (
                <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> NVIDIA AI
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-400">
              Listen to AI complaint summary in natural spoken audio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Selector Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors border border-slate-700"
            title="Toggle Language"
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>{SUPPORTED_LANGS.find((l) => l.code === language)?.label || 'Hindi (हिन्दी)'}</span>
          </button>

          {/* Speed Selector Button */}
          <button
            type="button"
            onClick={cycleSpeed}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors border border-slate-700"
            title="Speech Speed"
          >
            <FastForward className="w-3 h-3 text-cyan-400" />
            <span>{speed}x</span>
          </button>
        </div>
      </div>

      {/* Main Play Action Bar */}
      <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
        <button
          type="button"
          onClick={handlePlayTTS}
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-md ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Script...</span>
            </>
          ) : isPlaying ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Stop Playing</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Play Audio Announcement</span>
            </>
          )}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-1.5 flex-1 pl-2">
            <span className="text-[11px] text-emerald-400 font-mono animate-pulse">
              Playing Spoken Audio...
            </span>
            <div className="flex gap-1 items-end h-4 ml-auto pr-2">
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
              <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3.5" style={{ animationDelay: '450ms' }} />
            </div>
          </div>
        )}
      </div>

      {spokenText && (
        <div className="text-[11px] text-slate-300 italic bg-slate-950/40 p-2 rounded border border-slate-800/50">
          "{spokenText}"
        </div>
      )}
    </div>
  );
};

export default TTSReader;
