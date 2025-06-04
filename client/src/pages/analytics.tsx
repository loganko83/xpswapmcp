import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("7d");

  // Fetch real XP price data
  const { data: xpPrice } = useQuery({
    queryKey: ['/api/xp-price'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mock analytics data - in real implementation, this would come from API
  const volumeData = [
    { date: "2024-01-01", volume: 1200000, transactions: 450 },
    { date: "2024-01-02", volume: 1800000, transactions: 620 },
    { date: "2024-01-03", volume: 2100000, transactions: 780 },
    { date: "2024-01-04", volume: 1900000, transactions: 690 },
    { date: "2024-01-05", volume: 2400000, transactions: 850 },
    { date: "2024-01-06", volume: 2800000, transactions: 920 },
    { date: "2024-01-07", volume: 3200000, transactions: 1100 },
  ];

  const liquidityData = [
    { name: "XP/USDT", value: 45, amount: 5200000 },
    { name: "ETH/XP", value: 28, amount: 3100000 },
    { name: "BNB/USDT", value: 15, amount: 1800000 },
    { name: "XP/BNB", value: 12, amount: 1400000 },
  ];

  const tokenData = [
    { symbol: "XP", price: xpPrice?.price || 0.0842, change: xpPrice?.change24h || 2.1, volume: 2800000, marketCap: xpPrice?.marketCap || 45200000 },
    { symbol: "USDT", price: 1.00, change: 0.1, volume: 1900000, marketCap: 98000000000 },
    { symbol: "ETH", price: 2340.50, change: -1.8, volume: 890000, marketCap: 281000000000 },
    { symbol: "BNB", price: 324.12, change: 0.8, volume: 654000, marketCap: 50000000000 },
  ];

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    return formatCurrency(volume);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Analytics</h1>
          <p className="text-muted-foreground">
            Track XpSwap performance and market insights
          </p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Volume</span>
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{formatVolume(volumeData.reduce((sum, d) => sum + d.volume, 0))}</div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              +12.4%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Liquidity</span>
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(liquidityData.reduce((sum, d) => sum + d.amount, 0))}</div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              +8.7%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Transactions</span>
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{volumeData.reduce((sum, d) => sum + d.transactions, 0).toLocaleString()}</div>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              +15.3%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">XP Price</span>
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">${(xpPrice?.price || 0.0842).toFixed(4)}</div>
            <Badge 
              variant="outline" 
              className={`${(xpPrice?.change24h || 2.1) >= 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}`}
            >
              {(xpPrice?.change24h || 2.1) >= 0 ? '+' : ''}{(xpPrice?.change24h || 2.1).toFixed(1)}%
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="volume" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="pairs">Pairs</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trading Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatVolume(value)} />
                  <Tooltip formatter={(value) => [formatVolume(value as number), "Volume"]} />
                  <Bar dataKey="volume" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Count</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={liquidityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {liquidityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Liquidity Pools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liquidityData.map((pool, index) => (
                    <div key={pool.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{pool.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(pool.amount)}</div>
                        <div className="text-sm text-muted-foreground">{pool.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tokenData.map((token, index) => (
                  <div key={token.symbol} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{token.symbol[0]}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(token.marketCap)} Market Cap
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8 text-right">
                      <div>
                        <div className="font-semibold">${token.price.toFixed(token.price < 1 ? 4 : 2)}</div>
                        <div className="text-sm text-muted-foreground">Price</div>
                      </div>
                      <div>
                        <div className={`font-semibold ${token.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {token.change >= 0 ? '+' : ''}{token.change.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">24h Change</div>
                      </div>
                      <div>
                        <div className="font-semibold">{formatVolume(token.volume)}</div>
                        <div className="text-sm text-muted-foreground">24h Volume</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pairs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trading Pairs Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liquidityData.map((pair, index) => (
                  <div key={pair.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center -space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full border-2 border-background" />
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-2 border-background" />
                      </div>
                      <div>
                        <div className="font-semibold">{pair.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(pair.amount)} TVL
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 text-right">
                      <div>
                        <div className="font-semibold">{formatVolume(pair.amount * 0.8)}</div>
                        <div className="text-sm text-muted-foreground">24h Volume</div>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          {(45 + index * 5).toFixed(1)}% APR
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}