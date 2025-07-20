import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Target, AlertCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useQuery } from "@tanstack/react-query";
import { QuickShareButton } from "./SocialSharing";
import { WalletSelector } from "./WalletSelector";

interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
  price: number;
  change24h: number;
  allocation: number;
  staked?: string;
  rewards?: string;
  apy?: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent: number;
  totalStaked: number;
  totalRewards: number;
  portfolioAPY: number;
  riskScore: number;
  diversificationScore: number;
}

interface PortfolioPosition {
  type: 'liquidity' | 'staking' | 'farming' | 'wallet';
  pair?: string;
  token: string;
  amount: string;
  usdValue: number;
  apy?: number;
  rewards?: string;
  duration?: string;
  risk: 'low' | 'medium' | 'high';
}

interface PortfolioHistory {
  timestamp: number;
  totalValue: number;
  change: number;
}

export function PortfolioManager() {
  const { wallet } = useWeb3();
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [showPrivate, setShowPrivate] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'positions' | 'performance' | 'analytics'>('overview');
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

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

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
        <div className="flex gap-2">
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
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24H</SelectItem>
              <SelectItem value="7d">7D</SelectItem>
              <SelectItem value="30d">30D</SelectItem>
              <SelectItem value="90d">90D</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Value</span>
              <Wallet className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">
              {showPrivate ? formatCurrency(metrics?.totalValue || 0) : '••••••'}
            </div>
            <div className={`flex items-center gap-1 text-sm ${getChangeColor(metrics?.totalChangePercent || 0)}`}>
              {getChangeIcon(metrics?.totalChangePercent || 0)}
              {metrics?.totalChangePercent?.toFixed(2) || '0.00'}% (24h)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Staked Value</span>
              <Target className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">
              {showPrivate ? formatCurrency(metrics?.totalStaked || 0) : '••••••'}
            </div>
            <div className="text-sm text-muted-foreground">
              Portfolio APY: {metrics?.portfolioAPY?.toFixed(2) || '0.00'}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Rewards</span>
              <DollarSign className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">
              {showPrivate ? formatCurrency(metrics?.totalRewards || 0) : '••••••'}
            </div>
            <div className="text-sm text-green-600">
              +{formatCurrency(metrics?.totalRewards * 0.1 || 0)} this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
              <AlertCircle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{metrics?.riskScore || 0}/100</div>
            <div className="text-sm text-muted-foreground">
              Diversification: {metrics?.diversificationScore || 0}/100
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis tickFormatter={(value) => `$${formatNumber(value)}`} />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(value), 'Portfolio Value']}
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="totalValue" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioData?.assets || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="allocation"
                        label={(entry) => `${entry.symbol}: ${entry.allocation.toFixed(1)}%`}
                      >
                        {(portfolioData?.assets || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value.toFixed(2)}%`, 'Allocation']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Asset Holdings */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Asset</th>
                      <th className="text-right p-3">Balance</th>
                      <th className="text-right p-3">Price</th>
                      <th className="text-right p-3">24h Change</th>
                      <th className="text-right p-3">Value</th>
                      <th className="text-right p-3">Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(portfolioData?.assets || []).map((asset: PortfolioAsset, index: number) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              {asset.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{asset.symbol}</div>
                              <div className="text-xs text-muted-foreground">{asset.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right p-3">
                          {showPrivate ? parseFloat(asset.balance).toFixed(4) : '••••'}
                        </td>
                        <td className="text-right p-3">${asset.price.toFixed(4)}</td>
                        <td className={`text-right p-3 ${getChangeColor(asset.change24h)}`}>
                          {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </td>
                        <td className="text-right p-3">
                          {showPrivate ? formatCurrency(asset.usdValue) : '••••••'}
                        </td>
                        <td className="text-right p-3">{asset.allocation.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position: PortfolioPosition, index: number) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={getRiskColor(position.risk)}>
                          {position.type}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {position.pair || position.token}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {position.amount} • Risk: {position.risk}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {showPrivate ? formatCurrency(position.usdValue) : '••••••'}
                        </div>
                        {position.apy && (
                          <div className="text-sm text-green-600">
                            {position.apy.toFixed(2)}% APY
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {position.rewards && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Pending Rewards</span>
                        <span className="text-sm font-medium text-green-600">
                          {showPrivate ? position.rewards : '••••'}
                        </span>
                      </div>
                    )}
                    
                    {position.duration && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-muted-foreground">Duration</span>
                        <span className="text-sm">{position.duration}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Return</span>
                  <span className={`font-medium ${getChangeColor(metrics?.totalChangePercent || 0)}`}>
                    {metrics?.totalChangePercent?.toFixed(2) || '0.00'}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Best Performing Asset</span>
                  <span className="font-medium text-green-600">XP (+23.5%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Worst Performing Asset</span>
                  <span className="font-medium text-red-600">BTC (-2.1%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                  <span className="font-medium">1.85</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Portfolio Risk</span>
                    <span className="text-sm">{metrics?.riskScore || 0}/100</span>
                  </div>
                  <Progress value={metrics?.riskScore || 0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Diversification</span>
                    <span className="text-sm">{metrics?.diversificationScore || 0}/100</span>
                  </div>
                  <Progress value={metrics?.diversificationScore || 0} className="h-2" />
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Value at Risk (95%)</span>
                    <span>{showPrivate ? '$2,450' : '••••'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Maximum Drawdown</span>
                    <span>-8.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toFixed(2)}%`, 'Change']}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="change" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">Optimization Opportunity</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Consider rebalancing to increase XP allocation by 5% for better risk-adjusted returns.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-300">Performance Alert</div>
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Your portfolio is outperforming the market by 12.3% this month.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-700 dark:text-yellow-300">Risk Warning</div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                        High concentration in DeFi tokens. Consider diversifying into stable assets.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Rebalance Portfolio
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Claim All Rewards
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Optimize Yield
                </Button>
                <QuickShareButton
                  insight={{
                    id: 'portfolio-performance',
                    type: 'analysis',
                    title: 'Portfolio Performance Update',
                    description: `Portfolio value: ${showPrivate ? formatCurrency(metrics?.totalValue || 0) : 'Hidden'}, 24h change: ${metrics?.totalChangePercent?.toFixed(2) || '0.00'}%`,
                    data: {
                      change: metrics?.totalChangePercent?.toFixed(2) || '0.00'
                    },
                    timestamp: Date.now()
                  }}
                  variant="outline"
                  size="lg"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Wallet Selector */}
      <WalletSelector
        isOpen={isWalletSelectorOpen}
        onClose={() => setIsWalletSelectorOpen(false)}
      />
    </div>
  );
}