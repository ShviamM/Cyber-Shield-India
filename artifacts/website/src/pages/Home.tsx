import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { motion, MotionConfig, useReducedMotion, type Variants } from "framer-motion";
import { ShieldCheck, ArrowRight, ShieldAlert, Users, ChevronRight, Search, AlertOctagon, Lock, Phone, Link2, QrCode } from "lucide-react";
import { ScamCounter } from "@/components/ScamCounter";
import { TrustTicker } from "@/components/TrustTicker";
import { CyberRadar } from "@/components/CyberRadar";
import { FamilyStorytelling } from "@/components/FamilyStorytelling";
import { useTranslation } from "react-i18next";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

function HeroScanLine() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className="absolute inset-x-0 top-1/2 h-0.5 bg-accent opacity-50 shadow-[0_0_15px_rgba(255,103,19,0.6)]" />;
  }

  return (
    <motion.div
      className="absolute inset-x-0 h-[2px] bg-accent shadow-[0_0_20px_rgba(255,103,19,0.7)] z-50"
      animate={{ top: ["0%", "100%", "0%"] }}
      transition={{ duration: 3, ease: "linear", repeat: Infinity }}
    />
  );
}

function CinematicPhone() {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation("home");

  return (
    <div className="relative w-[260px] sm:w-[280px] h-[540px] sm:h-[580px] rounded-[40px] border-[8px] border-[#1a253c] bg-[#0c1424] overflow-hidden shadow-2xl shrink-0 flex flex-col items-center justify-center">
      <div className="absolute top-0 inset-x-0 flex justify-center z-50">
        <div className="w-[120px] h-[24px] bg-[#1a253c] rounded-b-2xl" />
      </div>

      <HeroScanLine />

      <div className="w-full h-full p-4 flex flex-col gap-4 relative z-10 pt-12">
        <div className="text-center mb-4">
          <motion.div
            className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-16 h-16 rounded-full bg-destructive/40 flex items-center justify-center">
              <ShieldAlert className="text-destructive w-8 h-8" />
            </div>
          </motion.div>
          <h3 className="text-xl font-bold text-white tracking-wide">{t("hero.phone.incomingCall")}</h3>
          <p className="text-destructive font-semibold mt-1">{t("hero.phone.highRisk")}</p>
        </div>

        <div className="bg-[#152033] rounded-2xl p-4 border border-destructive/30 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 blur-xl rounded-full" />
          <p className="text-white text-lg font-bold font-mono tracking-wider">{t("hero.phone.number")}</p>
          <div className="flex items-center gap-2 mt-2">
            <AlertOctagon className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{t("hero.phone.reported")}</p>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-4">
          <div className="h-14 rounded-full bg-destructive text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(225,29,42,0.5)] uppercase">
            {t("hero.phone.block")}
          </div>
          <div className="h-14 rounded-full bg-[#1a253c] text-white font-bold flex items-center justify-center uppercase">
            {t("hero.phone.ignore")}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-destructive/10 to-transparent pointer-events-none" />
    </div>
  );
}

function HeroTeaser() {
  const { t } = useTranslation("home");
  const [value, setValue] = useState("");
  const [, setLocation] = useLocation();

  const handleCheck = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLocation(`/check?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="w-full max-w-md bg-[#0c1424]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-80" />

      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-accent" />
        {t("hero.teaser.title")}
      </h4>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder={t("hero.teaser.placeholder")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
          className="w-full bg-[#152033] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent transition-colors font-mono"
        />
        <button
          onClick={handleCheck}
          disabled={!value.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {t("hero.teaser.analyzeCta")} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation("home");

  const radarBullets = t("radar.bullets", { returnObjects: true }) as string[];
  const howSteps = t("howItWorks.steps", { returnObjects: true }) as Array<{
    title: string;
    desc: string;
  }>;
  const stepImages = [
    "/images/step-check-number.png",
    "/images/step-check-link.png",
    "/images/step-check-message.png",
    "/images/step-report-fraud.png",
  ];

  return (
    <MotionConfig reducedMotion="user">
    <Layout>
      <SEOHead 
        title={t("seo.title")} 
        description={t("seo.description")}
        schema={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Netraksh",
          "description": "India's most trusted cyber safety platform protecting citizens from digital fraud.",
          "applicationCategory": "SecurityApplication",
          "operatingSystem": "Android, iOS"
        }}
      />

      <TrustTicker />

      {/* Hero Section — Cinematic */}
      <section className="relative overflow-hidden bg-[#061f4d] text-white">
        {/* Atmospheric Background Depth */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0B3D91_0%,_transparent_60%)] opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#FF6713_0%,_transparent_40%)] opacity-[0.06] mix-blend-screen" />
          {/* Decorative dotted grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.4] [background-image:radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Hero Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(255,103,19,0.15)]">
                <ShieldCheck className="w-4 h-4" />
                <span>{t("hero.badge")}</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-white drop-shadow-lg">
                {t("hero.titleLine1")} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  {t("hero.titleHighlight")}
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-lg font-light">
                {t("hero.subtitle")}
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/download">
                  <motion.div whileHover={prefersReducedMotion ? {} : { scale: 1.02 }} whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
                    <Button size="lg" className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-14 text-lg w-full sm:w-auto shadow-[0_0_20px_rgba(11,61,145,0.5)] border border-[#0a3179] flex items-center justify-center gap-2">
                      {t("hero.downloadCta")} <Lock className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/features">
                  <motion.div whileHover={prefersReducedMotion ? {} : { scale: 1.02 }} whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
                    <Button size="lg" variant="outline" className="rounded-xl font-semibold px-8 h-14 text-lg w-full sm:w-auto bg-transparent border-gray-600 text-gray-200 hover:bg-white/5 hover:text-white hover:border-gray-400 flex items-center justify-center gap-2 group">
                      {t("hero.seeHowCta")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <HeroTeaser />
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <div className="relative flex justify-center lg:justify-end lg:pr-8">

              {/* Phone + chips anchored to the phone's bounding box */}
              <div className="relative">

                {/* Saffron glow behind phone */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  className="relative z-10 drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]"
                >
                  <CinematicPhone />
                </motion.div>

                {/* Proof Stat — anchored over the phone's top-left corner */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  className="absolute -top-5 -left-5 sm:-left-10 bg-[#0c1424]/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xl z-20"
                >
                  <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tighter">8.5L+</p>
                  <p className="text-[11px] sm:text-xs font-medium text-accent mt-1 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" /> {t("hero.scamsBlocked")}
                  </p>
                </motion.div>

                {/* Status Chip — anchored to the phone's bottom-right */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                  className="absolute bottom-20 -right-4 sm:-right-6 bg-[#0c1424]/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-[#16a34a]/40 shadow-2xl z-20 flex items-center gap-2.5"
                >
                  <span className="relative flex h-2 w-2">
                    {!prefersReducedMotion && (
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-75 animate-ping" />
                    )}
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]" />
                  </span>
                  <span className="text-sm font-medium text-white whitespace-nowrap">{t("hero.activeProtection")}</span>
                </motion.div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Cyber Crime Stats & Scam Counters Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-gray-900 to-gray-900 pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">{t("stats.heading")}</motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-400">{t("stats.subtitle")}</motion.p>
          </motion.div>
          
          {/* Live Counters */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <ScamCounter to={2} suffix="M+" label={t("stats.counters.threatsAnalyzed")} />
            <ScamCounter to={850} suffix="K+" label={t("stats.counters.scamsBlocked")} />
            <ScamCounter to={120} suffix="K+" label={t("stats.counters.familiesProtected")} />
            <ScamCounter to={15} suffix="K+" label={t("stats.counters.activeScammers")} />
          </motion.div>
        </div>
      </section>

      {/* Cyber Threat Radar Section */}
      <section className="py-24 bg-gray-50 overflow-hidden relative border-y border-gray-200/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-semibold mb-6">
                <ShieldCheck className="h-4 w-4" /> {t("radar.badge")}
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{t("radar.headingLine1")}<br/>{t("radar.headingLine2")}</motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t("radar.description")}
              </motion.p>
              <motion.ul variants={fadeInUp} className="space-y-4 text-gray-700 font-medium">
                {radarBullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm"><ShieldCheck className="h-5 w-5 text-primary" /> {bullet}</li>
                ))}
              </motion.ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="relative"
            >
              <CyberRadar />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">{t("howItWorks.heading")}</motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600">{t("howItWorks.subtitle")}</motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {howSteps.map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="group text-center">
                <div className="mb-6 rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square flex items-center justify-center p-6 group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300">
                  <img src={stepImages[i]} alt={step.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Try the Scam Checker — CTA Band */}
      <section className="py-20 bg-[#061f4d] text-white relative overflow-hidden">
        {/* Atmospheric depth */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#0B3D91_0%,_transparent_55%)] opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_#FF6713_0%,_transparent_45%)] opacity-[0.08] mix-blend-screen" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-[#0c1424]/70 backdrop-blur-xl p-8 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-80" />

            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(255,103,19,0.15)]">
              <Search className="w-4 h-4" />
              <span>{t("tryChecker.badge")}</span>
            </motion.div>

            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold tracking-tight mb-5 text-white">
              {t("tryChecker.heading")}
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
              {t("tryChecker.subtitle")}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3 mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#152033] border border-white/10 text-sm font-medium text-gray-200">
                <Phone className="w-4 h-4 text-accent" /> {t("tryChecker.items.number")}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#152033] border border-white/10 text-sm font-medium text-gray-200">
                <Link2 className="w-4 h-4 text-accent" /> {t("tryChecker.items.link")}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#152033] border border-white/10 text-sm font-medium text-gray-200">
                <QrCode className="w-4 h-4 text-accent" /> {t("tryChecker.items.upi")}
              </span>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/check">
                <motion.div
                  className="inline-block"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <Button size="lg" className="rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold px-10 h-14 text-lg shadow-[0_0_25px_rgba(255,103,19,0.4)] flex items-center justify-center gap-2">
                    {t("tryChecker.cta")} <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Family Protection */}
      <section className="py-24 bg-orange-50/50 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div 
              initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0.5 }}
              className="inline-flex items-center justify-center p-4 bg-orange-100 rounded-2xl text-accent mb-6 shadow-sm"
            >
              <Users className="h-8 w-8" />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              {t("family.heading")}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-xl text-gray-600"
            >
              {t("family.subtitle")}
            </motion.p>
          </div>

          <FamilyStorytelling />

          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <Link href="/family-protection">
              <Button size="lg" className="rounded-full bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 shadow-xl shadow-gray-900/10 transition-transform hover:scale-105 active:scale-95">
                {t("family.cta")} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            {t("finalCta.heading")}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t("finalCta.subtitle")}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/download">
              <Button size="lg" className="rounded-full bg-white hover:bg-gray-100 text-primary font-bold px-10 h-14 text-lg shadow-xl shadow-black/10 transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto">
                {t("finalCta.android")}
              </Button>
            </Link>
            <Link href="/download">
              <Button size="lg" variant="outline" className="rounded-full bg-transparent border-white/30 hover:bg-white/10 text-white font-bold px-10 h-14 text-lg transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto">
                {t("finalCta.ios")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

    </Layout>
    </MotionConfig>
  );
}