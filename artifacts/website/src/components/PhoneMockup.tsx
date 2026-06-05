import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck, Smartphone, ScanLine, MessageSquare, AlertOctagon, XCircle, CheckCircle2 } from "lucide-react";

export function PhoneMockup() {
  const prefersReducedMotion = useReducedMotion();
  const [scenario, setScenario] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setScenario((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  return (
    <div className="relative w-full max-w-[300px] mx-auto aspect-[9/19] rounded-[2.5rem] border-[8px] border-gray-900 bg-gray-950 shadow-2xl overflow-hidden flex flex-col text-white">
      {/* Dynamic Island / Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-black rounded-full z-50"></div>
      
      <div className="flex-1 relative flex flex-col">
        <AnimatePresence mode="wait">
          {scenario === 0 && (
            <motion.div 
              key="call"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-red-950 to-gray-950 flex flex-col px-4 pt-16 pb-8"
            >
              <div className="flex justify-center mb-6">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="bg-red-500/20 p-4 rounded-full"
                >
                  <div className="bg-red-500 p-4 rounded-full">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
              </div>
              
              <div className="text-center mb-8">
                <p className="text-red-400 font-bold tracking-widest text-xs mb-2 animate-pulse">HIGH RISK CALL</p>
                <h3 className="text-2xl font-bold mb-1">+91 98765-43210</h3>
                <p className="text-gray-400 text-sm">Reported as Courier Scam</p>
              </div>

              <div className="mt-auto">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-primary p-4 rounded-2xl flex items-center gap-4 mb-4"
                >
                  <ShieldCheck className="h-8 w-8 text-white" />
                  <div>
                    <p className="font-bold text-sm">Netraksh Active</p>
                    <p className="text-xs text-blue-200">Call Auto-Blocked</p>
                  </div>
                </motion.div>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-red-500/20 border border-red-500/50 py-3 rounded-xl flex justify-center text-red-500">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 bg-green-500/20 border border-green-500/50 py-3 rounded-xl flex justify-center text-green-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {scenario === 1 && (
            <motion.div 
              key="sms"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950 flex flex-col px-4 pt-16 pb-8"
            >
              <div className="bg-gray-900 rounded-2xl p-4 mb-4 border border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500/20 p-2 rounded-full text-blue-400"><MessageSquare className="h-4 w-4" /></div>
                  <span className="text-sm font-semibold">Unknown Sender</span>
                </div>
                <p className="text-sm text-gray-300">Your electricity connection will be disconnected tonight at 9:30 PM. Update your KYC here: http://bit.ly/fake-update</p>
              </div>

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-red-950/50 border border-red-900/50 rounded-2xl p-4 mt-2"
              >
                <div className="flex items-center gap-3 mb-2 text-red-400">
                  <AlertOctagon className="h-5 w-5" />
                  <span className="font-bold text-sm">Dangerous Link Detected</span>
                </div>
                <p className="text-xs text-red-200/70">Our AI has blocked access to this phishing site. Do not share OTPs.</p>
              </motion.div>
            </motion.div>
          )}

          {scenario === 2 && (
            <motion.div 
              key="qr"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950 flex flex-col px-4 pt-16 pb-8 items-center"
            >
               <div className="text-center mb-8">
                <ScanLine className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold">Scanning QR...</h3>
              </div>
              
              <div className="relative w-48 h-48 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center">
                <motion.div 
                  className="absolute inset-x-0 h-1 bg-accent/80 shadow-[0_0_8px_rgba(255,103,19,0.8)]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
                <ScanLine className="h-24 w-24 text-gray-800" />
              </div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-green-950/50 border border-green-900/50 rounded-2xl p-4 mt-8 w-full flex items-center gap-3 text-green-400"
              >
                <CheckCircle2 className="h-6 w-6 shrink-0" />
                <div className="text-left">
                  <p className="font-bold text-sm">Verified Merchant</p>
                  <p className="text-xs text-green-200/70">Safe to pay</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
