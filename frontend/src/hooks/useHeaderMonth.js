// src/hooks/useHeaderMonth.js
import { useEffect, useRef } from "react";

/**
 * Tracks which month section has the largest visible area.
 * Usage:
 *   const { register } = useHeaderMonth({ containerRef, onChange: (year, mIndex0) => {} });
 *   // In MonthSection useEffect:
 *   register("YYYY-M", sectionRef, () => sectionRef.current?.offsetHeight || 0)
 */
export function useHeaderMonth({ containerRef, onChange }) {
  const ioRef = useRef(null);

  // Always call the latest onChange without recreating the observer
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Maps used by the IO callback
  const visibleMap = useRef(new Map()); // key -> visible pixels
  const elToKey = useRef(new Map()); // element -> key (e.g. "2025-9")
  const elToHeight = useRef(new Map()); // element -> () => height

  // Create IO ONCE for the container
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const thresholds = [0, 0.25, 0.5, 0.75, 1];

    const io = new IntersectionObserver(
      (entries) => {
        let changed = false;

        for (const entry of entries) {
          const key = elToKey.current.get(entry.target);
          const getH = elToHeight.current.get(entry.target);
          if (!key || !getH) continue;

          const height =
            getH() || entry.target.getBoundingClientRect().height || 1;
          const visible = entry.intersectionRatio * height;
          visibleMap.current.set(key, visible);
          changed = true;
        }

        if (changed) {
          // choose key with max visible area
          let bestKey = null;
          let bestVal = -1;
          for (const [k, v] of visibleMap.current.entries()) {
            if (v > bestVal) {
              bestVal = v;
              bestKey = k;
            }
          }
          if (bestKey) {
            const [yy, mm1] = bestKey.split("-").map(Number); // "YYYY-M" (M = 1..12)
            onChangeRef.current?.(yy, mm1 - 1); // convert to 0..11
          }
        }
      },
      { root, threshold: thresholds }
    );

    ioRef.current = io;
    return () => io.disconnect();
  }, [containerRef]);

  // Called by MonthSection to start/stop observing itself
  function register(key, sectionRef, getHeight) {
    const el = sectionRef.current;
    if (!el || !ioRef.current) return;

    elToKey.current.set(el, key);
    elToHeight.current.set(el, getHeight);
    ioRef.current.observe(el);

    return () => {
      ioRef.current?.unobserve(el);
      elToKey.current.delete(el);
      elToHeight.current.delete(el);
      visibleMap.current.delete(key);
    };
  }

  return { register };
}
