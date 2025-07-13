import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Coins, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Wallet,
  Plus,
  Star,
  Info,
  DollarSign,
  TrendingUp,
  Shield,
  Target
} from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  recipientAddress: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  logo: string;
}

interface MintingFee {
  baseGas: number;
  tokenCreationFee: number;
  liquidityFee: number;
  totalFee: number;
  feeInXP: number;
  feeInUSD: number;
}

interface MintingStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
}

export default function MintingPage() {
  const { wallet, connectWallet } = useWeb3();
  const { toast } = useToast();
  
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    name: '',
    symbol: '',
    totalSupply: '',
    recipientAddress: wallet.address || '',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
    logo: ''
  });
  
  const [isMinting, setIsMinting] = useState(false);
  const [mintingProgress, setMintingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [mintingSteps, setMintingSteps] = useState<MintingStep[]>([
    { id: 1, title: "토큰 컨트랙트 배포", description: "XIP-20 표준 토큰 컨트랙트를 Xphere 네트워크에 배포합니다", status: 'pending' },
    { id: 2, title: "초기 공급량 발행", description: "지정된 총 공급량을 발행하여 받는 주소로 전송합니다", status: 'pending' },
    { id: 3, title: "토큰 정보 등록", description: "토큰 메타데이터를 DEX에 등록합니다", status: 'pending' },
    { id: 4, title: "유동성 풀 생성", description: "토큰과 XP의 초기 유동성 풀을 생성합니다 (선택사항)", status: 'pending' },
    { id: 5, title: "거래 활성화", description: "토큰이 DEX에서 거래 가능하도록 활성화합니다", status: 'pending' }
  ]);

  // Fetch XP price and calculate fees
  const { data: xpPrice } = useQuery({
    queryKey: ["/api/xp-price"],
    refetchInterval: 30000
  });

  // Calculate minting fees
  const { data: mintingFees } = useQuery({
    queryKey: ["/api/minting/fees"],
    refetchInterval: 30000
  });

  // Fetch user's XP balance
  const { data: userBalance } = useQuery({
    queryKey: [`/api/blockchain/balance/${wallet.address}/XP`],
    enabled: !!wallet.address,
    refetchInterval: 5000
  });

  const handleInputChange = (field: keyof TokenInfo, value: string) => {
    setTokenInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-fill recipient address with connected wallet
    if (field === 'recipientAddress' && !value && wallet.address) {
      setTokenInfo(prev => ({
        ...prev,
        recipientAddress: wallet.address
      }));
    }
  };

  const validateTokenInfo = () => {
    const errors: string[] = [];
    
    if (!tokenInfo.name.trim()) errors.push("토큰 이름을 입력해주세요");
    if (!tokenInfo.symbol.trim()) errors.push("토큰 심볼을 입력해주세요");
    if (!tokenInfo.totalSupply.trim()) errors.push("총 공급량을 입력해주세요");
    if (!tokenInfo.recipientAddress.trim()) errors.push("받는 주소를 입력해주세요");
    
    if (tokenInfo.symbol.length < 2 || tokenInfo.symbol.length > 10) {
      errors.push("토큰 심볼은 2-10자 사이여야 합니다");
    }
    
    if (isNaN(Number(tokenInfo.totalSupply)) || Number(tokenInfo.totalSupply) <= 0) {
      errors.push("올바른 총 공급량을 입력해주세요");
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenInfo.recipientAddress)) {
      errors.push("올바른 지갑 주소를 입력해주세요");
    }
    
    return errors;
  };

  const handleMintToken = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "지갑 연결 필요",
        description: "토큰을 발행하려면 지갑을 연결해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    const errors = validateTokenInfo();
    if (errors.length > 0) {
      toast({
        title: "입력 오류",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has enough XP for fees
    if (userBalance && mintingFees && parseFloat(userBalance.balance) < mintingFees.feeInXP) {
      toast({
        title: "잔액 부족",
        description: `토큰 발행에 필요한 XP가 부족합니다. 필요: ${mintingFees.feeInXP} XP`,
        variant: "destructive",
      });
      return;
    }
    
    setIsMinting(true);
    setMintingProgress(0);
    setCurrentStep(1);
    
    try {
      // Step 1: Deploy token contract
      setMintingSteps(prev => prev.map(step => 
        step.id === 1 ? { ...step, status: 'processing' } : step
      ));
      
      const response = await fetch("/api/minting/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...tokenInfo,
          userAddress: wallet.address,
        }),
      });
      
      if (!response.ok) {
        throw new Error("토큰 배포 실패");
      }
      
      const result = await response.json();
      
      // Update steps progressively
      for (let i = 1; i <= 5; i++) {
        setTimeout(() => {
          setCurrentStep(i);
          setMintingProgress((i / 5) * 100);
          setMintingSteps(prev => prev.map(step => 
            step.id === i ? { ...step, status: 'completed', txHash: result.txHash } : step
          ));
        }, i * 2000);
      }
      
      setTimeout(() => {
        setIsMinting(false);
        toast({
          title: "토큰 발행 완료",
          description: `${tokenInfo.name} (${tokenInfo.symbol}) 토큰이 성공적으로 발행되었습니다!`,
        });
      }, 10000);
      
    } catch (error) {
      setIsMinting(false);
      setMintingSteps(prev => prev.map(step => 
        step.id === currentStep ? { ...step, status: 'failed' } : step
      ));
      
      toast({
        title: "토큰 발행 실패",
        description: "토큰 발행 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">지갑 연결 필요</h2>
                <p className="text-gray-300">토큰을 발행하려면 지갑을 연결해주세요</p>
              </div>
              <Button onClick={connectWallet} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                지갑 연결
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Token Minting</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Xphere 네트워크에서 XIP-20 표준 토큰을 쉽게 발행하세요
          </p>
        </div>

        {/* Fee Information */}
        {mintingFees && (
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                발행 수수료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">기본 가스비</p>
                  <p className="text-lg font-semibold text-white">{mintingFees.baseGas} XP</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">토큰 생성 수수료</p>
                  <p className="text-lg font-semibold text-white">{mintingFees.tokenCreationFee} XP</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">유동성 풀 생성</p>
                  <p className="text-lg font-semibold text-white">{mintingFees.liquidityFee} XP</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">총 수수료</p>
                  <p className="text-lg font-semibold text-green-400">{mintingFees.totalFee} XP</p>
                  <p className="text-sm text-gray-400">(≈ ${mintingFees.feeInUSD})</p>
                </div>
              </div>
              
              {userBalance && (
                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white">내 XP 잔액:</span>
                    <span className="text-white font-semibold">{parseFloat(userBalance.balance).toFixed(2)} XP</span>
                  </div>
                  {parseFloat(userBalance.balance) < mintingFees.feeInXP && (
                    <Alert className="mt-2 bg-red-500/20 border-red-500/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-400">
                        잔액이 부족합니다. 최소 {mintingFees.feeInXP} XP가 필요합니다.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Information Form */}
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                토큰 정보 입력
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">토큰 이름 *</Label>
                  <Input
                    value={tokenInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="예: XpSwap Token"
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">토큰 심볼 *</Label>
                  <Input
                    value={tokenInfo.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                    placeholder="예: XPS"
                    className="bg-black/20 border-white/10 text-white"
                    maxLength={10}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">총 공급량 *</Label>
                <Input
                  type="number"
                  value={tokenInfo.totalSupply}
                  onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                  placeholder="예: 1000000"
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">받는 주소 *</Label>
                <Input
                  value={tokenInfo.recipientAddress}
                  onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                  placeholder="0x..."
                  className="bg-black/20 border-white/10 text-white"
                />
                {wallet.address && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleInputChange('recipientAddress', wallet.address)}
                    className="text-xs"
                  >
                    내 지갑 주소 사용
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">토큰 설명</Label>
                <Textarea
                  value={tokenInfo.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="토큰에 대한 설명을 입력하세요..."
                  className="bg-black/20 border-white/10 text-white"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">웹사이트</Label>
                  <Input
                    value={tokenInfo.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://..."
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">트위터</Label>
                  <Input
                    value={tokenInfo.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    placeholder="@username"
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">텔레그램</Label>
                  <Input
                    value={tokenInfo.telegram}
                    onChange={(e) => handleInputChange('telegram', e.target.value)}
                    placeholder="@channel"
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
              </div>
              
              <Alert className="bg-yellow-500/20 border-yellow-500/50">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-yellow-400">
                  * 표시된 항목은 필수 입력 사항입니다. 토큰 발행 후에는 수정할 수 없습니다.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleMintToken}
                disabled={isMinting || !tokenInfo.name || !tokenInfo.symbol || !tokenInfo.totalSupply}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isMinting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    토큰 발행 중...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    토큰 발행하기
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {/* Minting Progress */}
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                발행 진행 상황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isMinting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">진행률</span>
                    <span className="text-white">{mintingProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={mintingProgress} className="h-2" />
                </div>
              )}
              
              <div className="space-y-3">
                {mintingSteps.map((step) => (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {step.status === 'pending' && (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
                      )}
                      {step.status === 'processing' && (
                        <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                      )}
                      {step.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      {step.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{step.title}</p>
                      <p className="text-sm text-gray-400">{step.description}</p>
                      {step.txHash && (
                        <p className="text-xs text-blue-400 mt-1">
                          TX: {step.txHash.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {!isMinting && (
                <Alert className="bg-blue-500/20 border-blue-500/50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-blue-400">
                    토큰 발행이 완료되면 DEX에서 거래할 수 있습니다. 
                    향후 업데이트에서 본딩 커브 모델이 적용될 예정입니다.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Features Coming Soon */}
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5" />
              업데이트 예정 기능
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">본딩 커브 모델</h3>
                </div>
                <p className="text-sm text-gray-400">
                  펌프펀과 같은 본딩 커브 모델을 적용하여 자동 가격 발견 및 유동성 제공
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">고급 보안 기능</h3>
                </div>
                <p className="text-sm text-gray-400">
                  토큰 락업, 베스팅 스케줄, 멀티시그 관리 등 고급 보안 기능 추가
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-semibold">자동 마케팅</h3>
                </div>
                <p className="text-sm text-gray-400">
                  토큰 론칭과 동시에 자동 마케팅 캠페인 및 커뮤니티 빌딩 도구 제공
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}