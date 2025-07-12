import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Minus, TrendingUp, Search, Sparkles, ArrowRight } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useQuery } from "@tanstack/react-query";
import { AdvancedLiquidityPoolManager } from "@/components/LiquidityPoolManager";
import { getTokenIcon } from "@/lib/tokenUtils";

export default function PoolPage() {
  const { wallet } = useWeb3();
  const [searchQuery, setSearchQuery] = useState("");
  const [addLiquidityOpen, setAddLiquidityOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<any>(null);

  // Fetch real pool data from API
  const { data: pools = [], isLoading: poolsLoading } = useQuery({
    queryKey: ["/api/pools"],
    queryFn: async () => {
      const response = await fetch("/api/pools");
      if (!response.ok) throw new Error("Failed to fetch pools");
      return response.json();
    }
  });

  const filteredPools = pools.filter((pool: any) =>
    pool.tokenA?.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.tokenB?.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.tokenA?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.tokenB?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddLiquidity = () => {
    if (pools.length > 0) {
      setSelectedPool(pools[0]); // Use first pool as default
      setAddLiquidityOpen(true);
    }
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
      {/* XPS Token LP Boost Banner */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-1">XPS Holder LP Boost</h3>
                  <p className="text-green-100 text-sm">XPS staking increases LP rewards up to 2.5x</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  LP Mining Boost
                </Badge>
                <Button 
                  variant="secondary" 
                  className="bg-white text-green-600 hover:bg-white/90"
                  onClick={() => window.location.href = '/documentation#xps-whitepaper'}
                >
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

          {/* Advanced Pool Management */}
          {poolsLoading ? (
            <div className="text-center py-8">Loading pools...</div>
          ) : (
            <AdvancedLiquidityPoolManager pools={filteredPools} />
          )}
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
                  <Button onClick={handleAddLiquidity}>Add Liquidity</Button>
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

      {/* Add Liquidity Dialog */}
      {selectedPool && (
        <Dialog open={addLiquidityOpen} onOpenChange={setAddLiquidityOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Liquidity</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex items-center -space-x-2">
                    <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                      <img 
                        src={getTokenIcon(selectedPool.tokenA?.symbol)} 
                        alt={selectedPool.tokenA?.symbol}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                      <img 
                        src={getTokenIcon(selectedPool.tokenB?.symbol)} 
                        alt={selectedPool.tokenB?.symbol}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedPool.tokenA?.symbol}/{selectedPool.tokenB?.symbol}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  Add liquidity to earn trading fees and rewards
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Token A</span>
                      <span className="text-sm text-muted-foreground">Balance: 0.000</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="0.0"
                        className="text-xl font-semibold"
                        type="number"
                      />
                      <Button variant="outline" size="sm">MAX</Button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {selectedPool.tokenA?.symbol}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Token B</span>
                      <span className="text-sm text-muted-foreground">Balance: 0.000</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="0.0"
                        className="text-xl font-semibold"
                        type="number"
                      />
                      <Button variant="outline" size="sm">MAX</Button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {selectedPool.tokenB?.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>Pool Share</span>
                      <span className="font-semibold">0%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>APR</span>
                      <span className="font-semibold text-green-600">{selectedPool.apr}%</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" size="lg">
                    Add Liquidity
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}