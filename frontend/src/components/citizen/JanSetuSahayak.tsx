import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, FileText } from 'lucide-react';
import { getComplaintByTrackingId } from '../../services/api';
import type { Complaint } from '../../services/types';
import { playClick, playSuccess, playTick } from '../../utils/sounds';
import { GrievanceReceiptModal } from './GrievanceReceiptModal';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  complaintData?: Complaint;
  actions?: { label: string; action: () => void }[];
}

const FAQ_KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['emergency', 'helpline', 'phone', 'contact', 'number', 'sos', 'number', 'police', 'ambulance'],
    answer: '🚨 **Important National & Civic Helplines:**\n• **National Emergency / Police:** 112\n• **Ambulance:** 108\n• **Fire Control:** 101\n• **Women Helpline:** 1091\n• **Childline:** 1098\n• **WhatsApp JanSetu Bot:** +91 88000 01915\n\nAap "🚨 Emergency Civic SOS" tab se bhi 1-tap fast hazard report kar sakte hain!',
  },
  {
    keywords: ['paani', 'water', 'pipe', 'pipeline', 'leakage', 'jal'],
    answer: '💧 **Paani / Jal Board Samasya:**\nAap "Water Supply" category select karke pipeline burst, dirty water, ya supply timing ki complaint darj karein. AI system automatically Municipal Jal Board Division ko ticket forward karta hai aur high-urgency issues par immediate field crew alert hoti hai.',
  },
  {
    keywords: ['bijli', 'electricity', 'light', 'streetlight', 'wire', 'transformer', 'power'],
    answer: '⚡ **Electricity / Streetlight Grievance:**\nAap street pole number ya locality likhkar photo/voice ke through darj karein. Agar live wire sparking ho rahi hai, toh kripya turant **Emergency Civic SOS** button dabayein taki urgency 99 dispatch ho sake!',
  },
  {
    keywords: ['road', 'sadak', 'pothole', 'gaddha', 'traffic'],
    answer: '🛣️ **Road / Pothole Repair:**\nPublic Works Department (PWD) road repair tickets 24-72 ghante me audit karta hai. Agar manhole open ho ya road cave-in ho, toh hamara AI automatically urgency score 95+ set karta hai.',
  },
  {
    keywords: ['priority', 'ranking', 'score', 'kaise', 'how', 'work', 'ai'],
    answer: '🤖 **JanSetu AI Priority Engine Kaise Kaam Karta Hai?**\nJanSetu har complaint ka **Urgency Score (0-100)** calculate karta hai NLP ke zariye. Isme ward ka Infra Gap + Budget Gap + Citizens ke Upvotes combine karke final Priority Ranking banai jaati hai, jisse sachhe public issues sabse pehle resolve hote hain!',
  },
  {
    keywords: ['kura', 'kachra', 'garbage', 'safai', 'sanitation', 'clean'],
    answer: '🧹 **Swachhata / Sanitation Complaint:**\nGarbage dumping ya choked drain report karne par Swachh Bharat ward team ko dispatch hota hai. Citizen Portal me photo attach karke ya voice note bhej kar report karein.',
  },
];

export function JanSetuSahayak() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptComplaint, setReceiptComplaint] = useState<Complaint | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Namaste! 🙏 Mai **JanSetu Sahayak** hoon — aapka AI Civic Assistant. Mai aapki complaint track karne, ward details batane, aur samasya darj karne me sahayata kar sakta hoon.\n\nType your question, or enter your Tracking ID (e.g., `JS-12345`):',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    playTick();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    // Check if query contains a Tracking ID like JS-XXXXX
    const trackingMatch = query.match(/JS-[A-Z0-9-]+/i);

    if (trackingMatch) {
      const trackingId = trackingMatch[0].toUpperCase();
      try {
        const comp = await getComplaintByTrackingId(trackingId);
        playSuccess();
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `✅ **Complaint Found!**\n\n• **Tracking ID:** ${comp.tracking_id}\n• **Category:** ${comp.category}\n• **Status:** ${comp.status.toUpperCase()} 🚀\n• **Urgency:** ${comp.urgency}/100\n• **Description:** "${comp.raw_text}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          complaintData: comp,
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `❌ Tracking ID **${trackingId}** ka record nahi mila. Kripya check karein ki ID sahi hai ya nahi.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Match FAQ Knowledge
    const lowerQuery = query.toLowerCase();
    const matchedFaq = FAQ_KNOWLEDGE.find((faq) =>
      faq.keywords.some((kw) => lowerQuery.includes(kw))
    );

    setTimeout(() => {
      let replyText = '';
      if (matchedFaq) {
        replyText = matchedFaq.answer;
      } else {
        replyText =
          `Aapki query samajh li gayi hai. JanSetu AI portal par aap voice dictation ya text me grievance submit kar sakte hain.\n\nAgar aap kisi grievance ka status janna chahte hain, toh apna Tracking ID (e.g. \`JS-12345\`) yahan likhein!`;
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9990,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.5rem',
        }}
      >
        {!isOpen && (
          <div
            style={{
              background: '#FFFFFF',
              color: '#123524',
              padding: '0.4rem 0.85rem',
              borderRadius: 100,
              fontSize: '0.76rem',
              fontWeight: 800,
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(18, 53, 36, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              animation: 'bounce 2s infinite',
            }}
          >
            <Sparkles size={13} color="#25D366" /> Ask JanSetu Sahayak
          </div>
        )}

        <button
          onClick={() => {
            playClick();
            setIsOpen((prev) => !prev);
          }}
          aria-label="Open JanSetu Sahayak Chatbot"
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #123524 0%, #1F3A24 50%, #25D366 100%)',
            border: '2px solid #FFFFFF',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(18, 53, 36, 0.45)',
            transition: 'transform 200ms ease',
            position: 'relative',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
        >
          {isOpen ? <X size={26} /> : <Bot size={28} />}
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 13,
              height: 13,
              borderRadius: '50%',
              background: '#25D366',
              border: '2px solid #FFFFFF',
              boxShadow: '0 0 8px #25D366',
            }}
          />
        </button>
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="JanSetu AI Civic Assistant"
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '1.5rem',
            width: 'min(420px, calc(100vw - 2rem))',
            height: 'min(560px, calc(100vh - 7rem))',
            background: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid rgba(18, 53, 36, 0.15)',
            boxShadow: '0 20px 50px rgba(18, 53, 36, 0.25)',
            zIndex: 9991,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #123524 0%, #1F3A24 60%, #2E6B3E 100%)',
              padding: '1rem 1.25rem',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #25D366 0%, #6FBF73 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(37, 211, 102, 0.4)',
                }}
              >
                <Bot size={20} color="#123524" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  JanSetu Sahayak <span style={{ fontSize: '0.68rem', color: '#25D366' }}>AI</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#C9EAC7', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#25D366' }} /> Online Citizen Copilot
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FFFFFF',
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Prompts Chips */}
          <div
            style={{
              background: '#F8FAFC',
              padding: '0.6rem 0.85rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
            }}
          >
            {[
              '🚨 Emergency Numbers',
              '🔍 Track JS-12345',
              '💧 Paani ki Samasya',
              '🤖 AI Priority Score',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: 100,
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 650,
                  color: '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              background: '#FFFFFF',
            }}
          >
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      background: isUser ? '#123524' : '#F1F5F9',
                      color: isUser ? '#FFFFFF' : '#1E293B',
                      padding: '0.75rem 1rem',
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      fontSize: '0.84rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {m.text}

                    {/* If message has a complaint, show button to view official slip */}
                    {m.complaintData && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <button
                          onClick={() => {
                            playClick();
                            setReceiptComplaint(m.complaintData!);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.4rem 0.85rem',
                            borderRadius: 100,
                            background: '#25D366',
                            color: '#123524',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          <FileText size={13} /> View Official Slip
                        </button>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: 3, marginInline: 4 }}>
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: '#F1F5F9',
                  padding: '0.65rem 0.95rem',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.78rem',
                  color: '#64748B',
                }}
              >
                <Loader2 size={14} className="spin-anim" /> JanSetu Sahayak is searching…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or enter Tracking ID…"
              style={{
                flex: 1,
                padding: '0.65rem 0.95rem',
                borderRadius: 100,
                border: '1.5px solid #CBD5E1',
                fontSize: '0.84rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                background: '#FFFFFF',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: input.trim() ? '#123524' : '#E2E8F0',
                color: input.trim() ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 150ms ease',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Official Grievance Receipt Modal */}
      {receiptComplaint && (
        <GrievanceReceiptModal
          complaint={receiptComplaint}
          isOpen={!!receiptComplaint}
          onClose={() => setReceiptComplaint(null)}
        />
      )}
    </>
  );
}
