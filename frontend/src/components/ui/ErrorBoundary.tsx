import React, { Component } from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            gap: '1rem',
            padding: '2rem',
            fontFamily: 'var(--font-body)',
            color: 'var(--muted)',
            textAlign: 'center',
          }}
        >
          <strong style={{ color: 'var(--coral)', fontSize: '1rem' }}>Something went wrong</strong>
          <p style={{ fontSize: '0.875rem' }}>{this.state.error?.message ?? 'Unknown error'}</p>
          <button
            className="btn-ghost"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
