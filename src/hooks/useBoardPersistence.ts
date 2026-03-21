import { useEffect, useRef } from 'react';
import { useBoardStore } from '../stores/useBoardStore';

const STORAGE_KEY = 'hockey-board-state';

export function useBoardPersistence() {
  const strokes = useBoardStore((s) => s.strokes);
  const objects = useBoardStore((s) => s.objects);
  const loadState = useBoardStore((s) => s.loadState);
  const loaded = useRef(false);

  // Load on mount
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { strokes, objects } = JSON.parse(saved);
        if (strokes && objects) {
          loadState(strokes, objects);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [loadState]);

  // Save on changes (debounced)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ strokes, objects }));
      } catch {
        // Storage full or unavailable
      }
    }, 500);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [strokes, objects]);
}
