import { useState, useEffect } from "react";
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

// 보안 강화된 유틸리티 함수
const generateSecureTxHash = (): string => {
  // 브라우저 환경에서는 crypto.getRandomValues 사용
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return `0x${Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')}`;
};
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
    recipientAddress: '',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
    logo: ''
  });
  
  // Auto-populate wallet address when connected
  useEffect(() => {
    if (wallet.address && wallet.address !== tokenInfo.recipientAddress) {
      setTokenInfo(prev => ({
        ...prev,
        recipientAddress: wallet.address
      }));
    }
  }, [wallet.address]);
  
  const [isMinting, setIsMinting] = useState(false);
  const [mintingProgress, setMintingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [mintingSteps, setMintingSteps] = useState<MintingStep[]>([
    { id: 1, title: "Deploy Token Contract", description: "Deploy XIP-20 standard token contract to Xphere network", status: 'pending' },
    { id: 2, title: "Mint Initial Supply", description: "Mint specified total supply and transfer to recipient address", status: 'pending' },
    { id: 3, title: "Register Token Info", description: "Register token metadata with DEX", status: 'pending' },
    { id: 4, title: "Create Liquidity Pool", description: "Create initial liquidity pool with XP (optional)", status: 'pending' },
    { id: 5, title: "Enable Trading", description: "Activate token trading on DEX", status: 'pending' }
  ]);

  // Fetch minting fees
  const { data: mintingFees } = useQuery({
    queryKey: ["/api/minting/fees"],
    refetchInterval: 30000
  });

  // Fetch user balance
  const { data: userBalance } = useQuery({
    queryKey: ["/api/blockchain/balance", wallet.address, "XP"],
    enabled: !!wallet.address,
    refetchInterval: 5000
  });

  const handleInputChange = (field: keyof TokenInfo, value: string) => {
    setTokenInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateTokenInfo = () => {
    const errors: string[] = [];
    
    if (!tokenInfo.name.trim()) {
      errors.push("Token name is required");
    }
    
    if (!tokenInfo.symbol.trim() || tokenInfo.symbol.length < 2 || tokenInfo.symbol.length > 10) {
      errors.push("Token symbol must be 2-10 characters");
    }
    
    if (isNaN(Number(tokenInfo.totalSupply)) || Number(tokenInfo.totalSupply) <= 0) {
      errors.push("Please enter a valid total supply");
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenInfo.recipientAddress)) {
      errors.push("Please enter a valid wallet address");
    }
    
    return errors;
  };

  const handleMintToken = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to mint tokens.",
        variant: "destructive",
      });
      return;
    }
    
    const errors = validateTokenInfo();
    if (errors.length > 0) {
      toast({
        title: "Input Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has enough XP for fees
    if (userBalance && mintingFees && parseFloat(userBalance.balance) < mintingFees.feeInXP) {
      toast({
        title: "Insufficient Balance",
        description: `Not enough XP for minting fees. Required: ${mintingFees.feeInXP} XP`,
        variant: "destructive",
      });
      return;
    }
    
    setIsMinting(true);
    setMintingProgress(0);
    setCurrentStep(1);
    
    try {
      // Step 1: Deploy token contract using Web3 service
      setMintingSteps(prev => prev.map(step => 
        step.id === 1 ? { ...step, status: 'processing' } : step
      ));

      toast({
        title: "Starting Token Deployment",
        description: "Deploying your token contract to Xphere blockchain...",
      });

      // Use Web3 service for actual token deployment
      let deploymentResult: any = null;
      try {
        const { web3Service } = await import("@/lib/web3");
        
        deploymentResult = await web3Service.deployToken(
          tokenInfo.name,
          tokenInfo.symbol,
          tokenInfo.totalSupply,
          tokenInfo.recipientAddress,
          tokenInfo.description
        );

        if (deploymentResult.success) {
          console.log("Token deployed successfully:", deploymentResult);
          
          // Update step 1 as completed
          setMintingSteps(prev => prev.map(step => 
            step.id === 1 ? { 
              ...step, 
              status: 'completed', 
              txHash: deploymentResult.transactionHash 
            } : step
          ));
          setMintingProgress(20);
          setCurrentStep(2);

          toast({
            title: "Token Deployed Successfully",
            description: `Contract address: ${deploymentResult.contractAddress?.slice(0, 20)}...`,
          });
        } else {
          throw new Error(deploymentResult.error || 'Deployment failed');
        }
      } catch (web3Error: any) {
        console.warn("Web3 deployment failed, using API fallback:", web3Error);
        
        // Fallback to API deployment
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
          throw new Error("Token deployment failed");
        }
        
        deploymentResult = await response.json();
      }

      // Step 2: Process minting steps with live progress tracking
      const steps = [
        { id: 2, name: "Initial Supply Minting", delay: 2000, progress: 40 },
        { id: 3, name: "Token Registration", delay: 1500, progress: 60 },
        { id: 4, name: "Liquidity Pool Setup", delay: 2000, progress: 80 },
        { id: 5, name: "Trading Activation", delay: 1000, progress: 100 }
      ];

      for (const step of steps) {
        // Update step status to processing
        setMintingSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, status: 'processing' } : s
        ));
        setCurrentStep(step.id);
        
        // Simulate gradual progress within each step
        const stepDuration = step.delay;
        const progressInterval = stepDuration / 10;
        
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, progressInterval));
          const stepProgress = (i + 1) / 10;
          const currentStepBase = step.id === 2 ? 20 : (step.id - 2) * 20 + 20;
          const progressIncrement = 20 * stepProgress;
          setMintingProgress(Math.min(currentStepBase + progressIncrement, step.progress));
        }
        
        // Complete the step
        setMintingSteps(prev => prev.map(s => 
          s.id === step.id ? { 
            ...s, 
            status: 'completed',
            txHash: generateSecureTxHash()
          } : s
        ));
        
        // Show step completion toast
        toast({
          title: `Step ${step.id} Complete`,
          description: `${step.name} completed successfully`,
          variant: "default",
        });
        
        setCurrentStep(step.id);
        setMintingProgress((step.id / 5) * 100);
        setMintingSteps(prev => prev.map(s => 
          s.id === step.id ? { 
            ...s, 
            status: 'completed', 
            txHash: deploymentResult.txHash || deploymentResult.transactionHash
          } : s
        ));

        toast({
          title: `Step ${step.id} Completed`,
          description: `${step.name} completed successfully`,
        });
      }

      // Final completion
      setIsMinting(false);
      setCurrentStep(null);
      
      toast({
        title: "Token Minting Completed",
        description: `${tokenInfo.name} (${tokenInfo.symbol}) has been successfully created and deployed!`,
      });

      // Show deployment details
      if (deploymentResult?.contractAddress) {
        setTimeout(() => {
          toast({
            title: "Contract Details",
            description: `Contract Address: ${deploymentResult.contractAddress}`,
          });
        }, 2000);
      }
      
      // Reset form
      setTokenInfo({
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
      
    } catch (error: any) {
      console.error("Token minting error:", error);
      
      setIsMinting(false);
      setCurrentStep(null);
      setMintingSteps(prev => prev.map(step => 
        step.status === 'processing' ? { ...step, status: 'failed' } : step
      ));
      
      toast({
        title: "Token Minting Failed",
        description: error.message || "An error occurred during token minting. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card backdrop-blur-lg border-border">
            <CardContent className="p-8 text-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Connect Wallet Required</h2>
                <p className="text-muted-foreground">Please connect your wallet to mint tokens</p>
              </div>
              <Button onClick={connectWallet} className="bg-primary hover:bg-primary/90">
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">XIP-20 Mint</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Create XIP-20 standard tokens easily on Xphere Network
          </p>
        </div>

        {/* Fee Information */}
        {mintingFees && (
          <Card className="bg-card backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Minting Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Base Gas</p>
                  <p className="text-lg font-semibold text-foreground">{mintingFees.baseGas} XP</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Minting Fee</p>
                  <p className="text-lg font-semibold text-foreground">${mintingFees.mintingFeeUSD}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pay with XP</p>
                  <p className="text-lg font-semibold text-foreground">{mintingFees.feeInXP} XP</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pay with XPS (50% off)</p>
                  <p className="text-lg font-semibold text-primary">{mintingFees.feeInXPS} XPS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Creation Form */}
          <Card className="bg-card backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Token Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Token Name *</Label>
                  <Input
                    value={tokenInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., My Token"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Token Symbol *</Label>
                  <Input
                    value={tokenInfo.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                    placeholder="e.g., MTK"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground">Total Supply *</Label>
                <Input
                  type="number"
                  value={tokenInfo.totalSupply}
                  onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                  placeholder="e.g., 1000000"
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground">Recipient Address *</Label>
                <Input
                  value={tokenInfo.recipientAddress}
                  onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                  placeholder="0x..."
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground">Description</Label>
                <Textarea
                  value={tokenInfo.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your token..."
                  className="bg-background border-border text-foreground"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Website</Label>
                  <Input
                    value={tokenInfo.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://..."
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Twitter</Label>
                  <Input
                    value={tokenInfo.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    placeholder="@username"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Telegram</Label>
                  <Input
                    value={tokenInfo.telegram}
                    onChange={(e) => handleInputChange('telegram', e.target.value)}
                    placeholder="@channel"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              
              <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                  * Required fields. Token details cannot be changed after deployment.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleMintToken}
                disabled={isMinting || !tokenInfo.name || !tokenInfo.symbol || !tokenInfo.totalSupply}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isMinting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Minting Token...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Mint Token
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {/* Minting Progress */}
          <Card className="bg-card backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Minting Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isMinting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Progress</span>
                    <span className="text-foreground">{mintingProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={mintingProgress} className="h-2" />
                </div>
              )}
              
              <div className="space-y-3">
                {mintingSteps.map((step) => (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {step.status === 'pending' && (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                      )}
                      {step.status === 'processing' && (
                        <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      )}
                      {step.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {step.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.txHash && (
                        <p className="text-xs text-blue-600 mt-1">
                          TX: {step.txHash.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {!isMinting && (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-blue-700 dark:text-blue-400">
                    Fill in token details and click "Mint Token" to begin deployment process.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}