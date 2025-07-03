import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, TrendingUp, Clock, Shield, Zap, Globe } from "lucide-react";
import { CrossChainBridge } from "@/components/CrossChainBridge";
import { useQuery } from "@tanstack/react-query";

export default function BridgePage() {
  // Fetch bridge statistics
  const { data: bridgeStats } = useQuery({
    queryKey: ["/api/bridge/stats"],
    queryFn: async () => {
      const response = await fetch("/api/bridge/stats");
      if (!response.ok) throw new Error("Failed to fetch bridge stats");
      return response.json();
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Cross-Chain Bridge</h1>
        <p className="text-muted-foreground">
          Transfer assets seamlessly between different blockchain networks
        </p>
        
        {/* LI.FI Integration Status */}
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">LI.FI Bridge Integration Active</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              40+ Networks Supported
            </Badge>
          </div>
          <p className="text-sm text-green-700">
            Connected to the largest bridge aggregator supporting Ethereum, BSC, Polygon, Arbitrum, Optimism, 
            and 35+ additional blockchains for seamless cross-chain asset transfers.
          </p>
        </div>
      </div>

      {/* Bridge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Bridged</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">$42.8M</div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              +18.5%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">24h Volume</span>
              <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">$3.2M</div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              +12.3%
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Avg Time</span>
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">8m 30s</div>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              Fast
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
              <Shield className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">99.8%</div>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Reliable
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Supported Networks */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Supported Networks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: "Xphere", chainId: 20250217, status: "active" },
              { name: "Ethereum", chainId: 1, status: "active" },
              { name: "BNB Chain", chainId: 56, status: "active" },
              { name: "Polygon", chainId: 137, status: "active" },
              { name: "Avalanche", chainId: 43114, status: "active" }
            ].map((network) => {
              const NetworkIcon = ({ chainId, name }: { chainId: number; name: string }) => {
                const [hasError, setHasError] = useState(false);
                const logoMap: { [key: number]: string } = {
                  1: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                  56: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
                  137: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
                  43114: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
                  20250217: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png"
                };
                
                if (hasError) {
                  return <Globe className="w-8 h-8 text-muted-foreground" />;
                }
                
                return (
                  <img 
                    src={logoMap[chainId]} 
                    alt={name} 
                    className="w-8 h-8 rounded-full" 
                    onError={() => setHasError(true)}
                  />
                );
              };
              
              return (
                <div key={network.name} className="flex items-center gap-3 p-3 border rounded-lg">
                  <NetworkIcon chainId={network.chainId} name={network.name} />
                  <div>
                    <div className="font-medium">{network.name}</div>
                    <Badge variant="secondary" className="text-green-600">
                      {network.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bridge Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold">Fast Transfers</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Cross-chain transfers completed in 1-15 minutes depending on network confirmations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Secure Protocol</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Multi-signature validation and time-locked contracts ensure maximum security
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold">Low Fees</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Competitive bridge fees starting from 0.1% with dynamic pricing based on network costs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cross-Chain Bridge Component */}
      <CrossChainBridge />
    </div>
  );
}