import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { checkPhone, verifyToken } from "@workspace/api-client-react";
import {
  sendOtp,
  verifyOtp,
  retryOtp,
  prepareOtpWidget,
  isCaptchaVerified,
} from "@/lib/msg91";
import { Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const CAPTCHA_CONTAINER_ID = "msg91-captcha";

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  if (last10.length !== 10) return null;
  return last10;
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function nextPath(): string {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (next && next.startsWith("/")) return next;
  return "/account";
}

export default function Login() {
  const { setSession } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);

  // Initialize the OTP widget once the captcha container is in the DOM so the
  // captcha can render before the user requests a code. Only enable "Send code"
  // once it resolves, so we never call sendOtp before the captcha is rendered.
  useEffect(() => {
    prepareOtpWidget(CAPTCHA_CONTAINER_ID)
      .then(() => setWidgetReady(true))
      .catch(() => {
        /* surfaced when the user tries to send a code */
      });
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const local = normalizePhone(phone);
    if (!local) {
      toast({
        title: "Invalid number",
        description: "Enter a valid 10-digit Indian mobile number.",
        variant: "destructive",
      });
      return;
    }

    if (!isCaptchaVerified()) {
      toast({
        title: "Complete the captcha",
        description: "Please tick the captcha box to confirm you're human.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { isNewUser: newUser } = await checkPhone({ phone: local });
      await sendOtp(`91${local}`);
      setIsNewUser(newUser);
      setStep("otp");
      toast({
        title: "Code sent",
        description: `We sent a one-time code to +91 ${local}.`,
      });
    } catch (error) {
      toast({
        title: "Could not send the code",
        description: errorMessage(error, "Please try again in a moment."),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length < 4) {
      toast({
        title: "Enter the code",
        description: "Please enter the code we sent to your phone.",
        variant: "destructive",
      });
      return;
    }
    if (isNewUser && !fullName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name to create your account.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const accessToken = await verifyOtp(otp.trim());
      const { token, user } = await verifyToken({
        accessToken,
        fullName: isNewUser ? fullName.trim() : undefined,
      });
      setSession(token, user);
      toast({
        title: "Signed in",
        description: `Welcome${user.fullName ? `, ${user.fullName}` : ""}!`,
      });
      setLocation(nextPath());
    } catch (error) {
      toast({
        title: "Verification failed",
        description: errorMessage(error, "Please check the code and try again."),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await retryOtp();
      toast({ title: "Code resent", description: "We sent you a new code." });
    } catch (error) {
      toast({
        title: "Could not resend",
        description: errorMessage(error, "Please try again in a moment."),
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Sign in | Netraksh"
        description="Sign in to manage your Netraksh subscription. Your privacy and security are our priority."
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === "phone" ? "Welcome" : "Verify your number"}
            </h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Your privacy and security are our priority.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className={step === "phone" ? "" : "hidden"}>
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <div className="flex gap-2">
                    <div className="bg-gray-50 border border-input rounded-md px-3 flex items-center justify-center text-gray-500 font-medium">
                      +91
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter your 10-digit number"
                      required
                      className="h-12 flex-1"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    We'll text you a one-time code to confirm it's you. Use the same
                    number as your Netraksh app to unlock your plan there.
                  </p>
                </div>
                <div
                  id={CAPTCHA_CONTAINER_ID}
                  className="flex justify-center [&:empty]:hidden"
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-lg rounded-xl flex gap-2"
                  disabled={submitting || !widgetReady}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send code <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
            {step === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {isNewUser && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your full name"
                      required
                      className="h-12"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="otp">One-time code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter the code"
                    required
                    className="h-12 tracking-[0.4em] text-center text-lg"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={submitting}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      className="text-sm text-gray-500 hover:text-primary"
                      onClick={() => {
                        setStep("phone");
                        setOtp("");
                      }}
                      disabled={submitting}
                    >
                      Change number
                    </button>
                    <button
                      type="button"
                      className="text-sm text-primary font-medium hover:underline"
                      onClick={handleResend}
                      disabled={submitting}
                    >
                      Resend code
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-lg rounded-xl flex gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" /> Verify & continue
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
