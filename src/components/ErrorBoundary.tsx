'use client';

import React from 'react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => {
  return (
    <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center px-4">
      <div className="card-mobile border-error/30 max-w-md w-full text-center">
        <div className="w-16 h-16 gradient-hive rounded-hive flex items-center justify-center mx-auto mb-6 opacity-50">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-white">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M16 8v8M16 20h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h1 className="heading-lg-mobile mb-2 text-text">Neural Interface Error</h1>
        <p className="body-base-mobile text-subtle mb-6">
          A system anomaly has been detected. The neural pathway encountered an unexpected signal disruption.
        </p>
        
        {error && (
          <div className="bg-surface border border-error/20 rounded-hive p-4 mb-6 text-left">
            <p className="text-xs text-error font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={retry}
            className="btn-mobile-primary w-full"
          >
            Reconnect Neural Link
          </button>
          
          <Link
            href="/dashboard?demo=true"
            className="btn-mobile-secondary w-full inline-block text-center"
          >
            Return to Hub
          </Link>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-subtle">
            If this error persists, the network may be experiencing instability.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
