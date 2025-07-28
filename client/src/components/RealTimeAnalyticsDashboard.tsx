import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Activity, TrendingUp, TrendingDown, DollarSign, Users, Zap, RefreshCw, AlertCircle, Target, Eye, Radio } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getApiUrl } from "@/lib/apiUrl";
// 보안 강화???�틸리티 ?�수
const generateSecureId = (length: number = 16): string => {
  const array = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
};

const getSecureRandom = (): number => {
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  return array[0] / 255;
};
import { useTokenPrices } from "@/hooks/useTokenPrices";

interface LiveMetrics {
  timestamp: number;
  price: number;
  volume: number;
  trades: number;
  liquidity: number;
  volatility: number;
  marketCap: number;
  change: number;
}

interface TradeData {
  id: string;
  timestamp: number;
  pair: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  value: number;
  user: string;
}

interface LiquidityFlow {
  timestamp: number;
  inflow: number;
  outflow: number;
  net: number;
  pools: string[];
}

interface AlertLevel {
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
}

export function RealTimeAnalyticsDashboard() {
  const [isLive, setIsLive] = useState(true);
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | '1h' | '4h'>('15m');
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'volume' | 'liquidity' | 'volatility'>('price');
  const [liveData, setLiveData] = useState<LiveMetrics[]>([]);
  const [recentTrades, setRecentTrades] = useState<TradeData[]>([]);
  const [liquidityFlows, setLiquidityFlows] = useState<LiquidityFlow[]>([]);
  const [alerts, setAlerts] = useState<AlertLevel[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');

  const { data: tokenPrices } = useTokenPrices();

  // Fetch real-time analytics data
  const { data: analyticsData, refetch } = useQuery({
    queryKey: ["/api/analytics/realtime", timeRange],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/analytics/realtime?range=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch real-time analytics");
      return response.json();
    },
    refetchInterval: isLive ? 2000 : false, // 2-second updates when live
    enabled: isLive
  });

  // Fetch live trades
  const { data: liveTrades } = useQuery({
    queryKey: ["/api/analytics/live-trades"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/analytics/live-trades");
      if (!response.ok) throw new Error("Failed to fetch live trades");
      return response.json();
    },
    refetchInterval: isLive ? 1000 : false, // 1-second updates for trades
    enabled: isLive
  });

  // Fetch liquidity flows
  const { data: liquidityData } = useQuery({
    queryKey: ["/api/analytics/liquidity-flows"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/analytics/liquidity-flows");
      if (!response.ok) throw new Error("Failed to fetch liquidity flows");
      return response.json();
    },
    refetchInterval: isLive ? 5000 : false, // 5-second updates for liquidity
    enabled: isLive
  });

  // Generate real-time data simulation
  const generateRealTimeData = useCallback(() => {
    if (!isLive) return;

    const now = Date.now();
    const basePrice = tokenPrices?.XP?.price || 0.0152;
    const volatility = 0.02; // 2% volatility
    const priceChange = ((getSecureRandom() - 0.5)) * volatility;
    const newPrice = basePrice * (1 + priceChange);

    const newDataPoint: LiveMetrics = {
      timestamp: now,
      price: newPrice,
      volume: getSecureRandomInt(0, 50000) + 25000,
      trades: Math.floor(getSecureRandomInt(0, 10)) + 5,
      liquidity: 5200000 + ((getSecureRandom() - 0.5)) * 200000,
      volatility: Math.abs(priceChange) * 100,
      marketCap: newPrice * 1000000000, // Assuming 1B supply
      change: ((newPrice - basePrice) / basePrice) * 100
    };

    setLiveData(prev => {
      const updated = [...prev, newDataPoint];
      const maxPoints = timeRange === '1m' ? 60 : timeRange === '5m' ? 300 : 900;
      return updated.slice(-maxPoints);
    });

    // Generate alerts based on thresholds
    if (Math.abs(newDataPoint.change) > 5) {
      const alert: AlertLevel = {
        type: Math.abs(newDataPoint.change) > 10 ? 'error' : 'warning',
        message: `High price volatility detected: ${newDataPoint.change.toFixed(2)}%`,
        timestamp: now,
        metric: 'price_change',
        value: Math.abs(newDataPoint.change),
        threshold: 5
      };
      setAlerts(prev => [alert, ...prev.slice(0, 9)]);
    }

    if (newDataPoint.volume > 75000) {
      const alert: AlertLevel = {
        type: 'info',
        message: `High trading volume: ${(newDataPoint.volume / 1000).toFixed(1)}K`,
        timestamp: now,
        metric: 'volume',
        value: newDataPoint.volume,
        threshold: 75000
      };
      setAlerts(prev => [alert, ...prev.slice(0, 9)]);
    }
  }, [isLive, timeRange, tokenPrices]);

  // Generate live trades simulation
  const generateLiveTrade = useCallback(() => {
    if (!isLive || !tokenPrices?.XP?.price) return;

    const pairs = ['XP/USDT', 'XP/ETH', 'XP/BTC', 'XP/BNB'];
    const types: ('buy' | 'sell')[] = ['buy', 'sell'];
    
    const newTrade: TradeData = {
      id: getSecureRandom().toString(36).substr(2, 9),
      timestamp: Date.now(),
      pair: pairs[Math.floor(getSecureRandom() * pairs.length)],
      type: types[Math.floor(getSecureRandom() * types.length)],
      amount: getSecureRandomInt(0, 10000) + 100,
      price: tokenPrices.XP.price * (1 + ((getSecureRandom() - 0.5)) * 0.01),
      value: 0,
      user: `0x${generateSecureId(8)}...`
    };
    newTrade.value = newTrade.amount * newTrade.price;

    setRecentTrades(prev => [newTrade, ...prev.slice(0, 19)]);
  }, [isLive, tokenPrices]);

  // Real-time data generation effects
  useEffect(() => {
    if (!isLive) return;

    const dataInterval = setInterval(generateRealTimeData, 2000);
    const tradeInterval = setInterval(generateLiveTrade, 3000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(tradeInterval);
    };
  }, [generateRealTimeData, generateLiveTrade]);

  // Connection status simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        setConnectionStatus(getSecureRandom() > 0.95 ? 'connecting' : 'connected');
      } else {
        setConnectionStatus('disconnected');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const getAlertColor = (type: AlertLevel['type']) => {
    switch (type) {
      case 'error': return 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
      case 'warning': return 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
      case 'info': return 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
      default: return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300';
    }
  };

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${connectionStatus === 'connected' ? 'text-green-500' : connectionStatus === 'connecting' ? 'text-yellow-500' : 'text-red-500'}`} />
            <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
          </div>
          <Badge 
            variant="outline" 
            className={`${
              connectionStatus === 'connected' ? 'border-green-200 text-green-700 bg-green-50' :
              connectionStatus === 'connecting' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
              'border-red-200 text-red-700 bg-red-50'
            }`}
          >
            {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1M</SelectItem>
              <SelectItem value="5m">5M</SelectItem>
              <SelectItem value="15m">15M</SelectItem>
              <SelectItem value="1h">1H</SelectItem>
              <SelectItem value="4h">4H</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-2"
          >
            {isLive ? <Radio className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            {isLive ? 'Live' : 'Paused'}
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Live Price</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-xl font-bold text-green-900 dark:text-green-100">
              ${liveData[liveData.length - 1]?.price.toFixed(6) || tokenPrices?.XP?.price?.toFixed(6) || '0.000000'}
            </div>
            <Badge variant="outline" className={`text-xs ${
              (liveData[liveData.length - 1]?.change || 0) >= 0 
                ? 'text-green-600 border-green-200 bg-green-50' 
                : 'text-red-600 border-red-200 bg-red-50'
            }`}>
              {(liveData[liveData.length - 1]?.change || 0) >= 0 ? '+' : ''}
              {(liveData[liveData.length - 1]?.change || 0).toFixed(2)}%
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Volume ({timeRange})</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(liveData[liveData.length - 1]?.volume || 35000)}
            </div>
            <div className="text-xs text-blue-600">
              {liveData[liveData.length - 1]?.trades || 0} trades
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Liquidity</span>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
              {formatCurrency(liveData[liveData.length - 1]?.liquidity || 5200000)}
            </div>
            <div className="text-xs text-purple-600">
              Total pools
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Volatility</span>
              <Zap className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
              {(liveData[liveData.length - 1]?.volatility || 1.2).toFixed(2)}%
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                (liveData[liveData.length - 1]?.volatility || 0) > 2 
                  ? 'text-red-600 border-red-200 bg-red-50' 
                  : 'text-green-600 border-green-200 bg-green-50'
              }`}
            >
              {(liveData[liveData.length - 1]?.volatility || 0) > 2 ? 'High' : 'Low'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="charts">Live Charts</TabsTrigger>
          <TabsTrigger value="trades">Live Trades</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity Flow</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Price Chart */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Real-Time Price Movement</CardTitle>
                  <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="liquidity">Liquidity</SelectItem>
                      <SelectItem value="volatility">Volatility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={liveData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis 
                        tickFormatter={(value) => 
                          selectedMetric === 'price' ? `$${value.toFixed(6)}` :
                          selectedMetric === 'volume' ? formatCurrency(value) :
                          selectedMetric === 'liquidity' ? formatCurrency(value) :
                          `${value.toFixed(2)}%`
                        }
                      />
                      <Tooltip 
                        formatter={(value: any) => [
                          selectedMetric === 'price' ? `$${value.toFixed(6)}` :
                          selectedMetric === 'volume' ? formatCurrency(value) :
                          selectedMetric === 'liquidity' ? formatCurrency(value) :
                          `${value.toFixed(2)}%`,
                          selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
                        ]}
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

            {/* Volume Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Trading Volume Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'XP/USDT', value: 35 },
                          { name: 'XP/ETH', value: 28 },
                          { name: 'XP/BTC', value: 22 },
                          { name: 'XP/BNB', value: 15 }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                      >
                        {pieColors.map((color, index) => (
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

          {/* Price Volatility Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Price Volatility Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liveData.slice(-20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis tickFormatter={(value) => `${value.toFixed(2)}%`} />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toFixed(2)}%`, 'Volatility']}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Bar dataKey="volatility" fill="#f59e0b" />
                    <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="5 5" label="High Risk" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Trade Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentTrades.map((trade) => (
                  <div 
                    key={trade.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`${
                          trade.type === 'buy' 
                            ? 'border-green-200 text-green-700 bg-green-50' 
                            : 'border-red-200 text-red-700 bg-red-50'
                        }`}
                      >
                        {trade.type.toUpperCase()}
                      </Badge>
                      <div>
                        <div className="font-medium">{trade.pair}</div>
                        <div className="text-xs text-muted-foreground">{trade.user}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(trade.amount)} XP</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(trade.value)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Liquidity Flow Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={liquidityFlows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(value), 'Flow']}
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inflow" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="outflow" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Real-Time Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No alerts at this time
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-sm opacity-75 mt-1">
                            Metric: {alert.metric} | Value: {alert.value.toFixed(2)} | Threshold: {alert.threshold}
                          </div>
                        </div>
                        <div className="text-xs opacity-75">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}