import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getTokenIcon } from "@/lib/tokenUtils";
import { AddLiquidityProps } from "./LiquidityPoolTypes";

import { getApiUrl } from "@/lib/apiUrl";
export function AddLiquidityModal({ pool, isOpen, onClose }: AddLiquidityProps) {
  const { wallet } = useWeb3Context();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [isOptimalRatio, setIsOptimalRatio] = useState(true);

  const { data: tokenPrices } = useTokenPrices([pool.tokenA.symbol, pool.tokenB.symbol]);

  // Real-time token balances
  const { data: balanceA } = useQuery({
    queryKey: [`/api/blockchain/balance/${wallet.address}/${pool.tokenA.symbol}`, wallet.address, pool.tokenA.symbol],
    enabled: !!wallet.address && !!pool.tokenA.symbol,
    refetchInterval: 5000,
  });

  const { data: balanceB } = useQuery({
    queryKey: [`/api/blockchain/balance/${wallet.address}/${pool.tokenB.symbol}`, wallet.address, pool.tokenB.symbol],
    enabled: !!wallet.address && !!pool.tokenB.symbol,
    refetchInterval: 5000,
  });

  const addLiquidityMutation = useMutation({
    mutationFn: async () => {
      if (!wallet.address) {
        throw new Error("Wallet not connected");
      }
      
      const response = await fetch(getApiUrl("/api/add-liquidity"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId: pool.id,
          tokenA: pool.tokenA.symbol,
          tokenB: pool.tokenB.symbol,
          amountA,
          amountB,
          slippage: parseFloat(slippage),
          userAddress: wallet.address
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add liquidity");
      }
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
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Calculate optimal amounts based on pool ratio
  useEffect(() => {
    if (isOptimalRatio && amountA && pool.reserveA && pool.reserveB) {
      const ratio = parseFloat(pool.reserveB) / parseFloat(pool.reserveA);
      const calculatedAmountB = (parseFloat(amountA) * ratio).toFixed(6);
      setAmountB(calculatedAmountB);
    }
  }, [amountA, isOptimalRatio, pool.reserveA, pool.reserveB]);

  useEffect(() => {
    if (isOptimalRatio && amountB && pool.reserveA && pool.reserveB) {
      const ratio = parseFloat(pool.reserveA) / parseFloat(pool.reserveB);
      const calculatedAmountA = (parseFloat(amountB) * ratio).toFixed(6);
      setAmountA(calculatedAmountA);
    }
  }, [amountB, isOptimalRatio, pool.reserveA, pool.reserveB]);

  // Calculate values and pool share
  const priceA = tokenPrices?.[pool.tokenA.symbol] || 0;
  const priceB = tokenPrices?.[pool.tokenB.symbol] || 0;
  const valueA = (parseFloat(amountA || "0") * priceA).toFixed(2);
  const valueB = (parseFloat(amountB || "0") * priceB).toFixed(2);
  const totalValue = (parseFloat(valueA) + parseFloat(valueB)).toFixed(2);
  
  // Calculate pool share
  const poolTVL = parseFloat(pool.tvl.replace(/[,$]/g, ''));
  const poolShare = poolTVL > 0 ? ((parseFloat(totalValue) / poolTVL) * 100).toFixed(6) : "0";
  
  // Calculate price impact
  const reserveA = parseFloat(pool.reserveA || "0");
  const reserveB = parseFloat(pool.reserveB || "0");
  const inputAmountA = parseFloat(amountA || "0");
  const inputAmountB = parseFloat(amountB || "0");
  
  let priceImpact = "0";
  if (reserveA > 0 && reserveB > 0 && inputAmountA > 0 && inputAmountB > 0) {
    const currentRatio = reserveA / reserveB;
    const newRatio = (reserveA + inputAmountA) / (reserveB + inputAmountB);
    priceImpact = (Math.abs(currentRatio - newRatio) / currentRatio * 100).toFixed(2);
  }

  const handleMaxA = () => {
    if (balanceA?.balance) {
      setAmountA(balanceA.balance);
    }
  };

  const handleMaxB = () => {
    if (balanceB?.balance) {
      setAmountB(balanceB.balance);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Liquidity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Token A Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Amount {pool.tokenA.symbol}</label>
              {balanceA?.balance && (
                <div className="text-xs text-muted-foreground">
                  Balance: {balanceA.balance}
                  <Button variant="link" size="sm" className="h-auto p-0 ml-1" onClick={handleMaxA}>
                    MAX
                  </Button>
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.0"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <img
                  src={getTokenIcon(pool.tokenA.symbol)}
                  alt={pool.tokenA.symbol}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-sm font-medium">{pool.tokenA.symbol}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">??${valueA}</div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-muted">
              <ArrowUpDown className="w-4 h-4" />
            </div>
          </div>

          {/* Token B Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Amount {pool.tokenB.symbol}</label>
              {balanceB?.balance && (
                <div className="text-xs text-muted-foreground">
                  Balance: {balanceB.balance}
                  <Button variant="link" size="sm" className="h-auto p-0 ml-1" onClick={handleMaxB}>
                    MAX
                  </Button>
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.0"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <img
                  src={getTokenIcon(pool.tokenB.symbol)}
                  alt={pool.tokenB.symbol}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-sm font-medium">{pool.tokenB.symbol}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">??${valueB}</div>
          </div>

          {/* Pool Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pool Share</span>
              <span>{poolShare}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Value</span>
              <span>${totalValue}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Price Impact</span>
              <Badge variant={parseFloat(priceImpact) > 3 ? "destructive" : "secondary"}>
                {priceImpact}%
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Current APR</span>
              <Badge variant="secondary" className="text-green-600">{pool.apr}%</Badge>
            </div>
          </div>

          {/* Optimal Ratio Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="optimal-ratio"
                checked={isOptimalRatio}
                onChange={(e) => setIsOptimalRatio(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="optimal-ratio" className="text-sm font-medium">
                Maintain optimal ratio
              </label>
            </div>
            <div className="text-xs text-muted-foreground">
              Reserve Ratio: {pool.reserveA && pool.reserveB ? 
                (parseFloat(pool.reserveA) / parseFloat(pool.reserveB)).toFixed(6) : 'N/A'
              }
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
