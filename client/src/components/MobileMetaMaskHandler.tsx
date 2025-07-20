import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Smartphone, 
  Download, 
  ExternalLink, 
  Wallet, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MobileMetaMaskHandlerProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export function MobileMetaMaskHandler({ isOpen, onClose, onConnected }: MobileMetaMaskHandlerProps) {
  const { toast } = useToast();
  const [connectionStep, setConnectionStep] = useState<'detect' | 'install' | 'connect' | 'connected'>('detect');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [userAgent, setUserAgent] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserAgent(navigator.userAgent);
      checkMetaMaskInstallation();
    }
  }, []);

  const checkMetaMaskInstallation = () => {
    const hasMetaMask = typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    setIsMetaMaskInstalled(hasMetaMask);
    
    if (hasMetaMask) {
      setConnectionStep('connect');
    } else {
      setConnectionStep('install');
    }
  };

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(userAgent);
  };

  const isAndroid = () => {
    return /Android/.test(userAgent);
  };

  const handleInstallMetaMask = () => {
    let downloadUrl = '';
    
    if (isIOS()) {
      downloadUrl = 'https://apps.apple.com/app/metamask/id1438144202';
    } else if (isAndroid()) {
      downloadUrl = 'https://play.google.com/store/apps/details?id=io.metamask';
    } else {
      downloadUrl = 'https://metamask.io/download/';
    }
    
    window.open(downloadUrl, '_blank');
    
    toast({
      title: "📲 앱 스토어로 이동",
      description: "MetaMask 앱을 설치한 후 다시 시도해주세요.",
      variant: "default",
    });
  };

  const handleOpenInMetaMask = () => {
    setIsConnecting(true);
    
    const currentUrl = window.location.href;
    const metamaskDeepLink = `https://metamask.app.link/dapp/${window.location.host}`;
    
    // Try to open in MetaMask app
    window.location.href = metamaskDeepLink;
    
    // Set a timeout to show feedback
    setTimeout(() => {
      setIsConnecting(false);
      toast({
        title: "🔗 MetaMask 앱 연결",
        description: "MetaMask 앱에서 연결을 승인해주세요.",
        variant: "default",
      });
    }, 2000);
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      if (!window.ethereum) {
        setConnectionStep('install');
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setConnectionStep('connected');
        onConnected();
        
        toast({
          title: "✅ 연결 완료",
          description: "MetaMask가 성공적으로 연결되었습니다!",
          variant: "default",
        });
        
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Mobile MetaMask connection error:", error);
      
      if (error.code === 4001) {
        toast({
          title: "❌ 연결 취소",
          description: "사용자가 연결을 취소했습니다.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ 연결 실패",
          description: "MetaMask 연결에 실패했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const renderContent = () => {
    switch (connectionStep) {
      case 'install':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">MetaMask 설치 필요</h3>
              <p className="text-gray-600">
                XpSwap을 사용하려면 MetaMask 앱이 필요합니다.
              </p>
            </div>
            
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-orange-800">모바일 앱 다운로드</span>
                </div>
                <p className="text-sm text-gray-700 mb-6">
                  {isIOS() ? "App Store" : isAndroid() ? "Google Play Store" : "앱 스토어"}에서 
                  MetaMask 앱을 다운로드하세요.
                </p>
                <Button 
                  onClick={handleInstallMetaMask}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3"
                >
                  <Download className="w-5 h-5 mr-2" />
                  MetaMask 설치하기
                </Button>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="text-sm px-6 py-2 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                설치 완료 후 새로고침
              </Button>
            </div>
          </div>
        );
        
      case 'connect':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">MetaMask 연결</h3>
              <p className="text-gray-600">
                MetaMask 앱에 연결하여 XpSwap을 사용하세요.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={handleOpenInMetaMask}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-4"
              >
                {isConnecting ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-5 h-5 mr-2" />
                )}
                MetaMask 앱에서 열기
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">또는</span>
                </div>
              </div>
              
              <Button 
                onClick={handleConnectWallet}
                variant="outline"
                disabled={isConnecting}
                className="w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 py-4"
              >
                {isConnecting ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Wallet className="w-5 h-5 mr-2" />
                )}
                직접 연결하기
              </Button>
            </div>
            
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-800">연결 방법</p>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3" />
                        <span>"MetaMask 앱에서 열기"를 클릭하세요</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3" />
                        <span>MetaMask 앱에서 "연결" 버튼을 눌러주세요</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3" />
                        <span>자동으로 XpSwap으로 돌아옵니다</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'connected':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-green-800">연결 완료!</h3>
              <p className="text-gray-600">
                MetaMask가 성공적으로 연결되었습니다.
              </p>
            </div>
            
            <div className="text-center">
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-4 py-2">
                ✅ 연결됨
              </Badge>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">준비 완료</p>
                  <p className="text-sm text-green-700">이제 XpSwap의 모든 기능을 사용할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-10 h-10 text-gray-400 animate-spin" />
            </div>
            <p className="text-gray-500">MetaMask 상태를 확인 중...</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Smartphone className="w-6 h-6 text-blue-600" />
            모바일 MetaMask 연결
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}