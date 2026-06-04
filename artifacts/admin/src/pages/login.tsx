import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo, Wordmark, Tricolor } from "@/components/brand";

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const adminLogin = useAdminLogin();

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setSubmitting(true);
    try {
      const res = await adminLogin.mutateAsync({
        data: { password: data.password },
      });
      login(res.token, res.user);
      setLocation("/");
    } catch {
      form.setError("password", { message: "Incorrect password. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || adminLogin.isPending;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(160deg, #0A2A6B 0%, #0B3D91 50%, #06245C 100%)" }}
    >
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center gap-3">
          <BrandLogo size={72} className="bg-white/10" />
          <Wordmark className="text-3xl text-white" />
          <Tricolor className="w-16" />
          <p className="text-sm font-semibold mt-1" style={{ color: "#5AA9FF" }}>
            Trust &amp; Safety Console
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter the admin password to access the console.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Hidden username for accessibility / password managers (single shared admin account). */}
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value="admin"
                  readOnly
                  hidden
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
                          autoComplete="current-password"
                          {...field}
                          disabled={busy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-[#0B3D91] text-white hover:bg-[#0a357f]"
                  disabled={busy}
                >
                  {busy ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
