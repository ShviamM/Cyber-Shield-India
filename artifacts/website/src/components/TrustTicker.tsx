import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Smartphone, MessageSquareWarning } from "lucide-react";
import { useTranslation } from "react-i18next";

const alertIcons = [ShieldAlert, Smartphone, AlertTriangle, MessageSquareWarning];

export function TrustTicker() {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation("common");
  const texts = t("ticker.items", { returnObjects: true }) as string[];
  const alerts = texts.map((text, i) => ({
    icon: alertIcons[i] ?? ShieldAlert,
    text,
  }));

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
