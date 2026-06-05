import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function ScamCounter({ to, suffix, label, duration = 2000 }: { to: number; suffix: string; label: string; duration?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);
  const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      setCount(to);
      return;
    }

    let startTimestamp: number;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * to));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [inView, to, duration, prefersReducedMotion]);

  // Format large numbers with commas
  const formattedCount = new Intl.NumberFormat('en-IN').format(count);

  return (
    <div ref={ref} className="flex flex-col">
      <div className="text-4xl md:text-5xl font-extrabold text-accent flex items-baseline">
        <span>{formattedCount}</span>
        <span className="text-2xl md:text-3xl ml-1">{suffix}</span>
      </div>
      <p className="text-sm font-medium text-gray-400 mt-2 uppercase tracking-wider">{label}</p>
    </div>
  );
}
