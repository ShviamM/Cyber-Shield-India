import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, useInView, useReducedMotion, MotionConfig, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Eye,
  ShieldCheck,
  Target,
  Heart,
  Users,
  AlertTriangle,
  Smartphone,
  CreditCard,
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

function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setN(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(eased * to);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduceMotion]);
  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

const scamStats = [
  { to: 22.68, decimals: 2, suffix: " Lakh", label: "cybercrime cases reported in India in 2024 — more than double 2022." },
  { prefix: "₹", to: 5489, suffix: " Cr+", label: "siphoned funds frozen by the 1930 helpline system across 17.8 lakh cases." },
  { to: 3.24, decimals: 2, suffix: " Cr", label: "complaints reported to the national 1930 cyber helpline." },
];

const story = [
  {
    icon: Smartphone,
    title: "India went digital — overnight",
    desc: "UPI, cheap data and online everything reached every household. A billion people came online, many for the very first time.",
  },
  {
    icon: CreditCard,
    title: "The scammers followed the money",
    desc: "Fraudsters industrialised. Fake bank calls, investment traps, 'digital arrests' and job scams now run like organised businesses.",
  },
  {
    icon: AlertTriangle,
    title: "Our families became the targets",
    desc: "Parents, students and seniors — the people who trust most — are hit hardest. A caller ID and good intentions were never going to be enough.",
  },
  {
    icon: ShieldCheck,
    title: "So we built a digital bodyguard",
    desc: "Netraksh puts an always-on guardian in every pocket — spotting threats before they turn citizens into victims.",
  },
];

const pillars = [
  { icon: Eye, title: "Always Watching", desc: "Proactive, real-time protection that catches scams in the moment — not after the money is gone." },
  { icon: Heart, title: "Family First", desc: "Built for the people who need it most: seniors, students and parents navigating a digital world." },
  { icon: Globe2, title: "Made for India", desc: "Tuned to Indian scams, Indian payment rails and Indian languages — not a foreign tool bolted on." },
  { icon: Languages, title: "For Everyone", desc: "Simple enough for a first-time smartphone user. Safety shouldn't require a tech degree." },
  { icon: Lock, title: "Privacy by Design", desc: "We protect you without exploiting you. Your data is yours — security is never a trade for surveillance." },
  { icon: Brain, title: "Always Vigilant", desc: "We study the criminal playbook continuously, so our protection evolves as fast as the threats do." },
];

export default function About() {
  return (
    <MotionConfig reducedMotion="user">
      <Layout>
        <SEOHead
          title="About Us | Netraksh Mission"
          description="Netraksh exists to protect every Indian from cyber fraud. Learn why we built India's digital bodyguard, the scale of the cyber-scam crisis, and what we stand for."
        />

        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-24 pb-20">
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
              <ShieldCheck className="h-4 w-4" /> Our Mission
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight"
            >
              We're building India's <span className="text-primary">digital bodyguard</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              One mission drives everything we do: protect every Indian from cyber fraud — and build the nation's
              most trusted digital safety platform.
            </motion.p>
          </div>
        </section>

        {/* CYBER SCAM REALITY */}
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
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider mb-4">
                <AlertTriangle className="h-4 w-4" /> The cyber-scam crisis
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">
                A scam every few <span className="text-accent">seconds</span>.
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-400">
                Cyber fraud in India isn't an edge case anymore — it's an everyday epidemic. The numbers are staggering.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto"
            >
              {scamStats.map((s, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                    <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
                  </div>
                  <p className="text-gray-400 leading-relaxed text-sm">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-xs text-gray-500 mt-8"
            >
              Figures as reported by the Indian Cyber Crime Coordination Centre (I4C) &amp; Ministry of Home Affairs (2024–2025).
            </motion.p>
          </div>
        </section>

        {/* WHY NETRAKSH EXISTS */}
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
                Why Netraksh Exists
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                The story of how a digitising nation, and the criminals chasing it, made a digital bodyguard inevitable.
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
                {story.map((step) => {
                  const Icon = step.icon;
                  return (
                    <motion.div key={step.title} variants={fadeInUp} className="flex gap-5 relative">
                      <div className="shrink-0 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-1.5">{step.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* NAME MEANING */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="max-w-3xl mx-auto mt-16 rounded-3xl bg-gradient-to-br from-primary to-[#0a2f6e] text-white p-8 sm:p-10 text-center relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-8 h-40 w-40 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 mb-5">
                  <Eye className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">The meaning behind the name</h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  <span className="font-semibold text-white">Netra</span> (the eye) +{" "}
                  <span className="font-semibold text-white">Raksha</span> (protection) ={" "}
                  <span className="font-semibold text-white">Netraksh</span> — the watchful eye that guards you.
                  It's not just a name; it's the promise we build into every feature.
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  To put a trusted digital bodyguard in the hands of every Indian — making cyber safety as simple,
                  accessible and instinctive as locking your front door.
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  A secure digital India where no citizen loses their hard-earned savings to a scam — and where every
                  family feels safe online, regardless of age or background.
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
                What We Stand For
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                The principles that shape every decision, every feature, and every line of code.
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Built on frontline expertise</h3>
                <p className="text-gray-600 leading-relaxed text-lg mb-6">
                  Netraksh is founded by a cyber-crime specialist and author of <em>Digital Dhokha</em> — India's first
                  cyber crime awareness book — who has advised governments and trained citizens across more than 10
                  countries. Years of fighting fraud on the front lines are built into everything we make.
                </p>
                <Button asChild className="rounded-full font-semibold">
                  <Link href="/founder">
                    Meet the founder <ArrowRight className="ml-2 h-4 w-4" />
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
              <Sparkles className="h-4 w-4" /> Join the mission
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-5xl font-bold mb-6 tracking-tight"
            >
              A safer digital India starts with you.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Put a digital bodyguard in your pocket — and help protect the people you love.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button asChild size="lg" className="rounded-full bg-white hover:bg-gray-100 text-primary font-bold px-10 h-14 text-lg shadow-xl shadow-black/10 w-full sm:w-auto">
                <Link href="/download">Get Netraksh</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent border-white/30 hover:bg-white/10 text-white font-bold px-10 h-14 text-lg w-full sm:w-auto">
                <Link href="/features">Explore Features <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    </MotionConfig>
  );
}
