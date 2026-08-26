import { useCallback, useEffect, useRef, useState } from 'react';

export interface Countdown {
  /** Milliseconds left, 0 when finished or never started. */
  left: number;
  running: boolean;
  /** 0 → 1 elapsed fraction, for a progress bar. */
  progress: number;
  start: (ms?: number) => void;
  stop: () => void;
}

/**
 * A countdown driven by wall-clock time rather than by counting ticks: a phone
 * that locks mid-round, or a backgrounded tab, throttles timers to a crawl and
 * a tick-counting timer would silently pause. Comparing against a deadline
 * means the timer is simply already over when the screen comes back.
 */
export function useCountdown(defaultMs: number, onDone?: () => void): Countdown {
  const [left, setLeft] = useState(0);
  const [total, setTotal] = useState(defaultMs);
  const [running, setRunning] = useState(false);
  const deadline = useRef(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const step = () => {
      const remaining = Math.max(0, deadline.current - performance.now());
      setLeft(remaining);
      if (remaining <= 0) {
        setRunning(false);
        done.current?.();
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const start = useCallback(
    (ms?: number) => {
      const span = ms ?? defaultMs;
      setTotal(span);
      setLeft(span);
      deadline.current = performance.now() + span;
      setRunning(true);
    },
    [defaultMs],
  );

  const stop = useCallback(() => {
    setRunning(false);
    setLeft(0);
  }, []);

  return { left, running, progress: total > 0 ? 1 - left / total : 0, start, stop };
}

/** Fires `onTick` once per whole second while a countdown is running. */
export function useSecondTicks(left: number, running: boolean, onTick: (second: number) => void) {
  const last = useRef(-1);
  const cb = useRef(onTick);
  cb.current = onTick;
  useEffect(() => {
    if (!running) {
      last.current = -1;
      return;
    }
    const second = Math.ceil(left / 1000);
    if (second !== last.current) {
      last.current = second;
      cb.current(second);
    }
  }, [left, running]);
}

/** Counts up from zero. Used by tap battles and waterfall. */
export function useStopwatch() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const from = useRef(0);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const step = () => {
      setMs(performance.now() - from.current);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const start = useCallback(() => {
    from.current = performance.now();
    setMs(0);
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    const elapsed = performance.now() - from.current;
    setMs(elapsed);
    return elapsed;
  }, []);

  return { ms, running, start, stop };
}
