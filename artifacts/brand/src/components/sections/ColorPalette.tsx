import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const colors = {
  primary: [
    { name: "Midnight Navy", hex: "#081C3A", textClass: "text-white" },
    { name: "Electric Blue", hex: "#007BFF", textClass: "text-white" },
  ],
  accents: [
    { name: "Cyan", hex: "#00D4FF", textClass: "text-[#081C3A]" },
    { name: "Emerald", hex: "#00C896", textClass: "text-[#081C3A]" },
    { name: "Saffron", hex: "#FF6713", textClass: "text-white" },
  ],
  neutrals: [
    { name: "Silver Gray", hex: "#C6D0DC", textClass: "text-[#081C3A]" },
    { name: "White", hex: "#FFFFFF", textClass: "text-[#081C3A]" },
  ]
};

export function ColorPalette() {
  const { toast } = useToast();

  const handleCopy = (hex: string, name: string) => {
    navigator.clipboard.writeText(hex);
    toast({
      title: "Color Copied",
      description: `${name} (${hex}) copied to clipboard.`,
    });
  };

  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-b border-border/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-sm font-mono tracking-widest text-accent mb-6 uppercase">Color System</h2>
        <h3 className="text-3xl md:text-5xl font-display font-semibold mb-16 leading-tight">
          Precision in color.
        </h3>

        <div className="space-y-16">
          <div>
            <h4 className="font-display text-xl mb-6 text-muted-foreground">Primary Brand</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {colors.primary.map(c => (
                <ColorSwatch key={c.hex} color={c} onCopy={handleCopy} />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-display text-xl mb-6 text-muted-foreground">Functional Accents</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {colors.accents.map(c => (
                <ColorSwatch key={c.hex} color={c} onCopy={handleCopy} />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-xl mb-6 text-muted-foreground">Neutrals</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {colors.neutrals.map(c => (
                <ColorSwatch key={c.hex} color={c} onCopy={handleCopy} border={c.hex === '#FFFFFF'} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ColorSwatch({ color, onCopy, border = false }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`rounded-2xl overflow-hidden shadow-sm bg-card cursor-pointer group flex flex-col h-64 border ${border ? 'border-border' : 'border-transparent'}`}
      onClick={() => onCopy(color.hex, color.name)}
    >
      <div className={`flex-grow p-6 flex flex-col justify-end ${color.textClass} relative`} style={{ backgroundColor: color.hex }}>
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="font-mono text-sm font-medium tracking-wider opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
          CLICK TO COPY
        </div>
      </div>
      <div className="p-6 bg-card border-t border-border/50">
        <h3 className="font-display font-semibold text-lg">{color.name}</h3>
        <p className="text-muted-foreground font-mono mt-1 text-sm">{color.hex}</p>
      </div>
    </motion.div>
  );
}
