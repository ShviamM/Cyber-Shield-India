import { motion } from "framer-motion";

export function Essence() {
  return (
    <section className="py-32 px-6 md:px-12 max-w-5xl mx-auto border-b border-border/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-sm font-mono tracking-widest text-accent mb-6 uppercase">Brand Essence</h2>
        
        <h3 className="text-4xl md:text-6xl font-display font-semibold mb-12 leading-tight tracking-tight">
          Two steps ahead.
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <div>
            <div className="mb-8">
              <span className="text-2xl font-display font-bold">Netra</span>
              <p className="text-muted-foreground mt-2">Eye, vision, absolute insight.</p>
            </div>
            <div>
              <span className="text-2xl font-display font-bold">Raksh</span>
              <p className="text-muted-foreground mt-2">Protection, the ultimate guardian.</p>
            </div>
          </div>
          <div className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
            <p className="mb-6">
              Netraksh is the definitive cyber-safety layer for a digitally accelerating India. We are not just a tool; we are a proactive guardian.
            </p>
            <p>
              Our identity reflects relentless vigilance, precise intelligence, and the calm assurance that you are protected before a threat even emerges.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
