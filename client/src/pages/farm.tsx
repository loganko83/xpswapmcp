import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Sprout, TrendingUp, Search, Lock, Unlock } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";

export default function FarmPage() {
  const { wallet } = useWeb3();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock farm data
  const farms = [
    {
      id: 1,
      tokenA: { symbol: "XP", name: "Xphere" },
      tokenB: { symbol: "USDT", name: "Tether USD" },
      apr: "125.5",
      tvl: "2,400,000",
      multiplier: "10x",
      status: "active",
      rewardToken: "XP",
      userStaked: "0",
      pendingRewards: "0",
      lockPeriod: "0 days"
    },
    {
      id: 2,
      tokenA: { symbol: "ETH", name: "Ethereum" },
      tokenB: { symbol: "XP", name: "Xphere" },
      apr: "89.2",
      tvl: "1,800,000",
      multiplier: "8x",
      status: "active",
      rewardToken: "XP",
      userStaked: "0",
      pendingRewards: "0",
      lockPeriod: "0 days"
    },
    {
      id: 3,
      tokenA: { symbol: "BNB", name: "Binance Coin" },
      tokenB: { symbol: "USDT", name: "Tether USD" },
      apr: "67.8",
      tvl: "1,200,000",
      multiplier: "5x",
      status: "active",
      rewardToken: "XP",
      userStaked: "0",
      pendingRewards: "0",
      lockPeriod: "7 days"
    },
    {
      id: 4,
      tokenA: { symbol: "XP", name: "Xphere" },
      tokenB: { symbol: "XP", name: "Xphere" },
      apr: "45.3",
      tvl: "3,600,000",
      multiplier: "3x",
      status: "ended",
      rewardToken: "XP",
      userStaked: "0",
      pendingRewards: "0",
      lockPeriod: "30 days"
    }
  ];

  const filteredFarms = farms.filter(farm =>
    farm.tokenA.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.tokenB.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.tokenA.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.tokenB.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFarms = filteredFarms.filter(farm => farm.status === "active");
  const endedFarms = filteredFarms.filter(farm => farm.status === "ended");

  const getTokenIcon = (symbol: string) => {
    const iconMap: { [key: string]: string } = {
      XP: "https://s2.coinmarketcap.com/static/img/coins/64x64/28447.png",
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

  const renderFarmCard = (farm: any) => (
    <Card key={farm.id} className={`hover:shadow-lg transition-shadow ${farm.status === 'ended' ? 'opacity-60' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center -space-x-2">
              <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                <img 
                  src={getTokenIcon(farm.tokenA.symbol)} 
                  alt={farm.tokenA.symbol}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                <img 
                  src={getTokenIcon(farm.tokenB.symbol)} 
                  alt={farm.tokenB.symbol}
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
                {farm.tokenA.symbol}/{farm.tokenB.symbol}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant={farm.status === 'active' ? 'default' : 'secondary'}>
                  {farm.multiplier}
                </Badge>
                <Badge variant="outline">
                  {farm.lockPeriod}
                </Badge>
                {farm.status === 'ended' && (
                  <Badge variant="destructive">Ended</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{farm.apr}%</div>
            <div className="text-sm text-muted-foreground">APR</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">TVL</p>
            <p className="font-semibold">{formatCurrency(farm.tvl)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reward Token</p>
            <p className="font-semibold">{farm.rewardToken}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lock Period</p>
            <div className="flex items-center space-x-1">
              {farm.lockPeriod === "0 days" ? (
                <Unlock className="w-4 h-4 text-green-500" />
              ) : (
                <Lock className="w-4 h-4 text-orange-500" />
              )}
              <span className="font-semibold">{farm.lockPeriod}</span>
            </div>
          </div>
        </div>

        {wallet.isConnected && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Staked: {farm.userStaked} LP</span>
              <span>Pending: {farm.pendingRewards} XP</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        )}

        <div className="flex space-x-2">
          {farm.status === 'active' ? (
            <>
              <Button className="flex-1" disabled={!wallet.isConnected}>
                <Sprout className="w-4 h-4 mr-1" />
                Stake
              </Button>
              <Button variant="outline" className="flex-1" disabled={!wallet.isConnected}>
                Unstake
              </Button>
              <Button variant="secondary" disabled={!wallet.isConnected}>
                Harvest
              </Button>
            </>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              Farm Ended
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Yield Farming</h1>
        <p className="text-muted-foreground">
          Stake LP tokens to earn additional rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Value Staked</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">$9.0M</div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              +22.4%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Rewards</span>
              <Sprout className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">125K XP</div>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              Daily
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Farms</span>
              <Sprout className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{activeFarms.length}</div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Live
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Max APR</span>
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">125.5%</div>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              XP/USDT
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Farms ({activeFarms.length})</TabsTrigger>
          <TabsTrigger value="my-farms">My Farms</TabsTrigger>
          <TabsTrigger value="ended">Ended Farms ({endedFarms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search farms by token symbol or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Farms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeFarms.map(renderFarmCard)}
          </div>
        </TabsContent>

        <TabsContent value="my-farms" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              {wallet.isConnected ? (
                <div>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sprout className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No active farms</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't staked in any farms yet.
                  </p>
                  <Button>Explore Farms</Button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sprout className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Connect your wallet</h3>
                  <p className="text-muted-foreground">
                    Connect your wallet to view your farming positions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ended" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {endedFarms.map(renderFarmCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}