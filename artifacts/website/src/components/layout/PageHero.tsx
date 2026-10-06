import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// Shared dark page header matching the homepage hero (Launch UI style):
// navy background, faint guide lines, saffron glow, pill badge.

const appear: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

export function HeroGlow({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 ${className}`}>
      <div className="absolute left-1/2 top-0 h-[420px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,181,92,0.45)_10%,rgba(255,181,92,0)_60%)]" />
      <div className="absolute left-1/2 top-0 h-[210px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] bg-[radial-gradient(closest-side,rgba(247,147,30,0.3)_10%,rgba(247,147,30,0)_60%)]" />
    </div>
  );
}

export function PageHero({
  badge,
  badgeIcon,
  title,
  subtitle,
  children,
  glow = true,
}: {
  badge?: ReactNode;
  badgeIcon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  glow?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0A0F24] text-[#F6F7FB]">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[max(12px,calc(50%-612px))] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-[max(12px,calc(50%-612px))] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="container relative z-10 mx-auto max-w-4xl px-4 pb-20 pt-14 text-center md:px-6 lg:pb-24 lg:pt-20"
      >
        {badge && (
          <motion.div
            variants={appear}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/20 px-3.5 py-1.5 text-[15px] font-semibold [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[#F7931E]"
          >
            {badgeIcon ?? <span className="h-2 w-2 rounded-full bg-[#F7931E] shadow-[0_0_0_4px_rgba(247,147,30,0.2)]" />}
            {badge}
          </motion.div>
        )}
        <motion.h1
          variants={appear}
          className="bg-gradient-to-r from-white to-[#C9CEE0] bg-clip-text text-4xl font-bold leading-[1.15] tracking-tight text-transparent text-balance md:text-6xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p variants={appear} className="mx-auto mt-5 max-w-2xl text-lg text-[#B4BBD0] text-balance md:text-xl">
            {subtitle}
          </motion.p>
        )}
        {children && <motion.div variants={appear}>{children}</motion.div>}
      </motion.div>
      {glow && <HeroGlow className="-bottom-[300px]" />}
    </section>
  );
}

export const heroBtnLight =
  "inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[#F6F7FB] px-6 text-[17px] font-semibold text-[#121731] shadow-[0_6px_20px_-6px_rgba(247,147,30,0.45)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7931E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F24]";
export const heroBtnGlow =
  "inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl border border-b-0 border-white/15 border-t-white/30 bg-gradient-to-b from-[#F7931E]/15 to-[#F7931E]/5 px-6 text-[17px] font-semibold text-[#F6F7FB] transition-colors hover:from-[#F7931E]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7931E]";
