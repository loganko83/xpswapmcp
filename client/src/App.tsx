import { Switch, Route, Router } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Web3Provider } from "@/contexts/Web3Context";
import { WalletProvider } from "@/contexts/WalletContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader, NetworkStatus } from "@/components/LoadingSpinner";
import { ToastProvider, ToastStyles, useGlobalToast } from "@/components/Toast";
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
  // Toast 시스템 글로벌 이벤트 리스너 등록
  useGlobalToast();

  return (
    <Router base="/xpswap">
      <NetworkStatus />
      <Layout>
        <Suspense fallback={<PageLoader />}>
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="xpswap-ui-theme">
          <TooltipProvider>
            <ToastProvider>
              <ToastStyles />
              <Web3Provider>
                <WalletProvider>
                  <RouterComponent />
                  <Toaster />
                </WalletProvider>
              </Web3Provider>
            </ToastProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
