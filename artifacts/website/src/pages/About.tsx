import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ShieldCheck, Target, Heart } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <SEOHead 
        title="About Us | Netraksh Mission" 
        description="Learn about Netraksh's mission to protect every Indian from cyber fraud and build the nation's most trusted digital safety platform."
      />
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Our Mission</h1>
          <p className="text-2xl font-medium text-primary max-w-3xl mx-auto leading-relaxed">
            To protect every Indian from cyber fraud and build the nation's most trusted digital safety platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">Why Netraksh Exists</h2>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              India is digitizing at an unprecedented scale. With the rise of UPI and cheap internet access, everyday citizens have been empowered, but they have also been exposed.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Cyber criminals are using increasingly sophisticated social engineering, from "Digital Arrests" targeting seniors to fake job offers targeting the youth. We built Netraksh because traditional caller IDs aren't enough anymore. India needs a dedicated digital bodyguard.
            </p>
          </div>
          <div className="bg-gray-50 rounded-[2rem] p-10 border border-gray-100">
            <div className="flex gap-4 mb-8 items-start">
              <Target className="h-8 w-8 text-orange-500 shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Our Vision</h3>
                <p className="text-gray-600">A secure digital India where no citizen loses their savings to a scam.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <Heart className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Family First</h3>
                <p className="text-gray-600">Technology should protect our most vulnerable. Our features prioritize senior and family safety.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}