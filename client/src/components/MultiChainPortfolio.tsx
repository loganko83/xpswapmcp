import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Zap,
  Eye,
  Copy,
  ExternalLink,
  RefreshCw,
  Filter,
  Globe
} from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { WalletSelector } from "./WalletSelector";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getTokenIcon } from "@/lib/tokenUtils";
import { getApiUrl } from "@/lib/apiUrl";

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
}

function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps) {
  const networks = [
    { id: 'all', name: 'All Networks', logo: '🌐' },
    { id: 'ethereum', name: 'Ethereum', logo: '⟠' },
    { id: 'bsc', name: 'BSC', logo: '🟡' },
    { id: 'polygon', name: 'Polygon', logo: '🟣' },
    { id: 'arbitrum', name: 'Arbitrum', logo: '🔵' },
    { id: 'optimism', name: 'Optimism', logo: '🔴' },
    { id: 'xphere', name: 'Xphere', logo: '⚡' }
  ];

  return (
    <Select value={selectedNetwork} onValueChange={onNetworkChange}>
      <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white border-gray-200">
        {networks.map((network) => (
          <SelectItem key={network.id} value={network.id} className="hover:bg-gray-50">
            <div className="flex items-center space-x-2">
              <span>{network.logo}</span>
              <span>{network.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface Token {
  symbol: string;
  name: string;
  balance: string;
  value: number;
  change24h: number;
  network: string;
  contractAddress?: string;
}

interface PortfolioData {
  totalValue: number;
  totalChange24h: number;
  tokens: Token[];
  networks: {
    [key: string]: {
      value: number;
      percentage: number;
    };
  };
  stakingRewards: {
    earned: number;
    pending: number;
    apr: number;
  };
}

interface TransactionHistory {
  id: string;
  type: 'swap' | 'liquidity' | 'stake' | 'bridge';
  timestamp: number;
  amount: string;
  token: string;
  status: 'completed' | 'pending' | 'failed';
  hash: string;
  network: string;
}

export function MultiChainPortfolio() {
  const [selectedNetwork, setSelectedNetwork] = useState("all");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showTransactions, setShowTransactions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  
  const { wallet, isConnected } = useWeb3Context();
  const { toast } = useToast();
  const { prices, loading: pricesLoading } = useTokenPrices();

  // Fetch portfolio data from API
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery({
    queryKey: ["/api/portfolio/multichain", wallet.address],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/portfolio/multichain/${wallet.address}`));
      if (!response.ok) throw new Error("Failed to fetch portfolio data");
      return response.json();
    },
    enabled: !!wallet.address,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch transaction history
  const { data: transactionHistory } = useQuery({
    queryKey: ["/api/portfolio/transactions", wallet.address],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/portfolio/transactions/${wallet.address}?limit=10`));
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
    enabled: !!wallet.address,
    refetchInterval: 20000,
  });

  // Fetch portfolio analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/portfolio/analytics", wallet.address, selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/portfolio/analytics/${wallet.address}?timeframe=${selectedTimeframe}`));
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    enabled: !!wallet.address && selectedTab === "analytics",
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
    toast({
      title: "Portfolio Updated",
      description: "Your portfolio data has been refreshed successfully.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'swap': return <RefreshCw className="h-4 w-4" />;
      case 'liquidity': return <PieChart className="h-4 w-4" />;
      case 'stake': return <Zap className="h-4 w-4" />;
      case 'bridge': return <Globe className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to view your multi-chain portfolio and transaction history.
            </p>
            <WalletSelector />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PieChart className="mr-3 h-8 w-8 text-blue-600" />
                Multi-Chain Portfolio
              </h1>
              <p className="text-gray-600 mt-1">Track your assets across all networks</p>
            </div>
            <div className="flex items-center space-x-4">
              <NetworkSelector 
                selectedNetwork={selectedNetwork}
                onNetworkChange={setSelectedNetwork}
              />
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${portfolioData.totalValue.toLocaleString()}
              </div>
              <div className={`flex items-center text-sm ${
                portfolioData.totalChange24h > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {portfolioData.totalChange24h > 0 ? 
                  <TrendingUp className="h-4 w-4 mr-1" /> : 
                  <TrendingDown className="h-4 w-4 mr-1" />
                }
                {portfolioData.totalChange24h > 0 ? '+' : ''}{portfolioData.totalChange24h}% (24h)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-600" />
                Staking Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                ${portfolioData.stakingRewards.earned.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                ${portfolioData.stakingRewards.pending.toFixed(2)} pending
              </div>
              <div className="text-sm text-purple-600 font-medium">
                {portfolioData.stakingRewards.apr}% APR
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Active Networks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-3">
                {Object.keys(portfolioData.networks).length}
              </div>
              <div className="space-y-2">
                {Object.entries(portfolioData.networks).map(([network, data]) => (
                  <div key={network} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{network}</span>
                    <span className="font-medium text-gray-900">{data.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
              <TabsTrigger value="tokens" className="data-[state=active]:bg-white">Tokens</TabsTrigger>
              <TabsTrigger value="networks" className="data-[state=active]:bg-white">Networks</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Portfolio Allocation */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
                  <div className="space-y-4">
                    {portfolioData.tokens.map((token, index) => {
                      const percentage = (token.value / portfolioData.totalValue) * 100;
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {token.symbol.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{token.symbol}</div>
                              <div className="text-sm text-gray-600">{token.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{percentage.toFixed(1)}%</div>
                            <div className="text-sm text-gray-600">${token.value.toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Network Distribution */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Distribution</h3>
                  <div className="space-y-4">
                    {Object.entries(portfolioData.networks).map(([network, data]) => (
                      <div key={network}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">{network}</span>
                          <span className="text-sm text-gray-600">{data.percentage}%</span>
                        </div>
                        <Progress value={data.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tokens" className="mt-6">
              <div className="space-y-4">
                {portfolioData.tokens.map((token, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{token.symbol}</div>
                          <div className="text-sm text-gray-600">{token.name}</div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {token.network}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{token.balance}</div>
                        <div className="text-lg font-bold text-gray-900">${token.value.toLocaleString()}</div>
                        <div className={`text-sm flex items-center justify-end ${
                          token.change24h > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {token.change24h > 0 ? 
                            <TrendingUp className="h-3 w-3 mr-1" /> : 
                            <TrendingDown className="h-3 w-3 mr-1" />
                          }
                          {token.change24h > 0 ? '+' : ''}{token.change24h}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="networks" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(portfolioData.networks).map(([network, data]) => (
                  <Card key={network} className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900 capitalize flex items-center">
                        <Globe className="h-5 w-5 mr-2 text-blue-600" />
                        {network}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        ${data.value.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {data.percentage}% of portfolio
                      </div>
                      <Progress value={data.percentage} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="space-y-4">
                {(transactionHistory?.data || transactionHistory || []).map((tx) => (
                  <div key={tx.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTypeIcon(tx.type)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 capitalize">{tx.type}</div>
                          <div className="text-sm text-gray-600">{tx.token}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{tx.amount}</div>
                        <Badge className={`${getStatusColor(tx.status)} border`}>
                          {tx.status}
                        </Badge>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(tx.hash)}
                            className="text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}