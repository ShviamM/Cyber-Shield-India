import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";

type Clipping = {
  masthead: string;
  dateline: string;
  kicker: string;
  headline: string;
  standfirst: string;
  rotate: number;
};

const ROTATIONS = [-3, 2.5, -1.5, 3, -2, 1.5];

function ClippingCard({ item, index }: { item: Clipping; index: number }) {
  const { t } = useTranslation("family");
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28, rotate: item.rotate * 1.6 }}
      whileInView={{ opacity: 1, y: 0, rotate: item.rotate }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: "easeOut" }}
      whileHover={{ rotate: 0, scale: 1.035, y: -8, zIndex: 30 }}
      onHoverStart={() => setRevealed(true)}
      onHoverEnd={() => setRevealed(false)}
      onClick={() => setRevealed((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setRevealed((v) => !v);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={revealed}
      aria-label={t("clippings.aria", { headline: item.headline })}
      className="group relative cursor-pointer select-none rounded-[2px] bg-[#f6f1e6] px-5 pb-5 pt-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] ring-1 ring-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {/* Tape */}
      <span className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2 bg-amber-200/70 shadow-sm backdrop-blur-[1px]" />

      {/* Masthead */}
      <div className="border-b-2 border-black/80 pb-1.5 text-center">
        <p className="text-[15px] font-black uppercase tracking-tight text-black/85">
          {item.masthead}
        </p>
      </div>
      <div className="mt-1 flex items-center justify-between border-b border-black/30 pb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-black/55">
        <span>{item.dateline}</span>
        <span className="rounded-sm bg-black/80 px-1.5 py-0.5 text-[8px] text-[#f6f1e6]">
          {item.kicker}
        </span>
      </div>

      {/* Headline */}
      <h3 className="mt-3 text-[19px] font-bold leading-[1.15] text-black/90">
        {item.headline}
      </h3>
      <p className="mt-2 columns-1 gap-3 text-[11px] leading-snug text-black/70 sm:columns-2 sm:[column-rule:1px_solid_rgba(0,0,0,0.12)]">
        {item.standfirst}
      </p>

      {/* Saffron "BLOCKED" rubber stamp */}
      <motion.div
        initial={false}
        animate={
          revealed
            ? { opacity: 1, scale: 1, rotate: -14 }
            : { opacity: 0, scale: 1.5, rotate: -28 }
        }
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="flex items-center gap-2 rounded-md border-[3px] border-accent px-3 py-1.5 text-accent shadow-sm [text-shadow:0_1px_0_rgba(255,255,255,0.4)]">
          <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
          <span className="text-sm font-black uppercase tracking-wide">
            {t("clippings.stamp")}
          </span>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function NewspaperClippings() {
  const { t } = useTranslation("family");
  const clippings = t("clippings.items", { returnObjects: true }) as Array<
    Omit<Clipping, "rotate">
  >;
  return (
    <div className="relative">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clippings.map((item, i) => (
          <ClippingCard
            key={item.headline}
            item={{ ...item, rotate: ROTATIONS[i] ?? 0 }}
            index={i}
          />
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-gray-500">
        {t("clippings.note")}
      </p>
    </div>
  );
}
