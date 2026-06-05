import { motion, useReducedMotion } from "framer-motion";
import { Shield, AlertCircle, Scan, MessageSquare, PhoneIncoming } from "lucide-react";
import { useState, useEffect } from "react";

export function CyberRadar() {
  const prefersReducedMotion = useReducedMotion();
  const [activeThreat, setActiveThreat] = useState(0);

  const threats = [
    { label: "Digital Arrest", icon: AlertCircle, x: "20%", y: "30%", color: "text-red-500", bg: "bg-red-500/20" },
    { label: "UPI Fraud", icon: Scan, x: "75%", y: "25%", color: "text-orange-500", bg: "bg-orange-500/20" },
    { label: "Scam Call", icon: PhoneIncoming, x: "80%", y: "70%", color: "text-amber-500", bg: "bg-amber-500/20" },
    { label: "Fraud SMS", icon: MessageSquare, x: "25%", y: "75%", color: "text-yellow-500", bg: "bg-yellow-500/20" },
  ];

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveThreat((prev) => (prev + 1) % threats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [threats.length, prefersReducedMotion]);

  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto flex items-center justify-center">
      {/* Radar circles */}
      <div className="absolute inset-0 rounded-full border border-gray-200/50" />
      <div className="absolute inset-8 rounded-full border border-gray-200/50" />
      <div className="absolute inset-16 rounded-full border border-gray-200/50" />
      <div className="absolute inset-24 rounded-full border border-gray-200/50 bg-gray-50/50" />
      
      {/* Radar sweep */}
      {!prefersReducedMotion && (
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 70%, rgba(11, 61, 145, 0.1) 100%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
      )}

      {/* Center Shield */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-primary p-4 rounded-full text-white shadow-xl shadow-primary/20">
          <Shield className="h-8 w-8" />
        </div>
      </div>

      {/* Threats */}
      {threats.map((threat, i) => {
        const Icon = threat.icon;
        const isActive = activeThreat === i;
        
        return (
          <motion.div
            key={i}
            className="absolute z-20 flex flex-col items-center gap-2"
            style={{ left: threat.x, top: threat.y, transform: "translate(-50%, -50%)" }}
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ 
              opacity: isActive ? 1 : 0.4,
              scale: isActive ? 1.1 : 0.8,
            }}
            transition={{ duration: 0.5 }}
          >
            <div className={`p-2 rounded-full ${threat.bg} ${threat.color} ${isActive && !prefersReducedMotion ? 'animate-pulse' : ''}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className={`text-xs font-bold whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
              {threat.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
