import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ComplaintForm } from '../components/citizen/ComplaintForm';
import { AiConsole } from '../components/citizen/AiConsole';
import type { ConsoleState } from '../components/citizen/AiConsole';

const INITIAL_CONSOLE: ConsoleState = {
  phase: 'idle',
  lines: [],
  result: null,
  errorMsg: null,
};

export function CitizenPortal() {
  const [consoleState, setConsoleState] = useState<ConsoleState>(INITIAL_CONSOLE);

  return (
    <PageContainer>
      {/* Section header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '0.2rem 0.75rem',
              background: 'var(--saffron-light)',
              borderRadius: 20,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.75rem',
              color: 'var(--saffron-deep)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Citizen Portal
          </div>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          Your complaint goes directly into the AI-ranked priority queue reviewed by local policymakers.
        </p>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        <ComplaintForm onConsoleUpdate={setConsoleState} />
        <div style={{ position: 'sticky', top: 80 }}>
          <AiConsole state={consoleState} />
        </div>
      </div>

      {/* Mobile note */}
      <style>{`
        @media (max-width: 720px) {
          .citizen-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageContainer>
  );
}
