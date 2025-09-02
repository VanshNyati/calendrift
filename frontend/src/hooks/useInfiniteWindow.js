import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Infinite month window based on top/bottom sentinels inside a scroll container.
 * @param {React.RefObject} containerRef
 */
export function useInfiniteWindow(containerRef) {
  const [winStart, setStart] = useState(-12);
  const [winEnd, setEnd] = useState(12);

  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const months = useMemo(
    () => Array.from({ length: winEnd - winStart + 1 }, (_, i) => winStart + i),
    [winStart, winEnd]
  );

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (e.target === topRef.current) setStart((s) => s - 6);
            if (e.target === bottomRef.current) setEnd((s) => s + 6);
          }
        }
      },
      { root, rootMargin: "800px 0px", threshold: 0 }
    );
    if (topRef.current) io.observe(topRef.current);
    if (bottomRef.current) io.observe(bottomRef.current);
    return () => io.disconnect();
  }, [containerRef]);

  return { months, topRef, bottomRef };
}
