import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";

export default function Disclaimer() {
  return (
    <Layout>
      <SEOHead title="Disclaimer | Netraksh" description="Legal disclaimer for Netraksh users." />
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>
        <div className="prose prose-lg text-gray-600 max-w-none">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl mb-8">
            <p className="font-semibold text-xl text-gray-900 m-0">
              "Netraksh assists users in identifying potential cyber threats and scams. Users should independently verify critical decisions before sharing information, making payments, or taking legal action."
            </p>
          </div>
          <p className="mb-4">
            The information and alerts provided by the Netraksh application and website are based on artificial intelligence analysis, crowdsourced reports, and public threat intelligence databases. While we strive to provide accurate, real-time protection, no security system is completely foolproof.
          </p>
          <p className="mb-4">
            Netraksh does not guarantee the identification of every scam, nor does it take liability for any financial losses, data breaches, or damages resulting from missed threats or false positive alerts.
          </p>
          <p>
            Users are strongly advised to exercise caution, employ common sense, and consult with official authorities (such as the National Cyber Crime Reporting Portal at cybercrime.gov.in) when dealing with suspicious digital activities.
          </p>
        </div>
      </div>
    </Layout>
  );
}