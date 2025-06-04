import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Zap, Target, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTokenPrices } from "@/hooks/useTokenPrices";

interface TradingMetrics {
  totalVolume: string;
  volume24h: string;
  volumeChange: string;
  totalTrades: number;
  trades24h: number;
  averageTradeSize: string;
  totalFees: string;
  fees24h: string;
  uniqueTraders: number;
  activeTraders24h: number;
}

interface VolumeData {
  timestamp: number;
  volume: number;
  trades: number;
  fees: number;
}

interface TokenAnalytics {
  symbol: string;
  name: string;
  price: number;
  volume24h: number;
  volumeChange: number;
  marketCap: number;
  holders: number;
  transactions24h: number;
  liquidityUSD: number;
  priceChange24h: number;
}

interface PairAnalytics {
  pairAddress: string;
  tokenA: string;
  tokenB: string;
  volume24h: number;
  volumeChange: number;
  liquidity: number;
  liquidityChange: number;
  fees24h: number;
  apr: number;
  trades24h: number;
}

export function AdvancedAnalytics() {
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'trades' | 'fees' | 'liquidity'>('volume');
  
  const { data: tokenPrices } = useTokenPrices(["XP", "BTC", "ETH", "USDT"]);

  // Fetch trading metrics
  const { data: metrics } = useQuery({
    queryKey: ["/api/analytics/metrics", timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/metrics?timeframe=${timeframe}`);
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    }
  });

  // Fetch volume data for charts
  const { data: volumeData = [] } = useQuery({
    queryKey: ["/api/analytics/volume", timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/volume?timeframe=${timeframe}`);
      if (!response.ok) throw new Error("Failed to fetch volume data");
      return response.json();
    }
  });

  // Fetch token analytics
  const { data: tokenAnalytics = [] } = useQuery({
    queryKey: ["/api/analytics/tokens"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/tokens");
      if (!response.ok) throw new Error("Failed to fetch token analytics");
      return response.json();
    }
  });

  // Fetch pair analytics
  const { data: pairAnalytics = [] } = useQuery({
    queryKey: ["/api/analytics/pairs"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/pairs");
      if (!response.ok) throw new Error("Failed to fetch pair analytics");
      return response.json();
    }
  });

  // Risk metrics
  const { data: riskMetrics } = useQuery({
    queryKey: ["/api/analytics/risk"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/risk");
      if (!response.ok) throw new Error("Failed to fetch risk metrics");
      return response.json();
    }
  });

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
    return n.toFixed(2);
  };

  const formatCurrency = (amount: number | string) => {
    const n = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${formatNumber(n)}`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const pieChartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive trading and liquidity analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1H</SelectItem>
              <SelectItem value="24h">24H</SelectItem>
              <SelectItem value="7d">7D</SelectItem>
              <SelectItem value="30d">30D</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Volume</span>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.totalVolume || 0)}</div>
            <div className={`flex items-center gap-1 text-sm ${getChangeColor(parseFloat(metrics?.volumeChange || '0'))}`}>
              {getChangeIcon(parseFloat(metrics?.volumeChange || '0'))}
              {metrics?.volumeChange || '0'}% vs yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Trades</span>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics?.totalTrades || 0)}</div>
            <div className="text-sm text-muted-foreground">
              {formatNumber(metrics?.trades24h || 0)} in 24h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Protocol Fees</span>
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.totalFees || 0)}</div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(metrics?.fees24h || 0)} in 24h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Traders</span>
              <Users className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics?.uniqueTraders || 0)}</div>
            <div className="text-sm text-muted-foreground">
              {formatNumber(metrics?.activeTraders24h || 0)} active today
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="pairs">Pairs</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Volume Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Trading Volume</CardTitle>
                <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="trades">Trades</SelectItem>
                    <SelectItem value="fees">Fees</SelectItem>
                    <SelectItem value="liquidity">Liquidity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tickFormatter={formatNumber} />
                    <Tooltip 
                      formatter={(value: any) => [formatNumber(value), selectedMetric]}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={selectedMetric} 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Trade Size</span>
                  <span className="font-medium">{formatCurrency(metrics?.averageTradeSize || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Volume/TVL Ratio</span>
                  <span className="font-medium">2.45x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fee Revenue (24h)</span>
                  <span className="font-medium">{formatCurrency(metrics?.fees24h || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Protocol Efficiency</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    98.7%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'XP/USDT', value: 35 },
                          { name: 'XP/ETH', value: 25 },
                          { name: 'BTC/USDT', value: 20 },
                          { name: 'ETH/USDT', value: 15 },
                          { name: 'Others', value: 5 }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                      >
                        {pieChartColors.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Token</th>
                      <th className="text-right p-3">Price</th>
                      <th className="text-right p-3">24h Change</th>
                      <th className="text-right p-3">Volume (24h)</th>
                      <th className="text-right p-3">Market Cap</th>
                      <th className="text-right p-3">Liquidity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokenAnalytics.map((token: TokenAnalytics, index: number) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              {token.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-xs text-muted-foreground">{token.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right p-3">${token.price.toFixed(4)}</td>
                        <td className={`text-right p-3 ${getChangeColor(token.priceChange24h)}`}>
                          {token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </td>
                        <td className="text-right p-3">{formatCurrency(token.volume24h)}</td>
                        <td className="text-right p-3">{formatCurrency(token.marketCap)}</td>
                        <td className="text-right p-3">{formatCurrency(token.liquidityUSD)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pairs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Pairs Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Pair</th>
                      <th className="text-right p-3">Volume (24h)</th>
                      <th className="text-right p-3">Volume Change</th>
                      <th className="text-right p-3">Liquidity</th>
                      <th className="text-right p-3">APR</th>
                      <th className="text-right p-3">Trades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pairAnalytics.map((pair: PairAnalytics, index: number) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="font-medium">{pair.tokenA}/{pair.tokenB}</div>
                        </td>
                        <td className="text-right p-3">{formatCurrency(pair.volume24h)}</td>
                        <td className={`text-right p-3 ${getChangeColor(pair.volumeChange)}`}>
                          {pair.volumeChange > 0 ? '+' : ''}{pair.volumeChange.toFixed(2)}%
                        </td>
                        <td className="text-right p-3">{formatCurrency(pair.liquidity)}</td>
                        <td className="text-right p-3 text-green-600">{pair.apr.toFixed(2)}%</td>
                        <td className="text-right p-3">{formatNumber(pair.trades24h)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Liquidity Risk</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">Low</Badge>
                    </div>
                    <Progress value={25} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Strong liquidity across major pairs
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Volatility Risk</span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-200">Medium</Badge>
                    </div>
                    <Progress value={60} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Moderate price volatility observed
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Smart Contract Risk</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">Low</Badge>
                    </div>
                    <Progress value={15} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Audited contracts with high security
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-700 dark:text-yellow-300">Risk Alert</div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                          Increased volatility detected in XP/USDT pair. Consider adjusting position sizes.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Risk Metrics</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Value at Risk (95%)</span>
                      <span>$2,450</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Maximum Drawdown</span>
                      <span>-8.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sharpe Ratio</span>
                      <span>1.85</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">Opportunity</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        XP/ETH pair showing strong correlation with market sentiment. Consider yield farming opportunities.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-300">Trend Analysis</div>
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Trading volume increased 45% this week. Strong bullish momentum detected.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">+23.5%</div>
                    <div className="text-xs text-muted-foreground">Protocol Growth</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">158.3%</div>
                    <div className="text-xs text-muted-foreground">Avg APR</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">99.8%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">1,247</div>
                    <div className="text-xs text-muted-foreground">Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}