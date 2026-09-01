import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CityFlow Unhandled Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    try {
      localStorage.removeItem('cityflow_v2_delhi');
      localStorage.removeItem('cityflow_v2_chennai');
      localStorage.removeItem('cityflow_v2_bangalore');
      localStorage.removeItem('cityflow_store_delhi');
      localStorage.removeItem('cityflow_store_chennai');
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/admin/management';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-card border border-rose-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Control Room Subsystem Paused
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                An isolated interface fault was intercepted. The central transit database remains safe and consistent.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-muted/40 rounded-lg border border-border text-left font-mono text-[11px] text-rose-500 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs font-bold">
              <button
                onClick={this.handleReload}
                className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center space-x-2 shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Terminal</span>
              </button>

              <button
                onClick={this.handleResetState}
                className="py-2.5 px-4 rounded-xl bg-muted text-foreground hover:bg-muted/80 border border-border flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
                <span>Reset Local Cache</span>
              </button>
            </div>

            <div className="pt-2 border-t border-border/60">
              <a
                href="/"
                className="inline-flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Public Passenger Screen</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
