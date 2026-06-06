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
  Siren,
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

const sopSteps = [
  {
    icon: PhoneCall,
    time: "Within minutes",
    title: "Call 1930 immediately",
    desc: "The National Cyber Crime Helpline (24×7, toll-free) can alert your bank to freeze the fraudulent transaction. Speed is everything — the first hour is your best chance to recover money.",
  },
  {
    icon: FileText,
    time: "Same day",
    title: "File a complaint on cybercrime.gov.in",
    desc: "Go to the National Cyber Crime Reporting Portal, choose “Report Financial Fraud”, log in with your mobile OTP, and describe exactly what happened, when, and how much you lost.",
  },
  {
    icon: Camera,
    time: "Before you forget",
    title: "Preserve all evidence",
    desc: "Save screenshots, transaction IDs, UPI handles, caller numbers, SMS, emails and chat history. Do not delete anything — more evidence means a faster investigation.",
  },
  {
    icon: CreditCard,
    time: "Right away",
    title: "Alert your bank & block access",
    desc: "Inform your bank, block compromised cards and UPI IDs, and change passwords for accounts that may be exposed. Ask for a written acknowledgement of your report.",
  },
  {
    icon: ClipboardCheck,
    time: "Keep it safe",
    title: "Save your Complaint ID",
    desc: "After submitting, you receive a Complaint Reference Number. Note it down — you'll need it to track your case and during any follow-up with police or your bank.",
  },
  {
    icon: Search,
    time: "Follow up",
    title: "Track your case & file an FIR if needed",
    desc: "Track status at cybercrime.gov.in. If the case stalls, file an FIR — any cyber police station should register a Zero FIR regardless of where the fraud happened. Some states are also rolling out e-Zero FIRs to fast-track high-value cases.",
  },
];

const scenarioSops = [
  {
    icon: CreditCard,
    tone: "bg-red-50 text-red-600",
    title: "Money stolen (UPI / bank / card)",
    steps: [
      "Call 1930 in the golden hour",
      "Report Financial Fraud on cybercrime.gov.in",
      "Freeze cards & UPI with your bank",
      "Keep all transaction evidence",
    ],
  },
  {
    icon: UserX,
    tone: "bg-amber-50 text-amber-600",
    title: "Social media / account hacked",
    steps: [
      "Try account recovery & enable 2FA",
      "Warn contacts not to respond to it",
      "Report on cybercrime.gov.in",
      "Report the profile to the platform",
    ],
  },
  {
    icon: Lock,
    tone: "bg-purple-50 text-purple-600",
    title: "Sextortion / blackmail",
    steps: [
      "Do not pay — it never stops the threat",
      "Stop contact, but don't delete proof",
      "Report (anonymous option available)",
      "Call 1930 / file on the portal",
    ],
  },
  {
    icon: MessageSquareWarning,
    tone: "bg-blue-50 text-blue-600",
    title: "Suspicious call/SMS (no loss yet)",
    steps: [
      "Don't click links or share OTP",
      "Report on Sanchar Saathi (Chakshu)",
      "Block the number",
      "Verify it instantly on Netraksh",
    ],
  },
];

type Law = { code: string; title: string; desc: string; penalty: string };

const itActLaws: Law[] = [
  {
    code: "Section 66",
    title: "Hacking & computer-related offences",
    desc: "Unauthorised access, data theft, virus attacks or system damage done with dishonest or fraudulent intent.",
    penalty: "Up to 3 years imprisonment and/or fine up to ₹5 lakh",
  },
  {
    code: "Section 66C",
    title: "Identity theft",
    desc: "Dishonestly using someone else's password, electronic signature or other unique identification feature.",
    penalty: "Up to 3 years imprisonment and fine up to ₹1 lakh",
  },
  {
    code: "Section 66D",
    title: "Cheating by personation",
    desc: "Cheating someone by pretending to be another person using a phone, app or computer — covers fake bank calls and impersonation scams.",
    penalty: "Up to 3 years imprisonment and fine up to ₹1 lakh",
  },
  {
    code: "Section 66E",
    title: "Violation of privacy",
    desc: "Capturing, publishing or transmitting private images of a person without their consent.",
    penalty: "Up to 3 years imprisonment and/or fine up to ₹2 lakh",
  },
  {
    code: "Section 67 / 67A / 67B",
    title: "Obscene & exploitative content",
    desc: "Publishing or transmitting obscene material, sexually explicit content, or child sexual abuse material in electronic form.",
    penalty: "Up to 5–7 years and heavy fines, higher on repeat offence",
  },
];

const bnsLaws: Law[] = [
  {
    code: "Section 318",
    title: "Cheating",
    desc: "Deceiving a person to dishonestly part with property or money. Replaces the old IPC Sections 415, 417, 418 and 420.",
    penalty: "Up to 3 years (general) and up to 7 years when property is delivered",
  },
  {
    code: "Section 319",
    title: "Cheating by personation",
    desc: "Cheating while pretending to be another person — the offline counterpart often charged alongside IT Act Section 66D.",
    penalty: "Up to 5 years imprisonment and fine",
  },
  {
    code: "Section 336",
    title: "Forgery",
    desc: "Making a false document or electronic record with intent to cause damage, defraud, or support a claim.",
    penalty: "Up to 2 years for forgery; up to 7 years for forging valuable documents or to cheat",
  },
];

const dpdpRights = [
  "Right to access information about your personal data",
  "Right to correction and erasure of your data",
  "Right to grievance redressal from the data handler",
  "Right to nominate someone to act on your behalf",
  "Your data may only be used with informed consent, for a clear purpose",
];

const dos = [
  "Verify before you trust — call back on official numbers only",
  "Keep two-factor authentication on for every important account",
  "Report scams even when you lost nothing — it protects others",
  "Save evidence: screenshots, IDs, numbers and timestamps",
];

const donts = [
  "Never share OTP, CVV, PIN or passwords — no bank ever asks",
  "Don't click links in unexpected SMS, email or WhatsApp",
  "Don't install screen-sharing or “support” apps on a stranger's request",
  "Don't pay blackmailers — report instead",
];

const resources = [
  {
    icon: Siren,
    name: "Helpline 1930",
    desc: "National Cyber Crime Helpline — 24×7, toll-free, for financial fraud.",
    action: "Call 1930",
    href: "tel:1930",
    external: false,
  },
  {
    icon: FileText,
    name: "cybercrime.gov.in",
    desc: "National Cyber Crime Reporting Portal (NCRP) to file & track complaints.",
    action: "Open Portal",
    href: "https://cybercrime.gov.in",
    external: true,
  },
  {
    icon: ShieldAlert,
    name: "Sanchar Saathi · Chakshu",
    desc: "Report suspected fraud calls/SMS (no loss yet) and block a lost phone.",
    action: "Open Sanchar Saathi",
    href: "https://sancharsaathi.gov.in",
    external: true,
  },
  {
    icon: Landmark,
    name: "Cyber Police / Zero FIR",
    desc: "Any police station must register a Zero FIR, regardless of jurisdiction.",
    action: "Find your station",
    href: "https://cybercrime.gov.in",
    external: true,
  },
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
  return (
    <MotionConfig reducedMotion="user">
      <Layout>
        <SEOHead
          title="Cyber Laws & SOPs | Know Your Rights — Netraksh"
          description="A citizen's guide to India's cyber laws (IT Act 2000, BNS 2023, DPDP Act 2023) and the official step-by-step SOPs to report cyber fraud via 1930 and cybercrime.gov.in."
        />

        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
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
              <Scale className="h-4 w-4" /> Know your rights · Act with confidence
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight"
            >
              Cyber Laws & <span className="text-primary">SOPs</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              Exactly what to do if you've been scammed — and the laws of India that protect every digital citizen.
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
                    <AlertTriangle className="h-4 w-4" /> Been scammed?
                  </div>
                  <h2 className="text-2xl font-bold mb-1">The Golden Hour matters.</h2>
                  <p className="text-gray-400">
                    Report within the first hour — banks can often freeze the money before it disappears.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Button asChild size="lg" className="w-full sm:w-auto rounded-full bg-red-500 hover:bg-red-600 text-white font-bold px-7">
                    <a href="tel:1930">
                      <PhoneCall className="mr-2 h-4 w-4" /> Call 1930
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-full bg-transparent border-white/30 hover:bg-white/10 text-white font-bold px-7">
                    <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">
                      File Complaint <ExternalLink className="ml-2 h-4 w-4" />
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
                If You've Been Scammed
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                Follow this official sequence — step by step, in order — to give yourself the best chance of recovery.
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
                  const Icon = step.icon;
                  return (
                    <motion.div key={step.title} variants={fadeInUp} className="flex gap-5 relative">
                      <div className="shrink-0 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-accent uppercase tracking-wider">{`Step ${i + 1}`}</span>
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
                Quick SOPs By Situation
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                Different scams need different first moves. Find yours and act.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto"
            >
              {scenarioSops.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.title}
                    variants={fadeInUp}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col"
                  >
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${s.tone}`}>
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
                <Gavel className="h-4 w-4" /> The law is on your side
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Know Your Rights
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                The key laws that make cyber fraud a serious, punishable crime in India.
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
                    <h3 className="text-xl font-bold text-gray-900">IT Act, 2000</h3>
                    <p className="text-sm text-gray-500">India's primary law for cyber offences</p>
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
                    <h3 className="text-xl font-bold text-gray-900">Bharatiya Nyaya Sanhita (BNS), 2023</h3>
                    <p className="text-sm text-gray-500">Replaced the IPC from 1 July 2024</p>
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
                    <h3 className="text-xl font-bold text-gray-900">Digital Personal Data Protection Act, 2023</h3>
                    <p className="text-sm text-gray-500">Your rights over your personal data</p>
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
                Safety Guidelines
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-400">
                Simple habits that stop most scams before they start.
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
                  <h3 className="text-xl font-bold">Always Do</h3>
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
                  <h3 className="text-xl font-bold">Never Do</h3>
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
                Official Resources
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                Government helplines and portals — bookmark these now, before you need them.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto"
            >
              {resources.map((r) => {
                const Icon = r.icon;
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
                      href={r.href}
                      {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      {r.action}
                      {r.external ? <ExternalLink className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
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
                This page is for general awareness and is not legal advice. Laws, sections and procedures are summarised
                and may change — always rely on official sources like cybercrime.gov.in and consult a qualified lawyer
                for your specific situation.
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
              Report it. Protect the next person.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Every scam you flag on Netraksh warns thousands of other Indians in real time.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button asChild size="lg" className="rounded-full bg-white hover:bg-gray-100 text-primary font-bold px-10 h-14 text-lg shadow-xl shadow-black/10 w-full sm:w-auto">
                <Link href="/download">Get Netraksh</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent border-white/30 hover:bg-white/10 text-white font-bold px-10 h-14 text-lg w-full sm:w-auto">
                <Link href="/cyber-safety-center">Cyber Safety Center <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    </MotionConfig>
  );
}
