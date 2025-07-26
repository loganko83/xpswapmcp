import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, TrendingUp, Zap } from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useQuery } from "@tanstack/react-query";
import { WalletSelector } from "@/components/WalletSelector";
import { AddLiquidityModal } from "./liquidity/AddLiquidityModal";
import { RemoveLiquidityModal } from "./liquidity/RemoveLiquidityModal";
import { PoolCard } from "./liquidity/PoolCard";
import { LiquidityPool } from "./liquidity/LiquidityPoolTypes";

export default function LiquidityPoolManager() {
  const { wallet } = useWeb3Context();
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [addLiquidityOpen, setAddLiquidityOpen] = useState(false);
  const [removeLiquidityOpen, setRemoveLiquidityOpen] = useState(false);

  const { data: pools, isLoading } = useQuery({
    queryKey: ["/api/pools"],
    enabled: !!wallet.address,
  });

  const handleAddLiquidity = (pool: LiquidityPool) => {
    setSelectedPool(pool);
    setAddLiquidityOpen(true);
  };

  const handleRemoveLiquidity = (pool: LiquidityPool) => {
    setSelectedPool(pool);
    setRemoveLiquidityOpen(true);
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Liquidity Pools</h2>
        <p className="text-muted-foreground mb-6">Connect your wallet to manage liquidity pools</p>
        <WalletSelector />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Liquidity Pools</h1>
          <p className="text-muted-foreground">Provide liquidity and earn fees from trades</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span>Active Pools: {pools?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Real-time AMM</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Pools</TabsTrigger>
          <TabsTrigger value="my-pools">My Positions</TabsTrigger>
          <TabsTrigger value="high-apr">High APR</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {pools?.map((pool: LiquidityPool) => (
            <PoolCard
              key={pool.id}
              pool={pool}
              onAddLiquidity={handleAddLiquidity}
              onRemoveLiquidity={handleRemoveLiquidity}
            />
          ))}
        </TabsContent>

        <TabsContent value="my-pools" className="space-y-4">
          {pools?.filter((pool: LiquidityPool) => parseFloat(pool.userLiquidity) > 0)
            .map((pool: LiquidityPool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                onAddLiquidity={handleAddLiquidity}
                onRemoveLiquidity={handleRemoveLiquidity}
              />
            ))}
        </TabsContent>

        <TabsContent value="high-apr" className="space-y-4">
          {pools?.filter((pool: LiquidityPool) => parseFloat(pool.apr) >= 50)
            .map((pool: LiquidityPool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                onAddLiquidity={handleAddLiquidity}
                onRemoveLiquidity={handleRemoveLiquidity}
              />
            ))}
        </TabsContent>
      </Tabs>

      {/* Add Liquidity Modal */}
      {selectedPool && (
        <AddLiquidityModal
          pool={selectedPool}
          isOpen={addLiquidityOpen}
          onClose={() => {
            setAddLiquidityOpen(false);
            setSelectedPool(null);
          }}
        />
      )}

      {/* Remove Liquidity Modal */}
      {selectedPool && (
        <RemoveLiquidityModal
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
