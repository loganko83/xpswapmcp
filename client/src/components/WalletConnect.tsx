import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, ExternalLink, AlertTriangle, Smartphone } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { MobileMetaMaskHandler } from "./MobileMetaMaskHandler";

interface WalletConnectProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnect({ isOpen, onClose }: WalletConnectProps) {
  const { connectWallet, isConnecting, error } = useWeb3();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showMobileHandler, setShowMobileHandler] = useState(false);

  // Check if user is on mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleConnect = async (walletType: string) => {
    setSelectedWallet(walletType);
    
    try {
      if (walletType === "metamask") {
        // Check if mobile user and show mobile handler
        if (isMobile()) {
          setShowMobileHandler(true);
          onClose();
          return;
        }
        
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

  const handleMobileConnected = () => {
    setShowMobileHandler(false);
  };

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Connect using MetaMask wallet",
      icon: <Wallet className="w-6 h-6" />,
      available: typeof window !== "undefined" && typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask,
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
    <>
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

            {/* Mobile notification */}
            {isMobile() && (
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">모바일 사용자</p>
                  <p className="text-sm">
                    모바일에서 MetaMask를 사용하시는 경우, 최적화된 연결 방법을 제공합니다.
                  </p>
                </AlertDescription>
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
                      <div className="font-medium flex items-center gap-2">
                        {wallet.name}
                        {wallet.id === 'metamask' && isMobile() && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            모바일 최적화
                          </span>
                        )}
                      </div>
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

      {/* Mobile MetaMask Handler */}
      <MobileMetaMaskHandler
        isOpen={showMobileHandler}
        onClose={() => setShowMobileHandler(false)}
        onConnected={handleMobileConnected}
      />
    </>
  );
}
