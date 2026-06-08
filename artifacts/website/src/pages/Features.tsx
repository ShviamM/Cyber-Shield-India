import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { motion, MotionConfig, type Variants } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  User,
  Users,
  Wallet,
  Fingerprint,
  HeartHandshake,
  PhoneIncoming,
  MessageSquare,
  MessageCircle,
  QrCode,
  BrainCircuit,
  ArrowDown,
  ArrowRight,
  Check,
  X,
  BellRing,
  GraduationCap,
  UserRound,
  Briefcase,
  Sparkles,
  Radar,
  Globe2,
} from "lucide-react";
import { ScamCounter } from "@/components/ScamCounter";
import { LiveProtectionDemo } from "@/components/LiveProtectionDemo";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const protectIcons = [User, Users, Wallet, Fingerprint, HeartHandshake];

const scenarioStyles = [
  { icon: PhoneIncoming, accent: "text-red-500", iconBg: "bg-red-50 text-red-500" },
  { icon: MessageSquare, accent: "text-amber-500", iconBg: "bg-amber-50 text-amber-500" },
  { icon: MessageCircle, accent: "text-green-600", iconBg: "bg-green-50 text-green-600" },
  { icon: QrCode, accent: "text-blue-600", iconBg: "bg-blue-50 text-blue-600" },
];

function FlowSteps({ steps, accent }: { steps: string[]; accent: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      className="space-y-2"
    >
      {steps.map((label, i) => (
        <motion.div key={label} variants={fadeInUp} className="flex flex-col">
          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
            <span className={`h-6 w-6 shrink-0 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center`}>
              {i + 1}
            </span>
            <span className="font-semibold text-gray-800 text-sm">{label}</span>
            {i === steps.length - 1 && <ShieldCheck className={`h-4 w-4 ml-auto ${accent}`} />}
          </div>
          {i < steps.length - 1 && (
            <div className="flex justify-start pl-[14px] py-0.5">
              <ArrowDown className="h-4 w-4 text-gray-300" />
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function Features() {
  const { t } = useTranslation("features");

  const protectItems = t("protect.items", { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;
  const scenarioItems = t("scenarios.items", { returnObjects: true }) as Array<{
    badge: string;
    title: string;
    desc: string;
    steps: string[];
  }>;
  const aiItems = t("ai.items", { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;
  const familySteps = t("family.steps", { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;
  const whyRows = t("why.rows", { returnObjects: true }) as string[];
  const audiences = t("india.audiences", { returnObjects: true }) as string[];

  const aiIcons = [Radar, Globe2, Users, BrainCircuit];
  const familyTones = [
    "bg-red-50 text-red-500",
    "bg-amber-50 text-amber-500",
    "bg-blue-50 text-blue-600",
    "bg-green-50 text-green-600",
  ];
  const familyIcons = [PhoneIncoming, ShieldAlert, BellRing, ShieldCheck];
  const whyOthers = [true, false, false, false, false, false, false];
  const audienceIcons = [GraduationCap, UserRound, HeartHandshake, Briefcase, Users];

  return (
    <MotionConfig reducedMotion="user">
      <Layout>
        <SEOHead
          title={t("seo.title")}
          description={t("seo.description")}
        />

        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-12 pb-16">
          <div className="absolute inset-0 pointer-events-none opacity-[0.6]">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute top-1/2 -left-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-accent text-sm font-semibold mb-6"
            >
              <Sparkles className="h-4 w-4" /> {t("hero.badge")}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight"
            >
              {t("hero.titleLead")}{" "}
              <span className="text-primary">{t("hero.titleHighlight")}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              {t("hero.subtitle")}
            </motion.p>
          </div>
        </section>

        {/* SECTION 1 — WHAT ARE YOU PROTECTING */}
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/25 via-gray-900 to-gray-900 pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">
                {t("protect.title")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-400">
                {t("protect.subtitle")}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
            >
              {protectItems.map((item, idx) => {
                const Icon = protectIcons[idx];
                return (
                  <motion.div
                    key={item.title}
                    variants={fadeInUp}
                    whileHover={{ y: -6 }}
                    className="group relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 transition-colors hover:bg-white/10 hover:border-white/20"
                  >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-colors pointer-events-none" />
                    <div className="inline-flex p-3 rounded-2xl bg-accent/15 text-accent mb-5 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* SECTION 2 — SCENARIOS */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mb-20"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("scenarios.title")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                {t("scenarios.subtitle")}
              </motion.p>
            </motion.div>

            <div className="space-y-20 lg:space-y-28">
              {scenarioItems.map((s, i) => {
                const style = scenarioStyles[i];
                const Icon = style.icon;
                const reversed = i % 2 === 1;
                return (
                  <div
                    key={s.title}
                    className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: reversed ? 30 : -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.6 }}
                      className={reversed ? "lg:order-2" : ""}
                    >
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-5 ${style.iconBg}`}>
                        <Icon className="h-4 w-4" /> {s.badge}
                      </div>
                      <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{s.title}</h3>
                      <p className="text-lg text-gray-600 leading-relaxed mb-8">{s.desc}</p>
                      <Link href="/download">
                        <Button size="lg" className="rounded-full bg-gray-900 hover:bg-gray-800 text-white font-medium px-7 transition-transform hover:scale-105 active:scale-95">
                          {t("scenarios.cta")} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.6 }}
                      className={`relative ${reversed ? "lg:order-1" : ""}`}
                    >
                      <div className="rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/70 p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`p-3 rounded-2xl bg-white shadow-sm ${style.accent}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{t("scenarios.flowLabel")}</p>
                            <p className="font-bold text-gray-900">{s.badge}</p>
                          </div>
                        </div>
                        <FlowSteps steps={s.steps} accent={style.accent} />
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AI ENGINE */}
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/25 via-gray-900 to-gray-900 pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-accent text-sm font-semibold mb-6">
                  <BrainCircuit className="h-4 w-4" /> {t("ai.badge")}
                </motion.div>
                <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  {t("ai.title")}
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-xl text-gray-400 leading-relaxed">
                  {t("ai.desc")}
                </motion.p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={staggerContainer}
                className="grid grid-cols-2 gap-5"
              >
                {aiItems.map((f, idx) => {
                  const Icon = aiIcons[idx];
                  return (
                    <motion.div
                      key={f.title}
                      variants={fadeInUp}
                      className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:bg-white/10 transition-colors"
                    >
                      <div className="inline-flex p-2.5 rounded-xl bg-accent/15 text-accent mb-4">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold mb-1.5">{f.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAMILY PROTECTION — LARGEST */}
        <section className="py-28 bg-orange-50/50 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center justify-center p-4 bg-orange-100 rounded-2xl text-accent mb-6 shadow-sm"
              >
                <Users className="h-8 w-8" />
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t("family.title")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 leading-relaxed">
                {t("family.subtitle")}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-4 gap-5 max-w-5xl mx-auto"
            >
              {familySteps.map((step, idx) => {
                const Icon = familyIcons[idx];
                return (
                  <motion.div
                    key={step.title}
                    variants={fadeInUp}
                    className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-6 flex flex-col"
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${familyTones[idx]}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-14 text-center"
            >
              <Link href="/family-protection">
                <Button size="lg" className="rounded-full bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 shadow-xl shadow-gray-900/10 transition-transform hover:scale-105 active:scale-95">
                  {t("family.cta")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* SECTION 3 — WHY DIFFERENT */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mb-14"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("why.title")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                {t("why.subtitle")}
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto overflow-hidden rounded-3xl border border-gray-200 shadow-sm"
            >
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                <div className="p-4 sm:p-5 text-sm font-bold text-gray-500 uppercase tracking-wider">{t("why.colProtection")}</div>
                <div className="p-4 sm:p-5 text-center text-sm font-semibold text-gray-500">{t("why.colCallerId")}</div>
                <div className="p-4 sm:p-5 text-center text-sm font-bold text-primary bg-primary/5">{t("why.colNetraksh")}</div>
              </div>
              {whyRows.map((label, i) => (
                <div
                  key={label}
                  className={`grid grid-cols-3 items-center ${i % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}
                >
                  <div className="p-4 sm:p-5 font-semibold text-gray-800 text-sm sm:text-base">{label}</div>
                  <div className="p-4 sm:p-5 flex justify-center">
                    {whyOthers[i] ? (
                      <Check className="h-5 w-5 text-gray-400" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div className="p-4 sm:p-5 flex justify-center bg-primary/5 h-full items-center">
                    <span className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SECTION 4 — LIVE DEMO */}
        <section className="py-24 bg-gray-50 border-y border-gray-200/60">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("demo.title")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                {t("demo.subtitle")}
              </motion.p>
            </motion.div>

            <LiveProtectionDemo />
          </div>
        </section>

        {/* SECTION 5 — COUNTER */}
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-gray-900 to-gray-900 pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">
                {t("counter.title")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-400">
                {t("counter.subtitle")}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              <ScamCounter to={2} suffix="M+" label={t("counter.threatsDetected")} />
              <ScamCounter to={650} suffix="K+" label={t("counter.fraudReports")} />
              <ScamCounter to={120} suffix="K+" label={t("counter.familiesProtected")} />
              <ScamCounter to={15} suffix="K+" label={t("counter.scamNumbersReported")} />
            </motion.div>
          </div>
        </section>

        {/* SECTION 6 — BUILT FOR INDIA */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-semibold mb-6">
                <ShieldCheck className="h-4 w-4" /> {t("india.badge")}
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {t("india.titleLine1")}<br />{t("india.titleLine2")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                {t("india.subtitle")}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 max-w-5xl mx-auto"
            >
              {audiences.map((label, idx) => {
                const Icon = audienceIcons[idx];
                return (
                  <motion.div
                    key={label}
                    variants={fadeInUp}
                    whileHover={{ y: -6 }}
                    className="rounded-3xl border border-gray-100 bg-gray-50 p-6 text-center hover:shadow-xl hover:bg-white transition-all"
                  >
                    <div className="inline-flex p-3.5 rounded-2xl bg-primary/10 text-primary mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-gray-900">{label}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* SECTION 7 — FINAL CTA */}
        <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
            >
              {t("finalCta.titleLine1")}<br />{t("finalCta.titleLine2")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t("finalCta.subtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link href="/download">
                <Button size="lg" className="rounded-full bg-white hover:bg-gray-100 text-primary font-bold px-10 h-14 text-lg shadow-xl shadow-black/10 transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto">
                  {t("finalCta.primary")}
                </Button>
              </Link>
              <Link href="/download">
                <Button size="lg" variant="outline" className="rounded-full bg-transparent border-white/30 hover:bg-white/10 text-white font-bold px-10 h-14 text-lg transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto">
                  {t("finalCta.secondary")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </Layout>
    </MotionConfig>
  );
}
