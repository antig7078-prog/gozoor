import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans" dir="rtl">
          {/* Decorative Glow Ambient Elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full filter blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>

          {/* Glassmorphic Container */}
          <div className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 text-center flex flex-col items-center">
            {/* Animated Alert Icon */}
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
            </div>

            {/* Error Message Header */}
            <h1 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight leading-snug">
              عذراً، حدث خطأ غير متوقع!
            </h1>
            <p className="text-slate-400 text-base mb-8 leading-relaxed max-w-md">
              نواجه مشكلة مؤقتة في تحميل هذه الصفحة. يرجى إعادة محاولة التحميل أو العودة للرئيسية.
            </p>

            {/* Actions Block */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full justify-center mb-8">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-white/10"
              >
                <RotateCcw className="w-5 h-5" />
                <span>إعادة تحميل الصفحة</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                <span>العودة للرئيسية</span>
              </button>
            </div>

            {/* Error Details Accordion */}
            {this.state.error && (
              <div className="w-full border-t border-white/10 pt-6">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full text-slate-500 hover:text-slate-300 transition-colors text-sm font-semibold mb-3 px-1"
                >
                  <span>تفاصيل الخطأ التقني</span>
                  {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {this.state.showDetails && (
                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-left font-mono text-xs text-red-400/90 overflow-x-auto max-h-40 leading-relaxed scrollbar-thin">
                    <p className="font-bold text-slate-300 mb-1">Error Message:</p>
                    <p className="whitespace-pre-wrap">{this.state.error.toString()}</p>
                    {this.state.error.stack && (
                      <>
                        <p className="font-bold text-slate-300 mt-3 mb-1">Stack Trace:</p>
                        <p className="whitespace-pre">{this.state.error.stack}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
