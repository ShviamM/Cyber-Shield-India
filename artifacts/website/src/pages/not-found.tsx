import { Link } from "wouter";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { PageHero, heroBtnGlow, heroBtnLight } from "@/components/layout/PageHero";
import { SEOHead } from "@/components/SEOHead";

export default function NotFound() {
  const { t } = useTranslation("misc");
  const { t: tc } = useTranslation("common");
  return (
    <Layout>
      <SEOHead title={`${t("notFound.title")} | Netraksh`} description={t("notFound.description")} />
      <PageHero badge="404" title={t("notFound.title")} subtitle={t("notFound.description")}>
        <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
          <Link href="/" className={heroBtnLight}>{t("notFound.home")}</Link>
          <Link href="/check" className={heroBtnGlow}>
            <Search className="h-5 w-5" />
            {tc("nav.checkScam")}
          </Link>
        </div>
      </PageHero>
    </Layout>
  );
}
