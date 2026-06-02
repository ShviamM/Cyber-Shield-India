import { motion } from "framer-motion";
import { LogoWordmark } from "@/components/logos";

export function Footer() {
  return (
    <footer className="py-24 px-6 md:px-12 text-center flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <LogoWordmark className="w-64 md:w-96 text-foreground mb-8 mx-auto" />
        <p className="text-xl md:text-2xl font-display text-accent font-medium tracking-tight">
          Two steps ahead.
        </p>
        <div className="mt-16 text-sm text-muted-foreground font-mono opacity-50">
          CONFIDENTIAL & PROPRIETARY &copy; {new Date().getFullYear()}
        </div>
      </motion.div>
    </footer>
  );
}
