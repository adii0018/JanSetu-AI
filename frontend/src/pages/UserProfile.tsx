import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Mail, MapPin, FileText, CheckCircle2, Clock, Sparkles, Edit3, Save, LogOut, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/layout/PageContainer';
import { playClick } from '../utils/sounds';
import { useToast } from '../components/ui/Toast';
import { NavLink } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function UserProfile() {
  const { user, updateUser, logout, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'complaints'>('profile');
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [cityWard, setCityWard] = useState(user?.city_ward || '');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [userComplaints, setUserComplaints] = useState<any[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setCityWard(user.city_ward || 'Pan-India');
      setAadhaarNumber(user.aadhaar_number || '');
      fetchMyComplaints();
    }
  }, [user]);

  const handleStartEditing = () => {
    playClick();
    if (user) {
      setFullName(user.full_name || '');
      setCityWard(user.city_ward || 'Pan-India');
      setAadhaarNumber(user.aadhaar_number || '');
    }
    setEditing(true);
  };

  const fetchMyComplaints = async () => {
    if (!user) return;
    setLoadingComplaints(true);
    try {
      const response = await fetch(`${BASE_URL}/api/complaints/user/my?email=${encodeURIComponent(user.email)}&user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserComplaints(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setSaving(true);
    try {
      const token = localStorage.getItem('jansetu_token');
      const response = await fetch(`${BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          city_ward: cityWard,
          aadhaar_number: aadhaarNumber.trim() ? aadhaarNumber.trim() : undefined,
        }),
      });

      const updatedData = await response.json();
      if (!response.ok) {
        const errMsg = typeof updatedData.detail === 'string' ? updatedData.detail : 'Failed to update profile';
        throw new Error(errMsg);
      }

      updateUser(updatedData);
      setEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <PageContainer style={{ paddingTop: '5rem', paddingBottom: '5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 480, margin: '0 auto', padding: '3rem 2rem' }}>
          <User size={48} color="var(--moss)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Citizen Profile Access
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.925rem', marginBottom: '1.75rem' }}>
            Please sign in to view your citizen profile, Aadhaar verification status, and complaint history.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="btn-primary"
            style={{ width: '100%', borderRadius: 100 }}
          >
            Sign In / Register Account
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      {/* Dynamic Profile Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1F3A24 0%, #2E6B3E 100%)',
          color: '#FFFFFF',
          padding: '3.5rem 0 4.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div aria-hidden="true" className="clouds-container">
          <svg className="cloud cloud-dark-1" viewBox="0 0 120 70" fill="none">
            <path d="M25 50 C18 50 12 44 12 36 C12 29 17 23 24 23 C26 15 35 9 46 9 C57 9 66 16 68 26 C75 26 82 32 82 40 C82 46 76 50 68 50 Z" fill="rgba(111, 191, 115, 0.15)"/>
          </svg>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {/* User Avatar */}
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700 0%, #6FBF73 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#1F3A24',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                  border: '3px solid #FFFFFF',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.full_name.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {user.full_name}
                  </h1>
                  {user.is_verified ? (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 750,
                        background: 'rgba(255, 215, 0, 0.2)',
                        color: '#FFD700',
                        border: '1px solid rgba(255, 215, 0, 0.5)',
                        padding: '0.2rem 0.65rem',
                        borderRadius: 100,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: '0 2px 10px rgba(255, 215, 0, 0.25)',
                      }}
                    >
                      <ShieldCheck size={14} color="#FFD700" /> 🛡️ Verified Citizen
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: 'rgba(255, 255, 255, 0.15)',
                        color: 'rgba(255, 255, 255, 0.85)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 100,
                      }}
                    >
                      Citizen Account
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 6, fontSize: '0.85rem', color: 'rgba(201, 234, 199, 0.85)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={14} /> {user.email}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={14} /> {user.city_ward || 'Pan-India'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { playClick(); logout(); showToast('Logged out successfully', 'info'); }}
              className="btn-ghost"
              style={{ color: '#FFB8B8', borderColor: 'rgba(255,120,100,0.4)', background: 'rgba(255,120,100,0.12)' }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <PageContainer style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        {/* User Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--leaf-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} color="var(--moss)" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', fontWeight: 600 }}>Total Complaints</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>{userComplaints.length}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E7FCE9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', fontWeight: 600 }}>Verification Status</div>
              <div style={{ fontSize: '1rem', fontWeight: 750, color: user.is_verified ? '#059669' : 'var(--ink)' }}>
                {user.is_verified ? 'Aadhaar Verified' : 'Standard'}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={22} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', fontWeight: 600 }}>Assigned Region</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 750, color: 'var(--ink)' }}>{user.city_ward || 'Pan-India'}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0.5rem',
          }}
        >
          <button
            onClick={() => { playClick(); setActiveTab('profile'); }}
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              background: activeTab === 'profile' ? 'var(--deep-moss)' : 'transparent',
              color: activeTab === 'profile' ? '#FFFFFF' : 'var(--ink-soft)',
              borderRadius: 100,
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            Profile & Aadhaar Details
          </button>
          <button
            onClick={() => { playClick(); setActiveTab('complaints'); }}
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              background: activeTab === 'complaints' ? 'var(--deep-moss)' : 'transparent',
              color: activeTab === 'complaints' ? '#FFFFFF' : 'var(--ink-soft)',
              borderRadius: 100,
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            My Complaints History ({userComplaints.length})
          </button>
        </div>

        {/* Tab Content 1: Profile & Aadhaar */}
        {activeTab === 'profile' && (
          <div className="card" style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>
                  Citizen Identity Details
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--ink-soft)' }}>
                  Manage your verified profile details, Aadhaar number, and city/ward preferences.
                </p>
              </div>

              {!editing && (
                <button
                  onClick={handleStartEditing}
                  className="btn-ghost"
                  style={{ fontSize: '0.8125rem' }}
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 12,
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.9rem',
                    background: editing ? '#FFFFFF' : '#F8FAFC',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 4 }}>
                  Gmail / Email Address (Primary ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    background: '#F1F5F9',
                    color: '#64748B',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Aadhaar Number</span>
                  <span style={{ fontSize: '0.72rem', color: user.is_verified ? '#059669' : 'var(--ink-soft)' }}>
                    {user.is_verified ? '🛡️ Verified' : 'Masked for Security'}
                  </span>
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={editing ? aadhaarNumber : user.aadhaar_number || 'Not Provided (Add for Verified Badge)'}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder={editing ? 'Enter 12-digit Aadhaar to verify' : ''}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 12,
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.9rem',
                    background: editing ? '#FFFFFF' : '#F8FAFC',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 4 }}>
                  Default City / Ward
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={cityWard}
                  onChange={(e) => setCityWard(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: 12,
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.9rem',
                    background: editing ? '#FFFFFF' : '#F8FAFC',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              {editing && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ borderRadius: 100 }}>
                    <Save size={15} /> {saving ? 'Saving…' : 'Save Profile Changes'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-ghost" style={{ borderRadius: 100 }}>
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Tab Content 2: My Complaints History */}
        {activeTab === 'complaints' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>
                  Submitted Complaints ({userComplaints.length})
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--ink-soft)' }}>
                  Real-time tracking of civic issues submitted by your account across India.
                </p>
              </div>

              <button onClick={fetchMyComplaints} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                <RefreshCw size={13} className={loadingComplaints ? 'spin-anim' : ''} /> Refresh History
              </button>
            </div>

            {userComplaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--ink-soft)' }}>
                <FileText size={36} color="var(--leaf)" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>No complaints submitted yet</div>
                <p style={{ fontSize: '0.84rem', marginTop: 4 }}>Submit your first civic issue via voice or text on the Citizen Portal.</p>
                <NavLink to="/" className="btn-primary" style={{ marginTop: '1.25rem', borderRadius: 100 }}>
                  File Complaint Now
                </NavLink>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {userComplaints.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 16,
                      background: '#F8FAFC',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ maxWidth: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--moss)', background: 'var(--leaf-pale)', padding: '0.15rem 0.5rem', borderRadius: 6 }}>
                          {c.tracking_id}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-soft)' }}>
                          • {c.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>
                        {c.raw_text}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span className={`tag tag-${c.urgency > 60 ? 'urgent' : 'leaf'}`}>
                        Priority: {c.urgency}/100
                      </span>
                      <NavLink
                        to={`/?track=${c.tracking_id}`}
                        className="btn-ghost"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        Track <ExternalLink size={12} />
                      </NavLink>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </>
  );
}
