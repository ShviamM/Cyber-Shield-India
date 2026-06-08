import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, MotionConfig, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Eye,
  ShieldCheck,
  Target,
  Heart,
  Globe2,
  Brain,
  Lock,
  Languages,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const pillarIcons = [Eye, Heart, Globe2, Languages, Lock, Brain];

export default function About() {
  const { t } = useTranslation("about");

  const pillarsText = t("standFor.pillars", { returnObjects: true }) as Array<{ title: string; desc: string }>;

  const pillars = pillarsText.map((p, i) => ({ ...p, icon: pillarIcons[i] }));

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
            <div className="absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-semibold mb-6"
            >
              <ShieldCheck className="h-4 w-4" /> {t("hero.badge")}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight"
            >
              {t("hero.titleLead")} <span className="text-primary">{t("hero.titleHighlight")}</span>{t("hero.titleTail")}
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

        {/* NAME MEANING */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-primary to-[#0a2f6e] text-white p-8 sm:p-10 text-center relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-8 h-40 w-40 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 mb-5">
                  <Eye className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{t("why.name.title")}</h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  <span className="font-semibold text-white">{t("why.name.netra")}</span> {t("why.name.netraGloss")} +{" "}
                  <span className="font-semibold text-white">{t("why.name.raksha")}</span> {t("why.name.rakshaGloss")} ={" "}
                  <span className="font-semibold text-white">{t("why.name.brand")}</span> {t("why.name.tail")}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="py-24 bg-gray-50 border-y border-gray-200/60">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
            >
              <motion.div variants={fadeInUp} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-5">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("missionVision.missionTitle")}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t("missionVision.missionDesc")}
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("missionVision.visionTitle")}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {t("missionVision.visionDesc")}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* WHAT WE STAND FOR */}
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
                {t("standFor.title")}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                {t("standFor.subtitle")}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
            >
              {pillars.map((p) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.title}
                    variants={fadeInUp}
                    className="bg-gray-50 rounded-3xl border border-gray-100 p-7 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{p.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* FOUNDER TIE-IN */}
        <section className="py-24 bg-gray-50 border-y border-gray-200/60">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="max-w-4xl mx-auto rounded-3xl bg-white border border-gray-100 shadow-sm p-8 sm:p-10 flex flex-col md:flex-row items-start gap-6"
            >
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                <Award className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("founder.title")}</h3>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  {t("founder.descBefore")}<em>{t("founder.descBook")}</em>{t("founder.descAfter")}
                </p>
                <Button asChild className="rounded-full font-semibold">
                  <Link href="/founder">
                    {t("founder.cta")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold mb-6"
            >
              <Sparkles className="h-4 w-4" /> {t("cta.badge")}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-5xl font-bold mb-6 tracking-tight"
            >
              {t("cta.title")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t("cta.subtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button asChild size="lg" className="rounded-full bg-white hover:bg-gray-100 text-primary font-bold px-10 h-14 text-lg shadow-xl shadow-black/10 w-full sm:w-auto">
                <Link href="/download">{t("cta.getApp")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent border-white/30 hover:bg-white/10 text-white font-bold px-10 h-14 text-lg w-full sm:w-auto">
                <Link href="/features">{t("cta.exploreFeatures")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    </MotionConfig>
  );
}
