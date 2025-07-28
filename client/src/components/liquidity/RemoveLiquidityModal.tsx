import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useWeb3Context } from "@/contexts/Web3Context";
import { getTokenIcon } from "@/lib/tokenUtils";
import { RemoveLiquidityProps } from "./LiquidityPoolTypes";

import { getApiUrl } from "@/lib/apiUrl";
export function RemoveLiquidityModal({ pool, isOpen, onClose }: RemoveLiquidityProps) {
  const { wallet } = useWeb3Context();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [percentage, setPercentage] = useState("25");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const removeLiquidityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(getApiUrl("/api/remove-liquidity", {
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

  // Real AMM calculations for liquidity removal
  const calculateRemoveAmounts = (removePercentage: number) => {
    if (!pool.reserveA || !pool.reserveB || !pool.userLiquidity) return { amountA: "0", amountB: "0" };
    
    const reserveA = parseFloat(pool.reserveA);
    const reserveB = parseFloat(pool.reserveB);
    const userLPTokens = parseFloat(pool.userLiquidity);
    
    // Calculate user's share of the pool
    const totalLPSupply = parseFloat(pool.lpTokens) || 100000; // Mock total LP supply
    const userPoolShare = userLPTokens / totalLPSupply;
    
    // Calculate tokens to receive based on current pool reserves
    const userReserveA = reserveA * userPoolShare;
    const userReserveB = reserveB * userPoolShare;
    
    // Calculate amounts to remove based on percentage
    const removeAmountA = userReserveA * (removePercentage / 100);
    const removeAmountB = userReserveB * (removePercentage / 100);
    
    return {
      amountA: removeAmountA.toFixed(6),
      amountB: removeAmountB.toFixed(6)
    };
  };

  useEffect(() => {
    const removePercentage = parseFloat(percentage);
    const amounts = calculateRemoveAmounts(removePercentage);
    setAmountA(amounts.amountA);
    setAmountB(amounts.amountB);
  }, [percentage, pool.reserveA, pool.reserveB, pool.userLiquidity, pool.lpTokens]);

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
            
            {/* Token A */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <img
                  src={getTokenIcon(pool.tokenA.symbol)}
                  alt={pool.tokenA.symbol}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">{pool.tokenA.symbol}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{amountA}</div>
              </div>
            </div>
            
            {/* Token B */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <img
                  src={getTokenIcon(pool.tokenB.symbol)}
                  alt={pool.tokenB.symbol}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">{pool.tokenB.symbol}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{amountB}</div>
              </div>
            </div>
          </div>

          {/* Pool Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Your Pool Share</span>
              <span>{pool.userLiquidity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Pool TVL</span>
              <span>{pool.tvl}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pool APR</span>
              <span className="text-green-600">{pool.apr}%</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full" 
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
