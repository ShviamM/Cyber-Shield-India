import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";
import { SEOHead } from "@/components/SEOHead";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

export default function FAQ() {
  const { t } = useTranslation("misc");
  const faqs = t("faq.items", { returnObjects: true }) as Array<{
    q: string;
    a: string;
  }>;

  return (
    <Layout>
      <SEOHead 
        title={t("faq.seoTitle")} 
        description={t("faq.seoDescription")}
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.a
            }
          }))
        }}
      />
      <PageHero title={t("faq.heading")} subtitle={t("faq.subheading")} />
      <div className="container mx-auto px-4 pt-12 pb-16 max-w-4xl">

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 py-6">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base leading-relaxed pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Layout>
  );
}