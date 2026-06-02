import { motion } from "framer-motion";
import { 
  LogoMark, 
  LogoWordmark, 
  LogoStacked, 
  LogoHorizontal, 
  LogoAppIcon, 
  LogoFavicon,
  LogoMonochrome
} from "@/components/logos";

export function LogoSystem() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-b border-border/20">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
      >
        <h2 className="text-sm font-mono tracking-widest text-accent mb-12 uppercase">Logo System</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Plate title="Primary Stacked" variants={item}>
            <LogoStacked className="w-48" />
          </Plate>
          <Plate title="Primary Horizontal" variants={item}>
            <LogoHorizontal className="w-64" />
          </Plate>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Plate title="Standalone Icon" variants={item} className="h-64">
            <LogoMark className="w-32 h-32" />
          </Plate>
          <Plate title="App Icon (Large)" variants={item} className="h-64">
            <LogoAppIcon className="w-32 h-32 drop-shadow-xl" />
          </Plate>
          <Plate title="App Icon (Small 32px)" variants={item} className="h-64">
            <div className="flex flex-col items-center gap-4">
              <LogoAppIcon className="w-8 h-8 drop-shadow-sm" />
              <span className="text-xs text-muted-foreground mt-4 font-mono">Legible at 32px</span>
            </div>
          </Plate>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Plate title="Monochrome (Light/Dark Context)" variants={item} className="p-0 overflow-hidden h-72">
            <div className="flex h-full w-full">
              <div className="w-1/2 bg-white flex items-center justify-center p-8">
                <LogoMonochrome fill="#081C3A" className="w-24 h-24" />
              </div>
              <div className="w-1/2 bg-[#081C3A] flex items-center justify-center p-8">
                <LogoMonochrome fill="#ffffff" className="w-24 h-24" />
              </div>
            </div>
          </Plate>
          
          <Plate title="Favicon" variants={item} className="h-72">
            <div className="flex flex-col items-center gap-8">
              <LogoFavicon className="w-16 h-16" />
              <div className="flex gap-4 items-center bg-muted px-4 py-2 rounded-md border border-border">
                <LogoFavicon className="w-4 h-4" />
                <span className="text-sm font-mono opacity-80">netraksh.com</span>
              </div>
            </div>
          </Plate>
        </div>

      </motion.div>
    </section>
  );
}

function Plate({ children, title, className = "", variants }: any) {
  return (
    <motion.div variants={variants} className="flex flex-col group">
      <div className={`relative bg-card border border-border/50 rounded-2xl flex items-center justify-center p-12 transition-colors group-hover:border-accent/50 ${className}`}>
        {children}
      </div>
      <div className="mt-4 text-sm font-medium text-muted-foreground tracking-wide">{title}</div>
    </motion.div>
  );
}
