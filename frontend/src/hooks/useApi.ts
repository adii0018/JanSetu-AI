import { useState, useCallback } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseApiState<T> {
  data: T | null;
  status: Status;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: Parameters<() => Promise<T>>) => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  apiFn: () => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, status: 'loading', error: null });
    try {
      const result = await apiFn();
      setState({ data: result, status: 'success', error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setState({ data: null, status: 'error', error: message });
    }
  }, [apiFn]);

  const reset = useCallback(() => {
    setState({ data: null, status: 'idle', error: null });
  }, []);

  return { ...state, execute, reset };
}
