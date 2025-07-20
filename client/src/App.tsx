import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/home";
import SwapPage from "@/pages/swap";
import TradingPage from "@/pages/trading";
import PoolPage from "@/pages/pool";
import FarmPage from "@/pages/farm";
import BridgePage from "@/pages/bridge";
import GovernancePage from "@/pages/governance";
import AnalyticsPage from "@/pages/analytics";
import SecurityPage from "@/pages/security";
import DocumentationPage from "@/pages/documentation";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import TermsOfServicePage from "@/pages/terms-of-service";
import BugBountyPage from "@/pages/bug-bounty";
import MultiChainPortfolioPage from "@/pages/multichain-portfolio";
import MintingPage from "@/pages/minting";
import XPSStakingPage from "@/pages/xps-staking";
import XPSPurchasePage from "@/pages/xps-purchase";
import OptionsPage from "@/pages/options";
import FuturesPage from "@/pages/futures";
import FlashLoansPage from "@/pages/flashloans";
import NotFound from "@/pages/not-found";

function RouterComponent() {
  return (
    <Router base="/xpswap">
      <Layout>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/swap" component={SwapPage} />
          <Route path="/trading" component={TradingPage} />
          <Route path="/pool" component={PoolPage} />
          <Route path="/farm" component={FarmPage} />
          <Route path="/bridge" component={BridgePage} />
          <Route path="/governance" component={GovernancePage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/security" component={SecurityPage} />
          <Route path="/documentation" component={DocumentationPage} />
          <Route path="/privacy-policy" component={PrivacyPolicyPage} />
          <Route path="/terms-of-service" component={TermsOfServicePage} />
          <Route path="/bug-bounty" component={BugBountyPage} />
          <Route path="/multichain-portfolio" component={MultiChainPortfolioPage} />
          <Route path="/minting" component={MintingPage} />
          <Route path="/xps-staking" component={XPSStakingPage} />
          <Route path="/xps-purchase" component={XPSPurchasePage} />
          <Route path="/options" component={OptionsPage} />
          <Route path="/futures" component={FuturesPage} />
          <Route path="/flashloans" component={FlashLoansPage} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="xpswap-ui-theme">
        <TooltipProvider>
          <Toaster />
          <RouterComponent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
