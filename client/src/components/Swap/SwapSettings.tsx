import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SwapSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: number;
  customSlippage: string;
  onSlippageChange: (value: number) => void;
  onCustomSlippageChange: (value: string) => void;
}

export function SwapSettings({
  isOpen,
  onClose,
  slippage,
  customSlippage,
  onSlippageChange,
  onCustomSlippageChange
}: SwapSettingsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Slippage Tolerance</label>
            <div className="grid grid-cols-4 gap-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <Button
                  key={value}
                  variant={slippage === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    onSlippageChange(value);
                    onCustomSlippageChange("");
                  }}
                >
                  {value}%
                </Button>
              ))}
              <div className="relative">
                <Input
                  placeholder="Custom"
                  value={customSlippage}
                  onChange={(e) => {
                    const value = e.target.value;
                    onCustomSlippageChange(value);
                    if (value && !isNaN(parseFloat(value))) {
                      onSlippageChange(parseFloat(value));
                    }
                  }}
                  className="text-xs"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                />
                {customSlippage && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your transaction will revert if the price changes unfavorably by more than this percentage.
            </p>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Transaction Details</label>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Slippage:</span>
                <span className="font-medium">{slippage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">Xphere</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Fee:</span>
                <span className="font-medium">~0.01 XP</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
