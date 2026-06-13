import React, { useState, useEffect } from "react";
import { motion, MotionConfig, useReducedMotion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, ShieldAlert, CheckCircle, Search, SearchCode, Fingerprint, Lock, ChevronRight } from "lucide-react";
import "./_group.css";

const MOCK_NUMBER = "+91 98765 43210";

function PhoneMockup() {
  const prefersReducedMotion = useReducedMotion();
  const [scanStep, setScanStep] = useState(0); // 0: scanning, 1: found

  useEffect(() => {
    if (prefersReducedMotion) {
      setScanStep(1);
      return;
    }
    const timer = setTimeout(() => {
      setScanStep(1);
    }, 2500);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  return (
    <div className="relative w-full max-w-[320px] mx-auto z-10 perspective-[1000px]">
      {/* Phone Body */}
      <motion.div 
        className="relative bg-white rounded-[3rem] p-3 shadow-2xl border-4 border-gray-100 overflow-hidden bg-clip-padding aspect-[9/19] flex flex-col"
        initial={prefersReducedMotion ? {} : { rotateY: 15, rotateX: 5, y: 20, opacity: 0 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { rotateY: 0, rotateX: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-100 rounded-b-xl z-20"></div>

        {/* Screen */}
        <div className="flex-1 bg-gray-50 rounded-[2rem] overflow-hidden relative flex flex-col pt-12">
          
          <div className="px-6 pb-6 flex-1 flex flex-col justify-center relative z-10">
            {scanStep === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center h-full space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-[var(--nk-navy)] opacity-20"
                    animate={prefersReducedMotion ? {} : { scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="w-16 h-16 rounded-full bg-[var(--nk-navy)] flex items-center justify-center text-white shadow-lg">
                    <Search className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[var(--nk-navy)] font-semibold text-lg animate-pulse">Scanning Call...</p>
                  <p className="text-sm text-gray-500 font-mono tracking-widest">{MOCK_NUMBER}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="flex flex-col h-full justify-center space-y-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="bg-red-50 rounded-2xl p-5 border border-red-100 text-center shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[var(--nk-danger)]" />
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-[var(--nk-danger)]">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-[var(--nk-danger)] font-bold text-xl mb-1">HIGH RISK</h3>
                  <p className="text-sm text-gray-600 font-medium mb-3">Courier Scam Reported</p>
                  <div className="inline-block px-3 py-1 bg-white rounded border border-gray-200 text-xs font-mono text-gray-500">
                    {MOCK_NUMBER}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button className="py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold text-sm">Allow</button>
                  <button className="py-3 rounded-xl bg-[var(--nk-danger)] text-white font-semibold text-sm shadow-md">Block & Report</button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Scanner Line */}
          {scanStep === 0 && !prefersReducedMotion && (
            <motion.div 
              className="absolute left-0 w-full h-1 bg-[var(--nk-saffron)] shadow-[0_0_15px_var(--nk-saffron)] z-20"
              animate={{ top: ["10%", "90%", "10%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}

        </div>
      </motion.div>

      {/* Floating Chips */}
      <AnimatePresence>
        {scanStep === 1 && (
          <>
            <motion.div 
              className="absolute top-1/4 -right-12 bg-white rounded-xl p-3 shadow-xl border border-gray-100 flex items-center gap-2 z-30"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 20, y: 10 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-[var(--nk-safe)]">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--nk-ink)]">Call Blocked</p>
                <p className="text-[10px] text-gray-500">Safe network</p>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-1/3 -left-8 bg-white rounded-xl p-3 shadow-xl border border-gray-100 flex items-center gap-2 z-30"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20, y: -10 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[var(--nk-navy)]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--nk-ink)]">Link Verified</p>
                <p className="text-[10px] text-gray-500">Zero threat</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TeaserInput() {
  const [demoState, setDemoState] = useState(0); // 0: empty, 1: typed, 2: checked
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      // Render the end state (scam detected -> download CTA) without looping.
      setDemoState(2);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (next: number, delay: number) => {
      timer = setTimeout(() => {
        setDemoState(next);
        if (next === 1) schedule(2, 1000);
        else if (next === 2) schedule(0, 5000);
        else schedule(1, 4000);
      }, delay);
    };
    schedule(1, 4000);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  return (
    <div className="w-full max-w-lg mt-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-2 relative overflow-hidden group">
      <div className="flex items-center">
        <div className="pl-4 pr-2 text-gray-400">
          <SearchCode className="w-5 h-5" />
        </div>
        <div className="flex-1 h-12 flex items-center relative">
          <AnimatePresence mode="wait">
            {demoState === 0 && (
              <motion.p 
                key="placeholder"
                className="text-gray-400 absolute w-full pointer-events-none"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                Paste a suspicious number or link...
              </motion.p>
            )}
            {demoState >= 1 && (
              <motion.p 
                key="typed"
                className="text-[var(--nk-ink)] font-mono font-medium absolute w-full pointer-events-none"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              >
                +91 98765 43210
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        <div className="pr-1 relative z-10">
          {demoState < 2 ? (
            <button className="h-10 px-6 bg-[var(--nk-mist)] text-[var(--nk-navy)] font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm">
              Check
            </button>
          ) : (
            <motion.button 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-10 px-4 bg-[var(--nk-danger)] text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-md"
            >
              <ShieldAlert className="w-4 h-4" /> Scam Detected! Download to Block
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Decorative scan line for demo */}
      {demoState === 1 && !prefersReducedMotion && (
        <motion.div 
          className="absolute inset-0 bg-[var(--nk-navy)]/5 z-0"
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 1, ease: "linear" }}
        />
      )}
    </div>
  );
}

export default function PremiumTrustHero() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative w-full min-h-[900px] flex flex-col bg-[var(--nk-mist)] overflow-hidden font-sans selection:bg-[var(--nk-navy)] selection:text-white">
        
        {/* Ambient Institutional Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px] opacity-80 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-[140px] opacity-60 pointer-events-none" />

        {/* Header / Nav */}
        <header className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/__mockup/images/netraksh-logo.png" alt="Netraksh Logo" className="h-10 w-auto" />
            <span className="text-[var(--nk-navy)] font-bold tracking-tight text-xl tracking-wide">Netraksh</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[var(--nk-ink)] font-medium text-sm">
            <a href="#" className="hover:text-[var(--nk-navy)] transition-colors">Features</a>
            <a href="#" className="hover:text-[var(--nk-navy)] transition-colors">How it Works</a>
            <a href="#" className="hover:text-[var(--nk-navy)] transition-colors">Safety Center</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="hidden md:inline-flex text-[var(--nk-navy)] font-semibold text-sm hover:opacity-80 transition-opacity">Login</button>
            <button className="bg-[var(--nk-navy)] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Download App
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-center gap-16 pb-20">
          
          <div className="flex-1 max-w-2xl pt-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-[var(--nk-ink)] mb-8">
                <ShieldCheck className="w-4 h-4 text-[var(--nk-saffron)]" />
                <span>Thag se 2 kadam aage</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-[var(--nk-navy-deep)] leading-[1.1] tracking-tight mb-6">
                India's Digital <br />
                <span className="text-[var(--nk-navy)] relative inline-block">
                  Bodyguard.
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--nk-saffron)] opacity-80" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0,10 Q100,0 200,10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
                Protect your family from scam calls, fraud SMS, fake links, and UPI fraud in real time. We watch the digital threats so you don't have to.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button className="w-full sm:w-auto px-8 h-14 rounded-full bg-[var(--nk-navy)] text-white font-bold text-lg shadow-[0_8px_20px_rgba(11,61,145,0.2)] hover:shadow-[0_12px_25px_rgba(11,61,145,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group">
                  Download Netraksh
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto px-8 h-14 rounded-full bg-white border border-gray-200 text-[var(--nk-navy)] font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  See How It Works
                </button>
              </div>

              {/* Big Proof Stat */}
              <div className="mt-16 pt-8 border-t border-gray-200/60 flex items-center gap-6">
                <div>
                  <h3 className="text-4xl font-extrabold text-[var(--nk-navy)] tracking-tight">1.2L+</h3>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-1">Families Protected</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--nk-mist)] bg-gray-100 flex items-center justify-center overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/initials/svg?seed=Family${i}&backgroundColor=cbd5e1`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-[var(--nk-mist)] bg-white flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                    +
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <TeaserInput />
            </motion.div>
          </div>

          <div className="flex-1 w-full lg:max-w-md pt-10 lg:pt-0">
            <PhoneMockup />
          </div>

        </div>
        
      </section>
    </MotionConfig>
  );
}
