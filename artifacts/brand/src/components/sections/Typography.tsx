import { motion } from "framer-motion";

export function Typography() {
  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-b border-border/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-sm font-mono tracking-widest text-accent mb-6 uppercase">Typography</h2>
        <h3 className="text-3xl md:text-5xl font-display font-semibold mb-16 leading-tight">
          Space Grotesk & Inter.
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div className="bg-card p-12 rounded-3xl border border-border/50">
            <h4 className="font-mono text-accent text-sm mb-4">Display / Headlines</h4>
            <div className="font-display text-7xl md:text-8xl font-bold mb-6 tracking-tight">Aa</div>
            <p className="text-2xl font-display font-medium mb-4">Space Grotesk</p>
            <p className="text-muted-foreground font-light leading-relaxed">
              Used for the wordmark, large numbers, and primary section headers. It brings character, structural geometry, and a technological edge that aligns with our AI capabilities.
            </p>
            <div className="mt-8 font-display text-xl opacity-70 break-all">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              abcdefghijklmnopqrstuvwxyz
              0123456789
            </div>
          </div>

          <div className="bg-card p-12 rounded-3xl border border-border/50">
            <h4 className="font-mono text-accent text-sm mb-4">Body / UI / Data</h4>
            <div className="font-sans text-7xl md:text-8xl font-bold mb-6 tracking-tight">Aa</div>
            <p className="text-2xl font-sans font-medium mb-4">Inter</p>
            <p className="text-muted-foreground font-light leading-relaxed">
              Highly legible, neutral, and meticulously crafted for screen displays. Used for all paragraphs, UI components, dense data tables, and secondary labels where clarity is paramount.
            </p>
            <div className="mt-8 font-sans text-xl opacity-70 break-all">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              abcdefghijklmnopqrstuvwxyz
              0123456789
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-mono text-accent text-sm mb-8 border-b border-border/50 pb-4">Type Scale</h4>
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline">
              <div className="font-mono text-muted-foreground text-sm">Display</div>
              <div className="md:col-span-3 font-display text-5xl md:text-7xl font-bold tracking-tight">System Guardian</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline">
              <div className="font-mono text-muted-foreground text-sm">Header 1</div>
              <div className="md:col-span-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">Two steps ahead.</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline">
              <div className="font-mono text-muted-foreground text-sm">Header 2</div>
              <div className="md:col-span-3 font-display text-2xl md:text-3xl font-medium tracking-tight">Active monitoring engaged.</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline">
              <div className="font-mono text-muted-foreground text-sm">Header 3</div>
              <div className="md:col-span-3 font-display text-xl font-medium">Recent Threats</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline">
              <div className="font-mono text-muted-foreground text-sm">Body</div>
              <div className="md:col-span-3 font-sans text-base text-muted-foreground leading-relaxed">
                Netraksh is the definitive cyber-safety layer for a digitally accelerating India. We are not just a tool; we are a proactive guardian designed to neutralize threats before they materialize.
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-baseline">
              <div className="font-mono text-muted-foreground text-sm">Caption / Label</div>
              <div className="md:col-span-3 font-sans text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Last updated 2 mins ago
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </section>
  );
}
