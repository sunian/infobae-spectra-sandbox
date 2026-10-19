import { useCallback, useRef } from 'react';

const DEFAULT_LOCK_MS = 600;

/** Wraps a navigation action. A second call inside the lock window is ignored (fast double tap). */
export function useNavigationLock(lockMs = DEFAULT_LOCK_MS): (action: () => void) => void {
  const lockedUntil = useRef(0);
  return useCallback(
    (action: () => void) => {
      const now = Date.now();
      if (now < lockedUntil.current) return;
      lockedUntil.current = now + lockMs;
      action();
    },
    [lockMs],
  );
}
