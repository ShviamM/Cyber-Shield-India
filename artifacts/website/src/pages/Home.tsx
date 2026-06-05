import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, ShieldCheck, Smartphone, Users, ChevronRight, Lock, Bell, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Home() {
  return (
    <Layout>
      <SEOHead 
        title="India's Digital Bodyguard" 
        description="Protecting every Indian from scam calls, fraud messages, fake links, QR scams, UPI fraud and digital crime."
        schema={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Netraksh",
          "description": "India's most trusted cyber safety platform protecting citizens from digital fraud.",
          "applicationCategory": "SecurityApplication",
          "operatingSystem": "Android, iOS"
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-24 pb-32">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                Built for a Safer India
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
                India's Digital <br/><span className="text-primary">Bodyguard.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                Protecting every Indian from scam calls, fraud messages, fake links, QR scams, UPI fraud and digital crime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/download">
                  <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-8 h-14 text-lg w-full sm:w-auto shadow-lg shadow-primary/20">
                    Download Netraksh
                  </Button>
                </Link>
                <Link href="/features">
                  <Button size="lg" variant="outline" className="rounded-full font-medium px-8 h-14 text-lg w-full sm:w-auto border-gray-200 hover:bg-gray-50">
                    See How It Works
                  </Button>
                </Link>
              </div>
              
              <div className="mt-10 flex items-center gap-4 text-sm text-gray-500 font-medium">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=U${i}&backgroundColor=e2e8f0`} alt="" />
                    </div>
                  ))}
                </div>
                <p>Growing community of protected citizens</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:ml-auto flex justify-center"
            >
              <div className="relative w-full max-w-[320px] aspect-[9/19] rounded-[2.5rem] border-[8px] border-gray-900 bg-white shadow-2xl overflow-hidden">
                <img 
                  src="/images/hero-mockup.png" 
                  alt="Netraksh App Interface" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-1/4 -left-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
              >
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Incoming Call</p>
                  <p className="text-sm font-bold text-gray-900">Scam Detected</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }} 
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 -right-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
              >
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Link Scanner</p>
                  <p className="text-sm font-bold text-gray-900">Safe to Open</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cyber Crime Stats Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">India's Growing Cyber Threat</h2>
            <p className="text-xl text-gray-400">Digital fraud is escalating. Everyday citizens are losing their hard-earned money to sophisticated scams.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Reported Cyber Crimes (2023)", value: "1.1M+", desc: "According to National Cyber Crime Reporting Portal data" },
              { label: "Financial Losses", value: "₹7,000 Cr+", desc: "Estimated public losses to digital fraud" },
              { label: "Targeting Seniors & Families", value: "Rising", desc: "Highest growth in targeted manipulation" }
            ].map((stat, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 p-8 rounded-3xl backdrop-blur-sm">
                <h3 className="text-gray-400 text-lg font-medium mb-2">{stat.label}</h3>
                <div className="text-5xl font-bold text-orange-500 mb-4">{stat.value}</div>
                <p className="text-sm text-gray-500">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Simple, Powerful Protection</h2>
            <p className="text-xl text-gray-600">Netraksh runs quietly in the background, analyzing threats in real-time without compromising your privacy.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Check Number", desc: "Instantly know if an incoming call is from a verified business or a reported scammer.", img: "/images/step-check-number.png" },
              { title: "Check Link", desc: "Our AI scanner analyzes URLs before you click, blocking phishing and fake sites.", img: "/images/step-check-link.png" },
              { title: "Check Message", desc: "Identify fake job offers, lottery scams, and urgent requests automatically.", img: "/images/step-check-message.png" },
              { title: "Report Fraud", desc: "Contribute to the national safety network by easily reporting suspicious activity.", img: "/images/step-report-fraud.png" }
            ].map((step, i) => (
              <div key={i} className="group text-center">
                <div className="mb-6 rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square flex items-center justify-center p-6 group-hover:shadow-xl transition-all duration-300">
                  <img src={step.img} alt={step.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Family Protection */}
      <section className="py-24 bg-orange-50/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-2xl text-orange-600 mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Family Guardian</h2>
              <p className="text-xl text-gray-600 mb-8">
                Protect your parents and loved ones from digital fraud. When they receive a suspicious call or link, you get alerted instantly.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Real-time alerts for family members",
                  "Shared trusted contacts list",
                  "Remote threat blocking",
                  "Zero complex setup for seniors"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/family-protection">
                <Button className="rounded-full bg-gray-900 hover:bg-gray-800 text-white font-medium px-6">
                  Explore Family Protection <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img src="/images/family-protection.png" alt="Family Protection" className="rounded-[2rem] shadow-2xl border-4 border-white" />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-red-100 p-2 rounded-full text-red-600">
                    <Bell className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-gray-900">Alert Sent to Rahul</span>
                </div>
                <p className="text-sm text-gray-600">Dad received a high-risk call from reported UPI scammer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the Movement for a Safer Digital India.</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Download Netraksh today and take the first step towards securing your digital life and protecting your family.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/download">
              <Button size="lg" className="rounded-full bg-white hover:bg-gray-100 text-primary font-bold px-8 h-14 text-lg">
                Download for Android
              </Button>
            </Link>
            <Link href="/download">
              <Button size="lg" className="rounded-full bg-white hover:bg-gray-100 text-primary font-bold px-8 h-14 text-lg">
                Download for iOS
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
}