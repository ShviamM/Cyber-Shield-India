import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield } from "lucide-react";
import { useRequestOtp, useVerifyOtp } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const phoneSchema = z.object({
  phone: z.string().min(10, "Valid phone number is required"),
});

const otpSchema = z.object({
  code: z.string().min(6, "Code must be 6 digits"),
  fullName: z.string().optional(),
  location: z.string().optional(),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "", fullName: "", location: "" },
  });

  const onPhoneSubmit = async (data: z.infer<typeof phoneSchema>) => {
    try {
      const res = await requestOtp.mutateAsync({ data: { phone: data.phone } });
      setPhone(data.phone);
      setIsNewUser(res.isNewUser);
      setDevOtp(res.devOtp ?? null);
      setStep("otp");
    } catch (err: any) {
      phoneForm.setError("phone", { message: err?.message || "Failed to send code" });
    }
  };

  const onOtpSubmit = async (data: z.infer<typeof otpSchema>) => {
    try {
      if (isNewUser && !data.fullName) {
        otpForm.setError("fullName", { message: "Full name is required for new accounts" });
        return;
      }
      
      const payload: any = { phone, code: data.code };
      if (isNewUser) {
        payload.fullName = data.fullName;
        payload.location = data.location;
      }

      const res = await verifyOtp.mutateAsync({ data: payload });
      login(res.token, res.user);
      setLocation("/");
    } catch (err: any) {
      otpForm.setError("code", { message: err?.message || "Invalid code" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">KavachAI Admin</h1>
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
                          <Input placeholder="Enter 10-digit number" {...field} disabled={requestOtp.isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={requestOtp.isPending}>
                    {requestOtp.isPending ? "Sending..." : "Continue"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                  {devOtp && (
                    <Alert className="bg-muted border-primary/20">
                      <AlertDescription className="font-mono text-center text-lg">
                        Dev code: {devOtp}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={otpForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" {...field} disabled={verifyOtp.isPending} maxLength={6} />
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
                              <Input placeholder="Your Name" {...field} disabled={verifyOtp.isPending} />
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
                              <Input placeholder="City, State" {...field} disabled={verifyOtp.isPending} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <Button type="submit" className="w-full" disabled={verifyOtp.isPending}>
                    {verifyOtp.isPending ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setStep("phone")}
                    disabled={verifyOtp.isPending}
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
