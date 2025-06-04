import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, TrendingUp, Clock, Shield, Zap } from "lucide-react";
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
              { name: "Xphere", logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png", status: "active" },
              { name: "Ethereum", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png", status: "active" },
              { name: "BNB Chain", logo: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png", status: "active" },
              { name: "Polygon", logo: "https://cryptologos.cc/logos/polygon-matic-logo.png", status: "active" },
              { name: "Avalanche", logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png", status: "active" }
            ].map((network) => (
              <div key={network.name} className="flex items-center gap-3 p-3 border rounded-lg">
                <img src={network.logo} alt={network.name} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-medium">{network.name}</div>
                  <Badge variant="secondary" className="text-green-600">
                    {network.status}
                  </Badge>
                </div>
              </div>
            ))}
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