import { Switch, Route, Router } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Web3Provider } from "@/contexts/Web3Context";
import { Layout } from "@/components/Layout";

// Lazy load pages for code splitting
const HomePage = lazy(() => import("@/pages/home"));
const SwapPage = lazy(() => import("@/pages/swap"));
const TradingPage = lazy(() => import("@/pages/trading"));
const PoolPage = lazy(() => import("@/pages/pool"));
const FarmPage = lazy(() => import("@/pages/farm"));
const BridgePage = lazy(() => import("@/pages/bridge"));
const AtomicSwapPage = lazy(() => import("@/pages/atomic-swap"));
const GovernancePage = lazy(() => import("@/pages/governance"));
const AnalyticsPage = lazy(() => import("@/pages/analytics"));
const SecurityPage = lazy(() => import("@/pages/security"));
const DocumentationPage = lazy(() => import("@/pages/documentation"));
const PrivacyPolicyPage = lazy(() => import("@/pages/privacy-policy"));
const TermsOfServicePage = lazy(() => import("@/pages/terms-of-service"));
const BugBountyPage = lazy(() => import("@/pages/bug-bounty"));
const MultiChainPortfolioPage = lazy(() => import("@/pages/multichain-portfolio"));
const MintingPage = lazy(() => import("@/pages/minting"));
const XPSStakingPage = lazy(() => import("@/pages/xps-staking"));
const XPSPurchasePage = lazy(() => import("@/pages/xps-purchase"));
const OptionsPage = lazy(() => import("@/pages/options"));
const FuturesPage = lazy(() => import("@/pages/futures"));
const FlashLoansPage = lazy(() => import("@/pages/flashloans"));
const MemeCoinPage = lazy(() => import("@/pages/memecoin"));
const TestPage = lazy(() => import("@/pages/test"));
const NotFound = lazy(() => import("@/pages/not-found"));

function RouterComponent() {
  return (
    <Router base="/xpswap">
      <Layout>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-muted-foreground">페이지를 로딩하는 중...</p>
            </div>
          </div>
        }>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/swap" component={SwapPage} />
            <Route path="/trading" component={TradingPage} />
            <Route path="/pool" component={PoolPage} />
            <Route path="/farm" component={FarmPage} />
            <Route path="/bridge" component={BridgePage} />
            <Route path="/atomic-swap" component={AtomicSwapPage} />
            <Route path="/governance" component={GovernancePage} />
            <Route path="/analytics" component={AnalyticsPage} />
            <Route path="/security" component={SecurityPage} />
            <Route path="/documentation" component={DocumentationPage} />
            <Route path="/privacy-policy" component={PrivacyPolicyPage} />
            <Route path="/terms-of-service" component={TermsOfServicePage} />
            <Route path="/bug-bounty" component={BugBountyPage} />
            <Route path="/multichain-portfolio" component={MultiChainPortfolioPage} />
            <Route path="/minting" component={MintingPage} />
            <Route path="/memecoin" component={MemeCoinPage} />
            <Route path="/xps-staking" component={XPSStakingPage} />
            <Route path="/xps-purchase" component={XPSPurchasePage} />
            <Route path="/test" component={TestPage} />
            <Route path="/options" component={OptionsPage} />
            <Route path="/futures" component={FuturesPage} />
            <Route path="/flashloans" component={FlashLoansPage} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="xpswap-ui-theme">
        <TooltipProvider>
          <Web3Provider>
            <RouterComponent />
            <Toaster />
          </Web3Provider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
