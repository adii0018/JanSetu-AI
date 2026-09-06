import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';
import { playClick, playTick } from '../../utils/sounds';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇮🇳' },
  { code: 'gom', name: 'Konkani', nativeName: 'कोंकणी', flag: '🇮🇳' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', flag: '🇮🇳' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', flag: '🇮🇳' },
  { code: 'mni-Mtei', name: 'Manipuri', nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ', flag: '🇮🇳' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कश्मीरी', flag: '🇮🇳' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', flag: '🇮🇳' },
  { code: 'sat', name: 'Santali', nativeName: 'ସାନ୍ତାଳୀ', flag: '🇮🇳' },
];

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read saved language preference
    const savedCode = localStorage.getItem('jansetu_lang') || 'en';
    const matched = LANGUAGES.find((l) => l.code === savedCode) || LANGUAGES[0];
    setSelectedLang(matched);

    // Initialize Google Translate script dynamically if not present
    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: LANGUAGES.map((l) => l.code).join(','),
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      };
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // Aggressively suppress Google Translate top banner iframe
    const bannerSuppressor = setInterval(() => {
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
        document.body.style.position = 'static';
      }
      const bannerFrames = document.querySelectorAll(
        '.goog-te-banner-frame, iframe.goog-te-banner-frame, .VIpgJd-yD051d-Lg4t2b'
      );
      bannerFrames.forEach((el) => {
        const elem = el as HTMLElement;
        elem.style.display = 'none';
        elem.style.visibility = 'hidden';
      });
    }, 300);

    return () => clearInterval(bannerSuppressor);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectLanguage = (lang: Language) => {
    playTick();
    setSelectedLang(lang);
    setIsOpen(false);
    setSearchQuery('');
    localStorage.setItem('jansetu_lang', lang.code);

    // Set Google Translate cookie
    const hostname = window.location.hostname;
    document.cookie = `googtrans=/en/${lang.code}; path=/;`;
    document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${hostname};`;

    // Try to change native combo box if already rendered
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = lang.code;
      combo.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Hidden Google Translate anchor */}
      <div id="google_translate_element" style={{ display: 'none', height: 0, overflow: 'hidden' }} />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => { playClick(); setIsOpen(!isOpen); }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.45rem 0.85rem',
          borderRadius: 24,
          background: isOpen ? 'rgba(18, 53, 36, 0.1)' : 'rgba(18, 53, 36, 0.05)',
          border: '1px solid rgba(18, 53, 36, 0.12)',
          color: 'var(--ink)',
          fontWeight: 700,
          fontSize: '0.8125rem',
          cursor: 'pointer',
          transition: 'all 180ms ease',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-body)',
        }}
        title="Select Language / भाषा चुनें"
      >
        <Globe size={15} color="#25D366" />
        <span>{selectedLang.nativeName}</span>
        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms ease',
            color: 'var(--ink-soft)',
          }}
        />
      </button>

      {/* Language Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 280,
            maxHeight: 390,
            background: '#FFFFFF',
            borderRadius: 20,
            boxShadow: '0 16px 40px rgba(18, 53, 36, 0.16)',
            border: '1px solid rgba(18, 53, 36, 0.12)',
            padding: '0.65rem',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {/* Header */}
          <div style={{ padding: '0.35rem 0.5rem 0.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: 'var(--moss)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '0.45rem',
            }}>
              🌐 Select Language — 22 Languages
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 12,
              background: 'var(--leaf-pale)',
              border: '1px solid rgba(18, 53, 36, 0.1)',
            }}>
              <Search size={13} color="var(--ink-soft)" />
              <input
                type="text"
                placeholder="Search language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.8125rem',
                  color: 'var(--ink)',
                  width: '100%',
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Language List */}
          <div style={{ overflowY: 'auto', maxHeight: 270, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredLanguages.map((lang) => {
              const isSelected = selectedLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 12,
                    border: 'none',
                    background: isSelected ? 'rgba(37, 211, 102, 0.12)' : 'transparent',
                    color: isSelected ? '#123524' : 'var(--ink)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'background 140ms ease',
                    textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(18, 53, 36, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontWeight: 400 }}>
                      ({lang.name})
                    </span>
                  </div>
                  {isSelected && <Check size={14} color="#123524" strokeWidth={3} />}
                </button>
              );
            })}
            {filteredLanguages.length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--ink-soft)' }}>
                No language found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
