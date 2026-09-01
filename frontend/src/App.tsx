import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { CitizenPortal } from './pages/CitizenPortal';
import { Dashboard } from './pages/Dashboard';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
          <TopNav />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<CitizenPortal />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
