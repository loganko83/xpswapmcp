import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, TrendingUp, Search } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";

export default function PoolPage() {
  const { wallet } = useWeb3();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock pool data
  const pools = [
    {
      id: 1,
      tokenA: { symbol: "XP", name: "Xphere" },
      tokenB: { symbol: "USDT", name: "Tether USD" },
      tvl: "5,200,000",
      apr: "45.2",
      volume24h: "2,100,000",
      fees24h: "6,300",
      userLiquidity: "0",
      userRewards: "0"
    },
    {
      id: 2,
      tokenA: { symbol: "ETH", name: "Ethereum" },
      tokenB: { symbol: "XP", name: "Xphere" },
      tvl: "3,100,000",
      apr: "32.8",
      volume24h: "890,000",
      fees24h: "2,670",
      userLiquidity: "0",
      userRewards: "0"
    },
    {
      id: 3,
      tokenA: { symbol: "BNB", name: "Binance Coin" },
      tokenB: { symbol: "USDT", name: "Tether USD" },
      tvl: "1,800,000",
      apr: "28.5",
      volume24h: "654,000",
      fees24h: "1,962",
      userLiquidity: "0",
      userRewards: "0"
    }
  ];

  const filteredPools = pools.filter(pool =>
    pool.tokenA.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.tokenB.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.tokenA.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.tokenB.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTokenIcon = (symbol: string) => {
    const iconMap: { [key: string]: string } = {
      XP: "https://s2.coinmarketcap.com/static/img/coins/64x64/29210.png",
      USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
      BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
    };
    return iconMap[symbol] || "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png";
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Liquidity Pools</h1>
        <p className="text-muted-foreground">
          Provide liquidity to earn trading fees and rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Value Locked</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">$10.1M</div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              +15.2%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">24h Volume</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">$3.6M</div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              +8.7%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">24h Fees</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">$10.9K</div>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              +12.3%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Pools</span>
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">12</div>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              +2 New
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-pools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-pools">All Pools</TabsTrigger>
          <TabsTrigger value="my-liquidity">My Liquidity</TabsTrigger>
        </TabsList>

        <TabsContent value="all-pools" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pools by token symbol or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Pool List */}
          <div className="space-y-4">
            {filteredPools.map((pool) => (
              <Card key={pool.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center -space-x-2">
                        <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                          <img 
                            src={getTokenIcon(pool.tokenA.symbol)} 
                            alt={pool.tokenA.symbol}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                          <img 
                            src={getTokenIcon(pool.tokenB.symbol)} 
                            alt={pool.tokenB.symbol}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {pool.tokenA.symbol}/{pool.tokenB.symbol}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {pool.tokenA.name} - {pool.tokenB.name}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-8 text-right">
                      <div>
                        <p className="text-sm text-muted-foreground">TVL</p>
                        <p className="font-semibold">{formatCurrency(pool.tvl)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">APR</p>
                        <Badge variant="secondary" className="text-green-600">
                          {pool.apr}%
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">24h Volume</p>
                        <p className="font-semibold">{formatCurrency(pool.volume24h)}</p>
                      </div>
                      <div className="space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                        <Button size="sm" variant="outline">
                          <Minus className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-liquidity" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              {wallet.isConnected ? (
                <div>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No liquidity positions</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't provided liquidity to any pools yet.
                  </p>
                  <Button>Add Liquidity</Button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Connect your wallet</h3>
                  <p className="text-muted-foreground">
                    Connect your wallet to view your liquidity positions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}