import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Smartphone, MessageSquareWarning } from "lucide-react";

const alerts = [
  { icon: ShieldAlert, text: "New UPI Fraud Pattern Detected in Maharashtra" },
  { icon: Smartphone, text: "Warning: Fake Customer Care Calls on the Rise" },
  { icon: AlertTriangle, text: "Digital Arrest Scam: Never Pay to 'Clear Your Name'" },
  { icon: MessageSquareWarning, text: "Fraud SMS: Fake Job Offers Circulating" },
];

export function TrustTicker() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full bg-gray-900 border-y border-gray-800 py-3 overflow-hidden flex">
      <motion.div
        className="flex gap-12 items-center whitespace-nowrap px-6"
        animate={prefersReducedMotion ? {} : { x: ["0%", "-50%"] }}
        transition={
          prefersReducedMotion
            ? {}
            : {
                repeat: Infinity,
                ease: "linear",
                duration: 40,
              }
        }
      >
        {[...alerts, ...alerts, ...alerts, ...alerts].map((alert, i) => {
          const Icon = alert.icon;
          return (
            <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-300">
              <Icon className="h-4 w-4 text-accent" />
              <span>{alert.text}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
