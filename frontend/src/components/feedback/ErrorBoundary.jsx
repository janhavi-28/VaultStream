import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Application error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 p-4">
          <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
            <div className="w-full rounded-[2rem] border border-rose-200 bg-white p-8 text-center shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle size={30} />
              </div>
              <h1 className="mt-5 text-3xl font-bold text-slate-950">Something went wrong</h1>
              <p className="mt-2 text-sm text-slate-500">A runtime error interrupted the app. Refresh to try again, or return later if the problem persists.</p>
              
              <div className="mt-4 p-4 bg-rose-50 text-rose-900 text-left text-xs overflow-auto max-h-48 rounded border border-rose-200 whitespace-pre-wrap font-mono">
                {this.state.error && this.state.error.toString()}
                {'\n\n'}
                {this.state.error && this.state.error.stack}
              </div>

              <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                Reload app
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
