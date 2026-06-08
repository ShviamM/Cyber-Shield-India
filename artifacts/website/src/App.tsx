import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/use-auth";

// Main Pages
import Home from "@/pages/Home";
import Features from "@/pages/Features";
import FamilyProtection from "@/pages/FamilyProtection";
import CyberSafetyCenter from "@/pages/CyberSafetyCenter";
import ScamArticle from "@/pages/ScamArticle";
import CyberLaws from "@/pages/CyberLaws";
import About from "@/pages/About";
import Founder from "@/pages/Founder";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Download from "@/pages/Download";
import Login from "@/pages/Login";
import Pricing from "@/pages/Pricing";
import Account from "@/pages/Account";
import NotFound from "@/pages/not-found";

// Legal Pages
import Disclaimer from "@/pages/Disclaimer";
import GenericLegalPage from "@/pages/GenericLegalPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/features" component={Features} />
      <Route path="/family-protection" component={FamilyProtection} />
      <Route path="/cyber-safety-center" component={CyberSafetyCenter} />
      <Route path="/cyber-safety-center/:slug" component={ScamArticle} />
      <Route path="/cyber-laws" component={CyberLaws} />
      <Route path="/about" component={About} />
      <Route path="/founder" component={Founder} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/download" component={Download} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/login" component={Login} />
      <Route path="/account" component={Account} />
      <Route path="/disclaimer" component={Disclaimer} />

      {/* Legal & Trust Pages */}
      <Route path="/privacy-policy">
        {() => <GenericLegalPage slug="privacy-policy" />}
      </Route>
      <Route path="/terms-of-service">
        {() => <GenericLegalPage slug="terms-of-service" />}
      </Route>
      <Route path="/cookie-policy">
        {() => <GenericLegalPage slug="cookie-policy" />}
      </Route>
      <Route path="/responsible-disclosure">
        {() => <GenericLegalPage slug="responsible-disclosure" />}
      </Route>
      <Route path="/data-retention-policy">
        {() => <GenericLegalPage slug="data-retention-policy" />}
      </Route>
      <Route path="/acceptable-use">
        {() => <GenericLegalPage slug="acceptable-use" />}
      </Route>
      <Route path="/security">
        {() => <GenericLegalPage slug="security" />}
      </Route>
      <Route path="/compliance">
        {() => <GenericLegalPage slug="compliance" />}
      </Route>

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
            <ScrollToTop />
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
