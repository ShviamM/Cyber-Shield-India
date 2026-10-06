import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";
import { SEOHead } from "@/components/SEOHead";
import { legalContent } from "@/data/legalContent";

export default function GenericLegalPage({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation("legal");
  const lang = i18n.language.startsWith("hi") ? "hi" : "en";
  const title = t(`pages.${slug}.title`);
  const description = t(`pages.${slug}.description`);
  const content = legalContent[lang][slug];
  return (
    <Layout>
      <SEOHead title={`${title} | Netraksh`} description={description} />
      <PageHero title={title} subtitle={description} glow={false} />
      <div className="container mx-auto px-4 py-14 max-w-4xl">
        <div className="prose prose-lg text-gray-600 max-w-none">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center">
              <p className="text-gray-500 mb-0">{t("fallback")}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
