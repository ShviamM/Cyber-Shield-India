import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { motion, MotionConfig, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  PhoneCall,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Scale,
  Clock,
  AlertTriangle,
  Check,
  X,
  CreditCard,
  Lock,
  UserX,
  MessageSquareWarning,
  ExternalLink,
  Gavel,
  ClipboardCheck,
  Search,
  Camera,
  Landmark,
  Fingerprint,
  ArrowRight,
  Info,
} from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const sopIcons = [PhoneCall, FileText, Camera, CreditCard, ClipboardCheck, Search];

const scenarioIcons = [CreditCard, UserX, Lock, MessageSquareWarning];
const scenarioTones = [
  "bg-red-50 text-red-600",
  "bg-amber-50 text-amber-600",
  "bg-purple-50 text-purple-600",
  "bg-blue-50 text-blue-600",
];

type Law = { code: string; title: string; desc: string; penalty: string };

const resourceMeta = [
  { icon: ShieldAlert, href: "https://sancharsaathi.gov.in", external: true },
  { icon: Landmark, href: "https://cybercrime.gov.in", external: true },
];

function LawAccordion({ laws }: { laws: Law[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {laws.map((law) => (
        <AccordionItem key={law.code} value={law.code} className="border-gray-200">
          <AccordionTrigger className="hover:no-underline py-5 text-base">
            <span className="flex items-center gap-3 text-left">
              <span className="shrink-0 rounded-lg bg-primary/10 text-primary text-xs font-bold px-2.5 py-1">
                {law.code}
              </span>
              <span className="font-semibold text-gray-900">{law.title}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base">
            <p className="text-gray-600 leading-relaxed mb-3">{law.desc}</p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium px-3 py-1.5">
              <Gavel className="h-4 w-4" /> {law.penalty}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function CyberLaws() {
  const { t } = useTranslation("laws");

  const sopSteps = t("sop.steps", { returnObjects: true }) as Array<{
    time: string;
    title: string;
    desc: string;
  }>;
  const scenarioSops = t("scenarios.items", { returnObjects: true }) as Array<{
    title: string;
    steps: string[];
  }>;
  const itActLaws = t("itActLaws", { returnObjects: true }) as Law[];
  const bnsLaws = t("bnsLaws", { returnObjects: true }) as Law[];
  const dpdpRights = t("dpdpRights", { returnObjects: true }) as string[];
  const dos = t("guidelines.dos", { returnObjects: true }) as string[];
  const donts = t("guidelines.donts", { returnObjects: true }) as string[];
  const resources = t("resources.items", { returnObjects: true }) as Array<{
    name: string;
    desc: string;
    action: string;
  }>;

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
            <div className="absolute top-1/2 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-semibold mb-6"
            >
              <Scale className="h-4 w-4" /> {t("hero.badge")}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight"
            >
              {t("hero.titleStart")}<span className="text-primary">{t("hero.titleHighlight")}</span>
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

        {/* EMERGENCY ACTION BAR */}
        <section className="pb-4 -mt-2">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto rounded-3xl bg-gray-900 text-white p-6 sm:p-8 shadow-2xl shadow-gray-900/20 relative overflow-hidden"
            >
              <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider mb-2">
                    <AlertTriangle className="h-4 w-4" /> {t("emergency.badge")}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{t("emergency.title")}</h2>
                  <p className="text-gray-400">
                    {t("emergency.desc")}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Button asChild size="lg" className="w-full sm:w-auto rounded-full bg-red-500 hover:bg-red-600 text-white font-bold px-7">
                    <a href="tel:1930">
                      <PhoneCall className="mr-2 h-4 w-4" /> {t("emergency.call")}
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-full bg-transparent border-white/30 hover:bg-white/10 text-white font-bold px-7">
                    <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">
                      {t("emergency.fileComplaint")} <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SOP TIMELINE */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("sop.heading")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                {t("sop.subtitle")}
              </motion.p>
            </motion.div>

            <div className="max-w-3xl mx-auto relative">
              <div className="absolute left-[27px] top-3 bottom-3 w-0.5 bg-gray-200 hidden sm:block" />
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={staggerContainer}
                className="space-y-6"
              >
                {sopSteps.map((step, i) => {
                  const Icon = sopIcons[i];
                  return (
                    <motion.div key={step.title} variants={fadeInUp} className="flex gap-5 relative">
                      <div className="shrink-0 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-accent uppercase tracking-wider">{t("sop.stepLabel", { number: i + 1 })}</span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                            <Clock className="h-3 w-3" /> {step.time}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1.5">{step.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </section>

        {/* SCENARIO SOPs */}
        <section className="py-24 bg-gray-50 border-y border-gray-200/60">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("scenarios.heading")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                {t("scenarios.subtitle")}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto"
            >
              {scenarioSops.map((s, i) => {
                const Icon = scenarioIcons[i];
                const tone = scenarioTones[i];
                return (
                  <motion.div
                    key={s.title}
                    variants={fadeInUp}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col"
                  >
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${tone}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-4 text-lg leading-snug">{s.title}</h3>
                    <ul className="space-y-2.5">
                      {s.steps.map((step) => (
                        <li key={step} className="flex items-start gap-2.5 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* KNOW YOUR RIGHTS — LAWS */}
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
                <Gavel className="h-4 w-4" /> {t("rights.badge")}
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("rights.heading")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                {t("rights.subtitle")}
              </motion.p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t("rights.itAct.title")}</h3>
                    <p className="text-sm text-gray-500">{t("rights.itAct.subtitle")}</p>
                  </div>
                </div>
                <LawAccordion laws={itActLaws} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent"><Scale className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t("rights.bns.title")}</h3>
                    <p className="text-sm text-gray-500">{t("rights.bns.subtitle")}</p>
                  </div>
                </div>
                <LawAccordion laws={bnsLaws} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-3xl bg-gray-50 border border-gray-100 p-7"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-green-100 text-green-700"><Fingerprint className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t("rights.dpdp.title")}</h3>
                    <p className="text-sm text-gray-500">{t("rights.dpdp.subtitle")}</p>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {dpdpRights.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-gray-700">
                      <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SAFETY GUIDELINES — DO / DON'T */}
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
                {t("guidelines.heading")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-400">
                {t("guidelines.subtitle")}
              </motion.p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-3xl border border-green-500/20 bg-green-500/5 backdrop-blur-md p-7"
              >
                <div className="flex items-center gap-3 mb-5 text-green-400">
                  <div className="p-2 rounded-xl bg-green-500/15"><Check className="h-5 w-5" /></div>
                  <h3 className="text-xl font-bold">{t("guidelines.alwaysDo")}</h3>
                </div>
                <ul className="space-y-3">
                  {dos.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-gray-300">
                      <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                className="rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-md p-7"
              >
                <div className="flex items-center gap-3 mb-5 text-red-400">
                  <div className="p-2 rounded-xl bg-red-500/15"><X className="h-5 w-5" /></div>
                  <h3 className="text-xl font-bold">{t("guidelines.neverDo")}</h3>
                </div>
                <ul className="space-y-3">
                  {donts.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-gray-300">
                      <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* OFFICIAL RESOURCES */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("resources.heading")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                {t("resources.subtitle")}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto"
            >
              {resources.map((r, i) => {
                const meta = resourceMeta[i];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={r.name}
                    variants={fadeInUp}
                    className="rounded-3xl border border-gray-100 bg-gray-50 p-6 flex flex-col"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{r.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mt-1">{r.desc}</p>
                      </div>
                    </div>
                    <a
                      href={meta.href}
                      {...(meta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      {r.action}
                      {meta.external ? <ExternalLink className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
                    </a>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto mt-10 flex items-start gap-3 rounded-2xl bg-blue-50/60 border border-blue-100 p-5 text-sm text-gray-600"
            >
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p>
                {t("resources.disclaimer")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-6 tracking-tight"
            >
              {t("finalCta.title")}
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
              <Button asChild size="lg" className="rounded-full bg-white hover:bg-gray-100 text-primary font-bold px-10 h-14 text-lg shadow-xl shadow-black/10 w-full sm:w-auto">
                <Link href="/download">{t("finalCta.getApp")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent border-white/30 hover:bg-white/10 text-white font-bold px-10 h-14 text-lg w-full sm:w-auto">
                <Link href="/cyber-safety-center">{t("finalCta.safetyCenter")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    </MotionConfig>
  );
}
