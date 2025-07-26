import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ChevronDown, Settings } from "lucide-react";
import { Token } from "@/types";
import { getTokenIcon } from "@/lib/tokenUtils";

interface SwapPanelProps {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  fromTokenBalance: string;
  toTokenBalanceAmount: string;
  fromAmountUSD: string;
  toAmountUSD: string;
  pricesLoading: boolean;
  onFromAmountChange: (amount: string) => void;
  onToAmountChange: (amount: string) => void;
  onSwapTokens: () => void;
  onOpenFromSelector: () => void;
  onOpenToSelector: () => void;
  onOpenSettings: () => void;
  onMaxClick: () => void;
  walletConnected: boolean;
}

export function SwapPanel({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  fromTokenBalance,
  toTokenBalanceAmount,
  fromAmountUSD,
  toAmountUSD,
  pricesLoading,
  onFromAmountChange,
  onToAmountChange,
  onSwapTokens,
  onOpenFromSelector,
  onOpenToSelector,
  onOpenSettings,
  onMaxClick,
  walletConnected
}: SwapPanelProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Swap
          <Button variant="ghost" size="sm" onClick={onOpenSettings}>
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">From</span>
            {walletConnected && (
              <span className="text-gray-500">
                Balance: {fromTokenBalance} {fromToken.symbol}
              </span>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => onFromAmountChange(e.target.value)}
                className="border-0 bg-transparent text-2xl font-medium p-0 h-auto focus-visible:ring-0"
                disabled={pricesLoading}
              />
              <div className="flex items-center gap-2">
                {walletConnected && parseFloat(fromTokenBalance) > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onMaxClick}
                    className="text-xs h-6 px-2"
                  >
                    MAX
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={onOpenFromSelector}
                  className="flex items-center gap-2 h-10"
                >
                  <img
                    src={getTokenIcon(fromToken.symbol)}
                    alt={fromToken.name}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <span className="font-medium">{fromToken.symbol}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {fromAmount && (
              <div className="text-sm text-gray-500">
                ≈ ${fromAmountUSD}
              </div>
            )}
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={onSwapTokens}
            className="rounded-full w-10 h-10 p-0 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">To</span>
            {walletConnected && (
              <span className="text-gray-500">
                Balance: {toTokenBalanceAmount} {toToken.symbol}
              </span>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                onChange={(e) => onToAmountChange(e.target.value)}
                className="border-0 bg-transparent text-2xl font-medium p-0 h-auto focus-visible:ring-0"
                disabled={pricesLoading}
                readOnly
              />
              <Button
                variant="outline"
                onClick={onOpenToSelector}
                className="flex items-center gap-2 h-10"
              >
                <img
                  src={getTokenIcon(toToken.symbol)}
                  alt={toToken.name}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <span className="font-medium">{toToken.symbol}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            {toAmount && (
              <div className="text-sm text-gray-500">
                ≈ ${toAmountUSD}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
