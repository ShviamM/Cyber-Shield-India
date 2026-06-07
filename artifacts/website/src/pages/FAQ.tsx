import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      q: "What is Netraksh?",
      a: "Netraksh is India's Digital Bodyguard, a comprehensive digital safety platform designed to protect citizens from scam calls, fraudulent SMS, malicious links, and UPI fraud using advanced AI threat detection."
    },
    {
      q: "How is Netraksh different from caller ID apps?",
      a: "While caller ID apps rely primarily on crowdsourced phone books to show you who is calling, Netraksh is a dedicated security tool. We use threat intelligence and behavioral AI to detect sophisticated scams, including WhatsApp fraud, QR code traps, and malicious URLs, moving beyond just names to provide real-time protection."
    },
    {
      q: "How does scam detection work?",
      a: "Our app runs quietly in the background. When you receive a call, message, or tap a link, our local and cloud AI engines instantly cross-reference the data against millions of known fraud patterns and our national threat database to alert you before you take action."
    },
    {
      q: "Does Netraksh monitor WhatsApp?",
      a: "Netraksh can safely scan links and numbers shared with you without reading your personal conversations. Your privacy is paramount, and our detection works without compromising end-to-end encryption."
    },
    {
      q: "Can Netraksh protect my family?",
      a: "Yes. Our 'Family Guardian' feature allows you to link accounts with elderly parents or vulnerable family members. You'll receive real-time alerts if they are targeted by a known scammer, allowing you to intervene quickly."
    },
    {
      q: "What should I do if I lose money to cyber fraud?",
      a: "Immediately dial 1930 (National Cyber Crime Helpline) to freeze the transaction, then file an official report at cybercrime.gov.in. Afterwards, you can report the scammer's details on the Netraksh app to help protect others."
    },
    {
      q: "Is it free?",
      a: "Netraksh offers a robust free tier to ensure every Indian has basic digital protection. Premium features, including advanced Family Guardian tools and priority AI scanning, are available via subscription."
    }
  ];

  return (
    <Layout>
      <SEOHead 
        title="Frequently Asked Questions | Netraksh" 
        description="Find answers to common questions about Netraksh, scam detection, family protection, and cyber safety in India."
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
      <div className="container mx-auto px-4 pt-10 pb-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Everything you need to know about Netraksh and digital safety.</p>
        </div>

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