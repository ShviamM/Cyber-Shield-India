import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Loader2,
  ArrowRight,
  Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  fraudCheck,
  type FraudVerdict,
  FraudCheckRequestType,
  ApiError,
  useListCategories,
  useCreatePublicReport,
} from "@workspace/api-client-react";
import { Flag, CheckCircle2 } from "lucide-react";

type CheckType =
  (typeof FraudCheckRequestType)[keyof typeof FraudCheckRequestType];

export function detectType(raw: string): CheckType {
  const v = raw.trim();
  if (!v) return "message";
  if (v.length > 80) return "message";
  // Phone: composed only of digits and common separators (spaces, dashes,
  // parentheses, plus) — e.g. "+91 98765 43210" — with 7–15 digits once the
  // separators are stripped. Checked before the space guard so spaced numbers
  // are still recognized as phone numbers.
  const digits = v.replace(/[\s\-()+]/g, "");
  if (/^[\d\s\-()+]+$/.test(v) && /^\d{7,15}$/.test(digits)) return "phone";
  if (v.includes(" ")) return "message";
  // UPI handle: user@bank — the part after @ has no dot (distinguishes from email)
  if (/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v)) return "upi";
  // URL: explicit scheme, www, or host.tld without spaces and without @
  if (
    /^https?:\/\//i.test(v) ||
    /^www\./i.test(v) ||
    (/^[^\s@]+\.[a-z]{2,}(?:[/?#]|$)/i.test(v) && !v.includes("@"))
  ) {
    return "url";
  }
  return "message";
}

type RiskLevel = FraudVerdict["riskLevel"];

const RISK_STYLES: Record<
  RiskLevel,
  { icon: typeof ShieldAlert; ring: string; text: string; bar: string }
> = {
  high: {
    icon: ShieldAlert,
    ring: "bg-red-500/15 text-red-500 ring-red-500/30",
    text: "text-red-500",
    bar: "bg-red-500",
  },
  medium: {
    icon: AlertTriangle,
    ring: "bg-amber-500/15 text-amber-500 ring-amber-500/30",
    text: "text-amber-500",
    bar: "bg-amber-500",
  },
  low: {
    icon: ShieldCheck,
    ring: "bg-emerald-500/15 text-emerald-500 ring-emerald-500/30",
    text: "text-emerald-500",
    bar: "bg-emerald-500",
  },
  unknown: {
    icon: HelpCircle,
    ring: "bg-gray-500/15 text-gray-300 ring-gray-500/30",
    text: "text-gray-300",
    bar: "bg-gray-400",
  },
};

type ErrorKind = "rateLimited" | "limitReached" | "generic" | "empty";

function reportErrorKey(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return "report.error.duplicate";
    if (err.status === 429) return "report.error.rateLimited";
    if (err.status === 400) return "report.error.invalidPhone";
  }
  return "report.error.generic";
}

/**
 * Community "Report as scam" action shown under a phone verdict. Only phone
 * numbers feed the reputation database, so this is rendered for phone checks
 * only. Keyed by the checked number so it resets between checks.
 */
function ReportScam({ phone }: { phone: string }) {
  const { t, i18n } = useTranslation("check");
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");

  const isHindi = i18n.language.startsWith("hi");
  const categoriesQuery = useListCategories();
  const report = useCreatePublicReport();

  if (report.isSuccess) {
    return (
      <div className="mt-7 border-t border-white/10 pt-6">
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30 p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-300">
              {t("report.success.title")}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              {t("report.success.desc", {
                count: report.data.reportCount,
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-7 border-t border-white/10 pt-6">
        <p className="text-sm text-gray-400 mb-3">{t("report.prompt")}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-amber-300 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
        >
          <Flag className="w-4 h-4" />
          {t("report.cta")}
        </button>
      </div>
    );
  }

  const categories = categoriesQuery.data?.categories ?? [];
  const errorKey = report.isError ? reportErrorKey(report.error) : null;

  return (
    <div className="mt-7 border-t border-white/10 pt-6">
      <p className="font-semibold text-white">{t("report.title")}</p>
      <p className="text-sm text-gray-400 mt-1 mb-4">{t("report.desc")}</p>

      <label
        htmlFor="report-category"
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        {t("report.categoryLabel")}
      </label>
      <select
        id="report-category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full bg-[#152033] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors mb-4"
      >
        <option value="">{t("report.categoryPlaceholder")}</option>
        {categories.map((c) => (
          <option key={c.key} value={c.key}>
            {isHindi && c.nameHi ? c.nameHi : c.nameEn}
          </option>
        ))}
      </select>

      {errorKey && <p className="text-sm text-red-400 mb-4">{t(errorKey)}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          disabled={report.isPending}
          onClick={() =>
            report.mutate({
              data: { phone, categoryKey: category || undefined },
            })
          }
          className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {report.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("report.submitting")}
            </>
          ) : (
            <>
              <Flag className="w-4 h-4" />
              {t("report.submit")}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-5 py-3 rounded-xl font-medium text-gray-300 border border-white/10 hover:bg-white/5 transition-colors"
        >
          {t("report.cancel")}
        </button>
      </div>
    </div>
  );
}

export default function CheckScam() {
  const { t } = useTranslation("check");
  const prefersReducedMotion = useReducedMotion();
  const [, setLocation] = useLocation();

  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<FraudVerdict | null>(null);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const ranInitial = useRef(false);

  const runCheck = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setErrorKind("empty");
      setVerdict(null);
      return;
    }
    setLoading(true);
    setErrorKind(null);
    setVerdict(null);
    try {
      const result = await fraudCheck({
        type: detectType(trimmed),
        value: trimmed,
      });
      setVerdict(result);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) setErrorKind("rateLimited");
        else if (err.status === 402) setErrorKind("limitReached");
        else setErrorKind("generic");
      } else {
        setErrorKind("generic");
      }
    } finally {
      setLoading(false);
    }
  };

  // Deep-link support: /check?q=<value> prefills and auto-runs the real check.
  useEffect(() => {
    if (ranInitial.current) return;
    ranInitial.current = true;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      setValue(q);
      void runCheck(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Keep the URL shareable/refresh-safe with the latest query.
    setLocation(`/check?q=${encodeURIComponent(value.trim())}`, {
      replace: true,
    });
    void runCheck(value);
  };

  const handleReset = () => {
    setValue("");
    setVerdict(null);
    setErrorKind(null);
    setLocation("/check", { replace: true });
  };

  const risk = verdict ? RISK_STYLES[verdict.riskLevel] : null;
  const RiskIcon = risk?.icon ?? HelpCircle;

  return (
    <Layout>
      <SEOHead title={t("seo.title")} description={t("seo.description")} />

      <section className="relative overflow-hidden bg-[#061f4d] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0B3D91_0%,_transparent_60%)] opacity-40" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.4] [background-image:radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 pt-16 pb-20 lg:pt-20 lg:pb-24 max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-6 backdrop-blur-md">
              <Search className="w-4 h-4" />
              <span>Netraksh</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {t("heading")}
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
              {t("subheading")}
            </p>
          </div>

          {/* Input card */}
          <form
            onSubmit={handleSubmit}
            className="w-full bg-[#0c1424]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-80" />
            <label
              htmlFor="check-input"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {t("inputLabel")}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="check-input"
                type="text"
                autoFocus
                placeholder={t("placeholder")}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 bg-[#152033] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent transition-colors font-mono"
              />
              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("checking")}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    {t("analyzeCta")}
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              {t("disclaimer")}
            </p>
          </form>

          {/* Result / error */}
          <AnimatePresence mode="wait">
            {errorKind && (
              <motion.div
                key={`err-${errorKind}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                className="mt-6 bg-[#0c1424]/80 border border-white/10 rounded-3xl p-6 text-center"
              >
                <p className="text-gray-200">{t(`error.${errorKind}`)}</p>
                {errorKind === "limitReached" && (
                  <Link href="/download" className="inline-block mt-4">
                    <button className="bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-xl font-medium flex items-center gap-2 transition-colors">
                      {t("download.cta")} <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                )}
              </motion.div>
            )}

            {verdict && risk && !errorKind && (
              <motion.div
                key="verdict"
                initial={
                  prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                className="mt-6 bg-[#0c1424]/80 border border-white/10 rounded-3xl p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ring-1 ${risk.ring}`}
                  >
                    <RiskIcon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-2xl font-bold ${risk.text}`}>
                      {t(`verdict.${verdict.riskLevel}.title`)}
                    </h2>
                    <p className="text-gray-300 mt-1 leading-relaxed">
                      {t(`verdict.${verdict.riskLevel}.desc`)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 text-sm text-gray-400 break-all">
                  <span className="text-gray-500">{t("checkedLabel")}: </span>
                  <span className="font-mono text-gray-200">
                    {verdict.value}
                  </span>
                  <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-400">
                    {t(`type.${verdict.type}`)}
                  </span>
                </div>

                {/* Score bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">{t("scoreLabel")}</span>
                    <span className={`font-semibold ${risk.text}`}>
                      {verdict.score}/100
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${risk.bar}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, verdict.score))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Reasons */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">
                    {t("reasonsLabel")}
                  </h3>
                  {verdict.reasons.length > 0 ? (
                    <ul className="space-y-2">
                      {verdict.reasons.map((reason, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-gray-300 bg-white/5 rounded-xl px-3 py-2.5"
                        >
                          <span
                            className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${risk.bar}`}
                          />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">{t("noReasons")}</p>
                  )}
                </div>

                {/* Community report — phone numbers only feed reputation */}
                {verdict.type === "phone" && (
                  <ReportScam key={verdict.value} phone={verdict.value} />
                )}

                {/* CTA */}
                <div className="mt-7 border-t border-white/10 pt-6">
                  <p className="font-semibold text-white">
                    {t("download.title")}
                  </p>
                  <p className="text-sm text-gray-400 mt-1 mb-4">
                    {t("download.desc")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/download" className="sm:flex-1">
                      <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(11,61,145,0.4)]">
                        {t("download.cta")} <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-3 rounded-xl font-medium text-gray-300 border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      {t("checkAnother")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Trust / download band */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("download.title")}
          </h2>
          <p className="text-gray-600 mb-8">{t("download.desc")}</p>
          <Link href="/download">
            <Button
              size="lg"
              className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-14 text-lg gap-2"
            >
              {t("download.cta")} <Lock className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
