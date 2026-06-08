import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";

export default function Disclaimer() {
  const { t } = useTranslation("legal");
  return (
    <Layout>
      <SEOHead
        title={`${t("pages.disclaimer.title")} | Netraksh`}
        description={t("pages.disclaimer.description")}
      />
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{t("pages.disclaimer.title")}</h1>
        <div className="prose prose-lg text-gray-600 max-w-none">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl mb-8">
            <p className="font-semibold text-xl text-gray-900 m-0">
              {t("disclaimer.quote")}
            </p>
          </div>
          <p className="mb-4">{t("disclaimer.p1")}</p>
          <p className="mb-4">{t("disclaimer.p2")}</p>
          <p>{t("disclaimer.p3")}</p>
        </div>
      </div>
    </Layout>
  );
}
