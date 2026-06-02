import { motion } from "framer-motion";
import { LogoMark, LogoStacked } from "@/components/logos";

export function DoDont() {
  const rules = [
    {
      title: "Don't stretch or distort",
      type: "dont" as const,
      render: () => <LogoMark className="w-32 h-32 scale-x-150" />
    },
    {
      title: "Don't arbitrarily recolor",
      type: "dont" as const,
      render: () => <LogoMark className="w-32 h-32 text-pink-500" />
    },
    {
      title: "Don't add drop shadows",
      type: "dont" as const,
      render: () => <LogoMark className="w-32 h-32 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]" />
    },
    {
      title: "Don't rotate the mark",
      type: "dont" as const,
      render: () => <LogoMark className="w-32 h-32 rotate-45" />
    },
    {
      title: "Don't place on busy backgrounds",
      type: "dont" as const,
      render: () => (
        <div className="w-full h-full absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,#000_0px,#000_10px,#333_10px,#333_20px)] overflow-hidden rounded-xl">
          <LogoMark className="w-32 h-32 text-white relative z-10" />
        </div>
      )
    },
    {
      title: "Do use authorized monochrome",
      type: "do" as const,
      render: () => <LogoMark className="w-32 h-32 text-foreground" />
    }
  ];

  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-b border-border/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-sm font-mono tracking-widest text-accent mb-6 uppercase">Usage Rules</h2>
        <h3 className="text-3xl md:text-5xl font-display font-semibold mb-16 leading-tight">
          Do's and Don'ts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {rules.map((rule, i) => (
            <div key={i} className="flex flex-col">
              <div className="relative bg-card border border-border/50 rounded-2xl h-64 flex items-center justify-center p-8 mb-4 overflow-hidden">
                {rule.render()}
              </div>
              <div className="flex items-center gap-3">
                {rule.type === "do" ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-destructive/20 text-destructive flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </div>
                )}
                <span className="font-medium">{rule.title}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
