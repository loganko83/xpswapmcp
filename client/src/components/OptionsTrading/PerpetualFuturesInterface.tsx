import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useWeb3Context } from "@/contexts/Web3Context";
import { TrendingUp, TrendingDown, Target, Zap, DollarSign, Shield, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getApiUrl } from "@/lib/apiUrl";
interface PerpetualContract {
  symbol: string;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  nextFundingTime: string;
  volume24h: number;
  openInterest: number;
  maxLeverage: number;
  minOrderSize: number;
  priceChange24h: number;
  priceChangePercent24h: number;
}

interface PerpetualPosition {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  leverage: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  margin: number;
  maintenanceMargin: number;
  marginRatio: number;
  fundingCost: number;
}

export function PerpetualFuturesInterface() {
  const { wallet } = useWeb3Context();
  const [activeTab, setActiveTab] = useState("trade");
  const [selectedContract, setSelectedContract] = useState("XP-PERP");
  const [orderSide, setOrderSide] = useState<'long' | 'short'>('long');
  const [orderSize, setOrderSize] = useState("");
  const [leverage, setLeverage] = useState([10]);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  // Fetch perpetual contracts
  const { data: contracts } = useQuery({
    queryKey: ["/api/perpetuals/contracts"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/perpetuals/contracts"));
      if (!response.ok) throw new Error("Failed to fetch contracts");
      return response.json();
    }
  });

  // Fetch user positions
  const { data: positions } = useQuery({
    queryKey: ["/api/perpetuals/positions", wallet?.address],
    queryFn: async () => {
      if (!wallet?.address) return [];
      const response = await fetch(getApiUrl(`/api/perpetuals/positions?address=${wallet.address}`));
      if (!response.ok) throw new Error("Failed to fetch positions");
      return response.json();
    },
    enabled: !!wallet?.address
  });

  // Fetch trading analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/perpetuals/analytics"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/perpetuals/analytics"));
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    }
  });

  const selectedContractData = contracts?.find((c: PerpetualContract) => c.symbol === selectedContract);

  const calculateLiquidationPrice = () => {
    if (!selectedContractData || !orderSize) return 0;
    
    const size = parseFloat(orderSize);
    const lev = leverage[0];
    const price = selectedContractData.markPrice;
    
    if (orderSide === 'long') {
      return price * (1 - 1/lev * 0.9); // 90% of margin
    } else {
      return price * (1 + 1/lev * 0.9);
    }
  };

  const calculateRequiredMargin = () => {
    if (!selectedContractData || !orderSize) return 0;
    const size = parseFloat(orderSize);
    const price = selectedContractData.markPrice;
    return (size * price) / leverage[0];
  };

  const handleTrade = async () => {
    if (!wallet?.address || !orderSize) {
      alert("Please fill in all fields and connect your wallet");
      return;
    }

    try {
      const response = await fetch(getApiUrl("/api/perpetuals/trade"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: wallet.address,
          symbol: selectedContract,
          side: orderSide,
          size: parseFloat(orderSize),
          leverage: leverage[0],
          orderType,
          limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined
        })
      });

      if (!response.ok) throw new Error("Trade failed");
      
      const result = await response.json();
      alert(`Perpetual order placed successfully! Transaction hash: ${result.txHash}`);
      
      // Reset form
      setOrderSize("");
      setLimitPrice("");
      setStopLoss("");
      setTakeProfit("");
    } catch (error) {
      console.error("Trading error:", error);
      alert("Trading failed. Please try again.");
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/perpetuals/close/${positionId}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: wallet.address })
      });

      if (!response.ok) throw new Error("Failed to close position");
      
      alert("Position closed successfully!");
    } catch (error) {
      console.error("Error closing position:", error);
      alert("Failed to close position. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Perpetual Futures</h1>
        <p className="text-muted-foreground">
          Trade with up to 100x leverage on perpetual futures contracts
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume (24h)</p>
                <p className="text-2xl font-bold">${analytics?.volume24h?.toLocaleString() || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Interest</p>
                <p className="text-2xl font-bold">${analytics?.openInterest?.toLocaleString() || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Traders</p>
                <p className="text-2xl font-bold">{analytics?.activeTraders || 0}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Long/Short Ratio</p>
                <p className="text-2xl font-bold">{analytics?.longShortRatio?.toFixed(2) || 0}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="markets">Markets</TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trading Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Place Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contract</label>
                  <Select value={selectedContract} onValueChange={setSelectedContract}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XP-PERP">XP-PERP</SelectItem>
                      <SelectItem value="XPS-PERP">XPS-PERP</SelectItem>
                      <SelectItem value="BTC-PERP">BTC-PERP</SelectItem>
                      <SelectItem value="ETH-PERP">ETH-PERP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={orderSide === 'long' ? 'default' : 'outline'}
                    onClick={() => setOrderSide('long')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Long
                  </Button>
                  <Button
                    variant={orderSide === 'short' ? 'default' : 'outline'}
                    onClick={() => setOrderSide('short')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Short
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Order Type</label>
                  <Select value={orderType} onValueChange={(value: 'market' | 'limit') => setOrderType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orderType === 'limit' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Limit Price</label>
                    <Input
                      type="number"
                      placeholder="Enter limit price"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Size (USD)</label>
                  <Input
                    type="number"
                    placeholder="Enter position size"
                    value={orderSize}
                    onChange={(e) => setOrderSize(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Leverage: {leverage[0]}x</label>
                  <Slider
                    value={leverage}
                    onValueChange={setLeverage}
                    max={selectedContractData?.maxLeverage || 100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1x</span>
                    <span>{selectedContractData?.maxLeverage || 100}x</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stop Loss</label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Take Profit</label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Order Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span>Required Margin:</span>
                    <span>${calculateRequiredMargin().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Liquidation Price:</span>
                    <span>${calculateLiquidationPrice().toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Funding Rate:</span>
                    <span>{selectedContractData?.fundingRate ? (selectedContractData.fundingRate * 100).toFixed(4) : 0}%</span>
                  </div>
                </div>

                <Button 
                  onClick={handleTrade} 
                  className="w-full"
                  disabled={!wallet?.isConnected}
                >
                  {!wallet?.isConnected ? "Connect Wallet" : `${orderSide === 'long' ? 'Buy/Long' : 'Sell/Short'}`}
                </Button>
              </CardContent>
            </Card>

            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Information</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedContractData ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{selectedContractData.symbol}</span>
                      <Badge variant={selectedContractData.priceChangePercent24h >= 0 ? 'default' : 'destructive'}>
                        {selectedContractData.priceChangePercent24h >= 0 ? '+' : ''}
                        {selectedContractData.priceChangePercent24h.toFixed(2)}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Mark Price</p>
                        <p className="font-medium text-lg">${selectedContractData.markPrice.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Index Price</p>
                        <p className="font-medium text-lg">${selectedContractData.indexPrice.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">24h Volume</p>
                        <p className="font-medium">${selectedContractData.volume24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Open Interest</p>
                        <p className="font-medium">${selectedContractData.openInterest.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Funding Rate</p>
                        <p className="font-medium">{(selectedContractData.fundingRate * 100).toFixed(4)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Funding</p>
                        <p className="font-medium">{new Date(selectedContractData.nextFundingTime).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Select a contract to view details</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {positions?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No open positions. Start trading to see your positions here.
                </p>
              ) : (
                <div className="space-y-4">
                  {positions?.map((position: PerpetualPosition) => (
                    <div key={position.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{position.symbol}</h3>
                          <Badge variant={position.side === 'long' ? 'default' : 'destructive'}>
                            {position.side.toUpperCase()} {position.leverage}x
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${position.unrealizedPnl.toFixed(2)}
                          </p>
                          <p className={`text-sm ${position.unrealizedPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({position.unrealizedPnlPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium">${position.size.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Entry Price</p>
                          <p className="font-medium">${position.entryPrice.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mark Price</p>
                          <p className="font-medium">${position.markPrice.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Liq. Price</p>
                          <p className="font-medium text-red-600">${position.liquidationPrice.toFixed(4)}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Margin Ratio: </span>
                          <span className={`font-medium ${position.marginRatio > 0.8 ? 'text-red-600' : 'text-green-600'}`}>
                            {(position.marginRatio * 100).toFixed(2)}%
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => closePosition(position.id)}
                        >
                          Close Position
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perpetual Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Contract</th>
                      <th className="text-left p-2">Mark Price</th>
                      <th className="text-left p-2">24h Change</th>
                      <th className="text-left p-2">24h Volume</th>
                      <th className="text-left p-2">Open Interest</th>
                      <th className="text-left p-2">Funding Rate</th>
                      <th className="text-left p-2">Max Leverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts?.map((contract: PerpetualContract) => (
                      <tr key={contract.symbol} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{contract.symbol}</td>
                        <td className="p-2">${contract.markPrice.toFixed(4)}</td>
                        <td className="p-2">
                          <span className={contract.priceChangePercent24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {contract.priceChangePercent24h >= 0 ? '+' : ''}
                            {contract.priceChangePercent24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className="p-2">${contract.volume24h.toLocaleString()}</td>
                        <td className="p-2">${contract.openInterest.toLocaleString()}</td>
                        <td className="p-2">{(contract.fundingRate * 100).toFixed(4)}%</td>
                        <td className="p-2">{contract.maxLeverage}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}