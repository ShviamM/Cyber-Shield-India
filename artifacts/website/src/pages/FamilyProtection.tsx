import { Link } from "wouter";
import { motion, MotionConfig } from "framer-motion";
import {
  ShieldCheck,
  Newspaper,
  ArrowRight,
  Users,
  BellRing,
  HeartHandshake,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { NewspaperClippings } from "@/components/NewspaperClippings";
import { FamilyRiskSelector } from "@/components/FamilyRiskSelector";
import { FamilyStorytelling } from "@/components/FamilyStorytelling";

const STATS = [
  { value: "₹11,000 Cr+", label: "lost to cyber fraud in India in a single year" },
  { value: "Every 10 min", label: "a senior citizen is targeted by an online scam" },
  { value: "1 app", label: "to protect up to 5 of your loved ones" },
];

export default function FamilyProtection() {
  return (
    <Layout>
      <MotionConfig reducedMotion="user">
      <SEOHead
        title="Family Guardian | Protect Your Loved Ones"
        description="Netraksh Family Guardian lets you monitor and block cyber threats targeting your parents, seniors, and children — with real-time alerts the moment a scam is stopped."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-white to-white">
        <div className="container mx-auto px-4 pb-12 pt-14 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
          >
            <HeartHandshake className="h-4 w-4" /> Family Guardian
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mx-auto mt-5 max-w-3xl text-4xl font-bold text-gray-900 md:text-6xl"
          >
            Protect the people who{" "}
            <span className="text-accent">raised you</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-gray-600 md:text-xl"
          >
            Scammers prey on trust — and they target our parents and grandparents most of
            all. Netraksh stands guard on their phone and alerts you the moment a threat is
            stopped.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link href="/pricing">
              <Button size="lg" className="gap-2">
                Protect My Family <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/download">
              <Button size="lg" variant="outline">
                Download the App
              </Button>
            </Link>
          </motion.div>

          {/* Stats strip */}
          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-gray-600">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newspaper clippings — the pinboard */}
      <section className="bg-[#efe9da] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 text-sm font-semibold text-gray-700">
              <Newspaper className="h-4 w-4" /> Torn from the headlines
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Headlines that didn’t have to happen
            </h2>
            <p className="mt-3 text-gray-600">
              These are the stories that fill our newspapers every week. Hover or tap each
              clipping to see how Netraksh stops the scam behind it.
            </p>
          </div>
          <NewspaperClippings />
        </div>
      </section>

      {/* Interactive risk selector */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <Users className="h-4 w-4" /> Who needs protecting?
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Every family member faces a different threat
            </h2>
            <p className="mt-3 text-gray-600">
              Tap a person to see the scam they’re most likely to face — and exactly how
              Netraksh shields them.
            </p>
          </div>
          <FamilyRiskSelector />
        </div>
      </section>

      {/* How the alert flow works */}
      <section className="bg-gradient-to-b from-white to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
              <BellRing className="h-4 w-4" /> Real-time peace of mind
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              You’ll know the moment a threat is stopped
            </h2>
            <p className="mt-3 text-gray-600">
              When Netraksh blocks a scam on your loved one’s phone, you get notified
              instantly — no more finding out too late.
            </p>
          </div>
          <FamilyStorytelling />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-accent" />
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold md:text-4xl">
            Give your family the digital bodyguard they deserve
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">
            One subscription protects up to 5 loved ones. Start a 7-day free trial — no card
            needed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/pricing">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                See All Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </MotionConfig>
    </Layout>
  );
}
