import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Smartphone, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Login() {
  const [step, setStep] = useState<"phone" | "done">("phone");

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("done");
  };

  return (
    <Layout>
      <SEOHead 
        title="Login to User Portal | Netraksh" 
        description="Access your Netraksh digital safety dashboard. Your privacy and security are our priority."
      />
      <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <img
              src="/images/netraksh-logo.png"
              alt="Netraksh logo"
              className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover shadow-lg shadow-primary/20"
            />
            <span className="block font-bold text-xl tracking-tight text-gray-900 mb-4">
              Netra<span className="text-accent">ksh</span>
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Your privacy and security are our priority.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            {step === "done" ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Your protection lives in the app</h3>
                <p className="text-gray-600 mb-6">
                  The full Netraksh dashboard and real-time protection are part of the mobile app, launching soon. Get notified the moment it goes live.
                </p>
                <Link href="/download">
                  <Button className="w-full h-12 text-lg rounded-xl flex gap-2">
                    Get the app <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <div className="flex gap-2">
                    <div className="bg-gray-50 border border-input rounded-md px-3 flex items-center justify-center text-gray-500 font-medium">
                      +91
                    </div>
                    <Input id="phone" type="tel" placeholder="Enter your 10-digit number" required className="h-12 flex-1" pattern="[0-9]{10}" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Sign-in and one-time-code verification happen securely inside the Netraksh app.
                  </p>
                </div>
                <Button type="submit" className="w-full h-12 text-lg rounded-xl flex gap-2">
                  Continue <ArrowRight className="w-5 h-5" />
                </Button>
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">Don't have an account? <Link href="/download" className="text-primary font-medium hover:underline">Get the app</Link></p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}