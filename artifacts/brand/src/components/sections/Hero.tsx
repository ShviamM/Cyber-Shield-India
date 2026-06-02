import { motion } from "framer-motion";
import { LogoMark, LogoWordmark } from "@/components/logos";

export function Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden border-b border-border/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-background to-background" />
      
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-50" />
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-50" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center max-w-4xl px-6 text-center"
      >
        <LogoMark className="w-48 h-48 md:w-72 md:h-72 mb-12 drop-shadow-[0_0_40px_rgba(0,123,255,0.4)]" />
        <LogoWordmark className="w-64 md:w-96 mb-8 text-foreground" />
        <p className="text-xl md:text-3xl text-muted-foreground font-light tracking-wide max-w-3xl leading-relaxed">
          The AI-powered cyber-safety guardian platform for India.
        </p>
      </motion.div>
    </section>
  );
}
