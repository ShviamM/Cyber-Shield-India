import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import BusinessMetrics from "@/pages/business-metrics";
import Users from "@/pages/users";
import FraudMap from "@/pages/fraud-map";
import Broadcasts from "@/pages/broadcasts";
import SuperAdmin from "@/pages/super-admin";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = `${import.meta.env.BASE_URL}login`;
    return null;
  }

  return <Component />;
}

function SuperAdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = `${import.meta.env.BASE_URL}login`;
    return null;
  }

  if (!user.isSuperAdmin) {
    return <NotFound />;
  }

  return <SuperAdmin />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/business" component={() => <ProtectedRoute component={BusinessMetrics} />} />
      <Route path="/users" component={() => <ProtectedRoute component={Users} />} />
      <Route path="/fraud-map" component={() => <ProtectedRoute component={FraudMap} />} />
      <Route path="/broadcasts" component={() => <ProtectedRoute component={Broadcasts} />} />
      <Route path="/super" component={() => <SuperAdminRoute />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
            <Toaster position="top-right" />
          </AuthProvider>
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
