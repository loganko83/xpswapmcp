import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Minus, ArrowUpDown, Info, TrendingUp, Zap } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_TOKENS } from "@/lib/constants";

interface LiquidityPool {
  id: number;
  tokenA: { symbol: string; name: string; address: string };
  tokenB: { symbol: string; name: string; address: string };
  tvl: string;
  apr: string;
  volume24h: string;
  fees24h: string;
  userLiquidity: string;
  userRewards: string;
  reserveA: string;
  reserveB: string;
  lpTokens: string;
  feeRate: string;
}

interface AddLiquidityProps {
  pool: LiquidityPool;
  isOpen: boolean;
  onClose: () => void;
}

function AddLiquidity({ pool, isOpen, onClose }: AddLiquidityProps) {
  const { wallet } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const { data: tokenPrices } = useTokenPrices([pool.tokenA.symbol, pool.tokenB.symbol]);

  const addLiquidityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/add-liquidity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: pool.id,
          amountA,
          amountB,
          slippage: parseFloat(slippage),
          userAddress: wallet.address
        })
      });
      
      if (!response.ok) throw new Error("Failed to add liquidity");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Liquidity Added",
        description: `Successfully added ${amountA} ${pool.tokenA.symbol} and ${amountB} ${pool.tokenB.symbol} to the pool`,
      });
      setAmountA("");
      setAmountB("");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/pools"] });
    },
    onError: (error) => {
      toast({
        title: "Add Liquidity Failed",
        description: "Failed to add liquidity. Please try again.",
        variant: "destructive",
      });
    }
  });

  const calculateAmountB = (inputAmountA: string) => {
    if (!inputAmountA || !pool.reserveA || !pool.reserveB) return "";
    const ratio = parseFloat(pool.reserveB) / parseFloat(pool.reserveA);
    return (parseFloat(inputAmountA) * ratio).toFixed(6);
  };

  const handleAmountAChange = (value: string) => {
    setAmountA(value);
    setAmountB(calculateAmountB(value));
  };

  const getTokenIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      XP: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
      BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
      ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"
    };
    return icons[symbol] || "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png";
  };

  const priceA = tokenPrices?.[pool.tokenA.symbol]?.price || 0;
  const priceB = tokenPrices?.[pool.tokenB.symbol]?.price || 0;
  const valueA = amountA ? (parseFloat(amountA) * priceA).toFixed(2) : "0.00";
  const valueB = amountB ? (parseFloat(amountB) * priceB).toFixed(2) : "0.00";
  const totalValue = (parseFloat(valueA) + parseFloat(valueB)).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Liquidity</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Token A Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Token A</span>
              <span>Balance: 0.000 {pool.tokenA.symbol}</span>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex justify-between items-center mb-2">
                <Input
                  placeholder="0.0"
                  value={amountA}
                  onChange={(e) => handleAmountAChange(e.target.value)}
                  className="border-0 text-xl font-semibold p-0 h-auto"
                  type="number"
                />
                <div className="flex items-center gap-2">
                  <img 
                    src={getTokenIcon(pool.tokenA.symbol)} 
                    alt={pool.tokenA.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold">{pool.tokenA.symbol}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">${valueA}</div>
            </div>
          </div>

          {/* Plus Icon */}
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
          </div>

          {/* Token B Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Token B</span>
              <span>Balance: 0.000 {pool.tokenB.symbol}</span>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex justify-between items-center mb-2">
                <Input
                  placeholder="0.0"
                  value={amountB}
                  readOnly
                  className="border-0 text-xl font-semibold p-0 h-auto"
                />
                <div className="flex items-center gap-2">
                  <img 
                    src={getTokenIcon(pool.tokenB.symbol)} 
                    alt={pool.tokenB.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold">{pool.tokenB.symbol}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">${valueB}</div>
            </div>
          </div>

          {/* Pool Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pool Share</span>
              <span>0.00%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Value</span>
              <span>${totalValue}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Current APR</span>
              <Badge variant="secondary" className="text-green-600">{pool.apr}%</Badge>
            </div>
          </div>

          {/* Slippage Settings */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Slippage Tolerance</label>
            <div className="flex gap-2">
              {["0.1", "0.5", "1.0"].map((value) => (
                <Button
                  key={value}
                  variant={slippage === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSlippage(value)}
                >
                  {value}%
                </Button>
              ))}
              <Input
                placeholder="Custom"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-20"
                type="number"
              />
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full" 
            onClick={() => addLiquidityMutation.mutate()}
            disabled={!amountA || !amountB || addLiquidityMutation.isPending}
          >
            {addLiquidityMutation.isPending ? "Adding Liquidity..." : "Add Liquidity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RemoveLiquidityProps {
  pool: LiquidityPool;
  isOpen: boolean;
  onClose: () => void;
}

function RemoveLiquidity({ pool, isOpen, onClose }: RemoveLiquidityProps) {
  const { wallet } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [percentage, setPercentage] = useState("25");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const removeLiquidityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/remove-liquidity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: pool.id,
          percentage: parseFloat(percentage),
          userAddress: wallet.address
        })
      });
      
      if (!response.ok) throw new Error("Failed to remove liquidity");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Liquidity Removed",
        description: `Successfully removed ${percentage}% of your liquidity`,
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/pools"] });
    },
    onError: (error) => {
      toast({
        title: "Remove Liquidity Failed",
        description: "Failed to remove liquidity. Please try again.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (pool.userLiquidity && percentage) {
      const userLiquidityAmount = parseFloat(pool.userLiquidity);
      const removePercentage = parseFloat(percentage) / 100;
      setAmountA((userLiquidityAmount * removePercentage * 0.5).toFixed(6));
      setAmountB((userLiquidityAmount * removePercentage * 0.5).toFixed(6));
    }
  }, [percentage, pool.userLiquidity]);

  const getTokenIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      XP: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
      BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
      ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"
    };
    return icons[symbol] || "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Liquidity</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Percentage Selection */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{percentage}%</div>
              <div className="text-sm text-muted-foreground">Remove liquidity</div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {["25", "50", "75", "100"].map((value) => (
                <Button
                  key={value}
                  variant={percentage === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPercentage(value)}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>

          {/* Tokens to Receive */}
          <div className="space-y-3">
            <div className="text-sm font-medium">You will receive:</div>
            
            <div className="rounded-lg border p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img 
                    src={getTokenIcon(pool.tokenA.symbol)} 
                    alt={pool.tokenA.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold">{pool.tokenA.symbol}</span>
                </div>
                <div className="text-lg font-semibold">{amountA}</div>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img 
                    src={getTokenIcon(pool.tokenB.symbol)} 
                    alt={pool.tokenB.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold">{pool.tokenB.symbol}</span>
                </div>
                <div className="text-lg font-semibold">{amountB}</div>
              </div>
            </div>
          </div>

          {/* Pool Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Your Pool Share</span>
              <span>0.01%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pool APR</span>
              <Badge variant="secondary" className="text-green-600">{pool.apr}%</Badge>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full" 
            variant="destructive"
            onClick={() => removeLiquidityMutation.mutate()}
            disabled={removeLiquidityMutation.isPending}
          >
            {removeLiquidityMutation.isPending ? "Removing Liquidity..." : "Remove Liquidity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AdvancedLiquidityPoolManagerProps {
  pools: LiquidityPool[];
}

export function AdvancedLiquidityPoolManager({ pools }: AdvancedLiquidityPoolManagerProps) {
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [addLiquidityOpen, setAddLiquidityOpen] = useState(false);
  const [removeLiquidityOpen, setRemoveLiquidityOpen] = useState(false);

  const handleAddLiquidity = (pool: LiquidityPool) => {
    setSelectedPool(pool);
    setAddLiquidityOpen(true);
  };

  const handleRemoveLiquidity = (pool: LiquidityPool) => {
    setSelectedPool(pool);
    setRemoveLiquidityOpen(true);
  };

  const getTokenIcon = (symbol: string) => {
    const icons: { [key: string]: string } = {
      XP: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
      BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
      ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      USDT: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png"
    };
    return icons[symbol] || "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png";
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
    <div className="space-y-4">
      {pools.map((pool) => (
        <Card key={pool.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                    <img 
                      src={getTokenIcon(pool.tokenA.symbol)} 
                      alt={pool.tokenA.symbol}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                    <img 
                      src={getTokenIcon(pool.tokenB.symbol)} 
                      alt={pool.tokenB.symbol}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {pool.tokenA.symbol}/{pool.tokenB.symbol}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fee: {pool.feeRate}%
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
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAddLiquidity(pool)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRemoveLiquidity(pool)}
                  >
                    <Minus className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            {/* Pool Details */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Reserve {pool.tokenA.symbol}</p>
                <p className="font-medium">{pool.reserveA}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reserve {pool.tokenB.symbol}</p>
                <p className="font-medium">{pool.reserveB}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">24h Fees Earned</p>
                <p className="font-medium">{formatCurrency(pool.fees24h)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Liquidity Dialog */}
      {selectedPool && (
        <AddLiquidity
          pool={selectedPool}
          isOpen={addLiquidityOpen}
          onClose={() => {
            setAddLiquidityOpen(false);
            setSelectedPool(null);
          }}
        />
      )}

      {/* Remove Liquidity Dialog */}
      {selectedPool && (
        <RemoveLiquidity
          pool={selectedPool}
          isOpen={removeLiquidityOpen}
          onClose={() => {
            setRemoveLiquidityOpen(false);
            setSelectedPool(null);
          }}
        />
      )}
    </div>
  );
}