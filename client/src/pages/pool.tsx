import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, TrendingUp, Search, Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdvancedLiquidityPoolManager } from "@/components/LiquidityPoolManager";
import { getTokenIcon } from "@/lib/tokenUtils";
import { web3Service } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export default function PoolPage() {
  const { wallet } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [addLiquidityOpen, setAddLiquidityOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [tokenA, setTokenA] = useState<string>("");
  const [tokenB, setTokenB] = useState<string>("");
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});

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

  // Available tokens for liquidity pairs
  const availableTokens = [
    { symbol: "XP", name: "Xphere Token", address: "0x0000000000000000000000000000000000000000" },
    { symbol: "XPS", name: "XpSwap Token", address: "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2" },
    { symbol: "USDT", name: "Tether USD", address: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
    { symbol: "USDC", name: "USD Coin", address: "0xa0b86a33e6df7febb86fdb5b8a2e6cc17a8db6bb" },
    { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000" },
    { symbol: "BTC", name: "Bitcoin", address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" },
  ];

  // Fetch token balances
  const fetchTokenBalances = async () => {
    if (!wallet.address) return;
    
    const balances: Record<string, string> = {};
    
    for (const token of availableTokens) {
      try {
        if (token.symbol === "XP") {
          balances[token.symbol] = wallet.balance;
        } else if (token.symbol === "XPS") {
          const xpsBalance = await web3Service.getXPSBalance(wallet.address);
          balances[token.symbol] = xpsBalance;
        } else {
          // For other tokens, use a placeholder (in real implementation, would call token contract)
          balances[token.symbol] = "0";
        }
      } catch (error) {
        console.error(`Failed to fetch ${token.symbol} balance:`, error);
        balances[token.symbol] = "0";
      }
    }
    
    setTokenBalances(balances);
  };

  useEffect(() => {
    if (wallet.address) {
      fetchTokenBalances();
    }
  }, [wallet.address]);

  // Add liquidity mutation
  const addLiquidityMutation = useMutation({
    mutationFn: async (liquidityData: any) => {
      const response = await fetch("/api/add-liquidity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(liquidityData),
      });
      if (!response.ok) throw new Error("Failed to add liquidity");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "유동성 추가 성공",
        description: "리퀴디티 풀에 성공적으로 추가되었습니다.",
        variant: "default",
      });
      setAddLiquidityOpen(false);
      setTokenA("");
      setTokenB("");
      setAmountA("");
      setAmountB("");
      queryClient.invalidateQueries({ queryKey: ["/api/pools"] });
    },
    onError: (error: any) => {
      toast({
        title: "유동성 추가 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddLiquidity = () => {
    if (pools.length > 0) {
      setSelectedPool(pools[0]); // Use first pool as default
      setTokenA("XP");
      setTokenB("XPS");
      setAddLiquidityOpen(true);
    }
  };

  const handleSubmitLiquidity = async () => {
    if (!tokenA || !tokenB || !amountA || !amountB || !wallet.address) return;
    
    const liquidityData = {
      userAddress: wallet.address,
      tokenA: tokenA,
      tokenB: tokenB,
      amountA: amountA,
      amountB: amountB,
    };
    
    addLiquidityMutation.mutate(liquidityData);
  };

  const handleMaxAmount = (token: string, isTokenA: boolean) => {
    const balance = tokenBalances[token] || "0";
    if (isTokenA) {
      setAmountA(balance);
    } else {
      setAmountB(balance);
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
                        src={getTokenIcon(tokenA)} 
                        alt={tokenA}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                      <img 
                        src={getTokenIcon(tokenB)} 
                        alt={tokenB}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-lg font-semibold">
                    {tokenA || "Select"}/{tokenB || "Select"}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  Add liquidity to earn trading fees and XPS rewards
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Token A</span>
                      <span className="text-sm text-muted-foreground">
                        Balance: {tokenA ? parseFloat(tokenBalances[tokenA] || "0").toFixed(3) : "0.000"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        placeholder="0.0"
                        className="text-xl font-semibold"
                        type="number"
                        value={amountA}
                        onChange={(e) => setAmountA(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => tokenA && handleMaxAmount(tokenA, true)}
                      >
                        MAX
                      </Button>
                    </div>
                    <Select value={tokenA} onValueChange={setTokenA}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Token A" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTokens.map((token) => (
                          <SelectItem key={token.symbol} value={token.symbol}>
                            <div className="flex items-center space-x-2">
                              <img 
                                src={getTokenIcon(token.symbol)} 
                                alt={token.symbol}
                                className="w-5 h-5 rounded-full"
                              />
                              <span>{token.symbol}</span>
                              <span className="text-muted-foreground text-xs">
                                {token.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-center">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Token B</span>
                      <span className="text-sm text-muted-foreground">
                        Balance: {tokenB ? parseFloat(tokenBalances[tokenB] || "0").toFixed(3) : "0.000"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        placeholder="0.0"
                        className="text-xl font-semibold"
                        type="number"
                        value={amountB}
                        onChange={(e) => setAmountB(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => tokenB && handleMaxAmount(tokenB, false)}
                      >
                        MAX
                      </Button>
                    </div>
                    <Select value={tokenB} onValueChange={setTokenB}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Token B" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTokens.map((token) => (
                          <SelectItem key={token.symbol} value={token.symbol}>
                            <div className="flex items-center space-x-2">
                              <img 
                                src={getTokenIcon(token.symbol)} 
                                alt={token.symbol}
                                className="w-5 h-5 rounded-full"
                              />
                              <span>{token.symbol}</span>
                              <span className="text-muted-foreground text-xs">
                                {token.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>Pool Share</span>
                      <span className="font-semibold">
                        {amountA && amountB ? "~0.001%" : "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Base APR</span>
                      <span className="font-semibold text-green-600">15.2%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>XPS Bonus APR</span>
                      <span className="font-semibold text-purple-600">+12.8%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span>Total APR</span>
                      <span className="text-green-600">28.0%</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubmitLiquidity}
                    disabled={!tokenA || !tokenB || !amountA || !amountB || addLiquidityMutation.isPending}
                  >
                    {addLiquidityMutation.isPending ? "Adding Liquidity..." : "Add Liquidity"}
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