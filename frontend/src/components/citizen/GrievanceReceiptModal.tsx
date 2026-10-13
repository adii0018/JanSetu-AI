import React from 'react';
import { Printer, Share2, Copy, Check, ShieldCheck, Calendar } from 'lucide-react';
import type { Complaint } from '../../services/types';
import { playClick } from '../../utils/sounds';

interface GrievanceReceiptModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  wardName?: string;
}

const DEPARTMENT_ROUTING: Record<string, string> = {
  'Water Supply': 'Municipal Jal Board & Drainage Division',
  'Road': 'Public Works Department (PWD) — Infrastructure Cell',
  'Electricity': 'State Electricity Distribution Board (Urban Grid)',
  'Sanitation': 'Municipal Solid Waste & Swachhata Mission',
  'Health': 'Chief Medical Health Officer (CMHO) — Public Health',
  'Education': 'District Education & School Welfare Board',
  'Other': 'Central Citizen Redressal & Civic Affairs Cell',
};

export function GrievanceReceiptModal({
  complaint,
  isOpen,
  onClose,
  wardName,
}: GrievanceReceiptModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !complaint) return null;

  const department = DEPARTMENT_ROUTING[complaint.category] || 'Urban Civic Action Department';
  const displayWard = wardName || `Ward #${complaint.ward_id}`;
  const formattedDate = complaint.created_at
    ? new Date(complaint.created_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const handlePrint = () => {
    playClick();
    window.print();
  };

  const handleCopyId = () => {
    playClick();
    navigator.clipboard.writeText(complaint.tracking_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    playClick();
    const message = `*JanSetu AI Grievance Acknowledgment*\nTracking ID: ${complaint.tracking_id}\nCategory: ${complaint.category}\nWard: ${displayWard}\nStatus: ${complaint.status.toUpperCase()}\nTrack online: ${window.location.origin}/?track=${complaint.tracking_id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          maxWidth: 620,
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(18, 53, 36, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Printable Area */}
        <div id="jansetu-printable-receipt" style={{ padding: '2rem' }}>
          {/* Official Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #123524',
              paddingBottom: '1.25rem',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #123524 0%, #2E6B3E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(18, 53, 36, 0.25)',
                }}
              >
                <ShieldCheck size={26} color="#6FBF73" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', color: '#123524', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  JanSetu <span style={{ color: '#25D366' }}>AI</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>
                  Digital Public Infrastructure (DPI) • Official Grievance Slip
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 100,
                  textTransform: 'uppercase',
                }}
              >
                ✓ AI VERIFIED &amp; LOGGED
              </span>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                Doc No: {complaint.id}
              </div>
            </div>
          </div>

          {/* Tracking ID Hero Box */}
          <div
            style={{
              margin: '1.5rem 0',
              padding: '1.2rem',
              background: '#F8FAFC',
              borderRadius: 16,
              border: '1.5px dashed rgba(18, 53, 36, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Official Tracking ID
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#123524',
                  letterSpacing: '0.04em',
                  marginTop: 2,
                }}
              >
                {complaint.tracking_id}
              </div>
            </div>

            {/* Simulated QR Code / Security Hologram */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  border: '2px solid #123524',
                  borderRadius: 8,
                  background: '#FFFFFF',
                  padding: 4,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gridTemplateRows: 'repeat(5, 1fr)',
                  gap: 2,
                }}
                title="JanSetu Authenticity Hash"
              >
                {/* Visual QR Pattern Simulation */}
                <div style={{ background: '#123524', gridArea: '1 / 1 / 3 / 3' }} />
                <div style={{ background: '#123524', gridArea: '1 / 4 / 3 / 6' }} />
                <div style={{ background: '#123524', gridArea: '4 / 1 / 6 / 3' }} />
                <div style={{ background: '#25D366', gridArea: '3 / 3 / 4 / 4' }} />
                <div style={{ background: '#123524', gridArea: '4 / 4 / 5 / 5' }} />
                <div style={{ background: '#123524', gridArea: '5 / 5 / 6 / 6' }} />
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748B', lineHeight: 1.3 }}>
                Scan to verify<br />
                <b>Digital Public Seal</b>
              </div>
            </div>
          </div>

          {/* Grievance Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ padding: '0.75rem 1rem', background: '#F1F5F9', borderRadius: 12 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Category</div>
              <div style={{ fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{complaint.category}</div>
            </div>

            <div style={{ padding: '0.75rem 1rem', background: '#F1F5F9', borderRadius: 12 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Ward / Region</div>
              <div style={{ fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{displayWard}</div>
            </div>

            <div style={{ padding: '0.75rem 1rem', background: '#F1F5F9', borderRadius: 12 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Urgency Severity</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 2 }}>
                <span
                  style={{
                    fontWeight: 800,
                    color: complaint.urgency >= 75 ? '#DC2626' : complaint.urgency >= 50 ? '#D97706' : '#16A34A',
                  }}
                >
                  {complaint.urgency} / 100
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  ({complaint.urgency >= 75 ? 'Critical Emergency' : complaint.urgency >= 50 ? 'Moderate' : 'Standard'})
                </span>
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', background: '#F1F5F9', borderRadius: 12 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Current Status</div>
              <div style={{ fontWeight: 800, color: '#123524', marginTop: 2, textTransform: 'capitalize' }}>
                {complaint.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Assigned Department */}
          <div
            style={{
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              background: '#EFF9EE',
              borderRadius: 14,
              border: '1px solid #C9EAC7',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1F3A24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🏛️ Dispatched Municipal Agency
            </div>
            <div style={{ fontWeight: 800, color: '#16241A', fontSize: '0.9rem', marginTop: 2 }}>
              {department}
            </div>
          </div>

          {/* Complaint Description Snippet */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
              CITIZEN STATEMENT RECORD:
            </div>
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                fontSize: '0.84rem',
                color: '#334155',
                lineHeight: 1.5,
                maxHeight: 110,
                overflowY: 'auto',
                fontStyle: 'italic',
              }}
            >
              "{complaint.raw_text}"
            </div>
          </div>

          {/* Footer Metadata & Time */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: '#94A3B8',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} />
              <span>Filing Timestamp: {formattedDate}</span>
            </div>
            <div>Channel: {complaint.channel?.toUpperCase() || 'WEB AI'}</div>
          </div>
        </div>

        {/* Action Buttons Toolbar (Hidden when printing) */}
        <div
          className="no-print"
          style={{
            padding: '1rem 1.75rem',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 100,
                background: '#123524',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(18, 53, 36, 0.25)',
              }}
            >
              <Printer size={15} /> Print / Save PDF
            </button>

            <button
              onClick={handleCopyId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                borderRadius: 100,
                background: '#FFFFFF',
                color: '#123524',
                border: '1.5px solid #CBD5E1',
                fontWeight: 650,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy ID'}
            </button>

            <button
              onClick={handleWhatsAppShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                borderRadius: 100,
                background: '#DCFCE7',
                color: '#166534',
                border: '1px solid #86EFAC',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              <Share2 size={14} /> WhatsApp
            </button>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 100,
              background: 'transparent',
              color: '#64748B',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Print CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #jansetu-printable-receipt, #jansetu-printable-receipt * {
            visibility: visible !important;
          }
          #jansetu-printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
