'use client';

import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { track } from '@/lib/events';

/**
 * The chat panel's code is not in the main bundle. It loads on first open,
 * which keeps the initial JavaScript under budget for the ~75% of visitors
 * who never open it.
 */
const AskPanel = dynamic(() => import('./AskPanel').then((m) => m.AskPanel), {
  ssr: false,
});

interface AskContextValue {
  open: boolean;
  openAsk: (prefill?: string) => void;
  closeAsk: () => void;
  prefill: string | null;
  consumePrefill: () => void;
}

const AskContext = createContext<AskContextValue | null>(null);

export function useAsk(): AskContextValue {
  const ctx = useContext(AskContext);
  if (!ctx) throw new Error('useAsk must be used inside <AskProvider>');
  return ctx;
}

export function AskProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefill, setPrefill] = useState<string | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const openAsk = useCallback((q?: string) => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    if (q) setPrefill(q);
    setMounted(true);
    setOpen(true);
    track('chat_open');
  }, []);

  const closeAsk = useCallback(() => {
    setOpen(false);
    // Return focus to whatever opened the panel (WCAG 2.2, focus management).
    window.requestAnimationFrame(() => restoreFocus.current?.focus?.());
  }, []);

  const consumePrefill = useCallback(() => setPrefill(null), []);

  // /?ask=1 opens the panel directly, so the link works from a résumé or
  // from LinkedIn without a second click.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ask') === '1') {
      setMounted(true);
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAsk();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeAsk]);

  const value = useMemo(
    () => ({ open, openAsk, closeAsk, prefill, consumePrefill }),
    [open, openAsk, closeAsk, prefill, consumePrefill],
  );

  return (
    <AskContext.Provider value={value}>
      {children}
      {mounted ? <AskPanel /> : null}
    </AskContext.Provider>
  );
}
