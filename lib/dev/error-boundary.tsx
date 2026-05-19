import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// postMessage helper
// ---------------------------------------------------------------------------

type NbLogLevel = 'error' | 'warn' | 'log' | 'info';
type NbLogSource = 'error-boundary' | 'console' | 'uncaught' | 'unhandled-rejection';

function postToParent(
  level: NbLogLevel,
  source: NbLogSource,
  message: string,
  stack: string | null,
  componentStack: string | null,
) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  if (!window.parent || window.parent === window) return;

  try {
    window.parent.postMessage(
      {
        type: 'NB_PREVIEW_LOG',
        iframeId: 'stackex-web-preview',
        level,
        source,
        error: {
          message: String(message || '').substring(0, 5000),
          stack: stack ? String(stack).substring(0, 10000) : null,
          componentStack: componentStack ? String(componentStack).substring(0, 10000) : null,
        },
        timestamp: new Date().toISOString(),
      },
      '*',
    );
  } catch {
    // silent
  }
}

// ---------------------------------------------------------------------------
// Module-level side effect: patch console + global error handlers
// ---------------------------------------------------------------------------

if (Platform.OS === 'web' && typeof window !== 'undefined' && window.parent && window.parent !== window) {
  // Signal that the app booted successfully
  try {
    window.parent.postMessage({ type: 'NB_PREVIEW_READY', timestamp: new Date().toISOString() }, '*');
  } catch { /* silent */ }

  // Patch console methods
  const levels: Array<{ method: NbLogLevel }> = [
    { method: 'error' },
    { method: 'warn' },
    { method: 'log' },
    { method: 'info' },
  ];

  for (const { method } of levels) {
    const original = console[method];
    console[method] = function (...args: unknown[]) {
      original.apply(console, args);

      const parts: string[] = [];
      for (const arg of args) {
        if (arg === null) parts.push('null');
        else if (arg === undefined) parts.push('undefined');
        else if (arg instanceof Error) parts.push(arg.message + (arg.stack ? '\n' + arg.stack : ''));
        else if (typeof arg === 'object') {
          try { parts.push(JSON.stringify(arg, null, 2)); }
          catch { parts.push(String(arg)); }
        } else parts.push(String(arg));
      }

      const message = parts.join(' ');
      const stack = args[0] instanceof Error ? (args[0].stack ?? null) : null;
      postToParent(method, 'console', message, stack, null);
    };
  }

  // Uncaught errors
  window.addEventListener('error', (e) => {
    const message = e.message || 'Unknown error';
    const stack = e.error?.stack ?? (e.filename ? `at ${e.filename}:${e.lineno}:${e.colno}` : null);
    postToParent('error', 'uncaught', message, stack, null);
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    let message = 'Unhandled Promise Rejection';
    let stack: string | null = null;

    if (reason instanceof Error) {
      message = reason.message;
      stack = reason.stack ?? null;
    } else if (typeof reason === 'string') {
      message = reason;
    } else if (reason) {
      try { message = JSON.stringify(reason); }
      catch { message = String(reason); }
    }

    postToParent('error', 'unhandled-rejection', message, stack, null);
  });
}

// ---------------------------------------------------------------------------
// Error Boundary Component
// ---------------------------------------------------------------------------

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class StackExErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    postToParent(
      'error',
      'error-boundary',
      error.message,
      error.stack ?? null,
      errorInfo.componentStack ?? null,
    );

    // Re-throw so Expo's error overlay handles the display
    throw error;
  }

  render() {
    return this.props.children;
  }
}
