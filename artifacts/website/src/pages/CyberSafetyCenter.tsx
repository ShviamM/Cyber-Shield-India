import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { BookOpen, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export default function CyberSafetyCenter() {
  const articles = [
    { title: "Understanding 'Digital Arrest' Scams", category: "Alert", icon: AlertTriangle },
    { title: "How to Spot a Fake UPI Payment Link", category: "Guide", icon: ShieldCheck },
    { title: "Protecting Seniors from Telecom Fraud", category: "Family", icon: HelpCircle },
    { title: "What to do if you've been scammed", category: "Recovery", icon: BookOpen },
  ];

  return (
    <Layout>
      <SEOHead 
        title="Cyber Safety Center | Free Educational Hub" 
        description="Learn about the latest digital scams in India, from UPI fraud to Digital Arrests, and discover how to protect yourself."
      />
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Cyber Safety Center</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Knowledge is your first line of defense. Stay updated on the latest threats targeting Indian citizens.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wider">{article.category}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h3>
                <Link href="#" className="text-primary font-medium hover:underline inline-flex items-center">
                  Read Article
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}