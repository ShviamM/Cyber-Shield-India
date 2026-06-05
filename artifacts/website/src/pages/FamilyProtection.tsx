import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";

export default function FamilyProtection() {
  return (
    <Layout>
      <SEOHead 
        title="Family Guardian | Protect Your Loved Ones" 
        description="Netraksh Family Guardian lets you monitor and block cyber threats targeting your parents, seniors, and children."
      />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Family Protection</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Because digital safety is a family responsibility. Set up alerts for your parents and stay informed when they encounter potential scams.</p>
        <div className="mt-12 max-w-4xl mx-auto rounded-3xl overflow-hidden border border-gray-200">
          <img src="/images/family-protection.png" alt="Family using Netraksh" className="w-full" />
        </div>
      </div>
    </Layout>
  );
}