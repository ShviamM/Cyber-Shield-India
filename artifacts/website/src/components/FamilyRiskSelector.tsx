import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  HeartPulse,
  GraduationCap,
  Briefcase,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

type Member = {
  id: string;
  label: string;
  icon: typeof Users;
  age: string;
  topThreat: string;
  scenario: string;
  protections: string[];
};

const MEMBERS: Member[] = [
  {
    id: "parents",
    label: "Parents",
    icon: Users,
    age: "45–60 yrs",
    topThreat: "Fake KYC & bank update calls",
    scenario:
      "A caller claims their account will be frozen tonight unless they ‘re-verify’ over the phone.",
    protections: [
      "Real-time scam-call warning before they pick up",
      "Suspicious link & APK blocking inside SMS and WhatsApp",
      "Instant alert sent to you when a threat is stopped",
    ],
  },
  {
    id: "seniors",
    label: "Grandparents",
    icon: HeartPulse,
    age: "60+ yrs",
    topThreat: "‘Digital arrest’ & impersonation",
    scenario:
      "Fraudsters posing as police or bank officers keep them on a video call, isolating them from family.",
    protections: [
      "Flags impersonation and pressure-tactic scripts",
      "One-tap ‘Ask Family’ button to break the isolation",
      "You can review what was blocked from your own phone",
    ],
  },
  {
    id: "children",
    label: "Children",
    icon: GraduationCap,
    age: "Students",
    topThreat: "Gaming, OTP & job-offer traps",
    scenario:
      "A ‘free reward’ or part-time job link asks them to share an OTP or download an app.",
    protections: [
      "Blocks malicious links shared in games and chats",
      "Warns before installing risky apps",
      "Safe-by-default settings tuned for young users",
    ],
  },
  {
    id: "you",
    label: "You",
    icon: Briefcase,
    age: "Working adult",
    topThreat: "UPI, QR & payment fraud",
    scenario:
      "A ‘refund’ asks you to scan a QR code or approve a collect request that actually pays them.",
    protections: [
      "Checks UPI IDs and QR codes before you pay",
      "Detects fake refund and delivery scams",
      "Manage protection for your whole family in one place",
    ],
  },
];

export function FamilyRiskSelector() {
  const [activeId, setActiveId] = useState(MEMBERS[0].id);
  const active = MEMBERS.find((m) => m.id === activeId) ?? MEMBERS[0];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Selector tabs */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {MEMBERS.map((m) => {
          const Icon = m.icon;
          const isActive = m.id === activeId;
          return (
            <button
              key={m.id}
              onClick={() => setActiveId(m.id)}
              aria-pressed={isActive}
              aria-label={`Show threats for ${m.label}`}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isActive
                  ? "text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:text-primary"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="risk-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Detail card */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50"
          >
            <div className="grid md:grid-cols-2">
              {/* Threat side */}
              <div className="bg-red-50/60 p-7">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Most common threat · {active.age}
                  </span>
                </div>
                <h4 className="mt-3 text-2xl font-bold text-gray-900">
                  {active.topThreat}
                </h4>
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-white p-4">
                  <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <p className="text-sm italic text-gray-600">
                    “{active.scenario}”
                  </p>
                </div>
              </div>

              {/* Protection side */}
              <div className="p-7">
                <div className="flex items-center gap-2 text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    How Netraksh protects them
                  </span>
                </div>
                <ul className="mt-4 space-y-3">
                  {active.protections.map((p) => (
                    <motion.li
                      key={p}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span>{p}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
