import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Scale, PhoneCall, FileText } from "lucide-react";

export default function CyberLaws() {
  return (
    <Layout>
      <SEOHead 
        title="Cyber Laws & SOPs | Netraksh" 
        description="Understand India's cyber laws, reporting SOPs, and how to contact the National Cyber Crime Reporting Portal."
      />
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Cyber Laws & SOPs</h1>
          <p className="text-xl text-gray-600">A citizen's guide to reporting digital fraud and understanding your rights.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white border border-gray-200 p-8 rounded-3xl text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
              <PhoneCall className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Dial 1930</h3>
            <p className="text-gray-600">National Cyber Crime Helpline for immediate assistance.</p>
          </div>
          <div className="bg-white border border-gray-200 p-8 rounded-3xl text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <Scale className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">IT Act 2000</h3>
            <p className="text-gray-600">Understand the legal framework protecting digital citizens.</p>
          </div>
          <div className="bg-white border border-gray-200 p-8 rounded-3xl text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Cybercrime.gov.in</h3>
            <p className="text-gray-600">The official portal to register a complaint online.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
          <h2 className="text-3xl font-bold mb-6">Standard Operating Procedure (SOP) if Scammed</h2>
          <ol className="list-decimal list-inside space-y-4 text-lg text-gray-700 font-medium">
            <li>Immediately call 1930 to freeze fraudulent transactions.</li>
            <li>Do not delete any evidence (messages, screenshots, transaction IDs).</li>
            <li>Report the incident on the official national portal.</li>
            <li>Notify your bank and block compromised cards/UPI IDs.</li>
            <li>Report the scammer's details on Netraksh to protect others.</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}