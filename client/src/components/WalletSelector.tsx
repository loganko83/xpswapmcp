import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, ExternalLink } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletOption {
  id: 'metamask' | 'zigap';
  name: string;
  icon: string;
  description: string;
  downloadUrl: string;
  isInstalled: boolean;
}

export function WalletSelector({ isOpen, onClose }: WalletSelectorProps) {
  const { connectWallet, isConnecting } = useWeb3();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  // 지갑 설치 상태 확인
  const getWalletOptions = (): WalletOption[] => [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: '가장 인기 있는 이더리움 지갑',
      downloadUrl: 'https://metamask.io/download/',
      isInstalled: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
    },
    {
      id: 'zigap',
      name: 'ZIGAP',
      icon: '⚡',
      description: '차세대 DeFi 전용 지갑',
      downloadUrl: 'https://zigap.com/download',
      isInstalled: typeof window !== 'undefined' && !!window.zigap?.isZigap,
    },
  ];

  const handleWalletConnect = async (walletType: 'metamask' | 'zigap') => {
    setConnectingWallet(walletType);
    
    try {
      await connectWallet(walletType);
      onClose();
    } catch (error) {
      console.error(`Failed to connect to ${walletType}:`, error);
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleInstallWallet = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  const walletOptions = getWalletOptions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            지갑 선택
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <Card key={wallet.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{wallet.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{wallet.name}</h3>
                        {wallet.isInstalled && (
                          <Badge variant="secondary" className="text-xs">
                            설치됨
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {wallet.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {wallet.isInstalled ? (
                      <Button
                        size="sm"
                        onClick={() => handleWalletConnect(wallet.id)}
                        disabled={isConnecting || connectingWallet !== null}
                        className="min-w-[80px]"
                      >
                        {connectingWallet === wallet.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            연결중...
                          </>
                        ) : (
                          '연결'
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInstallWallet(wallet.downloadUrl)}
                        className="min-w-[80px]"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        설치
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          💡 지갑을 처음 사용하시나요? 각 지갑의 공식 웹사이트에서 안전하게 다운로드하세요.
        </div>
      </DialogContent>
    </Dialog>
  );
}
