import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useState } from "react";
import { Shield, Bell, CheckCircle2 } from "lucide-react";
import { ScamCallScreen } from "@/components/ScamCallScreen";
import { useTranslation } from "react-i18next";

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function GooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path fill="#00d2ff" d="M3.6 1.7c-.3.3-.5.8-.5 1.4v17.8c0 .6.2 1.1.5 1.4l.1.1L13.5 12v-.2L3.7 1.6l-.1.1z" />
      <path fill="#ffce00" d="m16.8 15.3-3.3-3.3v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.3l-3.9 2.2-.1.1z" />
      <path fill="#ff3a44" d="M16.9 15.2 13.5 12 3.6 22.3c.4.4 1 .4 1.7.1l11.6-6.6z" />
      <path fill="#00f076" d="M16.9 8.8 5.3 1.6c-.7-.4-1.3-.4-1.7.1L13.5 12l3.4-3.2z" />
    </svg>
  );
}

type NotifyState = "idle" | "sending" | "done" | "invalid" | "error";

function NotifyForm() {
  const { t, i18n } = useTranslation("misc");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<NotifyState>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, lang: i18n.language?.startsWith("hi") ? "hi" : "en" }),
      });
      if (res.ok) setState("done");
      else setState(res.status === 400 ? "invalid" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p role="status" className="flex items-start gap-3 rounded-2xl border border-[#138A4B]/40 bg-[#138A4B]/15 p-4 text-lg text-white">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#6BD69A]" />
        {t("download.notifySuccess")}
      </p>
    );
  }

  return (
    <form id="notify" onSubmit={submit} noValidate className="scroll-mt-28">
      <label htmlFor="notify-contact" className="mb-2 block font-semibold text-white">
        {t("download.notifyLabel")}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="notify-contact"
          type="text"
          inputMode="email"
          autoComplete="email"
          value={contact}
          onChange={(e) => {
            setContact(e.target.value);
            if (state !== "sending") setState("idle");
          }}
          placeholder={t("download.notifyPlaceholder")}
          aria-invalid={state === "invalid"}
          aria-describedby="notify-help"
          className="min-h-[56px] flex-1 rounded-xl border border-white/20 bg-white/5 px-4 text-lg text-white placeholder:text-[#8F97B0] focus:border-[#F7931E] focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending" || !contact.trim()}
          className="inline-flex min-h-[56px] items-center justify-center gap-2.5 rounded-xl bg-accent px-6 text-lg font-bold text-[#1A1205] transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          <Bell className="h-5 w-5" />
          {state === "sending" ? t("download.notifySending") : t("download.notifyMe")}
        </button>
      </div>
      <p id="notify-help" role={state === "invalid" || state === "error" ? "alert" : undefined} className={`mt-2 text-sm ${state === "invalid" || state === "error" ? "text-[#FF9A9A]" : "text-[#B4BBD0]"}`}>
        {state === "invalid" ? t("download.notifyInvalid") : state === "error" ? t("download.notifyError") : t("download.notifyPrivacy")}
      </p>
    </form>
  );
}

export default function Download() {
  const { t } = useTranslation("misc");
  return (
    <Layout>
      <SEOHead 
        title={t("download.seoTitle")} 
        description={t("download.seoDescription")}
      />
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        <div className="bg-[#0A0F24] rounded-[3rem] overflow-hidden relative text-white shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-12 p-12 md:p-20 relative z-10">
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7931E]/15 text-[#FFB55C] text-sm font-medium mb-6 w-fit">
                <Shield className="w-4 h-4" />
                {t("download.badge")}
              </div>
              <h1 className="text-4xl md:text-5xl mb-6 leading-tight">{t("download.heading")}</h1>
              <p className="text-xl text-gray-400 mb-8">
                {t("download.description")}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-gray-200 text-sm font-medium">
                  <AppleLogo className="w-4 h-4" /> {t("download.appStore")}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-gray-200 text-sm font-medium">
                  <GooglePlayLogo className="w-4 h-4" /> {t("download.googlePlay")}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-semibold">
                  {t("download.launchingSoon")}
                </span>
              </div>

              <NotifyForm />
            </div>
            
            <div className="hidden lg:flex items-center justify-center">
               <div className="relative w-full max-w-[280px] aspect-[9/19] rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-900 shadow-2xl overflow-hidden transform rotate-[-5deg]">
                <ScamCallScreen />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}