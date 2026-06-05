import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Brain,
  Eye,
  Users,
  Sparkles,
  Award,
  BookOpen,
  Globe2,
  Quote,
  ArrowRight,
  ArrowDown,
  Smartphone,
  CreditCard,
  AlertTriangle,
  Mic,
  Newspaper,
  Map,
  Flag,
  Briefcase,
  Building2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const stats = [
  { value: "10+", label: "Countries Advised" },
  { value: "20+", label: "Workshops Led" },
  { value: "1", label: "National Award" },
];

const storyFlow = [
  {
    icon: Smartphone,
    title: "India Goes Digital",
    desc: "UPI, online services, and connected devices reach every household.",
  },
  {
    icon: CreditCard,
    title: "Cyber Frauds Increase",
    desc: "Criminals exploit the digital shift at an unprecedented scale.",
  },
  {
    icon: AlertTriangle,
    title: "Families Become Targets",
    desc: "Scam calls, fake messages, and digital arrests reach the vulnerable.",
  },
  {
    icon: ShieldCheck,
    title: "Netraksh Protects Citizens",
    desc: "A digital bodyguard that spots threats before they become victims.",
  },
];

const timeline = [
  {
    icon: ShieldCheck,
    title: "Cybersecurity Experience",
    desc: "A proven track record defending citizens and organisations across more than 10 countries.",
  },
  {
    icon: Brain,
    title: "Threat Intelligence Leadership",
    desc: "Tracking emerging fraud patterns and translating them into protection for everyday Indians.",
  },
  {
    icon: Briefcase,
    title: "Security Operations Expertise",
    desc: "Hands-on experience building and running defensive security at scale.",
  },
  {
    icon: Flag,
    title: "National Cyber Safety Vision",
    desc: "Advising governments and speaking at global forums to raise the bar for digital safety.",
  },
  {
    icon: Sparkles,
    title: "Founder of Netraksh",
    desc: "Turning years of frontline expertise into a digital bodyguard for every Indian family.",
  },
];

const achievements = [
  {
    no: "01",
    tag: "National Award",
    title: "Bharat Pratibha Samman",
    desc: "Awarded at Pradhanmantri Sangrahalaya for outstanding contributions to Cyber Crime Awareness across India.",
    icon: Award,
  },
  {
    no: "02",
    tag: "Author",
    title: "Digital Dhokha",
    desc: "India's first Cyber Crime Awareness book — a landmark publication on a mission to save 100 million Indians from digital fraud.",
    icon: BookOpen,
  },
  {
    no: "03",
    tag: "Government Advisory",
    title: "FIFA World Cup, Qatar",
    desc: "Provided Cyber Hygiene Advisory support to the Government of Qatar during the world's most-watched sporting event.",
    icon: Globe2,
  },
];

const trustCards = [
  { icon: Brain, title: "Threat Intelligence", desc: "Reading the criminal playbook before it reaches you." },
  { icon: ShieldCheck, title: "Cyber Defense", desc: "Defensive expertise built on real-world operations." },
  { icon: Eye, title: "Digital Safety", desc: "Making safety simple, clear, and human." },
  { icon: Users, title: "Family Protection", desc: "Designed for seniors, parents, and children alike." },
  { icon: Sparkles, title: "AI-Powered Scam Detection", desc: "Spotting fraud in calls, messages, links, and QR codes." },
];

export default function Founder() {
  return (
    <Layout>
      <SEOHead
        title="Founder — Shivam Malaviya | Netraksh"
        description="Meet Shivam Malaviya, Founder & CEO of Netraksh — cybersecurity professional and threat intelligence specialist on a mission to protect every Indian from cyber fraud."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#08183f] text-white">
        <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_20%_20%,rgba(255,103,19,0.25),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.25),transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="container relative mx-auto px-4 md:px-6 pt-32 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase text-accent">
                <span className="h-px w-8 bg-accent" />
                International Cyber Security Expert
              </span>
              <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
                Shivam <span className="text-accent">Malaviya</span>
              </h1>
              <p className="mt-5 text-lg md:text-xl text-blue-100/80 font-medium">
                Founder &amp; CEO, Netraksh
              </p>
              <p className="mt-4 max-w-xl text-blue-100/70 leading-relaxed">
                Cybersecurity professional and threat intelligence specialist,
                securing nations, educating communities, and advising governments —
                now building a digital bodyguard for every Indian family.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-5 text-center"
                  >
                    <div className="text-3xl font-bold text-accent">{s.value}</div>
                    <div className="mt-1 text-xs text-blue-100/70 leading-snug">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/download">
                  <Button className="rounded-full bg-accent hover:bg-accent/90 text-white font-semibold px-7 h-12">
                    Download Netraksh <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="outline"
                    className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold px-7 h-12"
                  >
                    Our Mission
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative mx-auto"
            >
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-accent/40 via-transparent to-blue-400/30 blur-2xl" />
              <div className="relative rounded-[2rem] p-2 bg-gradient-to-tr from-accent/70 to-amber-200/40">
                <img
                  src="/images/founder-shivam.png"
                  alt="Shivam Malaviya, Founder & CEO of Netraksh"
                  className="rounded-[1.6rem] w-[300px] md:w-[360px] object-cover shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/15 bg-[#08183f]/80 backdrop-blur-md px-5 py-3 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Securing India's Digital Future
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Personal Mission */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">
              Personal Mission
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">
              Protecting India's Digital Future
            </h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid md:grid-cols-2 gap-10 text-lg text-gray-600 leading-relaxed"
          >
            <div className="space-y-5">
              <p>
                Netraksh was founded with a simple belief:{" "}
                <span className="font-semibold text-gray-900">
                  every Indian deserves protection from online fraud, cyber scams,
                  and digital crime.
                </span>
              </p>
              <p>
                As India rapidly embraces digital payments, online services, and
                connected technologies, cybercriminals are targeting ordinary
                citizens at an unprecedented scale.
              </p>
            </div>
            <div className="space-y-5">
              <p>
                Netraksh was created to make cyber safety simple, accessible, and
                understandable for every Indian family.
              </p>
              <p>
                Whether it's a scam call, fake WhatsApp message, fraudulent QR code,
                phishing link, or digital arrest scam, our mission is to help people
                identify threats{" "}
                <span className="font-semibold text-gray-900">
                  before they become victims.
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Founder Quote */}
      <section className="bg-[#08183f] py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.3] bg-[radial-gradient(circle_at_50%_0%,rgba(255,103,19,0.25),transparent_45%)]" />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.7 }}
          className="container relative mx-auto px-4 md:px-6 max-w-4xl text-center"
        >
          <Quote className="h-12 w-12 text-accent mx-auto mb-8" />
          <p className="text-3xl md:text-4xl font-medium leading-snug tracking-tight">
            "Cyber safety should not be limited to experts. Every Indian deserves a
            <span className="text-accent"> digital bodyguard.</span>"
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <img
              src="/images/founder-shivam.png"
              alt="Shivam Malaviya"
              className="h-14 w-14 rounded-full object-cover border-2 border-accent/60"
            />
            <div className="text-left">
              <div className="font-semibold">Shivam Malaviya</div>
              <div className="text-sm text-blue-100/70">Founder &amp; CEO, Netraksh</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Why Netraksh Exists */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">
              Why Netraksh Exists
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">
              The story behind the shield
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {storyFlow.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative"
              >
                <div
                  className={`h-full rounded-3xl p-7 border shadow-sm ${
                    i === storyFlow.length - 1
                      ? "bg-[#08183f] border-[#08183f] text-white"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-5 ${
                      i === storyFlow.length - 1
                        ? "bg-accent/20 text-accent"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      i === storyFlow.length - 1 ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      i === storyFlow.length - 1 ? "text-blue-100/70" : "text-gray-600"
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
                {i < storyFlow.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
                {i < storyFlow.length - 1 && (
                  <div className="md:hidden flex justify-center my-2 text-accent">
                    <ArrowDown className="h-5 w-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Timeline */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">
              The Journey
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">
              From frontline defender to founder
            </h2>
          </motion.div>

          <div className="relative pl-8 md:pl-0">
            <div className="absolute left-2 md:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-accent/60 via-gray-200 to-transparent md:-translate-x-1/2" />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`relative md:grid md:grid-cols-2 md:gap-12 md:items-center ${
                    i % 2 === 0 ? "" : "md:[direction:rtl]"
                  }`}
                >
                  <div
                    className={`md:[direction:ltr] ${
                      i % 2 === 0 ? "md:text-right md:pr-4" : "md:pl-4"
                    }`}
                  >
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                      <div
                        className={`flex items-center gap-3 mb-2 ${
                          i % 2 === 0 ? "md:flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="absolute left-2 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 h-4 w-4 rounded-full bg-accent ring-4 ring-white" />
                  <div className="hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recognition & Impact */}
      <section className="bg-[#08183f] py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.25] bg-[radial-gradient(circle_at_85%_15%,rgba(255,103,19,0.3),transparent_45%)]" />
        <div className="container relative mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">
              Recognition &amp; Impact
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold">Key achievements</h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2 grid sm:grid-cols-3 gap-5">
              {achievements.map((a, i) => (
                <motion.div
                  key={a.title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:border-accent/40 transition-colors"
                >
                  <div className="text-3xl font-bold text-accent/80 mb-3">{a.no}</div>
                  <a.icon className="h-6 w-6 text-accent mb-3" />
                  <div className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-100/60 mb-1">
                    {a.tag}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{a.title}</h3>
                  <p className="text-sm text-blue-100/70 leading-relaxed">{a.desc}</p>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto"
            >
              <div className="absolute -inset-3 rounded-2xl bg-accent/20 blur-2xl" />
              <img
                src="/images/founder-book.png"
                alt="Digital Dhokha — India's first Cyber Crime Awareness book by Shivam Malaviya"
                className="relative rounded-xl w-[230px] shadow-2xl border border-white/10"
              />
              <p className="mt-4 text-center text-xs text-blue-100/60">
                Author of <span className="text-accent font-semibold">Digital Dhokha</span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Built by Cybersecurity Professionals.
              <br className="hidden md:block" />{" "}
              <span className="text-accent">Designed for Every Indian.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {trustCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group rounded-3xl border border-gray-100 bg-gray-50 p-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5 group-hover:bg-accent group-hover:text-white transition-colors">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision + Movement + Media + Roadmap */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-gray-100 bg-white p-9 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Vision for India</h3>
              <p className="text-gray-600 leading-relaxed">
                A world where cyber awareness is not a privilege but a fundamental
                right — taught in every school, every institution, across every
                nation. A digitally literate society where every citizen, from the
                schoolroom to the boardroom, is equipped to defend themselves in
                cyberspace.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl border border-gray-100 bg-white p-9 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Cyber Safety Movement
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Beyond an app, Netraksh is a national movement — securing nations,
                educating communities, and advising governments. Through 20+
                workshops and awareness drives, the mission is to put practical
                cyber safety into the hands of every Indian family.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-gray-100 bg-white p-9 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Media &amp; Speaking</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                A recognised voice on cyber safety — speaking at global forums,
                advising governments, and author of India's first Cyber Crime
                Awareness book.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-3">
                  <Newspaper className="h-4 w-4 text-accent shrink-0" />
                  Author of <span className="font-semibold text-gray-900">Digital Dhokha</span>
                </li>
                <li className="flex items-center gap-3">
                  <Globe2 className="h-4 w-4 text-accent shrink-0" />
                  Government Cyber Advisory — FIFA World Cup, Qatar
                </li>
                <li className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-accent shrink-0" />
                  Global forums &amp; institutional workshops
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl border border-gray-100 bg-white p-9 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5">
                <Map className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Future Roadmap</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  Smarter AI-powered scam detection across calls, messages &amp; QR codes.
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  Deeper family protection for seniors, parents, and children.
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  Nationwide cyber literacy programmes in schools and institutions.
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  Making India the safest digital society in the world.
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#08183f] py-28 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_50%_120%,rgba(255,103,19,0.35),transparent_50%)]" />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.7 }}
          className="container relative mx-auto px-4 md:px-6 max-w-3xl text-center"
        >
          <span className="text-sm font-semibold tracking-[0.25em] uppercase text-accent">
            One Mission. One Vision.
          </span>
          <h2 className="mt-5 text-4xl md:text-5xl font-bold leading-tight">
            Making India the safest digital society in the world.
          </h2>
          <p className="mt-6 text-lg text-blue-100/75 leading-relaxed">
            Ensuring that every citizen has access to simple, powerful protection
            against cyber fraud.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/download">
              <Button className="rounded-full bg-accent hover:bg-accent/90 text-white font-semibold px-7 h-12">
                Download Netraksh <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/family-protection">
              <Button
                variant="outline"
                className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold px-7 h-12"
              >
                Protect Your Family
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold px-7 h-12"
              >
                Join the Mission
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
