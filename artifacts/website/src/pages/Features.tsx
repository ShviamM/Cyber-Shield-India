import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";

export default function Features() {
  return (
    <Layout>
      <SEOHead 
        title="Features | Powerful Cyber Protection" 
        description="Explore how Netraksh protects you from scam calls, fraud SMS, fake URLs, and UPI fraud using advanced AI threat detection."
      />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Advanced Protection, Simplified.</h1>
          <p className="text-xl text-gray-600">Enterprise-grade security technology wrapped in an interface your parents can use.</p>
        </div>
        
        {/* Placeholder for full features list */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {[
            { title: "Scam Call Protection", desc: "Identify and block malicious callers automatically." },
            { title: "SMS Fraud Detection", desc: "Filter out phishing links and fake lottery messages." },
            { title: "WhatsApp Scanner", desc: "Analyze suspicious forwards safely." },
            { title: "QR Code Safety", desc: "Verify payment QR codes before scanning." },
            { title: "AI Threat Engine", desc: "Real-time analysis of new scam patterns." },
            { title: "Family Guardian", desc: "Link accounts to protect vulnerable loved ones." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-gray-50 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}