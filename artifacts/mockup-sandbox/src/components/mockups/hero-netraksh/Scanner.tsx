import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, MotionConfig, useReducedMotion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, CheckCircle, Search, Smartphone, ShieldCheck, ArrowRight, Activity, XOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./_group.css";

const MOCK_SCANS = [
  { input: "+91 98765 43210", type: "number", status: "danger", title: "High Risk Call", subtitle: "Reported: Courier Scam" },
  { input: "http://free-gift-claim.in", type: "link", status: "danger", title: "Malicious Link", subtitle: "Phishing attempt detected" },
  { input: "raj.kumar@ybl", type: "upi", status: "safe", title: "Safe UPI ID", subtitle: "Verified Merchant" },
];

const TypewriterInput = ({ text, onComplete, isScanning }: { text: string, onComplete: () => void, isScanning: boolean }) => {
  const [displayedText, setDisplayedText] = useState("");
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(text);
      onComplete();
      return;
    }

    let i = 0;
    setDisplayedText("");

    let completeTimer: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        completeTimer = setTimeout(onComplete, 500); // Pause before scanning
      }
    }, 50);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  }, [text, onComplete, prefersReducedMotion]);

  return (
    <div className="flex items-center w-full px-4 h-14 bg-white border-2 rounded-xl text-lg font-mono relative overflow-hidden transition-colors duration-300" style={{ borderColor: isScanning ? 'var(--nk-saffron)' : 'var(--nk-line)'}}>
      <Search className="w-5 h-5 mr-3 text-slate-400" />
      <span className="text-slate-800">{displayedText}</span>
      {!prefersReducedMotion && !isScanning && displayedText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-0.5 h-6 bg-slate-400 ml-1 inline-block"
        />
      )}
      {isScanning && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--nk-saffron-soft)] to-transparent opacity-20"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      )}
    </div>
  );
};

export default function Scanner() {
  const prefersReducedMotion = useReducedMotion();
  const [demoIndex, setDemoIndex] = useState(0);
  const [demoState, setDemoState] = useState<"typing" | "scanning" | "result" | "cta">("typing");

  useEffect(() => {
    if (demoState === "scanning") {
      const timer = setTimeout(() => {
        setDemoState("result");
      }, prefersReducedMotion ? 0 : 1500);
      return () => clearTimeout(timer);
    }
    
    if (demoState === "result") {
      const timer = setTimeout(() => {
        setDemoState("cta");
      }, prefersReducedMotion ? 0 : 2500);
      return () => clearTimeout(timer);
    }
  }, [demoState, prefersReducedMotion]);

  const handleTypingComplete = useCallback(() => {
    setDemoState("scanning");
  }, []);

  const resetDemo = () => {
    setDemoIndex((prev) => (prev + 1) % MOCK_SCANS.length);
    setDemoState("typing");
  };

  const currentScan = MOCK_SCANS[demoIndex];

  return (
    <MotionConfig reducedMotion="user">
      <div 
        className="w-full h-[900px] overflow-hidden relative flex flex-col font-sans"
        style={{ backgroundColor: 'var(--nk-mist)' }}
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, var(--nk-line) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Nav */}
        <header className="w-full h-20 px-8 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-3">
            <img src="/__mockup/images/netraksh-logo.png" alt="Netraksh Logo" className="h-10" />
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--nk-navy)' }}>Netraksh</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-slate-600">
            <span>Features</span>
            <span>Safety Center</span>
            <Button className="rounded-full shadow-md" style={{ backgroundColor: 'var(--nk-navy)', color: 'white' }}>
              Download App
            </Button>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Left Column: Interactive Scanner */}
          <div className="flex flex-col items-start pt-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm mb-6 border shadow-sm bg-white"
              style={{ color: 'var(--nk-navy)', borderColor: 'var(--nk-saffron-soft)' }}
            >
              <Shield className="w-4 h-4" style={{ color: 'var(--nk-saffron)' }} />
              Thag se 2 kadam aage
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
              style={{ color: 'var(--nk-navy)' }}
            >
              India's Digital<br />Bodyguard.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed"
            >
              Paste any suspicious number, link, or UPI ID below. 
              We'll tell you if it's a scam before you make a mistake.
            </motion.p>

            {/* Interactive Scanner Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full max-w-md bg-white p-6 rounded-3xl shadow-xl border border-slate-100 relative z-20"
            >
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Live Threat Scanner</h3>
              
              <AnimatePresence mode="wait">
                {demoState !== "cta" ? (
                  <motion.div
                    key="scanner-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-4"
                  >
                    <TypewriterInput 
                      text={currentScan.input} 
                      onComplete={handleTypingComplete}
                      isScanning={demoState === "scanning"}
                    />
                    
                    <div className="h-20 relative">
                      <AnimatePresence mode="wait">
                        {demoState === "scanning" && (
                          <motion.div
                            key="scanning-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center gap-2 text-slate-500 font-medium"
                          >
                            {!prefersReducedMotion && (
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                                <Activity className="w-5 h-5 text-[var(--nk-saffron)]" />
                              </motion.div>
                            )}
                            Analyzing cross-network signals...
                          </motion.div>
                        )}
                        
                        {demoState === "result" && (
                          <motion.div
                            key="result-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`absolute inset-0 flex items-center p-4 rounded-xl border ${
                              currentScan.status === 'danger' 
                                ? 'bg-red-50 border-red-200 text-red-700' 
                                : 'bg-green-50 border-green-200 text-green-700'
                            }`}
                          >
                            <div className="mr-3">
                              {currentScan.status === 'danger' ? <XOctagon className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="font-bold text-sm leading-tight">{currentScan.title}</p>
                              <p className="text-xs opacity-80 font-medium">{currentScan.subtitle}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="cta-ui"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center py-4"
                  >
                    <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--nk-navy)' }}>
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-lg mb-1" style={{ color: 'var(--nk-navy)' }}>Check Real Numbers</h4>
                    <p className="text-sm text-slate-500 mb-6 px-4">Download the app to scan actual numbers, links, and SMS instantly.</p>
                    <div className="flex gap-3 w-full">
                      <Button className="flex-1 rounded-xl shadow-md h-12 font-bold group" style={{ backgroundColor: 'var(--nk-navy)', color: 'white' }}>
                        Download Netraksh
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                    <button onClick={resetDemo} className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
                      Replay Demo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ONE Big Proof Stat */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 flex items-center gap-6"
            >
              <div className="flex flex-col">
                <span className="text-4xl font-black tracking-tighter" style={{ color: 'var(--nk-navy)' }}>8.5L+</span>
                <span className="text-sm font-bold uppercase tracking-wider text-slate-500 mt-1">Scams Blocked Today</span>
              </div>
              <div className="w-px h-12 bg-slate-300" />
              <p className="text-sm font-medium text-slate-600 max-w-[200px] leading-snug">
                Trusted by Indian families to stop fraud before it happens.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Phone Mockup */}
          <div className="relative h-full w-full flex items-center justify-center lg:justify-end pr-4 lg:pr-12 pointer-events-none">
            
            {/* Soft Glow Behind Phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-60 z-0" />

            {/* Phone Device Frame */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 w-[320px] h-[650px] bg-white rounded-[44px] shadow-2xl border-[8px] flex flex-col overflow-hidden"
              style={{ borderColor: 'var(--nk-ink)' }}
            >
              {/* Phone Notch/Island */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                <div className="w-32 h-6 bg-[var(--nk-ink)] rounded-b-2xl" />
              </div>

              {/* App UI Inside Phone */}
              <div className="flex-1 bg-slate-50 flex flex-col relative pt-12">
                
                {/* Header */}
                <div className="px-6 pb-6 pt-4 bg-[var(--nk-navy)] text-white rounded-b-3xl shadow-sm relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <span className="font-bold text-lg">Netraksh</span>
                    <Shield className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm text-white/70 font-medium mb-1">Status</p>
                    <p className="text-xl font-bold flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[var(--nk-safe)]" />
                      Actively Scanning
                    </p>
                  </div>
                </div>

                {/* Live Threat Card */}
                <div className="px-5 mt-6 flex-1 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Recent Activity</h4>
                  
                  {/* Alert Card */}
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-red-100 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <div className="flex items-start gap-3">
                      <div className="bg-red-50 p-2 rounded-full mt-1">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--nk-ink)] text-sm mb-1">+91 98765 43210</p>
                        <p className="text-xs font-bold text-red-600 mb-2">High Risk • Courier Scam</p>
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                          <XOctagon className="w-3 h-3" /> Auto-Blocked
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Safe Card */}
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 p-2 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--nk-ink)] text-sm">HDFC Bank Alert</p>
                        <p className="text-[11px] text-slate-500">Verified Sender</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Nav Bar Mock */}
                <div className="h-16 bg-white border-t border-slate-100 flex justify-around items-center px-6">
                  <div className="w-6 h-6 rounded bg-[var(--nk-navy)] opacity-20" />
                  <div className="w-6 h-6 rounded-full bg-[var(--nk-navy)]" />
                  <div className="w-6 h-6 rounded bg-[var(--nk-navy)] opacity-20" />
                </div>
              </div>

              {/* Floating Status Chips */}
              {!prefersReducedMotion && (
                <>
                  <motion.div 
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -left-12 top-40 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-[var(--nk-safe)]" />
                    <span className="text-xs font-bold text-[var(--nk-ink)]">Safe Link</span>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute -right-8 bottom-32 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-[var(--nk-danger)] animate-pulse" />
                    <span className="text-xs font-bold text-[var(--nk-ink)]">Scam Blocked</span>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}