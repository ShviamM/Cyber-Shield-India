import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Main Pages
import Home from "@/pages/Home";
import Features from "@/pages/Features";
import FamilyProtection from "@/pages/FamilyProtection";
import CyberSafetyCenter from "@/pages/CyberSafetyCenter";
import CyberLaws from "@/pages/CyberLaws";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Download from "@/pages/Download";
import Login from "@/pages/Login";
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
      <Route path="/cyber-laws" component={CyberLaws} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/download" component={Download} />
      <Route path="/login" component={Login} />
      <Route path="/disclaimer" component={Disclaimer} />
      
      {/* Generated Generic Legal & Other Pages */}
      <Route path="/privacy-policy">
        {() => <GenericLegalPage title="Privacy Policy" description="Netraksh Privacy Policy" />}
      </Route>
      <Route path="/terms-of-service">
        {() => <GenericLegalPage title="Terms of Service" description="Netraksh Terms of Service" />}
      </Route>
      <Route path="/cookie-policy">
        {() => <GenericLegalPage title="Cookie Policy" description="Netraksh Cookie Policy" />}
      </Route>
      <Route path="/responsible-disclosure">
        {() => <GenericLegalPage title="Responsible Disclosure Policy" description="Report security vulnerabilities responsibly." />}
      </Route>
      <Route path="/data-retention-policy">
        {() => <GenericLegalPage title="Data Retention Policy" description="How we handle your data." />}
      </Route>
      <Route path="/acceptable-use">
        {() => <GenericLegalPage title="Acceptable Use Policy" description="Netraksh Acceptable Use Policy" />}
      </Route>
      <Route path="/security">
        {() => <GenericLegalPage title="Security at Netraksh" description="How we secure the platform." />}
      </Route>
      <Route path="/compliance">
        {() => <GenericLegalPage title="Compliance & Trust" description="DPDP Act and compliance info." />}
      </Route>
      <Route path="/pricing">
        {() => <GenericLegalPage title="Pricing" description="Netraksh Pricing options." />}
      </Route>
      <Route path="/careers">
        {() => <GenericLegalPage title="Careers" description="Join the Netraksh team." />}
      </Route>
      <Route path="/media-kit">
        {() => <GenericLegalPage title="Media Kit" description="Press and media resources." />}
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
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;