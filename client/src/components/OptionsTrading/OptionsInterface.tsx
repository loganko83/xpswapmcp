import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWeb3Context } from "@/contexts/Web3Context";
import { TrendingUp, TrendingDown, Clock, DollarSign, AlertTriangle, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  validateOptionTrade, 
  calculateMarginRequirement,
  generateAntiMEVParams,
  detectPriceManipulation 
} from "@/utils/optionsSecurity";

import { getApiUrl } from "@/lib/apiUrl";
interface OptionContract {
  id: string;
  type: 'call' | 'put';
  underlying: string;
  strikePrice: number;
  expiryDate: string;
  premium: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  theta: number;
  gamma: number;
  vega: number;
}

interface OptionPosition {
  id: string;
  contract: OptionContract;
  position: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
}

export function OptionsInterface() {
  const { wallet } = useWeb3Context();
  const [activeTab, setActiveTab] = useState("trade");
  const [selectedUnderlying, setSelectedUnderlying] = useState("XP");
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [strikePrice, setStrikePrice] = useState("");
  const [expiry, setExpiry] = useState("");
  const [quantity, setQuantity] = useState("");
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');

  // Fetch available option contracts
  const { data: optionContracts } = useQuery({
    queryKey: ["/api/options/contracts", selectedUnderlying],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/options/contracts?underlying=${selectedUnderlying}`);
      if (!response.ok) throw new Error("Failed to fetch option contracts");
      return response.json();
    }
  });

  // Fetch user positions
  const { data: userPositions } = useQuery({
    queryKey: ["/api/options/positions", wallet?.address],
    queryFn: async () => {
      if (!wallet?.address) return [];
      const response = await fetch(getApiUrl(`/api/options/positions?address=${wallet.address}`);
      if (!response.ok) throw new Error("Failed to fetch positions");
      return response.json();
    },
    enabled: !!wallet?.address
  });

  // Fetch option analytics
  const { data: optionAnalytics } = useQuery({
    queryKey: ["/api/options/analytics"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/options/analytics");
      if (!response.ok) throw new Error("Failed to fetch option analytics");
      return response.json();
    }
  });

  const handleTrade = async () => {
    if (!wallet?.address || !strikePrice || !expiry || !quantity) {
      alert("Please fill in all fields and connect your wallet");
      return;
    }

    try {
      // Get current spot price and oracle data
      const priceResponse = await fetch(getApiUrl(`/api/price/${selectedUnderlying}`);
      const priceData = await priceResponse.json();
      const spotPrice = priceData.price;
      
      // Get liquidity data
      const liquidityResponse = await fetch(getApiUrl(`/api/options/liquidity/${selectedUnderlying}`);
      const liquidityData = await liquidityResponse.json();
      const totalLiquidity = liquidityData.totalLiquidity || 100000; // Default fallback
      
      // Calculate time to expiry
      const expiryTimestamp = new Date(expiry).getTime() / 1000;
      const currentTimestamp = Date.now() / 1000;
      const timeToExpiry = expiryTimestamp - currentTimestamp;
      
      // Security validation
      const securityCheck = validateOptionTrade(
        parseFloat(strikePrice),
        spotPrice,
        0.5, // Implied volatility - should be fetched from oracle
        timeToExpiry,
        parseFloat(quantity),
        totalLiquidity
      );
      
      if (!securityCheck.isValid) {
        alert(`Security validation failed:\n${securityCheck.errors.join('\n')}`);
        return;
      }
      
      if (securityCheck.warnings.length > 0) {
        const proceed = confirm(
          `Security warnings detected:\n${securityCheck.warnings.join('\n')}\n\nRisk Score: ${securityCheck.riskScore}/100\n\nDo you want to proceed?`
        );
        if (!proceed) return;
      }
      
      // Calculate margin requirement
      const marginRequired = calculateMarginRequirement(
        optionType,
        parseFloat(strikePrice),
        spotPrice,
        parseFloat(quantity),
        0.5 // Implied volatility
      );
      
      // Get anti-MEV parameters
      const antiMEVParams = generateAntiMEVParams(spotPrice, orderType === 'buy');
      
      const response = await fetch(getApiUrl("/api/options/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: wallet.address,
          underlying: selectedUnderlying,
          type: optionType,
          strikePrice: parseFloat(strikePrice),
          expiry,
          quantity: parseFloat(quantity),
          orderType,
          marginRequired,
          antiMEVParams,
          securityCheck: {
            riskScore: securityCheck.riskScore,
            warnings: securityCheck.warnings
          }
        })
      });

      if (!response.ok) throw new Error("Trade failed");
      
      const result = await response.json();
      alert(`Option ${orderType} order placed successfully!\nTransaction hash: ${result.txHash}\nMargin locked: $${marginRequired.toFixed(2)}`);
      
      // Reset form
      setStrikePrice("");
      setExpiry("");
      setQuantity("");
    } catch (error) {
      console.error("Trading error:", error);
      alert("Trading failed. Please try again.");
    }
  };

  const calculateOptionPrice = (contract: OptionContract, currentPrice: number) => {
    // Black-Scholes 모델 간단 구현
    const timeToExpiry = (new Date(contract.expiryDate).getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000);
    const moneyness = currentPrice / contract.strikePrice;
    
    if (contract.type === 'call') {
      return Math.max(0, currentPrice - contract.strikePrice) + (contract.impliedVolatility * Math.sqrt(timeToExpiry) * currentPrice * 0.4);
    } else {
      return Math.max(0, contract.strikePrice - currentPrice) + (contract.impliedVolatility * Math.sqrt(timeToExpiry) * currentPrice * 0.4);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Options Trading</h1>
        <p className="text-muted-foreground">
          Trade advanced options contracts with sophisticated risk management
        </p>
      </div>

      {/* Options Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume (24h)</p>
                <p className="text-2xl font-bold">${optionAnalytics?.volume24h?.toLocaleString() || 0}</p>
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
                <p className="text-2xl font-bold">${optionAnalytics?.openInterest?.toLocaleString() || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold">{optionAnalytics?.activeContracts || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg IV</p>
                <p className="text-2xl font-bold">{optionAnalytics?.avgImpliedVolatility?.toFixed(1) || 0}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trade">Trade Options</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
          <TabsTrigger value="chain">Option Chain</TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Create Option Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Underlying Asset</label>
                  <Select value={selectedUnderlying} onValueChange={setSelectedUnderlying}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XP">XP Token</SelectItem>
                      <SelectItem value="XPS">XPS Token</SelectItem>
                      <SelectItem value="BTC">Bitcoin</SelectItem>
                      <SelectItem value="ETH">Ethereum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Option Type</label>
                  <Select value={optionType} onValueChange={(value: 'call' | 'put') => setOptionType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call Option</SelectItem>
                      <SelectItem value="put">Put Option</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Strike Price</label>
                  <Input
                    type="number"
                    placeholder="Enter strike price"
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry Date</label>
                  <Input
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Order Type</label>
                  <Select value={orderType} onValueChange={(value: 'buy' | 'sell') => setOrderType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy to Open</SelectItem>
                      <SelectItem value="sell">Sell to Open</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleTrade} 
                className="w-full"
                disabled={!wallet?.isConnected}
              >
                {!wallet?.isConnected ? "Connect Wallet" : `${orderType} Option`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Option Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {userPositions?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No option positions found. Start trading to see your positions here.
                </p>
              ) : (
                <div className="space-y-4">
                  {userPositions?.map((position: OptionPosition) => (
                    <div key={position.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">
                            {position.contract.underlying} {position.contract.strikePrice} {position.contract.type.toUpperCase()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Expires: {new Date(position.contract.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={position.position === 'long' ? 'default' : 'destructive'}>
                          {position.position.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{position.quantity}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Entry Price</p>
                          <p className="font-medium">${position.entryPrice.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Price</p>
                          <p className="font-medium">${position.currentPrice.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">P&L</p>
                          <p className={`font-medium ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${position.pnl.toFixed(2)} ({position.pnlPercentage.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Option Chain - {selectedUnderlying}</CardTitle>
            </CardHeader>
            <CardContent>
              {optionContracts?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No option contracts available for {selectedUnderlying}.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Strike</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Premium</th>
                        <th className="text-left p-2">Volume</th>
                        <th className="text-left p-2">OI</th>
                        <th className="text-left p-2">IV</th>
                        <th className="text-left p-2">Delta</th>
                        <th className="text-left p-2">Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionContracts?.map((contract: OptionContract) => (
                        <tr key={contract.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">${contract.strikePrice}</td>
                          <td className="p-2">
                            <Badge variant={contract.type === 'call' ? 'default' : 'destructive'}>
                              {contract.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-2">${contract.premium.toFixed(4)}</td>
                          <td className="p-2">{contract.volume.toLocaleString()}</td>
                          <td className="p-2">{contract.openInterest.toLocaleString()}</td>
                          <td className="p-2">{(contract.impliedVolatility * 100).toFixed(1)}%</td>
                          <td className="p-2">{contract.delta.toFixed(3)}</td>
                          <td className="p-2">{new Date(contract.expiryDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}