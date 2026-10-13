import React, { useState, useEffect } from 'react';
import { AlertOctagon, Zap, CheckCircle2, Loader2, X, Navigation } from 'lucide-react';
import { submitComplaint, getWards } from '../../services/api';
import type { Ward, Complaint } from '../../services/types';
import { playClick, playSubmit, playSuccess, playError } from '../../utils/sounds';

interface QuickSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (complaint: Complaint) => void;
}

interface HazardPreset {
  id: string;
  icon: string;
  label: string;
  category: string;
  defaultText: string;
  urgency: number;
}

const HAZARD_PRESETS: HazardPreset[] = [
  {
    id: 'manhole',
    icon: '🕳️',
    label: 'Open Manhole / Cave-in',
    category: 'Road',
    defaultText: 'CRITICAL HAZARD: Open uncovered deep manhole or caved-in road posing immediate life threat to pedestrians and vehicles.',
    urgency: 98,
  },
  {
    id: 'electric',
    icon: '⚡',
    label: 'Live Sparking Wire',
    category: 'Electricity',
    defaultText: 'ELECTRICAL EMERGENCY: High-tension electric wire snapped/sparking on public road, immediate electrocution hazard.',
    urgency: 99,
  },
  {
    id: 'water_burst',
    icon: '🌊',
    label: 'Major Pipeline Burst',
    category: 'Water Supply',
    defaultText: 'WATER EMERGENCY: High-pressure water main pipeline burst flooding the road and submerging residential access.',
    urgency: 95,
  },
  {
    id: 'fallen_tree',
    icon: '🌳',
    label: 'Fallen Tree / Blocked Road',
    category: 'Road',
    defaultText: 'CIVIC OBSTRUCTION: Large tree fallen across main road completely blocking ambulance & emergency vehicle passage.',
    urgency: 96,
  },
  {
    id: 'chemical',
    icon: '☣️',
    label: 'Gas/Chemical Leakage',
    category: 'Sanitation',
    defaultText: 'TOXIC RISK: Strong pungent chemical/sewage gas emission causing breathing difficulty to citizens in the area.',
    urgency: 98,
  },
];

export function QuickSOSModal({ isOpen, onClose, onSuccess }: QuickSOSModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<HazardPreset>(HAZARD_PRESETS[0]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<number | ''>('');
  const [customNote, setCustomNote] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (isOpen) {
      getWards()
        .then((data) => {
          setWards(data);
          if (data.length > 0 && !selectedWardId) {
            setSelectedWardId(data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    playClick();
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationCoords({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        });
        setDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        setDetectingLocation(false);
        alert('Could not retrieve GPS location. Please select your municipal ward.');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWardId) return;

    playSubmit();
    setSubmitting(true);

    const locationText = locationCoords
      ? ` [GPS Coords: ${locationCoords.lat}, ${locationCoords.lng}]`
      : '';
    const fullText = `[EMERGENCY CIVIC SOS - URGENCY ${selectedPreset.urgency}] ${selectedPreset.defaultText}${customNote ? ` Additional Landmark: ${customNote}` : ''}${locationText}`;

    try {
      const response = await submitComplaint({
        ward_id: Number(selectedWardId),
        raw_text: fullText,
        language: 'English',
        channel: 'text',
      });

      playSuccess();
      setSubmittedComplaint(response);
      if (onSuccess) onSuccess(response);
    } catch (err) {
      playError();
      alert('Failed to send SOS dispatch. Please try calling 112 directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedComplaint(null);
    setCustomNote('');
    setLocationCoords(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(220, 38, 38, 0.25)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={handleReset}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          maxWidth: 580,
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(220, 38, 38, 0.4)',
          border: '2px solid #EF4444',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header Alert Strip */}
        <div
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
            padding: '1.25rem 1.5rem',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
              }}
            >
              <AlertOctagon size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Civic SOS Emergency Dispatch
              </div>
              <div style={{ fontSize: '0.74rem', color: '#FECACA', marginTop: 3 }}>
                Fast-track 1-tap reporting for immediate public hazards
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#FFFFFF',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {submittedComplaint ? (
          <div style={{ padding: '2rem 1.75rem', textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '4px solid #BBF7D0',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800, color: '#123524' }}>
              🚨 Emergency Ticket Dispatched!
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: 6, maxWidth: 440, marginInline: 'auto' }}>
              Your hazard report has been flagged with <b>Urgency {submittedComplaint.urgency}/100</b> and broadcast to the municipal rapid response division.
            </p>

            <div
              style={{
                margin: '1.5rem 0',
                padding: '1rem',
                background: '#FEF2F2',
                border: '1.5px dashed #EF4444',
                borderRadius: 16,
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#991B1B', fontWeight: 700, textTransform: 'uppercase' }}>
                Emergency Tracking ID
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 900, color: '#DC2626', marginTop: 2 }}>
                {submittedComplaint.tracking_id}
              </div>
            </div>

            {/* Direct Helpline Numbers */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: 14,
                padding: '0.85rem 1rem',
                fontSize: '0.8rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                📞 Police / SOS: <b>112</b>
              </div>
              <div>
                🚑 Ambulance: <b>108</b>
              </div>
              <div>
                🚒 Fire Control: <b>101</b>
              </div>
            </div>

            <button
              onClick={handleReset}
              style={{
                padding: '0.75rem 2rem',
                background: '#123524',
                color: '#FFFFFF',
                borderRadius: 100,
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Done &amp; Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Step 1: Hazard Selection */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                1. Select Critical Hazard Type:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem' }}>
                {HAZARD_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        playClick();
                        setSelectedPreset(preset);
                      }}
                      style={{
                        padding: '0.75rem 0.65rem',
                        borderRadius: 14,
                        border: `1.5px solid ${isSelected ? '#DC2626' : '#E2E8F0'}`,
                        background: isSelected ? '#FEF2F2' : '#FFFFFF',
                        color: isSelected ? '#991B1B' : '#334155',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 160ms ease',
                      }}
                    >
                      <div style={{ fontSize: '1.35rem', marginBottom: 4 }}>{preset.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', lineHeight: 1.2 }}>{preset.label}</div>
                      <div style={{ fontSize: '0.68rem', color: '#DC2626', fontWeight: 800, marginTop: 4 }}>
                        Urgency {preset.urgency}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Location & GPS */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  2. Hazard Location:
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    color: '#2563EB',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: 100,
                    padding: '0.2rem 0.65rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {detectingLocation ? <Loader2 size={12} className="spin-anim" /> : <Navigation size={12} />}
                  {locationCoords ? `GPS Captured (${locationCoords.lat}, ${locationCoords.lng})` : 'Auto-Detect GPS Location'}
                </button>
              </div>

              <select
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(Number(e.target.value))}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-body)',
                  color: '#1E293B',
                  background: '#FFFFFF',
                  outline: 'none',
                }}
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Exact Landmark (Optional) */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Exact Landmark or Street Detail (Optional):
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Near Metro Pillar 142, Opposite City Hospital Gate"
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Submit Action Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '0.7rem 1.2rem',
                  borderRadius: 100,
                  border: '1.5px solid #E2E8F0',
                  background: 'transparent',
                  color: '#64748B',
                  fontSize: '0.85rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 100,
                  border: 'none',
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin-anim" /> Dispatching SOS…
                  </>
                ) : (
                  <>
                    <Zap size={16} /> Broadcast Emergency Dispatch Now
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
