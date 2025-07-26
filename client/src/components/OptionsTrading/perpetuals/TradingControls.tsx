import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

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

interface TradingControlsProps {
  selectedContract: string;
  onContractChange: (contract: string) => void;
  contracts: PerpetualContract[];
  orderSide: 'long' | 'short';
  onOrderSideChange: (side: 'long' | 'short') => void;
  orderSize: string;
  onOrderSizeChange: (size: string) => void;
  leverage: number[];
  onLeverageChange: (leverage: number[]) => void;
  orderType: 'market' | 'limit';
  onOrderTypeChange: (type: 'market' | 'limit') => void;
  limitPrice: string;
  onLimitPriceChange: (price: string) => void;
  stopLoss: string;
  onStopLossChange: (price: string) => void;
  takeProfit: string;
  onTakeProfitChange: (price: string) => void;
  onExecuteTrade: () => void;
  wallet: any;
}

export function TradingControls({
  selectedContract,
  onContractChange,
  contracts,
  orderSide,
  onOrderSideChange,
  orderSize,
  onOrderSizeChange,
  leverage,
  onLeverageChange,
  orderType,
  onOrderTypeChange,
  limitPrice,
  onLimitPriceChange,
  stopLoss,
  onStopLossChange,
  takeProfit,
  onTakeProfitChange,
  onExecuteTrade,
  wallet
}: TradingControlsProps) {
  const selectedContractData = contracts?.find((c: PerpetualContract) => c.symbol === selectedContract);

  const calculateLiquidationPrice = () => {
    if (!selectedContractData || !orderSize) return 0;
    
    const size = parseFloat(orderSize);
    const lev = leverage[0];
    const price = selectedContractData.markPrice;
    
    if (orderSide === 'long') {
      return price * (1 - 1/lev * 0.9);
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

  const calculatePotentialPnl = () => {
    if (!selectedContractData || !orderSize || !limitPrice) return 0;
    const size = parseFloat(orderSize);
    const entry = orderType === 'market' ? selectedContractData.markPrice : parseFloat(limitPrice);
    const current = selectedContractData.markPrice;
    
    if (orderSide === 'long') {
      return size * (current - entry);
    } else {
      return size * (entry - current);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contract Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Select Contract
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedContract} onValueChange={onContractChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a perpetual contract" />
            </SelectTrigger>
            <SelectContent>
              {contracts?.map((contract) => (
                <SelectItem key={contract.symbol} value={contract.symbol}>
                  <div className="flex items-center justify-between w-full">
                    <span>{contract.symbol}</span>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm text-gray-600">
                        ${contract.markPrice.toFixed(6)}
                      </span>
                      <Badge 
                        variant={contract.priceChangePercent24h >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {contract.priceChangePercent24h >= 0 ? "+" : ""}
                        {contract.priceChangePercent24h.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedContractData && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Mark Price:</span>
                <span className="ml-2 font-medium">${selectedContractData.markPrice.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-600">Index Price:</span>
                <span className="ml-2 font-medium">${selectedContractData.indexPrice.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-600">Funding Rate:</span>
                <span className={`ml-2 font-medium ${selectedContractData.fundingRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(selectedContractData.fundingRate * 100).toFixed(4)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">24h Volume:</span>
                <span className="ml-2 font-medium">${selectedContractData.volume24h.toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Place Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Side Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={orderSide === 'long' ? "default" : "outline"}
              onClick={() => onOrderSideChange('long')}
              className={orderSide === 'long' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Long
            </Button>
            <Button
              variant={orderSide === 'short' ? "default" : "outline"}
              onClick={() => onOrderSideChange('short')}
              className={orderSide === 'short' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Short
            </Button>
          </div>

          {/* Order Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Order Type</label>
            <Select value={orderType} onValueChange={(value: 'market' | 'limit') => onOrderTypeChange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market Order</SelectItem>
                <SelectItem value="limit">Limit Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order Size */}
          <div>
            <label className="text-sm font-medium mb-2 block">Size (USD)</label>
            <Input
              type="number"
              placeholder="Enter order size"
              value={orderSize}
              onChange={(e) => onOrderSizeChange(e.target.value)}
            />
            {selectedContractData && (
              <p className="text-xs text-gray-600 mt-1">
                Min: ${selectedContractData.minOrderSize} | Max Leverage: {selectedContractData.maxLeverage}x
              </p>
            )}
          </div>

          {/* Leverage Slider */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Leverage: {leverage[0]}x
            </label>
            <Slider
              value={leverage}
              onValueChange={onLeverageChange}
              max={selectedContractData?.maxLeverage || 125}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1x</span>
              <span>{selectedContractData?.maxLeverage || 125}x</span>
            </div>
          </div>

          {/* Limit Price (if limit order) */}
          {orderType === 'limit' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Limit Price (USD)</label>
              <Input
                type="number"
                placeholder="Enter limit price"
                value={limitPrice}
                onChange={(e) => onLimitPriceChange(e.target.value)}
              />
            </div>
          )}

          {/* Stop Loss */}
          <div>
            <label className="text-sm font-medium mb-2 block">Stop Loss (USD) - Optional</label>
            <Input
              type="number"
              placeholder="Enter stop loss price"
              value={stopLoss}
              onChange={(e) => onStopLossChange(e.target.value)}
            />
          </div>

          {/* Take Profit */}
          <div>
            <label className="text-sm font-medium mb-2 block">Take Profit (USD) - Optional</label>
            <Input
              type="number"
              placeholder="Enter take profit price"
              value={takeProfit}
              onChange={(e) => onTakeProfitChange(e.target.value)}
            />
          </div>

          {/* Order Summary */}
          {orderSize && selectedContractData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Required Margin:</span>
                <span className="font-medium">${calculateRequiredMargin().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Liquidation Price:</span>
                <span className="font-medium text-red-600">
                  ${calculateLiquidationPrice().toFixed(6)}
                </span>
              </div>
              {orderType === 'limit' && limitPrice && (
                <div className="flex justify-between">
                  <span>Potential P&L:</span>
                  <span className={`font-medium ${calculatePotentialPnl() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculatePotentialPnl().toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Execute Button */}
          <Button
            onClick={onExecuteTrade}
            disabled={!wallet?.isConnected || !orderSize || (orderType === 'limit' && !limitPrice)}
            className={`w-full ${orderSide === 'long' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {!wallet?.isConnected ? 'Connect Wallet' : 
             orderSide === 'long' ? 'Open Long Position' : 'Open Short Position'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
