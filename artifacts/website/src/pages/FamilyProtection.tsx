import { Link } from "wouter";
import { motion, MotionConfig } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Newspaper,
  ArrowRight,
  Users,
  BellRing,
  HeartHandshake,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHero, heroBtnLight, heroBtnGlow } from "@/components/layout/PageHero";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { NewspaperClippings } from "@/components/NewspaperClippings";
import { FamilyRiskSelector } from "@/components/FamilyRiskSelector";
import { FamilyStorytelling } from "@/components/FamilyStorytelling";

export default function FamilyProtection() {
  const { t } = useTranslation("family");
  const stats = t("stats.items", { returnObjects: true }) as Array<{
    value: string;
    label: string;
    source?: number;
  }>;
  const statSources = t("stats.sources", { returnObjects: true }) as Array<{ label: string; url: string }>;
  return (
    <Layout>
      <MotionConfig reducedMotion="user">
      <SEOHead
        title={t("seo.title")}
        description={t("seo.description")}
      />

      {/* Hero */}
      <PageHero
        badgeIcon={<HeartHandshake />}
        badge={t("hero.badge")}
        title={<>{t("hero.titleStart")}{t("hero.titleAccent")}{t("hero.titleEnd")}</>}
        subtitle={t("hero.subtitle")}
      >
        <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
          <Link href="/pricing" className={heroBtnLight}>
            {t("hero.protectBtn")} <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/download" className={heroBtnGlow}>
            {t("hero.downloadBtn")}
          </Link>
        </div>
        <dl className="mx-auto mt-12 grid max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left sm:grid-cols-3">
          {stats.map((s, i) => (
            <div key={s.label} className={`p-5 ${i > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""}`}>
              <dd className="text-2xl font-bold text-white">
                {s.value}
                {s.source !== undefined && <sup className="ml-0.5 text-sm font-semibold text-[#FFB55C]">{s.source + 1}</sup>}
              </dd>
              <dt className="mt-1 text-[15px] text-[#B4BBD0]">{s.label}</dt>
            </div>
          ))}
        </dl>
        <ol className="mx-auto mt-4 max-w-3xl list-none space-y-1 text-left text-[13px] text-[#B4BBD0]">
          {statSources.map((src, i) => (
            <li key={src.url}>
              <span className="font-semibold text-[#FFB55C]">{i + 1}</span>{" "}
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 underline-offset-2 hover:text-white">
                {src.label}
              </a>
            </li>
          ))}
        </ol>
      </PageHero>

      {/* Newspaper clippings — the pinboard */}
      <section className="bg-[#efe9da] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 text-sm font-semibold text-gray-700">
              <Newspaper className="h-4 w-4" /> {t("clippingsSection.badge")}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              {t("clippingsSection.title")}
            </h2>
            <p className="mt-3 text-gray-600">
              {t("clippingsSection.subtitle")}
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
              <Users className="h-4 w-4" /> {t("riskSection.badge")}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              {t("riskSection.title")}
            </h2>
            <p className="mt-3 text-gray-600">
              {t("riskSection.subtitle")}
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
              <BellRing className="h-4 w-4" /> {t("alertSection.badge")}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              {t("alertSection.title")}
            </h2>
            <p className="mt-3 text-gray-600">
              {t("alertSection.subtitle")}
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
            {t("cta.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[#B4BBD0]">
            {t("cta.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/pricing">
              <Button size="lg" variant="secondary" className="gap-2">
                {t("cta.startBtn")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                {t("cta.seeAllBtn")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </MotionConfig>
    </Layout>
  );
}
