import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone } from "lucide-react";

export default function Download() {
  return (
    <Layout>
      <SEOHead 
        title="Download Netraksh App | iOS & Android" 
        description="Download India's leading cyber safety app. Get real-time protection from scam calls, fake links, and UPI fraud on your smartphone."
      />
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="bg-gray-900 rounded-[3rem] overflow-hidden relative text-white shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-12 p-12 md:p-20 relative z-10">
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-6 w-fit">
                <Shield className="w-4 h-4" />
                Your Digital Bodyguard
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Get Netraksh for your smartphone.</h1>
              <p className="text-xl text-gray-400 mb-10">
                Join the growing community of Indians protecting their families and finances from digital fraud.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full bg-white hover:bg-gray-100 text-gray-900 font-bold h-16 px-8 text-lg w-full sm:w-auto flex gap-3">
                  <Smartphone className="w-6 h-6" />
                  App Store <span className="text-xs font-normal opacity-70 ml-1">(Coming Soon)</span>
                </Button>
                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-16 px-8 text-lg w-full sm:w-auto flex gap-3">
                  <Smartphone className="w-6 h-6" />
                  Google Play <span className="text-xs font-normal opacity-70 ml-1">(Coming Soon)</span>
                </Button>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center justify-center">
               <div className="relative w-full max-w-[280px] aspect-[9/19] rounded-[2.5rem] border-[6px] border-gray-800 bg-white shadow-2xl overflow-hidden transform rotate-[-5deg]">
                <img 
                  src="/images/hero-mockup.png" 
                  alt="Netraksh App Interface" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}