import { motion } from "framer-motion";
import { LogoMark } from "@/components/logos";

export function ClearSpace() {
  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-b border-border/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row gap-16 items-center"
      >
        <div className="w-full md:w-1/2">
          <h2 className="text-sm font-mono tracking-widest text-accent mb-6 uppercase">Clear Space & Size</h2>
          <h3 className="text-3xl md:text-5xl font-display font-semibold mb-8 leading-tight">
            Room to breathe.
          </h3>
          <div className="space-y-6 text-muted-foreground font-light text-lg">
            <p>
              To ensure the mark maintains its presence and impact, always maintain a minimum clear space around it. 
              This area should be free of typography, other logos, or competing visual elements.
            </p>
            <p>
              The minimum clear space is equal to the width of the central digital pupil (represented by "x").
            </p>
            <div className="pt-6 mt-6 border-t border-border/50">
              <h4 className="font-display text-foreground font-medium mb-2">Minimum Size</h4>
              <p>For digital applications, the mark should never appear smaller than 24px wide. For print, minimum width is 0.25 inches.</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative p-16 bg-card border border-border/50 rounded-2xl">
            {/* Guide lines */}
            <div className="absolute inset-8 border border-accent/30 border-dashed" />
            
            {/* Height/Width markers */}
            <div className="absolute top-4 left-0 w-full flex justify-center">
              <span className="font-mono text-accent text-xs">x</span>
            </div>
            <div className="absolute left-4 top-0 h-full flex flex-col justify-center">
              <span className="font-mono text-accent text-xs">x</span>
            </div>
            <div className="absolute bottom-4 left-0 w-full flex justify-center">
              <span className="font-mono text-accent text-xs">x</span>
            </div>
            <div className="absolute right-4 top-0 h-full flex flex-col justify-center">
              <span className="font-mono text-accent text-xs">x</span>
            </div>

            <LogoMark className="w-48 h-48 text-foreground relative z-10" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
