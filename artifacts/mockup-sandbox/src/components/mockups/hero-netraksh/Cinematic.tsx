import React, { useState, useEffect, useRef } from "react";
import { motion, MotionConfig, useReducedMotion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, CheckCircle, Search, ArrowRight, Lock, Activity, ShieldCheck, AlertOctagon } from "lucide-react";
import "./_group.css";

function ScanLine() {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[var(--nk-saffron)] opacity-50 shadow-[0_0_15px_var(--nk-saffron)]" />;
  }

  return (
    <motion.div
      className="absolute inset-x-0 h-[2px] bg-[var(--nk-saffron)] shadow-[0_0_20px_var(--nk-saffron)] z-50"
      animate={{ top: ["0%", "100%", "0%"] }}
      transition={{ duration: 3, ease: "linear", repeat: Infinity }}
    />
  );
}

function PhoneMockup() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="relative w-[280px] h-[580px] rounded-[40px] border-[8px] border-[#1a253c] bg-[#0c1424] overflow-hidden shadow-2xl shrink-0 flex flex-col items-center justify-center">
      {/* Top notch */}
      <div className="absolute top-0 inset-x-0 flex justify-center z-50">
        <div className="w-[120px] h-[24px] bg-[#1a253c] rounded-b-2xl" />
      </div>

      <ScanLine />

      {/* Screen Content */}
      <div className="w-full h-full p-4 flex flex-col gap-4 relative z-10 pt-12">
        <div className="text-center mb-4">
          <motion.div 
            className="w-20 h-20 mx-auto rounded-full bg-[var(--nk-danger)]/20 flex items-center justify-center mb-4"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-16 h-16 rounded-full bg-[var(--nk-danger)]/40 flex items-center justify-center">
              <ShieldAlert className="text-[var(--nk-danger)] w-8 h-8" />
            </div>
          </motion.div>
          <h3 className="text-xl font-bold text-[var(--nk-cloud)] tracking-wide">Incoming Call</h3>
          <p className="text-[var(--nk-danger)] font-semibold mt-1 animate-pulse">HIGH RISK</p>
        </div>

        <div className="bg-[#152033] rounded-2xl p-4 border border-[var(--nk-danger)]/30 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--nk-danger)]/10 blur-xl rounded-full" />
          <p className="text-[var(--nk-cloud)] text-lg font-bold font-mono tracking-wider">+91 98765 43210</p>
          <div className="flex items-center gap-2 mt-2">
            <AlertOctagon className="w-4 h-4 text-[var(--nk-danger)]" />
            <p className="text-sm text-[var(--nk-danger)]">Reported: Courier Scam</p>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4">
          <button className="h-14 rounded-full bg-[var(--nk-danger)] text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_var(--nk-danger)]">
            BLOCK
          </button>
          <button className="h-14 rounded-full bg-[#1a253c] text-white font-bold">
            IGNORE
          </button>
        </div>
      </div>

      {/* Glow Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--nk-danger)]/10 to-transparent pointer-events-none" />
    </div>
  );
}

function TeaserInput() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "result">("idle");
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCheck = () => {
    if (!value) return;
    setStatus("scanning");
    
    if (prefersReducedMotion) {
      setStatus("result");
    } else {
      timerRef.current = setTimeout(() => {
        setStatus("result");
      }, 2000);
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setValue("");
  };

  return (
    <div className="w-full max-w-md mx-auto md:mx-0 bg-[#0c1424]/80 backdrop-blur-xl border border-[var(--nk-line)] p-6 rounded-3xl relative overflow-hidden">
      {/* Saffron accent beam from top */}
      <div className="absolute top-0 left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-[var(--nk-saffron)] to-transparent opacity-80" />

      <h4 className="text-[var(--nk-cloud)] font-semibold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-[var(--nk-saffron)]" />
        Check a Number or Link
      </h4>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. 9876543210 or bit.ly/scam"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-[#152033] border border-[var(--nk-line)] rounded-xl px-4 py-3 text-[var(--nk-cloud)] placeholder:text-gray-500 focus:outline-none focus:border-[var(--nk-saffron)] transition-colors font-mono"
            />
            <button
              onClick={handleCheck}
              disabled={!value}
              className="w-full bg-[var(--nk-navy)] hover:bg-[var(--nk-navy-700)] text-[var(--nk-cloud)] font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Analyze Threat Level
            </button>
          </motion.div>
        )}

        {status === "scanning" && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 flex flex-col items-center justify-center gap-4"
          >
            <div className="relative">
              <Activity className="w-8 h-8 text-[var(--nk-saffron)] animate-pulse" />
              <motion.div 
                className="absolute inset-0 border-2 border-[var(--nk-saffron)] rounded-full"
                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            <p className="text-gray-400 font-mono text-sm animate-pulse">Running heuristic scan...</p>
          </motion.div>
        )}

        {status === "result" && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 py-2"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--nk-danger)]/20 flex items-center justify-center text-[var(--nk-danger)]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[var(--nk-cloud)] font-medium">This looks suspicious.</p>
              <p className="text-sm text-gray-400 mt-1">Found in our threat database.</p>
            </div>
            <button className="w-full mt-2 bg-[var(--nk-navy)] text-white py-3 rounded-xl font-medium shadow-[0_0_20px_rgba(11,61,145,0.4)] flex items-center justify-center gap-2 hover:bg-[var(--nk-navy-700)] transition-colors">
              Download to block <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-300">
              Check another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Cinematic() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2, delayChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div 
        className="relative min-h-[900px] w-full bg-[var(--nk-navy-deep)] overflow-hidden font-sans text-[var(--nk-cloud)] flex flex-col"
        style={{ fontFamily: "var(--nk-font)" }}
      >
        {/* Atmospheric Background Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--nk-navy)_0%,_transparent_60%)] opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--nk-saffron)_0%,_transparent_40%)] opacity-5 pointer-events-none mix-blend-screen" />
        
        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />

        {/* Top Nav / Wordmark */}
        <header className="absolute top-0 inset-x-0 p-8 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/__mockup/images/netraksh-logo.png" alt="Netraksh Logo" className="w-10 h-10 object-contain drop-shadow-md" />
            <span className="text-xl font-bold tracking-wide">Netraksh</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Safety Center</a>
            <a href="#" className="hover:text-white transition-colors">About Us</a>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative z-10 flex items-center pt-24 pb-12">
          <div className="w-full max-w-7xl mx-auto px-8 md:px-12 grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Left Column: Copy & CTAs */}
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible"
              className="flex flex-col items-start max-w-2xl pt-8"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--nk-saffron)]/30 bg-[var(--nk-saffron)]/10 text-[var(--nk-saffron)] text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(255,103,19,0.15)]">
                <ShieldCheck className="w-4 h-4" />
                <span>Thag se 2 kadam aage</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-white drop-shadow-lg">
                India's <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Digital Bodyguard</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-300 mb-12 max-w-lg leading-relaxed font-light">
                We stand between your family and financial fraud. 
                Blocking scam calls, detecting fake links, and securing UPI in real-time.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
                <button className="px-8 py-4 rounded-xl bg-[var(--nk-navy)] text-white font-semibold text-lg hover:bg-[var(--nk-navy-700)] transition-all shadow-[0_0_20px_rgba(11,61,145,0.5)] border border-[var(--nk-navy-700)] flex items-center justify-center gap-2">
                  Download Netraksh <Lock className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 rounded-xl bg-transparent border border-gray-600 text-gray-200 font-semibold text-lg hover:bg-white/5 hover:border-gray-400 transition-all flex items-center justify-center">
                  See How It Works
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="w-full">
                <TeaserInput />
              </motion.div>
            </motion.div>

            {/* Right Column: Visuals & Proof Stat */}
            <div className="relative flex justify-center lg:justify-end lg:pr-12">
              
              {/* Massive Proof Stat - Floating behind/next to phone */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                className="absolute -top-12 -left-4 lg:-left-20 bg-[#0c1424]/90 backdrop-blur-md p-6 rounded-3xl border border-[var(--nk-line)] shadow-2xl z-20"
              >
                <p className="text-5xl font-extrabold text-[var(--nk-cloud)] tracking-tighter">8.5L+</p>
                <p className="text-sm font-medium text-[var(--nk-saffron)] mt-1 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Scams Blocked
                </p>
              </motion.div>

              {/* Status Chip - Floating right */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                className="absolute bottom-24 -right-4 lg:-right-8 bg-[#0c1424]/90 backdrop-blur-md px-5 py-3 rounded-full border border-[var(--nk-safe)]/30 shadow-2xl z-20 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--nk-safe)] animate-pulse" />
                <span className="text-sm font-medium text-[var(--nk-cloud)]">Active Protection ON</span>
              </motion.div>

              {/* Saffron Scanner Light Beam effect behind phone */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-[var(--nk-saffron)]/10 blur-[100px] rounded-full pointer-events-none" />

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                className="relative z-10 drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]"
              >
                <PhoneMockup />
              </motion.div>
            </div>
            
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
