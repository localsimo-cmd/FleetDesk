import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-3xl shadow-xl">
                <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-black uppercase tracking-tightest leading-none">System Crash</h1>
              <p className="text-muted-foreground font-medium">
                The application encountered a terminal error. Your local session may be corrupted.
              </p>
            </div>

            <div className="bg-secondary/50 p-6 rounded-2xl text-left font-mono text-xs overflow-auto max-h-32 border border-border">
              {this.state.error?.message || 'Unknown execution error'}
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </Button>
              <Button 
                variant="outline"
                onClick={this.handleReset}
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Force Logout & Reset
              </Button>
            </div>
            
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
              Clear your browser cache if the issue persists
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
