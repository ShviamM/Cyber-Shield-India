import { motion } from "framer-motion";
import { LogoMark } from "@/components/logos";

export function Splash() {
  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-b border-border/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="flex flex-col lg:flex-row gap-16 items-center"
      >
        <div className="w-full lg:w-1/2">
          <h2 className="text-sm font-mono tracking-widest text-accent mb-6 uppercase">Product Splash</h2>
          <h3 className="text-3xl md:text-5xl font-display font-semibold mb-8 leading-tight">
            The first impression.
          </h3>
          <p className="text-muted-foreground font-light text-lg leading-relaxed mb-6">
            The launch experience sets the tone. A pure, deep gradient from Midnight Navy to Electric Blue serves as the canvas, while the crisp white mark rests exactly at the golden ratio, providing a moment of calm confidence before the interface appears.
          </p>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-[320px] h-[680px] rounded-[3rem] border-[12px] border-card bg-[#081C3A] overflow-hidden shadow-2xl shrink-0">
            {/* Splash gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#081C3A] to-[#007BFF]" />
            
            {/* StatusBar stub */}
            <div className="absolute top-0 w-full h-12 flex items-center justify-between px-6 z-20">
              <span className="text-[10px] font-sans font-medium text-white">9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2.5 border border-white/80 rounded-sm" />
              </div>
            </div>

            {/* The Mark */}
            <div className="absolute inset-0 flex items-center justify-center mb-16">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <LogoMark className="w-32 h-32 text-white" />
              </motion.div>
            </div>
            
            {/* Loader indicator stub */}
            <div className="absolute bottom-16 w-full flex justify-center">
               <motion.div 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 transition={{ delay: 1, duration: 1 }}
                 className="w-32 h-1 bg-white/20 rounded-full overflow-hidden"
               >
                 <motion.div 
                   initial={{ x: "-100%" }}
                   whileInView={{ x: "0%" }}
                   transition={{ duration: 1.5, ease: "circOut", delay: 1 }}
                   className="w-full h-full bg-white rounded-full"
                 />
               </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
