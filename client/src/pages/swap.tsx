import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, DollarSign, Users, Zap, ArrowRight, Sparkles } from "lucide-react";
import { SwapInterface } from "@/components/SwapInterface";
import { TopPairs } from "@/components/TopPairs";
import { useQuery } from "@tanstack/react-query";
import { useTokenPrices } from "@/hooks/useTokenPrices";

export default function SwapPage() {
  const { data: tokenPrices } = useTokenPrices();
  
  // Fetch market stats
  const { data: marketStats } = useQuery({
    queryKey: ["/api/market-stats"],
    refetchInterval: 30000,
  });

  // Fetch XP price data
  const { data: xpData } = useQuery({
    queryKey: ["/api/xp-price"],
    refetchInterval: 30000,
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* XPS Token Promotion Banner */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold mb-1">XPS 네이티브 토큰</h3>
                    <p className="text-blue-100 text-sm">거래 수수료 최대 75% 할인 + 최대 400% 스테이킹 APY</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    디플레이션 토큰
                  </Badge>
                  <Button 
                    variant="secondary" 
                    className="bg-white text-purple-600 hover:bg-white/90"
                    onClick={() => window.location.href = '/documentation#xps-whitepaper'}
                  >
                    화이트페이퍼 보기 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              XpSwap
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            The Ultimate DeFi Hub on Xphere Blockchain - Trade, Earn, and Govern with Lightning Speed
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="px-4 py-2 text-sm bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              158.3% Max APY
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Zap className="w-4 h-4 mr-2 text-blue-600" />
              Lightning Fast
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <Users className="w-4 h-4 mr-2 text-purple-600" />
              1,247+ Active Users
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(parseFloat(marketStats?.totalValueLocked || "12400000"))}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Total Value Locked</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(xpData?.volume24h || 2500000)}
              </div>
              <div className="text-sm text-muted-foreground font-medium">24h Volume</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{marketStats?.activePairs || 8}</div>
              <div className="text-sm text-muted-foreground font-medium">Active Pairs</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4">
                <img 
                  src="https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png" 
                  alt="XP" 
                  className="w-7 h-7 rounded-full"
                />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatPrice(tokenPrices?.XP?.price || xpData?.price || 0)}
              </div>
              <div className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-2">
                XP Price
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    (tokenPrices?.XP?.change24h || xpData?.change24h || 0) >= 0 
                      ? 'text-green-600 border-green-200 bg-green-50' 
                      : 'text-red-600 border-red-200 bg-red-50'
                  }`}
                >
                  {(tokenPrices?.XP?.change24h || xpData?.change24h || 0) >= 0 ? '+' : ''}
                  {(tokenPrices?.XP?.change24h || xpData?.change24h || 0).toFixed(2)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Swap Interface */}
          <div className="xl:col-span-2">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                  Instant Token Swap
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  Trade tokens instantly with minimal slippage and competitive rates
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <SwapInterface />
              </CardContent>
            </Card>
          </div>

          {/* Information Panels */}
          <div className="xl:col-span-3 space-y-8">
            <Tabs defaultValue="pairs" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/50 dark:bg-gray-800/50">
                <TabsTrigger value="pairs" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                  Top Trading Pairs
                </TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
                  Platform Features
                </TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
                  Live Statistics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pairs" className="space-y-6">
                <TopPairs />
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-900/20 dark:via-blue-900/10 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Lightning Swaps</h3>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                        Execute trades in seconds with minimal slippage, competitive fees, and seamless user experience across all devices.
                      </p>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        Start Trading
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 via-green-50 to-green-100 dark:from-green-900/20 dark:via-green-900/10 dark:to-green-800/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Yield Farming</h3>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                        Earn up to 158.3% APY by providing liquidity and staking LP tokens in our optimized farming pools.
                      </p>
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                        Explore Farms
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 dark:from-purple-900/20 dark:via-purple-900/10 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Cross-Chain Bridge</h3>
                      </div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                        Bridge assets across 5+ networks with $42.8M total volume and industry-leading security protocols.
                      </p>
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        Bridge Assets
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 dark:from-orange-900/20 dark:via-orange-900/10 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">DAO Governance</h3>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                        Vote on protocol upgrades, parameter changes, and earn rewards for active participation in governance.
                      </p>
                      <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                        Join DAO
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Real-Time Platform Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-3xl font-bold text-green-600 mb-1">99.8%</div>
                        <div className="text-sm text-green-700 dark:text-green-300 font-medium">Success Rate</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-3xl font-bold text-blue-600 mb-1">0.3%</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Trading Fee</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-3xl font-bold text-purple-600 mb-1">2,847</div>
                        <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">24h Trades</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="text-3xl font-bold text-orange-600 mb-1">~8s</div>
                        <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">Avg Speed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Network Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Uptime</span>
                        <span className="font-semibold text-green-600">99.9%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Active Validators</span>
                        <span className="font-semibold">127</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Network Load</span>
                        <Badge variant="outline" className="text-green-600 border-green-200">Low</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Security Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Smart Contracts</span>
                        <Badge variant="outline" className="text-green-600 border-green-200">Audited</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Bug Bounty</span>
                        <span className="font-semibold">$50K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Insurance Fund</span>
                        <span className="font-semibold">$2.1M</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}