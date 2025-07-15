import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Smartphone, Download, ExternalLink, Wallet, CheckCircle, AlertCircle } from "lucide-react";
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
      title: "MetaMask 설치",
      description: "MetaMask 앱을 설치한 후 다시 시도해주세요.",
      variant: "default",
    });
  };

  const handleOpenInMetaMask = () => {
    const currentUrl = window.location.href;
    const metamaskDeepLink = `https://metamask.app.link/dapp/${window.location.host}`;
    
    // Try to open in MetaMask app
    window.location.href = metamaskDeepLink;
    
    // Set a timeout to check if user returned
    setTimeout(() => {
      toast({
        title: "MetaMask 앱 연결",
        description: "MetaMask 앱에서 연결을 승인해주세요.",
        variant: "default",
      });
    }, 1000);
  };

  const handleConnectWallet = async () => {
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
          title: "지갑 연결 완료",
          description: "MetaMask가 성공적으로 연결되었습니다.",
          variant: "default",
        });
        
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Mobile MetaMask connection error:", error);
      
      if (error.code === 4001) {
        toast({
          title: "연결 취소",
          description: "사용자가 연결을 취소했습니다.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "연결 실패",
          description: "MetaMask 연결에 실패했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
      }
    }
  };

  const renderContent = () => {
    switch (connectionStep) {
      case 'install':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">MetaMask 설치 필요</h3>
              <p className="text-muted-foreground">
                XpSwap을 사용하려면 MetaMask 앱이 필요합니다.
              </p>
            </div>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">모바일 앱 다운로드</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {isIOS() ? "App Store" : isAndroid() ? "Google Play Store" : "앱 스토어"}에서 
                  MetaMask 앱을 다운로드하세요.
                </p>
                <Button 
                  onClick={handleInstallMetaMask}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  MetaMask 설치하기
                </Button>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="text-sm"
              >
                설치 완료 후 새로고침
              </Button>
            </div>
          </div>
        );
        
      case 'connect':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">MetaMask 연결</h3>
              <p className="text-muted-foreground">
                MetaMask 앱에 연결하여 XpSwap을 사용하세요.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleOpenInMetaMask}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                MetaMask 앱에서 열기
              </Button>
              
              <Button 
                onClick={handleConnectWallet}
                variant="outline"
                className="w-full"
              >
                <Wallet className="w-4 h-4 mr-2" />
                직접 연결하기
              </Button>
            </div>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">연결 방법</p>
                    <p className="text-sm text-muted-foreground">
                      1. "MetaMask 앱에서 열기"를 클릭하세요<br/>
                      2. MetaMask 앱에서 "연결" 버튼을 눌러주세요<br/>
                      3. 자동으로 XpSwap으로 돌아옵니다
                    </p>
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">연결 완료!</h3>
              <p className="text-muted-foreground">
                MetaMask가 성공적으로 연결되었습니다.
              </p>
            </div>
            
            <div className="text-center">
              <Badge variant="outline" className="text-green-600 border-green-200">
                연결됨
              </Badge>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground">MetaMask 상태를 확인 중...</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            모바일 MetaMask 연결
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}