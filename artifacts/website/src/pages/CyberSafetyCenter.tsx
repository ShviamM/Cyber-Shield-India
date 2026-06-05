import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "wouter";
import { useState } from "react";
import { scamArticles } from "@/data/scamArticles";
import {
  AlertTriangle,
  ShieldCheck,
  Smartphone,
  QrCode,
  MessageCircle,
  Banknote,
  TrendingUp,
  Briefcase,
  KeyRound,
  IdCard,
  ArrowRight,
  Phone,
} from "lucide-react";

const iconMap = {
  alert: AlertTriangle,
  upi: Smartphone,
  qr: QrCode,
  whatsapp: MessageCircle,
  loan: Banknote,
  invest: TrendingUp,
  job: Briefcase,
  otp: KeyRound,
  kyc: IdCard,
};

const categories = ["All", "Alert", "Guide", "Family", "Recovery"] as const;

export default function CyberSafetyCenter() {
  const [active, setActive] = useState<(typeof categories)[number]>("All");

  const filtered =
    active === "All"
      ? scamArticles
      : scamArticles.filter((a) => a.category === active);

  return (
    <Layout>
      <SEOHead
        title="Cyber Safety Center | Free Scam Awareness Guides"
        description="Learn how to spot and avoid India's most common scams: digital arrest, UPI fraud, QR fraud, WhatsApp scams, fake loan apps, OTP theft and more. Free, simple guides for every Indian."
        url="https://netraksh.com/cyber-safety-center"
      />
      <div className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-primary text-sm font-semibold mb-6">
              <ShieldCheck className="h-4 w-4" />
              Free Awareness Hub
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Cyber Safety Center
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Knowledge is your first line of defense. Simple, jargon free guides
              to the scams targeting Indian families today.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  active === cat
                    ? "bg-primary text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => {
              const Icon = iconMap[article.icon];
              return (
                <Link
                  key={article.slug}
                  href={`/cyber-safety-center/${article.slug}`}
                  className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 bg-blue-50 text-primary rounded-2xl">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-5 flex-1">{article.excerpt}</p>
                  <span className="text-primary font-medium inline-flex items-center gap-1.5">
                    Read guide
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-16 p-8 md:p-10 rounded-3xl bg-gray-900 text-white flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-accent/20 text-accent rounded-2xl">
                <Phone className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Been scammed? Act now.</h3>
                <p className="text-gray-300">
                  Call the National Cyber Crime Helpline 1930 or report online.
                </p>
              </div>
            </div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-gray-900 font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Report fraud
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
