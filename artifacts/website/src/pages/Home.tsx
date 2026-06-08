import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, MotionConfig, useReducedMotion, type Variants } from "framer-motion";
import { ShieldCheck, ArrowRight, ShieldAlert, CheckCircle, Bell, Users, ChevronRight, Footprints, Star } from "lucide-react";
import { ScamCounter } from "@/components/ScamCounter";
import { TrustTicker } from "@/components/TrustTicker";
import { CyberRadar } from "@/components/CyberRadar";
import { PhoneMockup } from "@/components/PhoneMockup";
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

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation("home");

  const statCards = t("stats.cards", { returnObjects: true }) as Array<{
    label: string;
    value: string;
    desc: string;
  }>;
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-20 pb-32">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/40 rounded-full blur-3xl opacity-50" />
          
          {!prefersReducedMotion && (
            <motion.div 
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="absolute top-[20%] right-[15%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"
            />
          )}

          {/* Decorative dotted grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.5] [background-image:radial-gradient(circle,rgba(11,61,145,0.12)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          />

        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Hero Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeInUp} className="relative inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/70 text-accent text-sm font-bold mb-8 shadow-sm overflow-hidden">
                {!prefersReducedMotion && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                    animate={{ x: ["-160%", "160%"] }}
                    transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", repeatDelay: 1.2 }}
                  />
                )}
                <motion.span
                  aria-hidden
                  className="relative z-10 flex items-center justify-center h-6 w-6 rounded-full bg-accent/15 text-accent"
                  animate={prefersReducedMotion ? {} : { x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                >
                  <Footprints className="h-3.5 w-3.5" />
                </motion.span>
                <span className="relative z-10">{t("hero.badge")}</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
                {t("hero.titleLine1")} <br/>
                <span className="relative inline-block text-primary group mt-2">
                  {t("hero.titleHighlight")}
                  {!prefersReducedMotion && (
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] pointer-events-none rounded-md"
                      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    />
                  )}
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                {t("hero.subtitle")}
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <Link href="/download">
                  <motion.div whileHover={prefersReducedMotion ? {} : { scale: 1.02 }} whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
                    <Button size="lg" className="relative overflow-hidden rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-8 h-14 text-lg w-full sm:w-auto shadow-lg shadow-primary/20 group">
                      <span className="relative z-10 flex items-center">
                        {t("hero.downloadCta")}
                        {!prefersReducedMotion && (
                          <motion.span 
                            className="absolute -inset-x-8 -inset-y-4 z-0 bg-white/20 opacity-0 group-hover:opacity-100"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          />
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/features">
                  <motion.div whileHover={prefersReducedMotion ? {} : { scale: 1.02 }} whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
                    <Button size="lg" variant="outline" className="rounded-full font-medium px-8 h-14 text-lg w-full sm:w-auto border-gray-200 hover:bg-gray-50 group flex items-center justify-center gap-2">
                      {t("hero.seeHowCta")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs overflow-hidden shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=U${i}&backgroundColor=e2e8f0`} alt="" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5 text-accent">
                      {[0,1,2,3,4].map(i => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">{t("hero.trustedBy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">1.2L+</p>
                    <p className="text-xs text-gray-500 font-medium mt-1.5">{t("hero.familiesProtected")}</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">8.5L+</p>
                    <p className="text-xs text-gray-500 font-medium mt-1.5">{t("hero.scamsBlocked")}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:ml-auto flex justify-center w-full"
            >
              <div className="relative z-10 w-full max-w-[250px] sm:max-w-[300px] lg:max-w-[320px]">
                <PhoneMockup />
                
                {/* Floating Cards */}
                {!prefersReducedMotion && (
                  <>
                    <motion.div 
                      animate={{ y: [0, -10, 0], rotate: [0, -2, 0] }} 
                      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      className="absolute top-1/4 -left-12 sm:-left-16 lg:-left-20 bg-white p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20"
                    >
                      <div className="bg-red-50 p-2 rounded-full text-red-500"><ShieldAlert className="h-5 w-5" /></div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{t("hero.floatingBlockedLabel")}</p>
                        <p className="text-sm font-bold text-gray-900">{t("hero.floatingBlockedValue")}</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, 15, 0], rotate: [0, 2, 0] }} 
                      transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-1/3 -right-12 sm:-right-20 lg:-right-24 bg-white p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20"
                    >
                      <div className="bg-green-50 p-2 rounded-full text-green-500"><CheckCircle className="h-5 w-5" /></div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{t("hero.floatingScannerLabel")}</p>
                        <p className="text-sm font-bold text-gray-900">{t("hero.floatingScannerValue")}</p>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
            
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
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 border-b border-gray-800 pb-16"
          >
            <ScamCounter to={2} suffix="M+" label={t("stats.counters.threatsAnalyzed")} />
            <ScamCounter to={850} suffix="K+" label={t("stats.counters.scamsBlocked")} />
            <ScamCounter to={120} suffix="K+" label={t("stats.counters.familiesProtected")} />
            <ScamCounter to={15} suffix="K+" label={t("stats.counters.activeScammers")} />
          </motion.div>

          {/* Real Stats */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {statCards.map((stat, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-3xl backdrop-blur-sm hover:bg-gray-800 transition-colors">
                <h3 className="text-gray-400 text-lg font-medium mb-2">{stat.label}</h3>
                <div className="text-5xl font-bold text-accent mb-4">{stat.value}</div>
                <p className="text-sm text-gray-500">{stat.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <p className="text-center text-xs text-gray-500 mt-10 max-w-3xl mx-auto leading-relaxed">
            {t("stats.sources")}
          </p>
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