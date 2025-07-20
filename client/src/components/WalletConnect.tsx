import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  ExternalLink, 
  AlertTriangle, 
  Smartphone, 
  CheckCircle,
  Copy,
  Wifi,
  WifiOff,
  Loader2
} from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { MobileMetaMaskHandler } from "./MobileMetaMaskHandler";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnect({ isOpen, onClose }: WalletConnectProps) {
  const { wallet, connectWallet, disconnectWallet, isConnecting, error, isXphereNetwork, switchToXphere } = useWeb3();
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showMobileHandler, setShowMobileHandler] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Check if user is on mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Update connection status based on wallet state
  useEffect(() => {
    if (wallet.isConnected) {
      setConnectionStatus('connected');
    } else if (isConnecting) {
      setConnectionStatus('connecting');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [wallet.isConnected, isConnecting]);

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
        
        await connectWallet('metamask');
        
        toast({
          title: "✅ 연결 성공",
          description: "MetaMask가 성공적으로 연결되었습니다!",
          variant: "default",
        });
        
        onClose();
      } else if (walletType === "zigap") {
        await connectWallet('zigap');
        
        toast({
          title: "✅ 연결 성공",
          description: "ZIGAP 지갑이 성공적으로 연결되었습니다!",
          variant: "default",
        });
        
        onClose();
      } else {
        // Mock for other wallets
        toast({
          title: "🚧 개발 중",
          description: `${walletType} 연동을 준비 중입니다!`,
          variant: "default",
        });
      }
    } catch (err: any) {
      console.error("Connection failed:", err);
      toast({
        title: "❌ 연결 실패",
        description: err.message || "지갑 연결에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setSelectedWallet(null);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "🔌 연결 해제",
      description: "지갑 연결이 해제되었습니다.",
      variant: "default",
    });
    onClose();
  };

  const handleMobileConnected = () => {
    setShowMobileHandler(false);
    onClose();
  };

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "📋 복사 완료",
        description: "지갑 주소가 클립보드에 복사되었습니다.",
        variant: "default",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "가장 인기 있는 Web3 지갑",
      icon: (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
      ),
      available: typeof window !== "undefined" && typeof window.ethereum !== "undefined",
      recommended: true,
    },
    {
      id: "zigap",
      name: "ZIGAP Wallet",
      description: "Xphere 네트워크 전용 지갑",
      icon: (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
          Z
        </div>
      ),
      available: true, // ZIGAP 지갑 활성화
      comingSoon: false,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "다양한 모바일 지갑 지원",
      icon: (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
          <ExternalLink className="w-5 h-5 text-white" />
        </div>
      ),
      available: false,
      comingSoon: true,
    },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-w-[95vw]">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {wallet.isConnected ? "지갑 정보" : "지갑 연결"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Connection Status */}
            {wallet.isConnected ? (
              <div className="space-y-4">
                {/* Connected Wallet Info */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">연결됨</span>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {wallet.walletType === 'metamask' ? 'MetaMask' : wallet.walletType === 'zigap' ? 'ZIGAP' : '연결됨'}
                    </Badge>
                  </div>
                  
                  {/* Address Display */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">주소:</span>
                    <code className="bg-white px-2 py-1 rounded text-sm border">
                      {formatAddress(wallet.address || "")}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Balance Display */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">잔액:</span>
                    <span className="font-mono text-sm">
                      {parseFloat(wallet.balance).toFixed(4)} XP
                    </span>
                  </div>
                </div>

                {/* Network Status */}
                <div className={`border rounded-xl p-4 ${
                  isXphereNetwork 
                    ? "bg-blue-50 border-blue-200" 
                    : "bg-yellow-50 border-yellow-300"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isXphereNetwork ? (
                        <Wifi className="w-5 h-5 text-blue-600" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-yellow-600" />
                      )}
                      <span className={`font-medium ${
                        isXphereNetwork ? "text-blue-800" : "text-yellow-800"
                      }`}>
                        {isXphereNetwork ? "Xphere 네트워크" : "네트워크 전환 필요"}
                      </span>
                    </div>
                    
                    {!isXphereNetwork && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={switchToXphere}
                        className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                      >
                        전환하기
                      </Button>
                    )}
                  </div>
                  
                  {!isXphereNetwork && (
                    <p className="text-sm text-yellow-700 mt-2">
                      XpSwap을 사용하려면 Xphere 네트워크로 전환해주세요.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    연결 해제
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    확인
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="border-red-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Mobile notification */}
                {isMobile() && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <p className="font-medium mb-1 text-blue-800">모바일 사용자</p>
                      <p className="text-sm text-blue-700">
                        모바일에서 MetaMask를 사용하시는 경우, 최적화된 연결 방법을 제공합니다.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Wallet Options */}
                <div className="space-y-3">
                  {walletOptions.map((wallet) => (
                    <Button
                      key={wallet.id}
                      variant="outline"
                      className={`w-full justify-between p-4 h-auto border-2 transition-all duration-200 ${
                        wallet.available 
                          ? "hover:border-blue-300 hover:bg-blue-50" 
                          : "opacity-60"
                      } ${selectedWallet === wallet.id ? "border-blue-400 bg-blue-50" : ""}`}
                      onClick={() => wallet.available && handleConnect(wallet.id)}
                      disabled={!wallet.available || isConnecting || selectedWallet === wallet.id}
                    >
                      <div className="flex items-center space-x-3">
                        {wallet.icon}
                        <div className="text-left">
                          <div className="font-medium flex items-center gap-2">
                            {wallet.name}
                            {wallet.recommended && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                추천
                              </Badge>
                            )}
                            {wallet.id === 'metamask' && isMobile() && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                모바일 최적화
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {wallet.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {wallet.comingSoon && (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            준비 중
                          </Badge>
                        )}
                        {selectedWallet === wallet.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Network Setup Alert */}
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <p className="font-medium mb-1 text-orange-800">네트워크 설정 안내</p>
                    <p className="text-sm text-orange-700">
                      XpSwap을 사용하려면 Xphere 네트워크 (Chain ID: 20250217)를 
                      지갑에 추가해야 합니다. 연결 시 자동으로 안내됩니다.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            )}
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