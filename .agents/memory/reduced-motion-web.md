---
name: prefers-reduced-motion coverage on the website
description: How to honor reduced-motion across framer-motion + CSS in the marketing site, and where to draw the line.
---

Honoring `prefers-reduced-motion` on the website needs THREE layers — no single switch covers everything:

1. **framer-motion transforms** — wrap the page/app in `<MotionConfig reducedMotion="user">`. This suppresses transform/layout animations (x/y/scale/rotate, hover scale, infinite transform loops, scroll-reveal movement) for reduced-motion users.
2. **JS interval/loop-driven content changes** — `MotionConfig` does NOT stop `setInterval`/`requestAnimationFrame` logic (auto-cycling carousels, radar threat cycling, count-ups). Guard each with `useReducedMotion()` and early-return / render the static first state.
3. **CSS animations & Tailwind transitions** — `MotionConfig` does NOT touch `animate-pulse`, `hover:scale-*`, `group-hover:translate-*`, or `transition-*`. Add ONE global reset in `index.css`:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```

**Where to stop:** framer-motion opacity *fades* (no movement) are intentionally left running. Under WCAG 2.3.3, cross-fades are the *recommended* reduced-motion fallback (fade instead of move) and don't trigger vestibular issues. Don't burn effort stripping every entrance fade — disable movement/loops/auto-play, keep fades.

**Why:** a code review will repeatedly flag "reduced motion not fully honored" if any one layer is missing; addressing only framer-motion leaves CSS pulses/hover transforms running, and vice versa. All three layers together is the complete, low-touch solution.
