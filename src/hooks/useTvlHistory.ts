import { useCallback, useEffect, useRef, useState } from 'react';

export interface TvlDataPoint {
  timestamp: number; // ms
  tvl: number;
  pacts: number;
  members: number;
}

const STORAGE_KEY = 'ajorithm-tvl-history';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MIN_INTERVAL_MS = 20_000; // don't record more often than 20s

function loadHistory(): TvlDataPoint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: TvlDataPoint[] = JSON.parse(raw);
    const cutoff = Date.now() - MAX_AGE_MS;
    return data.filter((d) => d.timestamp >= cutoff);
  } catch {
    return [];
  }
}

function saveHistory(data: TvlDataPoint[]) {
  try {
    const cutoff = Date.now() - MAX_AGE_MS;
    const trimmed = data.filter((d) => d.timestamp >= cutoff);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export function useTvlHistory() {
  const [history, setHistory] = useState<TvlDataPoint[]>(loadHistory);
  const lastRecordRef = useRef(history.length > 0 ? history[history.length - 1].timestamp : 0);

  // Persist whenever history changes
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const record = useCallback(
    (tvl: number, pacts: number, members: number) => {
      const now = Date.now();
      if (now - lastRecordRef.current < MIN_INTERVAL_MS) return;
      lastRecordRef.current = now;

      setHistory((prev) => {
        const cutoff = now - MAX_AGE_MS;
        const cleaned = prev.filter((d) => d.timestamp >= cutoff);
        return [...cleaned, { timestamp: now, tvl, pacts, members }];
      });
    },
    []
  );

  return { history, record };
}
