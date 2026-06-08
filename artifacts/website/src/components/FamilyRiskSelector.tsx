import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Users,
  HeartPulse,
  GraduationCap,
  Briefcase,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

type MemberContent = {
  id: string;
  label: string;
  age: string;
  topThreat: string;
  scenario: string;
  protections: string[];
};

type Member = MemberContent & {
  icon: typeof Users;
};

const MEMBER_ICONS: Record<string, typeof Users> = {
  parents: Users,
  seniors: HeartPulse,
  children: GraduationCap,
  you: Briefcase,
};

export function FamilyRiskSelector() {
  const { t } = useTranslation("family");
  const memberContent = t("risk.members", { returnObjects: true }) as MemberContent[];
  const MEMBERS: Member[] = memberContent.map((m) => ({
    ...m,
    icon: MEMBER_ICONS[m.id] ?? Users,
  }));
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
              aria-label={t("risk.showThreats", { label: m.label })}
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
                    {t("risk.mostCommon", { age: active.age })}
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
                    {t("risk.howProtects")}
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
