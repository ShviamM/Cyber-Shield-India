import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Shield, Bell, ArrowRight } from "lucide-react";
import { ScamCallScreen } from "@/components/ScamCallScreen";
import { Link } from "wouter";
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

export default function Download() {
  const { t } = useTranslation("misc");
  return (
    <Layout>
      <SEOHead 
        title={t("download.seoTitle")} 
        description={t("download.seoDescription")}
      />
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="bg-gray-900 rounded-[3rem] overflow-hidden relative text-white shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-12 p-12 md:p-20 relative z-10">
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-6 w-fit">
                <Shield className="w-4 h-4" />
                {t("download.badge")}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{t("download.heading")}</h1>
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

              <Link href="/contact">
                <Button size="lg" className="rounded-full bg-accent hover:bg-accent/90 text-gray-900 font-bold h-16 px-8 text-lg w-full sm:w-auto flex gap-3">
                  <Bell className="w-6 h-6" />
                  {t("download.notifyMe")}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
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