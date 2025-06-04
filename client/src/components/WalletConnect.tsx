import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, ExternalLink, AlertTriangle } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";

interface WalletConnectProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnect({ isOpen, onClose }: WalletConnectProps) {
  const { connectWallet, isConnecting, error } = useWeb3();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleConnect = async (walletType: string) => {
    setSelectedWallet(walletType);
    
    try {
      if (walletType === "metamask") {
        await connectWallet();
        onClose();
      } else {
        // Mock for other wallets
        alert(`${walletType} integration coming soon!`);
      }
    } catch (err) {
      console.error("Connection failed:", err);
    } finally {
      setSelectedWallet(null);
    }
  };

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Connect using MetaMask wallet",
      icon: <Wallet className="w-6 h-6" />,
      available: typeof window !== "undefined" && typeof window.ethereum !== "undefined",
    },
    {
      id: "zigap",
      name: "ZIGAP Wallet",
      description: "Connect using ZIGAP wallet",
      icon: <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">Z</div>,
      available: false,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Connect using WalletConnect protocol",
      icon: <ExternalLink className="w-6 h-6" />,
      available: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="w-full justify-between p-4 h-auto"
                onClick={() => handleConnect(wallet.id)}
                disabled={!wallet.available || isConnecting || selectedWallet === wallet.id}
              >
                <div className="flex items-center space-x-3">
                  {wallet.icon}
                  <div className="text-left">
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {wallet.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!wallet.available && (
                    <span className="text-xs text-muted-foreground">Coming Soon</span>
                  )}
                  {selectedWallet === wallet.id && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </Button>
            ))}
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Network Setup Required</p>
              <p className="text-sm">
                You'll need to add Xphere network (Chain ID: 20250217) to your wallet to use XpSwap.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
