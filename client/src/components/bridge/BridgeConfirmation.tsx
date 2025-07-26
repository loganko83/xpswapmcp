import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeftRight, Globe } from "lucide-react";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { BridgeData } from "./types";

interface BridgeConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  bridgeData: BridgeData;
  onConfirm: () => void;
}

export function BridgeConfirmation({ isOpen, onClose, bridgeData, onConfirm }: BridgeConfirmationProps) {
  const { data: tokenPrices } = useTokenPrices([bridgeData.token.symbol]);
  const tokenPrice = tokenPrices?.[bridgeData.token.symbol]?.price || 0;
  const totalValue = (parseFloat(bridgeData.amount) * tokenPrice).toFixed(2);
  const feeValue = (parseFloat(bridgeData.fee) * tokenPrice).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Bridge Transaction</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Networks */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium">{bridgeData.fromNetwork.name}</div>
                <div className="text-sm text-muted-foreground">From</div>
              </div>
            </div>
            
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-medium">{bridgeData.toNetwork.name}</div>
                <div className="text-sm text-muted-foreground">To</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Amount</span>
              <div className="text-right">
                <div className="font-medium">{bridgeData.amount} {bridgeData.token.symbol}</div>
                <div className="text-sm text-muted-foreground">${totalValue}</div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span>Bridge Fee</span>
              <div className="text-right">
                <div className="font-medium">{bridgeData.fee} {bridgeData.token.symbol}</div>
                <div className="text-sm text-muted-foreground">${feeValue}</div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span>You'll Receive</span>
              <div className="text-right">
                <div className="font-medium">
                  {(parseFloat(bridgeData.amount) - parseFloat(bridgeData.fee)).toFixed(6)} {bridgeData.token.symbol}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${((parseFloat(bridgeData.amount) - parseFloat(bridgeData.fee)) * tokenPrice).toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span>Estimated Time</span>
              <div className="font-medium">{bridgeData.estimatedTime}</div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-orange-700 dark:text-orange-300">Important Notice</div>
                <div className="text-orange-600 dark:text-orange-400 mt-1">
                  Cross-chain transactions are irreversible. Please verify all details before proceeding.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onConfirm}>
              Confirm Bridge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
