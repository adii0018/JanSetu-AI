import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { Footer } from './components/layout/Footer';
import { CitizenPortal } from './pages/CitizenPortal';
import { Dashboard } from './pages/Dashboard';
import { UserProfile } from './pages/UserProfile';
import { AdminPanel } from './pages/AdminPanel';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageLoader } from './components/ui/PageLoader';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { PWAUpdatePrompt } from './components/ui/PWAUpdatePrompt';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageLoader />
        <ToastProvider>
          <PWAUpdatePrompt />
          <AuthModal />
          <Routes>
            {/* Admin Panel / Open Analytics — full page */}
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/dashboard" element={<AdminPanel />} />

            {/* Main citizen-facing routes */}
            <Route path="*" element={
              <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <TopNav />
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<CitizenPortal />} />
                      <Route path="/profile" element={<UserProfile />} />
                    </Routes>
                  </ErrorBoundary>
                </div>
                <Footer />
              </div>
            } />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
