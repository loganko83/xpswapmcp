import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Zap, 
  Target, 
  TrendingUp, 
  DollarSign, 
  ArrowRight, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface YieldOpportunity {
  id: string;
  protocol: string;
  type: "staking" | "liquidity" | "farming" | "lending";
  tokenPair: string;
  currentAPY: number;
  optimizedAPY: number;
  improvement: number;
  risk: "low" | "medium" | "high";
  tvl: string;
  autoCompound: boolean;
  description: string;
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  expectedImprovement: number;
  estimatedGas: string;
  timeframe: string;
  complexity: "simple" | "moderate" | "complex";
  enabled: boolean;
}

export function YieldOptimization() {
  const { wallet } = useWeb3Context();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  // Fetch yield optimization data
  const { data: yieldData, isLoading } = useQuery({
    queryKey: ["/api/yield/opportunities", wallet.address],
    enabled: !!wallet.address,
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Fetch optimization strategies
  const { data: strategies } = useQuery({
    queryKey: ["/api/yield/strategies", wallet.address],
    enabled: !!wallet.address,
  });

  // Fetch user's current positions
  const { data: currentPositions } = useQuery({
    queryKey: ["/api/yield/positions", wallet.address],
    enabled: !!wallet.address,
  });

  // Execute optimization
  const optimizeMutation = useMutation({
    mutationFn: async (strategyId: string) => {
      return apiRequest(`/api/yield/optimize`, {
        method: "POST",
        body: JSON.stringify({
          strategyId,
          userAddress: wallet.address,
          autoCompound: autoOptimize
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Optimization Executed",
        description: "Your yield optimization has been successfully executed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/yield/positions"] });
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleOptimize = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    optimizeMutation.mutate(strategyId);
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Connect your wallet to access yield optimization</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Optimization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Potential Improvement</p>
                <p className="text-2xl font-bold">+{yieldData?.totalImprovement || "0"}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Additional Annual Yield</p>
                <p className="text-2xl font-bold">${yieldData?.additionalYield || "0"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Auto-Compound Boost</p>
                <p className="text-2xl font-bold">+{yieldData?.compoundBoost || "0"}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5" />
            <span>Auto-Optimization Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-optimize"
              checked={autoOptimize}
              onCheckedChange={setAutoOptimize}
            />
            <Label htmlFor="auto-optimize">
              Enable automatic yield optimization and compounding
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Automatically optimize your positions when better opportunities arise (gas costs apply)
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="positions">Current Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading optimization opportunities...</div>
            ) : (
              (yieldData?.opportunities || []).map((opportunity: YieldOpportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{opportunity.protocol}</CardTitle>
                          <p className="text-sm text-muted-foreground">{opportunity.tokenPair} • {opportunity.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskBadge(opportunity.risk)}>
                          {opportunity.risk} risk
                        </Badge>
                        <Badge variant="outline">TVL: {opportunity.tvl}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-muted-foreground">
                            {opportunity.currentAPY}%
                          </div>
                          <div className="text-sm text-muted-foreground">Current APY</div>
                        </div>
                        <div className="flex items-center justify-center">
                          <ArrowRight className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            {opportunity.optimizedAPY}%
                          </div>
                          <div className="text-sm text-muted-foreground">Optimized APY</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Improvement</span>
                          <span className="text-lg font-bold text-green-500">
                            +{opportunity.improvement}%
                          </span>
                        </div>
                        <Progress value={opportunity.improvement} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {opportunity.autoCompound && (
                            <div className="flex items-center space-x-1 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Auto-compound</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleOptimize(opportunity.id)}
                          disabled={optimizeMutation.isPending && selectedStrategy === opportunity.id}
                          className="flex items-center space-x-2"
                        >
                          {optimizeMutation.isPending && selectedStrategy === opportunity.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Optimizing...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              <span>Optimize</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="space-y-4">
            {(strategies || []).map((strategy: OptimizationStrategy) => (
              <Card key={strategy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <Badge variant={strategy.enabled ? "default" : "outline"}>
                      {strategy.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Expected Improvement</span>
                        <div className="font-medium text-green-500">+{strategy.expectedImprovement}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gas Cost</span>
                        <div className="font-medium">{strategy.estimatedGas}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Frequency</span>
                        <div className="font-medium">{strategy.timeframe}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Complexity</span>
                        <div className="font-medium capitalize">{strategy.complexity}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={strategy.id}
                          checked={strategy.enabled}
                          onCheckedChange={(checked) => {
                            // Handle strategy toggle
                            toast({
                              title: `Strategy ${checked ? 'Enabled' : 'Disabled'}`,
                              description: `${strategy.name} has been ${checked ? 'enabled' : 'disabled'}.`,
                            });
                          }}
                        />
                        <Label htmlFor={strategy.id}>Enable Strategy</Label>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <div className="space-y-4">
            {(currentPositions || []).map((position: any) => (
              <Card key={position.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{position.protocol}</CardTitle>
                        <p className="text-sm text-muted-foreground">{position.tokenPair} • {position.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{position.currentAPY}%</div>
                      <div className="text-sm text-muted-foreground">Current APY</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Staked Amount</div>
                      <div className="text-lg font-bold">{position.amount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Earned</div>
                      <div className="text-lg font-bold text-green-500">{position.earned}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Compound</div>
                      <div className="text-lg font-bold">{position.lastCompound}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      {position.autoCompound ? (
                        <div className="flex items-center space-x-1 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Auto-compound active</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-sm text-yellow-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Manual compound needed</span>
                        </div>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        Compound
                      </Button>
                      <Button size="sm">
                        Optimize
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}