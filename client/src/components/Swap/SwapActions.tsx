import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { Token, SwapQuote } from "@/types";

interface SwapActionsProps {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  swapQuote: SwapQuote | null;
  walletConnected: boolean;
  isXphereNetwork: boolean;
  requiresCrossChainBridge: boolean;
  isInsufficientBalance: boolean;
  isGettingQuote: boolean;
  isSwapping: boolean;
  slippage: number;
  onConnectWallet: () => void;
  onSwitchNetwork: () => void;
  onExecuteSwap: () => void;
}

export function SwapActions({
  fromToken,
  toToken,
  fromAmount,
  swapQuote,
  walletConnected,
  isXphereNetwork,
  requiresCrossChainBridge,
  isInsufficientBalance,
  isGettingQuote,
  isSwapping,
  slippage,
  onConnectWallet,
  onSwitchNetwork,
  onExecuteSwap
}: SwapActionsProps) {
  // Calculate minimum received amount
  const minimumReceived = swapQuote && fromAmount ? 
    (parseFloat(swapQuote.toAmount) * (1 - slippage / 100)).toFixed(6) : "0";

  // Calculate price impact
  const priceImpact = swapQuote?.priceImpact || 0;

  return (
    <div className="space-y-4">
      {/* Swap Details */}
      {swapQuote && fromAmount && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Rate:</span>
            <span className="font-medium">
              1 {fromToken.symbol} = {swapQuote.rate} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price Impact:</span>
            <span className={`font-medium ${priceImpact > 5 ? 'text-red-600' : priceImpact > 1 ? 'text-yellow-600' : 'text-green-600'}`}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Slippage Tolerance:</span>
            <span className="font-medium">{slippage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Minimum Received:</span>
            <span className="font-medium">
              {minimumReceived} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Network Fee:</span>
            <span className="font-medium">~{swapQuote.networkFee} XP</span>
          </div>
        </div>
      )}

      {/* Price Impact Warning */}
      {swapQuote && priceImpact > 5 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            High price impact ({priceImpact.toFixed(2)}%). You may want to reduce your trade size.
          </AlertDescription>
        </Alert>
      )}

      {/* Cross-chain Bridge Notice */}
      {requiresCrossChainBridge && (
        <Alert className="border-blue-200 bg-blue-50">
          <ExternalLink className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            This swap requires a cross-chain bridge. Please use the Bridge feature for cross-chain transfers.
          </AlertDescription>
        </Alert>
      )}

      {/* Insufficient Balance Warning */}
      {isInsufficientBalance && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Insufficient {fromToken.symbol} balance. You need at least {fromAmount} {fromToken.symbol}.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Button */}
      <div className="pt-2">
        {!walletConnected ? (
          <Button className="w-full" onClick={onConnectWallet}>
            Connect Wallet
          </Button>
        ) : !isXphereNetwork ? (
          <Button 
            className="w-full" 
            onClick={onSwitchNetwork}
            variant="outline"
          >
            Switch to Xphere Network
          </Button>
        ) : requiresCrossChainBridge ? (
          <Button className="w-full" disabled>
            Use Bridge for Cross-chain Transfer
          </Button>
        ) : isInsufficientBalance ? (
          <Button className="w-full" disabled>
            Insufficient Balance
          </Button>
        ) : !fromAmount || parseFloat(fromAmount) === 0 ? (
          <Button className="w-full" disabled>
            Enter Amount
          </Button>
        ) : isGettingQuote ? (
          <Button className="w-full" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Getting Quote...
          </Button>
        ) : isSwapping ? (
          <Button className="w-full" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Swapping...
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onExecuteSwap}
            disabled={!swapQuote}
          >
            Swap {fromToken.symbol} for {toToken.symbol}
          </Button>
        )}
      </div>

      {/* Network Info */}
      <div className="text-center text-xs text-gray-500">
        Trading on {isXphereNetwork ? 'Xphere' : 'Unknown'} Network
      </div>
    </div>
  );
}
