import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { Footer } from './components/layout/Footer';
import { CitizenPortal } from './pages/CitizenPortal';
import { Dashboard } from './pages/Dashboard';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageLoader } from './components/ui/PageLoader';

export default function App() {
  return (
    <BrowserRouter>
      <PageLoader />
      <ToastProvider>
        <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <TopNav />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<CitizenPortal />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </ErrorBoundary>
          </div>
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
