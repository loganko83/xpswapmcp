import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Eye, EyeOff, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useQuery } from "@tanstack/react-query";
import { QuickShareButton } from "./SocialSharing";
import { WalletSelector } from "./WalletSelector";

// Import modularized components
import { PortfolioOverview } from "./portfolio/PortfolioOverview";
import { PortfolioPositions } from "./portfolio/PortfolioPositions";
import { PortfolioAnalytics } from "./portfolio/PortfolioAnalytics";
import { 
  PortfolioAsset, 
  PortfolioMetrics, 
  PortfolioPosition, 
  PortfolioHistory, 
  TimeframeType, 
  ViewType 
} from "./portfolio/PortfolioTypes";

export function PortfolioManager() {
  const { wallet } = useWeb3Context();
  const [timeframe, setTimeframe] = useState<TimeframeType>('7d');
  const [showPrivate, setShowPrivate] = useState(true);
  const [selectedView, setSelectedView] = useState<ViewType>('overview');
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);

  // Fetch portfolio data
  const { data: portfolioData, refetch: refetchPortfolio } = useQuery({
    queryKey: ["/api/portfolio/assets", wallet.address],
    queryFn: async () => {
      if (!wallet.address) return null;
      const response = await fetch(`/api/portfolio/assets/${wallet.address}`);
      if (!response.ok) throw new Error("Failed to fetch portfolio");
      return response.json();
    },
    enabled: !!wallet.address
  });

  // Fetch portfolio metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/portfolio/metrics", wallet.address],
    queryFn: async () => {
      if (!wallet.address) return null;
      const response = await fetch(`/api/portfolio/metrics/${wallet.address}`);
      if (!response.ok) throw new Error("Failed to fetch portfolio metrics");
      return response.json();
    },
    enabled: !!wallet.address
  });

  // Fetch portfolio positions
  const { data: positions = [] } = useQuery({
    queryKey: ["/api/portfolio/positions", wallet.address],
    queryFn: async () => {
      if (!wallet.address) return [];
      const response = await fetch(`/api/portfolio/positions/${wallet.address}`);
      if (!response.ok) throw new Error("Failed to fetch positions");
      return response.json();
    },
    enabled: !!wallet.address
  });

  // Fetch portfolio history
  const { data: history = [] } = useQuery({
    queryKey: ["/api/portfolio/history", wallet.address, timeframe],
    queryFn: async () => {
      if (!wallet.address) return [];
      const response = await fetch(`/api/portfolio/history/${wallet.address}?timeframe=${timeframe}`);
      if (!response.ok) throw new Error("Failed to fetch portfolio history");
      return response.json();
    },
    enabled: !!wallet.address
  });

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Wallet not connected state
  if (!wallet.isConnected) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-4">
            Connect your wallet to view your portfolio and manage your DeFi positions
          </p>
          <Button onClick={() => setIsWalletSelectorOpen(true)}>
            Connect Wallet
          </Button>
          <WalletSelector 
            open={isWalletSelectorOpen} 
            onOpenChange={setIsWalletSelectorOpen} 
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Manager</h2>
          <p className="text-muted-foreground">Track and optimize your DeFi investments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrivate(!showPrivate)}
          >
            {showPrivate ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {showPrivate ? 'Hide' : 'Show'} Values
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPortfolio()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Select value={timeframe} onValueChange={(value: TimeframeType) => setTimeframe(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="90d">90d</SelectItem>
            </SelectContent>
          </Select>
          <QuickShareButton />
        </div>
      </div>

      {/* Portfolio Tabs */}
      <Tabs value={selectedView} onValueChange={(value: ViewType) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PortfolioOverview
            metrics={metrics}
            assets={portfolioData?.assets || []}
            history={history}
            timeframe={timeframe}
            showPrivate={showPrivate}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            getChangeColor={getChangeColor}
            getChangeIcon={getChangeIcon}
          />
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <PortfolioPositions
            positions={positions}
            assets={portfolioData?.assets || []}
            showPrivate={showPrivate}
            formatCurrency={formatCurrency}
            getChangeColor={getChangeColor}
            getRiskColor={getRiskColor}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PortfolioAnalytics
            metrics={metrics}
            assets={portfolioData?.assets || []}
            history={history}
            timeframe={timeframe}
            showPrivate={showPrivate}
            formatCurrency={formatCurrency}
            getChangeColor={getChangeColor}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PortfolioAnalytics
            metrics={metrics}
            assets={portfolioData?.assets || []}
            history={history}
            timeframe={timeframe}
            showPrivate={showPrivate}
            formatCurrency={formatCurrency}
            getChangeColor={getChangeColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
