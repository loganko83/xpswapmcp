import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Sprout, TrendingUp, Search, Lock, Unlock, Zap, Sparkles, ArrowRight } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useQuery } from "@tanstack/react-query";
import { getTokenIcon } from "@/lib/tokenUtils";
import { YieldFarmingManager } from "@/components/YieldFarmingManager";

export default function FarmPage() {
  const { wallet } = useWeb3();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real farm data from API
  const { data: farms = [], isLoading: farmsLoading } = useQuery({
    queryKey: ["/api/farms"],
    queryFn: async () => {
      const response = await fetch("/api/farms");
      if (!response.ok) throw new Error("Failed to fetch farms");
      return response.json();
    }
  });

  const filteredFarms = farms.filter((farm: any) =>
    farm.stakingToken.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.rewardToken.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFarms = filteredFarms.filter((farm: any) => farm.isActive);
  const endedFarms = filteredFarms.filter((farm: any) => !farm.isActive);



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
      {/* XPS Token Yield Farming Banner */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-1">XPS Staking Farm Yield Maximization</h3>
                  <p className="text-orange-100 text-sm">Up to 400% APY staking + 2.5x LP farm reward boost</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Yield Booster
                </Badge>
                <Button 
                  variant="secondary" 
                  className="bg-white text-orange-600 hover:bg-white/90"
                  onClick={() => window.location.href = '/documentation#xps-whitepaper'}
                >
                  Start Staking <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

          {/* Advanced Yield Farming Management */}
          {farmsLoading ? (
            <div className="text-center py-8">Loading farms...</div>
          ) : (
            <YieldFarmingManager farms={filteredFarms} />
          )}
        </TabsContent>

        <TabsContent value="my-farms" className="space-y-6">
          {farmsLoading ? (
            <div className="text-center py-8">Loading farms...</div>
          ) : (
            <YieldFarmingManager farms={filteredFarms} />
          )}
        </TabsContent>

        <TabsContent value="ended" className="space-y-6">
          {farmsLoading ? (
            <div className="text-center py-8">Loading farms...</div>
          ) : (
            <YieldFarmingManager farms={endedFarms} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}