import { Link } from "wouter";
import { MotionConfig, motion, type Variants } from "framer-motion";
import {
  Bell,
  Check,
  ChevronDown,
  Link2,
  Lock,
  MessageSquare,
  Phone,
  QrCode,
  Search,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { HeroGlow as Glow, heroBtnGlow as btnGlow, heroBtnLight as btnLight } from "@/components/layout/PageHero";

// Homepage layout adapted from Launch UI (MIT, github.com/launch-ui/launch-ui):
// dark hero with a saffron glow and framed product mockup, then light,
// high-readability sections. Every heading shows the active language with
// the other language underneath, so the page is bilingual in either mode.

const appear: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

type Tone = "red" | "orange" | "green";
const toneClass: Record<Tone, string> = {
  red: "bg-[#D93B3B]/15 text-[#FF9A9A]",
  orange: "bg-[#F7931E]/15 text-[#FFB55C]",
  green: "bg-[#138A4B]/20 text-[#6BD69A]",
};

function useEcho() {
  const { i18n } = useTranslation();
  const other = i18n.language?.startsWith("hi") ? "en" : "hi";
  return { tx: i18n.getFixedT(other, "home"), otherLang: other };
}

function SectionHeading({ k, center = false, dark = false }: { k: string; center?: boolean; dark?: boolean }) {
  const { t } = useTranslation("home");
  const { tx, otherLang } = useEcho();
  return (
    <h2
      className={`text-[32px] sm:text-[42px] lg:text-[50px] font-bold leading-[1.15] tracking-tight text-balance ${
        dark ? "text-white" : "text-[#121731]"
      } ${center ? "text-center mx-auto" : ""} max-w-3xl`}
    >
      {t(k)}
      <span
        lang={otherLang}
        className={`block mt-2 text-[0.6em] font-semibold tracking-normal ${dark ? "text-[#B4BBD0]" : "text-[#4A5170]"}`}
      >
        {tx(k)}
      </span>
    </h2>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-base font-semibold text-[#8F4A00]">{children}</p>;
}

function HeroMockup() {
  const { t } = useTranslation("home");
  const feed = t("mockup.feed", { returnObjects: true }) as Array<{ title: string; who: string; tag: string; tone: Tone }>;
  return (
    <div className="relative z-10 mx-auto max-w-[1080px] rounded-[18px] bg-white/[0.06] p-2">
      <div
        role="img"
        aria-label={t("mockup.ariaLabel")}
        className="overflow-hidden rounded-xl border border-white/[0.07] border-t-white/20 bg-[#0C1129] text-left text-[15px] text-[#F6F7FB] shadow-[-12px_16px_48px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3 text-sm text-[#B4BBD0]">
          <img src="/images/netraksh-logo.png" alt="" width={22} height={22} className="h-[22px] w-[22px] rounded-[5px]" />
          Netraksh
          <span className="rounded-full bg-[#FFC46B] px-2 py-0.5 text-xs font-bold text-[#1A1205]">{t("mockup.example")}</span>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-white/10 bg-[#10162F] p-[18px]">
            <h3 className="mb-3 text-[15px] font-semibold">{t("mockup.checkTitle")}</h3>
            <div className="mb-3.5 flex gap-2">
              <div className="flex min-h-[46px] flex-1 items-center rounded-[10px] border border-white/20 px-3.5 text-base">+91 98765 43210</div>
              <div className="flex min-h-[46px] items-center rounded-[10px] bg-[#F7931E] px-[18px] font-bold text-[#1A1205]">{t("mockup.check")}</div>
            </div>
            <div className="flex gap-3.5 rounded-[10px] border border-[#D93B3B]/35 bg-[#D93B3B]/10 p-3.5">
              <Phone className="mt-0.5 h-[22px] w-[22px] shrink-0 text-[#FF9A9A]" />
              <div>
                <strong className="block text-[17px] text-[#FF9A9A]">{t("mockup.verdictTitle")}</strong>
                <span className="text-sm text-[#B4BBD0]">{t("mockup.verdictDesc")}</span>
                <span className="mt-1 block text-[15px] text-white">{t("mockup.verdictWarn")}</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#10162F] p-[18px]">
            <h3 className="mb-3 text-[15px] font-semibold">{t("mockup.feedTitle")}</h3>
            <ul className="grid gap-2.5">
              {feed.map((f) => (
                <li key={f.title} className="flex items-center gap-3 rounded-[10px] border border-white/10 px-3 py-2.5">
                  <div>
                    <b className="block text-[15px] font-semibold">{f.title}</b>
                    <small className="text-[13px] text-[#B4BBD0]">{f.who}</small>
                  </div>
                  <span className={`ml-auto whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-bold ${toneClass[f.tone]}`}>{f.tag}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation("home");
  const { tx, otherLang } = useEcho();

  const proof = t("proof.items", { returnObjects: true }) as Array<{ value: string; label: string }>;
  const quotes = t("trusted.quotes", { returnObjects: true }) as Array<{ quote: string; role: string }>;
  const steps = t("walkthrough.steps", { returnObjects: true }) as Array<{ title: string; desc: string; tone: "bad" | "good" }>;
  const features = t("features.items", { returnObjects: true }) as Array<{ title: string; desc: string }>;
  const trustPoints = t("trust.points", { returnObjects: true }) as Array<{ title: string; desc: string }>;
  const faqs = t("faq.items", { returnObjects: true }) as Array<{ q: string; a: string }>;
  const featureIcons = [Phone, Link2, MessageSquare, QrCode];
  const trustIcons = [Check, Lock, Check];

  return (
    <MotionConfig reducedMotion="user">
      <Layout>
        <SEOHead
          title={t("seo.title")}
          description={t("seo.description")}
          schema={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Netraksh",
            description: t("seo.description"),
            applicationCategory: "SecurityApplication",
            operatingSystem: "Android, iOS",
          }}
        />

        {/* Hero: dark, sits under the transparent navbar */}
        <section className="relative -mt-20 overflow-hidden bg-[#0A0F24] pt-20 text-[#F6F7FB]">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[max(12px,calc(50%-612px))] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-[max(12px,calc(50%-612px))] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          <motion.div initial="hidden" animate="visible" variants={stagger} className="container relative z-10 mx-auto px-4 pt-12 text-center md:px-6 lg:pt-16">
            <motion.div variants={appear} className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/20 px-3.5 py-1.5 text-[15px] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#F7931E] shadow-[0_0_0_4px_rgba(247,147,30,0.2)]" />
              {t("hero.badge")}
            </motion.div>

            <motion.h1 variants={appear} className="bg-gradient-to-r from-white to-[#C9CEE0] bg-clip-text text-[44px] font-bold leading-[1.15] tracking-tight text-transparent sm:text-6xl lg:text-[84px]">
              {t("hero.title")}
            </motion.h1>
            <motion.p variants={appear} lang={otherLang} className="mt-2 text-2xl font-semibold text-[#F6F7FB] sm:text-[32px]">
              {tx("hero.title")}
            </motion.p>
            <motion.p variants={appear} className="mx-auto mt-6 max-w-[720px] text-lg text-[#B4BBD0] text-balance sm:text-[21px]">
              {t("hero.subtitle")}
            </motion.p>

            <motion.div variants={appear} className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row">
              <Link href="/check" className={btnLight}>
                <Search className="h-[22px] w-[22px]" />
                {t("hero.checkCta")}
              </Link>
              <Link href="/download" className={btnGlow}>
                <Bell className="h-[22px] w-[22px]" />
                {t("hero.notifyCta")}
              </Link>
            </motion.div>

            <motion.dl
              variants={appear}
              aria-label={t("proof.label")}
              className="mx-auto mt-14 grid max-w-[1080px] grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left lg:grid-cols-4"
            >
              {proof.map((p, i) => (
                <div
                  key={p.label}
                  className={`p-4 sm:p-6 ${i % 2 === 1 ? "border-l border-white/10" : ""} ${i >= 2 ? "border-t border-white/10 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
                >
                  <dt className="sr-only">{p.label}</dt>
                  <dd className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{p.value}</dd>
                  <dd className="mt-1 text-[15px] text-[#B4BBD0]">{p.label}</dd>
                </div>
              ))}
            </motion.dl>

            <motion.div variants={appear} className="relative pt-14 [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]">
              <HeroMockup />
              <Glow className="top-0" />
            </motion.div>
          </motion.div>
        </section>

        {/* Trusted on the ground: real photos and audience quotes */}
        <section className="bg-[#F5F6FA] py-20 lg:py-26">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <Kicker>{t("trusted.kicker")}</Kicker>
              <SectionHeading k="trusted.heading" center />
            </div>
            <div className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-3.5 sm:auto-rows-[200px] lg:auto-rows-[240px] lg:grid-cols-[1.3fr_1fr_1fr]">
              {[
                { src: "event-felicitation-3", cap: t("trusted.photos.police"), cls: "col-span-2 row-span-1 lg:col-span-1 lg:row-span-2" },
                { src: "event-school-1", cap: t("trusted.photos.school"), cls: "" },
                { src: "event-felicitation-4", cap: t("trusted.photos.women"), cls: "" },
                { src: "event-press-1", cap: t("trusted.photos.press"), cls: "" },
                { src: "event-speaking-4", cap: t("trusted.photos.jagran"), cls: "" },
              ].map((p) => (
                <figure key={p.src} className={`relative overflow-hidden rounded-[14px] bg-gray-200 ${p.cls}`}>
                  <img src={`/images/home/${p.src}.webp`} alt={p.cap} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0A0F24]/90 to-transparent px-3.5 pb-3 pt-7 text-left text-[14.5px] font-semibold text-white">
                    {p.cap}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {quotes.map((q) => (
                <blockquote key={q.role} className="rounded-[14px] border border-[#E3E6EF] bg-white p-6 text-[17px] text-[#121731]">
                  “{q.quote}”
                  <cite className="mt-3 block text-[15px] font-semibold not-italic text-[#4A5170]">{q.role}</cite>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Walkthrough of a digital-arrest call */}
        <section className="bg-white py-20 lg:py-26">
          <div className="container mx-auto grid items-start gap-14 px-4 md:px-6 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Kicker>{t("walkthrough.kicker")}</Kicker>
              <SectionHeading k="walkthrough.heading" />
              <p className="mt-4 max-w-2xl text-lg text-[#4A5170] sm:text-[19px]">{t("walkthrough.subtitle")}</p>
              <a
                href="tel:1930"
                className="mt-7 flex items-center gap-4 rounded-[14px] border border-[#F5C2C2] bg-[#FDECEC] px-5 py-4 text-[17px] text-[#121731]"
              >
                <b className="text-[28px] leading-none text-[#D93B3B]">1930</b>
                <span>{t("walkthrough.helpline")}</span>
              </a>
            </div>
            <ol className="relative grid gap-6 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-0.5 before:bg-[#E3E6EF]">
              {steps.map((s, i) => (
                <li key={s.title} className="relative grid grid-cols-[40px_1fr] gap-4">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-full border-2 bg-white text-base font-bold ${
                      s.tone === "bad" ? "border-[#D93B3B] text-[#D93B3B]" : "border-[#138A4B] text-[#138A4B]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <b className="block text-lg text-[#121731]">{s.title}</b>
                    <p className="text-[17px] text-[#4A5170]">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="bg-[#F5F6FA] py-20 lg:py-26">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeading k="features.heading" center />
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => {
                const Icon = featureIcons[i];
                return (
                  <div key={f.title}>
                    <h3 className="mb-2 flex items-center gap-2.5 text-[19px] font-semibold text-[#121731]">
                      <Icon className="h-[22px] w-[22px] text-[#8F4A00]" />
                      {f.title}
                    </h3>
                    <p className="text-[17px] text-[#4A5170]">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Family Guardian */}
        <section className="bg-white py-20 lg:py-26">
          <div className="container mx-auto grid items-center gap-14 px-4 md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Kicker>{t("family.kicker")}</Kicker>
              <SectionHeading k="family.heading" />
              <p className="mt-4 max-w-2xl text-lg text-[#4A5170] sm:text-[19px]">{t("family.subtitle")}</p>
              <Link
                href="/family-protection"
                className="mt-7 inline-flex min-h-[52px] items-center gap-2.5 rounded-xl bg-[#121731] px-6 text-[17px] font-semibold text-white hover:bg-black"
              >
                <Users className="h-[22px] w-[22px]" />
                {t("family.cta")}
              </Link>
            </div>
            <div role="img" aria-label={`${t("mockup.example")}: ${t("family.notifTitle")}`} className="rounded-[18px] border border-[#E3E6EF] bg-white p-6 shadow-[0_24px_48px_-28px_rgba(10,15,36,0.35)]">
              <div className="flex items-center gap-2 text-sm text-[#4A5170]">
                {t("family.notifSource")}
                <span className="rounded-full bg-[#FFC46B] px-2 py-0.5 text-xs font-bold text-[#1A1205]">{t("mockup.example")}</span>
              </div>
              <b className="my-1.5 block text-xl text-[#121731]">{t("family.notifTitle")}</b>
              <span className="text-base text-[#4A5170]">{t("family.notifBody")}</span>
              <div className="mt-4 flex gap-2.5 font-bold">
                <span className="flex-1 rounded-xl bg-[#138A4B] p-3 text-center text-white">{t("family.callAction")}</span>
                <span className="flex-1 rounded-xl bg-[#F5F6FA] p-3 text-center text-[#121731]">{t("family.safeAction")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why trust us */}
        <section className="bg-[#F5F6FA] py-20 lg:py-26">
          <div className="container mx-auto grid items-center gap-14 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid grid-cols-[1fr_0.62fr] items-end gap-4">
              <div className="overflow-hidden rounded-[18px] bg-gradient-to-b from-[#1A2246] to-[#0A0F24]">
                <img src="/images/home/founder-shivam.webp" alt={t("trust.photoAlt")} loading="lazy" decoding="async" width={654} height={720} className="h-auto w-full" />
              </div>
              <div className="rotate-3 overflow-hidden rounded-[10px] shadow-[0_20px_40px_-18px_rgba(10,15,36,0.5)]">
                <img src="/images/home/founder-book.webp" alt={t("trust.bookAlt")} loading="lazy" decoding="async" width={430} height={720} className="h-auto w-full" />
              </div>
            </div>
            <div>
              <Kicker>{t("trust.kicker")}</Kicker>
              <SectionHeading k="trust.heading" />
              <ul className="mt-7 grid gap-4">
                {trustPoints.map((p, i) => {
                  const Icon = trustIcons[i];
                  return (
                    <li key={p.title} className="grid grid-cols-[28px_1fr] gap-3">
                      <Icon className="mt-1 h-[22px] w-[22px] text-[#138A4B]" />
                      <div>
                        <b className="block text-lg text-[#121731]">{p.title}</b>
                        <span className="text-[17px] text-[#4A5170]">{p.desc}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/founder" className="inline-flex min-h-[52px] items-center rounded-xl border border-[#C9CEDC] bg-white px-6 text-[17px] font-semibold text-[#121731] hover:border-[#121731]">
                  {t("trust.founderCta")}
                </Link>
                <Link href="/privacy-policy" className="inline-flex min-h-[52px] items-center rounded-xl border border-[#C9CEDC] bg-white px-6 text-[17px] font-semibold text-[#121731] hover:border-[#121731]">
                  {t("trust.privacyCta")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white py-20 lg:py-26">
          <div className="container mx-auto px-4 md:px-6">
            <SectionHeading k="faq.heading" center />
            <div className="mx-auto mt-12 max-w-[820px]">
              {faqs.map((f, i) => (
                <details key={f.q} open={i === 0} className="group border-b border-[#E3E6EF]">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 py-5 text-[19px] font-semibold text-[#121731] [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDown className="h-[22px] w-[22px] shrink-0 text-[#4A5170] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 text-[17px] text-[#4A5170]">{f.a}</p>
                </details>
              ))}
            </div>
            <a
              href="tel:1930"
              className="mx-auto mt-8 flex max-w-[820px] flex-wrap items-center justify-center gap-3.5 rounded-[14px] border border-[#F5C2C2] bg-[#FDECEC] px-5 py-4 text-[17px] text-[#121731]"
            >
              <Phone className="h-[22px] w-[22px] text-[#D93B3B]" />
              <span>{t("faq.helplinePre")}</span>
              <b className="text-2xl text-[#D93B3B]">1930</b>
              <span>{t("faq.helplinePost")}</span>
            </a>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative overflow-hidden bg-[#0A0F24] py-28 text-center lg:py-32">
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <SectionHeading k="finalCta.heading" center dark />
            <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row">
              <Link href="/check" className={btnLight}>
                <Search className="h-[22px] w-[22px]" />
                {t("finalCta.check")}
              </Link>
              <Link href="/download" className={btnGlow}>
                <Bell className="h-[22px] w-[22px]" />
                {t("finalCta.notify")}
              </Link>
            </div>
          </div>
          <Glow className="top-[40%]" />
        </section>
      </Layout>
    </MotionConfig>
  );
}
