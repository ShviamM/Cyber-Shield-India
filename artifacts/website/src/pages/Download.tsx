import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Shield, Apple, Smartphone, Bell, ArrowRight } from "lucide-react";
import { ScamCallScreen } from "@/components/ScamCallScreen";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

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
                  <Apple className="w-4 h-4" /> {t("download.appStore")}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-gray-200 text-sm font-medium">
                  <Smartphone className="w-4 h-4" /> {t("download.googlePlay")}
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