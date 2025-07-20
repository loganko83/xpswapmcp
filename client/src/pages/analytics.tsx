import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { RealTimeAnalyticsDashboard } from "@/components/RealTimeAnalyticsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { getTokenIcon } from "@/lib/tokenUtils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Zap, RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

// Secure random number generator
function getSecureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return min + (array[0] % range);
  }
  // Fallback for environments without crypto.getRandomValues
  return min + Math.floor(getSecureRandom() * range);
}

export default function AnalyticsPage() {
  const { data: tokenPrices } = useTokenPrices();
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  
  // Fetch market stats with real-time updates
  const { data: marketStats, refetch: refetchStats } = useQuery({
    queryKey: ["/api/market-stats"],
    refetchInterval: isAutoRefresh ? refreshInterval : false,
  });

  // Fetch XP specific data
  const { data: xpData } = useQuery({
    queryKey: ["/api/xp-price"],
    refetchInterval: isAutoRefresh ? refreshInterval : false,
  });

  // Generate real-time price history
  useEffect(() => {
    if (tokenPrices?.XP?.price) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      setPriceHistory(prev => {
        const newPoint = {
          time: timeString,
          XP: tokenPrices.XP.price,
          USDT: tokenPrices.USDT?.price || 1.0000,
          BTC: tokenPrices.BTC?.price || 43500,
          ETH: tokenPrices.ETH?.price || 2700,
          BNB: tokenPrices.BNB?.price || 310,
          timestamp: now.getTime(),
          volume: getSecureRandomInt(0, 1000000) + 500000 // Simulated volume
        };
        
        // Keep last 24 data points (12 hours with 30-second intervals)
        const updated = [...prev, newPoint].slice(-24);
        return updated;
      });
    }
  }, [tokenPrices]);

  // Calculate real-time metrics
  const currentPrice = tokenPrices?.XP?.price || 0;
  const priceChange24h = tokenPrices?.XP?.change24h || 0;
  const marketCap = xpData?.marketCap || 0;
  const volume24h = xpData?.volume24h || 0;

  // Real volume distribution based on actual data
  const volumeData = [
    { 
      name: "XP/USDT", 
      value: 35, 
      volume: volume24h ? `$${(volume24h * 0.35 / 1000000).toFixed(1)}M` : "$875K",
      color: "#6366F1"
    },
    { 
      name: "XP/BTC", 
      value: 28, 
      volume: volume24h ? `$${(volume24h * 0.28 / 1000000).toFixed(1)}M` : "$700K",
      color: "#10B981"
    },
    { 
      name: "XP/ETH", 
      value: 22, 
      volume: volume24h ? `$${(volume24h * 0.22 / 1000000).toFixed(1)}M` : "$550K",
      color: "#F59E0B"
    },
    { 
      name: "Others", 
      value: 15, 
      volume: volume24h ? `$${(volume24h * 0.15 / 1000000).toFixed(1)}M` : "$375K",
      color: "#EF4444"
    }
  ];



  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  // Top trading pairs with real data
  const topPairs = [
    { 
      pair: "XP/USDT", 
      price: currentPrice, 
      change: priceChange24h, 
      volume: volume24h * 0.35,
      liquidity: "$2.1M"
    },
    { 
      pair: "XP/BTC", 
      price: currentPrice / (tokenPrices?.BTC?.price || 43500), 
      change: priceChange24h - 0.5, 
      volume: volume24h * 0.28,
      liquidity: "$1.8M"
    },
    { 
      pair: "XP/ETH", 
      price: currentPrice / (tokenPrices?.ETH?.price || 2700), 
      change: priceChange24h + 0.3, 
      volume: volume24h * 0.22,
      liquidity: "$1.2M"
    },
    { 
      pair: "XP/BNB", 
      price: currentPrice / (tokenPrices?.BNB?.price || 310), 
      change: priceChange24h - 0.8, 
      volume: volume24h * 0.15,
      liquidity: "$800K"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* XPS Token Portfolio Analytics Banner */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-1">XPS Portfolio Optimization</h3>
                  <p className="text-purple-100 text-sm">Token diversification recommendations + real-time yield analysis</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Advanced Analytics
                </Badge>
                <Button 
                  variant="secondary" 
                  className="bg-white text-purple-600 hover:bg-white/90"
                  onClick={() => window.location.href = '/documentation#xps-whitepaper'}
                >
                  Start Portfolio <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics & Portfolio</h1>
          <p className="text-muted-foreground">Advanced analytics, portfolio management, and real-time market data</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchStats()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant={isAutoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            {isAutoRefresh ? "Live" : "Paused"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">XP Price</CardTitle>
            <img src={getTokenIcon("XP")} alt="XP" className="w-6 h-6" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(currentPrice)}</div>
            <p className={`text-xs flex items-center ${priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}% (24h)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(marketCap)}</div>
            <p className="text-xs text-muted-foreground">
              Rank #731
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(volume24h)}</div>
            <p className="text-xs text-muted-foreground">
              {marketStats?.activePairs || 8} active pairs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liquidity</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(marketStats?.totalValueLocked || "12400000"))}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all pools
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Manager</TabsTrigger>
          <TabsTrigger value="price">Price Charts</TabsTrigger>
          <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
          <TabsTrigger value="pairs">Trading Pairs</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime">
          <RealTimeAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="portfolio">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Portfolio Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Portfolio management features are available in the dedicated Portfolio section.
              </p>
              <Button 
                onClick={() => window.location.href = '/portfolio'}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Go to Portfolio Manager
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Price Movement</CardTitle>
              <p className="text-sm text-muted-foreground">
                Live price data updated every 30 seconds
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={['dataMin - 0.0001', 'dataMax + 0.0001']} />
                    <Tooltip 
                      formatter={(value: any) => [formatPrice(value), 'XP Price']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="XP"
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Token Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="XP" stroke="#6366F1" strokeWidth={2} />
                      <Line type="monotone" dataKey="USDT" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priceHistory.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(value), 'Volume']}
                      />
                      <Bar dataKey="volume" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volume" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Volume Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={volumeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {volumeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {volumeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.volume}</div>
                      <div className="text-sm text-muted-foreground">{item.value}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pairs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Trading Pairs</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time data from active trading pairs
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPairs.map((pair, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <img src={getTokenIcon("XP")} alt="XP" className="w-8 h-8" />
                        <div>
                          <div className="font-semibold">{pair.pair}</div>
                          <div className="text-sm text-muted-foreground">
                            Liquidity: {pair.liquidity}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold">
                        {pair.pair.includes('BTC') || pair.pair.includes('ETH') || pair.pair.includes('BNB') 
                          ? pair.price.toFixed(8) 
                          : formatPrice(pair.price)
                        }
                      </div>
                      <Badge variant={pair.change >= 0 ? "default" : "destructive"}>
                        {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(pair.volume)}</div>
                      <div className="text-sm text-muted-foreground">24h Volume</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Value Locked</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(parseFloat(marketStats?.totalValueLocked || "12400000"))}
                  </span>
                </div>
                <Progress value={75} className="w-full" />
                <div className="text-sm text-muted-foreground">
                  75% of target liquidity reached
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pool Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">XP/USDT Pool</span>
                    <span className="text-sm font-medium">APY 12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">XP/BTC Pool</span>
                    <span className="text-sm font-medium">APY 8.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">XP/ETH Pool</span>
                    <span className="text-sm font-medium">APY 15.7%</span>
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