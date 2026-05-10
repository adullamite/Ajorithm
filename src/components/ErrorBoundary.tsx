<<<<<<< HEAD
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
=======
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import MaterialIcon from "./MaterialIcon";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
>>>>>>> main
  hasError: boolean;
  error: Error | null;
}

<<<<<<< HEAD
export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="glass-strong max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-foreground text-sm font-medium hover:border-primary/30 transition-all"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
=======
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
          {/* Background blobs */}
          <div className="gradient-blob-purple top-1/4 left-1/4 opacity-40" />
          <div className="gradient-blob-neon bottom-1/4 right-1/4 opacity-20" />

          <div className="relative z-10 max-w-md w-full mx-4">
            <div className="glass-modal p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-ajo-error/10 flex items-center justify-center" style={{ boxShadow: "0 0 24px rgba(255,180,171,0.15)" }}>
                <MaterialIcon name="error_outline" size={36} className="text-ajo-error" />
              </div>

              <h2 className="font-headline text-xl text-on-surface mb-2">
                Something Went Wrong
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-2">
                An unexpected error occurred. This might be a temporary issue.
              </p>

              {this.state.error && (
                <div className="mt-4 mb-6 p-3 rounded-xl bg-surface-container-highest/40 border border-outline-variant/20 text-left overflow-auto max-h-24">
                  <p className="font-label text-[11px] text-ajo-error/80 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={this.handleGoHome}
                  className="btn-secondary flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="home" size={16} />
                  Go Home
                </button>
                <button
                  onClick={this.handleReset}
                  className="btn-primary flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <MaterialIcon name="refresh" size={16} />
                  Try Again
                </button>
              </div>
>>>>>>> main
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
<<<<<<< HEAD
=======

export default ErrorBoundary;
>>>>>>> main
