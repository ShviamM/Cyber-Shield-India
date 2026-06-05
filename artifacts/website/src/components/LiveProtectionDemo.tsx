import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  PhoneIncoming,
  MessageSquare,
  MessageCircle,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Check,
  type LucideIcon,
} from "lucide-react";

type Scenario = {
  id: string;
  tab: string;
  icon: LucideIcon;
  accent: string;
  ring: string;
  chip: string;
  phoneTitle: string;
  phoneSubtitle: string;
  steps: string[];
  verdict: string;
  verdictTone: "danger" | "safe";
};

const scenarios: Scenario[] = [
  {
    id: "call",
    tab: "Scam Call",
    icon: PhoneIncoming,
    accent: "text-red-400",
    ring: "bg-red-500/15 text-red-400 border-red-500/30",
    chip: "from-red-950 to-gray-950",
    phoneTitle: "+91 98765-43210",
    phoneSubtitle: "Reported as Bank Scam",
    steps: ["Incoming Call", "Netraksh Detects Risk", "Warning Displayed", "You Stay Protected"],
    verdict: "High Risk — Call Blocked",
    verdictTone: "danger",
  },
  {
    id: "sms",
    tab: "SMS Fraud",
    icon: MessageSquare,
    accent: "text-amber-400",
    ring: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    chip: "from-amber-950 to-gray-950",
    phoneTitle: "Your A/c will be blocked",
    phoneSubtitle: "Update KYC: http://bit.ly/fake",
    steps: ["Message Received", "Netraksh Analyzes", "Marked Dangerous", "Do Not Click"],
    verdict: "Phishing Link — Blocked",
    verdictTone: "danger",
  },
  {
    id: "whatsapp",
    tab: "WhatsApp Scam",
    icon: MessageCircle,
    accent: "text-green-400",
    ring: "bg-green-500/15 text-green-400 border-green-500/30",
    chip: "from-emerald-950 to-gray-950",
    phoneTitle: "Forwarded many times",
    phoneSubtitle: "“Win ₹25,000 — claim now!”",
    steps: ["Share to Netraksh", "AI Analysis", "Scam Detected", "Protection Advice"],
    verdict: "Lottery Scam — Avoid",
    verdictTone: "danger",
  },
  {
    id: "qr",
    tab: "QR Fraud",
    icon: QrCode,
    accent: "text-blue-400",
    ring: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    chip: "from-blue-950 to-gray-950",
    phoneTitle: "Scanning QR Code",
    phoneSubtitle: "Verifying merchant…",
    steps: ["Scan QR", "Netraksh Checks", "Safe or Dangerous", "Decision Made"],
    verdict: "Verified Merchant — Safe",
    verdictTone: "safe",
  },
];

export function LiveProtectionDemo() {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const scenario = scenarios[active];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next =
      e.key === "ArrowRight"
        ? (i + 1) % scenarios.length
        : (i - 1 + scenarios.length) % scenarios.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  useEffect(() => {
    setStep(0);
    if (prefersReducedMotion) {
      setStep(scenario.steps.length - 1);
      return;
    }
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % scenario.steps.length);
    }, 1400);
    return () => clearInterval(timer);
  }, [active, prefersReducedMotion, scenario.steps.length]);

  const Icon = scenario.icon;
  const complete = step === scenario.steps.length - 1;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tabs */}
      <div role="tablist" aria-label="Protection scenarios" className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
        {scenarios.map((s, i) => {
          const TabIcon = s.icon;
          const isActive = active === i;
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`demo-tab-${s.id}`}
              aria-selected={isActive}
              aria-controls={`demo-panel-${s.id}`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                isActive
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {s.tab}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`demo-panel-${scenario.id}`}
        aria-labelledby={`demo-tab-${scenario.id}`}
        className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
      >
        {/* Phone visualization */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[260px] aspect-[9/19] rounded-[2.5rem] border-[8px] border-gray-900 bg-gray-950 shadow-2xl overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-black rounded-full z-50" />
            <AnimatePresence mode="wait">
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 bg-gradient-to-b ${scenario.chip} flex flex-col px-5 pt-16 pb-6 text-white`}
              >
                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={prefersReducedMotion ? {} : { scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className={`p-5 rounded-full border ${scenario.ring}`}
                  >
                    <Icon className="h-9 w-9" />
                  </motion.div>
                </div>

                <p className={`text-center text-[10px] font-bold tracking-widest uppercase mb-2 ${scenario.accent}`}>
                  Netraksh Scanning
                </p>
                <h4 className="text-center text-base font-bold leading-snug">{scenario.phoneTitle}</h4>
                <p className="text-center text-xs text-gray-400 mt-1">{scenario.phoneSubtitle}</p>

                <div className="mt-auto">
                  <AnimatePresence mode="wait">
                    {complete && (
                      <motion.div
                        key="verdict"
                        initial={{ y: 16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`rounded-2xl p-4 flex items-center gap-3 border ${
                          scenario.verdictTone === "safe"
                            ? "bg-green-500/15 border-green-500/40 text-green-400"
                            : "bg-red-500/15 border-red-500/40 text-red-400"
                        }`}
                      >
                        {scenario.verdictTone === "safe" ? (
                          <ShieldCheck className="h-7 w-7 shrink-0" />
                        ) : (
                          <ShieldAlert className="h-7 w-7 shrink-0" />
                        )}
                        <p className="text-sm font-bold leading-tight">{scenario.verdict}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {scenario.steps.map((label, i) => {
            const reached = i <= step;
            const isCurrent = i === step;
            return (
              <motion.div
                key={`${scenario.id}-${i}`}
                animate={{
                  opacity: reached ? 1 : 0.4,
                  scale: isCurrent && !prefersReducedMotion ? 1.02 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                  reached ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50 border-gray-100"
                }`}
              >
                <div
                  className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                    reached ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {reached ? <Check className="h-5 w-5" /> : i + 1}
                </div>
                <span className={`font-semibold ${reached ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
