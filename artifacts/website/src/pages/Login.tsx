import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("This is a presentational marketing site. User dashboard coming soon!");
    }, 1000);
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
            <div className="bg-primary w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Your privacy and security are our priority.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            {step === "phone" ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <div className="flex gap-2">
                    <div className="bg-gray-50 border border-input rounded-md px-3 flex items-center justify-center text-gray-500 font-medium">
                      +91
                    </div>
                    <Input id="phone" type="tel" placeholder="Enter your 10-digit number" required className="h-12 flex-1" pattern="[0-9]{10}" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-lg rounded-xl" disabled={loading}>
                  {loading ? "Sending OTP..." : "Get OTP"}
                </Button>
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">Don't have an account? <a href="#" className="text-primary font-medium hover:underline">Create one</a></p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input id="otp" type="text" placeholder="6-digit code" required className="h-12 text-center text-xl tracking-[0.5em]" maxLength={6} pattern="[0-9]{6}" />
                  <p className="text-sm text-gray-500 text-center mt-2">Code sent to your mobile number</p>
                </div>
                <Button type="submit" className="w-full h-12 text-lg rounded-xl" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setStep("phone")} className="text-sm text-gray-500 hover:text-primary font-medium">
                    Change mobile number
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}