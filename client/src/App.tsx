import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import SwapPage from "@/pages/swap";
import PoolPage from "@/pages/pool";
import FarmPage from "@/pages/farm";
import BridgePage from "@/pages/bridge";
import GovernancePage from "@/pages/governance";
import AnalyticsPage from "@/pages/analytics";
import DocumentationPage from "@/pages/documentation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={SwapPage} />
        <Route path="/pool" component={PoolPage} />
        <Route path="/farm" component={FarmPage} />
        <Route path="/bridge" component={BridgePage} />
        <Route path="/governance" component={GovernancePage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/documentation" component={DocumentationPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="xpswap-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
