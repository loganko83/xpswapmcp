import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Sprout, TrendingUp, Search, Lock, Unlock, Zap, Sparkles, ArrowRight } from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useQuery } from "@tanstack/react-query";
import { getTokenIcon } from "@/lib/tokenUtils";
import { YieldFarmingManager } from "@/components/YieldFarmingManager";

export default function FarmPage() {
  const { wallet } = useWeb3Context();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real farm data from API
  const { data: farms = [], isLoading: farmsLoading } = useQuery({
    queryKey: ["/api/farming/pools"],
    queryFn: async () => {
      const response = await fetch("/api/farming/pools");
      if (!response.ok) throw new Error("Failed to fetch farms");
      return response.json();
    },
  });

  const filteredFarms = farms.filter((farm: any) =>
    farm.stakingToken.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.rewardToken.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFarms = filteredFarms.filter((farm: any) => farm.isActive);
  const endedFarms = filteredFarms.filter((farm: any) => !farm.isActive);

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
                  onClick={() => window.location.href = '/xpswap/documentation#xps-whitepaper'}
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