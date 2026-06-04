import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield } from "lucide-react";
import { useCheckPhone, useVerifyToken } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { isOtpConfigured, resendOtp, sendOtp, verifyOtp } from "@/lib/msg91";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const phoneSchema = z.object({
  phone: z.string().min(10, "Valid phone number is required"),
});

const otpSchema = z.object({
  code: z.string().min(4, "Code must be 4 digits"),
  fullName: z.string().optional(),
  location: z.string().optional(),
});

function toE164(phone: string): string {
  return `+91${phone.replace(/\D/g, "").slice(-10)}`;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const checkPhone = useCheckPhone();
  const verifyToken = useVerifyToken();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "", fullName: "", location: "" },
  });

  const onPhoneSubmit = async (data: z.infer<typeof phoneSchema>) => {
    if (!isOtpConfigured()) {
      phoneForm.setError("phone", { message: "OTP login is not configured." });
      return;
    }
    setSending(true);
    try {
      const res = await checkPhone.mutateAsync({ data: { phone: data.phone } });
      await sendOtp(toE164(data.phone));
      setPhone(data.phone);
      setIsNewUser(res.isNewUser);
      setStep("otp");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      phoneForm.setError("phone", {
        message: msg === "otp_unavailable"
          ? "OTP login is not available right now. Please try again shortly."
          : "Could not send the code. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const onResend = async () => {
    try {
      await resendOtp();
    } catch {
      otpForm.setError("code", { message: "Could not resend the code." });
    }
  };

  const onOtpSubmit = async (data: z.infer<typeof otpSchema>) => {
    if (isNewUser && !data.fullName) {
      otpForm.setError("fullName", { message: "Full name is required for new accounts" });
      return;
    }
    setVerifying(true);
    try {
      const accessToken = await verifyOtp(data.code);
      const res = await verifyToken.mutateAsync({
        data: {
          accessToken,
          fullName: isNewUser ? data.fullName : undefined,
          location: isNewUser && data.location ? data.location : undefined,
        },
      });
      login(res.token, res.user);
      setLocation("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      otpForm.setError("code", {
        message: msg === "otp_unavailable"
          ? "OTP verification is not available right now. Please try again shortly."
          : "Invalid or expired code.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const phoneBusy = sending || checkPhone.isPending;
  const otpBusy = verifying || verifyToken.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Netraksh Admin</h1>
          <p className="text-muted-foreground text-sm">Trust & Safety Console</p>
        </div>

        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle>{step === "phone" ? "Sign In" : "Verify Code"}</CardTitle>
            <CardDescription>
              {step === "phone"
                ? "Enter your mobile number to access the console."
                : `We sent a code to ${phone}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                  <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 10-digit number" {...field} disabled={phoneBusy} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={phoneBusy}>
                    {phoneBusy ? "Sending..." : "Continue"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                          <Input placeholder="1234" {...field} disabled={otpBusy} maxLength={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isNewUser && (
                    <>
                      <FormField
                        control={otpForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Name" {...field} disabled={otpBusy} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={otpForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State" {...field} disabled={otpBusy} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <Button type="submit" className="w-full" disabled={otpBusy}>
                    {otpBusy ? "Verifying..." : "Verify & Sign In"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={onResend}
                    disabled={otpBusy}
                  >
                    Resend code
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep("phone")}
                    disabled={otpBusy}
                  >
                    Back
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
