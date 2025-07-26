import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Flame, 
  TrendingUp, 
  Target, 
  Zap, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Info,
  DollarSign,
  Users,
  Star,
  ArrowUpRight,
  BarChart3,
  Coins,
  Heart,
  Share2,
  Wallet,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface MemeCoinInfo {
  name: string;
  symbol: string;
  description: string;
  image: string;
  website: string;
  twitter: string;
  telegram: string;
  category: string;
}

interface BondingCurveData {
  currentPrice: number;
  marketCap: number;
  totalSupply: number;
  progress: number;
  liquidityThreshold: number;
  nextMilestone: number;
  priceImpact: number;
}

interface TradingData {
  holders: number;
  volume24h: number;
  trades24h: number;
  timeToListing: string;
  createdAt: string;
  replies: number;
  hearts: number;
}

// 보안 강화된 유틸리티 함수
const generateSecureTxHash = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return `0x${Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')}`;
};

export default function MemeCoinPage() {
  const { wallet, connectWallet } = useWeb3Context();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"create" | "explore">("create");
  const [memeCoinInfo, setMemeCoinInfo] = useState<MemeCoinInfo>({
    name: '',
    symbol: '',
    description: '',
    image: '',
    website: '',
    twitter: '',
    telegram: '',
    category: 'meme'
  });
  
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [bondingCurve, setBondingCurve] = useState<BondingCurveData>({
    currentPrice: 0.000001,
    marketCap: 0,
    totalSupply: 1000000000,
    progress: 0,
    liquidityThreshold: 69000,
    nextMilestone: 10000,
    priceImpact: 0
  });

  // Mock trending memecoins data
  const [trendingCoins] = useState([
    {
      id: 1,
      name: "PEPE XPS",
      symbol: "PEPEXPS",
      image: "🐸",
      marketCap: 45000,
      progress: 65.2,
      change24h: 156.7,
      replies: 234,
      hearts: 1.2,
      timeLeft: "2h 45m",
      creator: "0x742d...7b2f"
    },
    {
      id: 2,
      name: "Doge Xphere",
      symbol: "DOGEXPS",
      image: "🐕",
      marketCap: 32000,
      progress: 46.4,
      change24h: 89.3,
      replies: 189,
      hearts: 0.8,
      timeLeft: "4h 12m",
      creator: "0x123a...456b"
    },
    {
      id: 3,
      name: "Shiba XPS",
      symbol: "SHIBXPS",
      image: "🦊",
      marketCap: 28000,
      progress: 40.6,
      change24h: 67.2,
      replies: 156,
      hearts: 0.6,
      timeLeft: "5h 33m",
      creator: "0x789c...def0"
    }
  ]);

  // Fetch minting fees for memecoin
  const { data: memeCoinFees } = useQuery({
    queryKey: ["/api/memecoin/fees"],
    refetchInterval: 30000
  });

  // Fetch user balance
  const { data: userBalance } = useQuery({
    queryKey: ["/api/blockchain/balance", wallet.address, "XP"],
    enabled: !!wallet.address,
    refetchInterval: 5000
  });

  const handleInputChange = (field: keyof MemeCoinInfo, value: string) => {
    setMemeCoinInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateMemeCoinInfo = () => {
    const errors: string[] = [];
    
    if (!memeCoinInfo.name.trim()) {
      errors.push("Token name is required");
    }
    
    if (!memeCoinInfo.symbol.trim() || memeCoinInfo.symbol.length < 2 || memeCoinInfo.symbol.length > 10) {
      errors.push("Token symbol must be 2-10 characters");
    }
    
    if (!memeCoinInfo.description.trim()) {
      errors.push("Description is required");
    }
    
    if (!memeCoinInfo.image.trim()) {
      errors.push("Image or emoji is required");
    }
    
    return errors;
  };

  const handleLaunchMemeCoin = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to launch a MemeCoin.",
        variant: "destructive",
      });
      return;
    }
    
    const errors = validateMemeCoinInfo();
    if (errors.length > 0) {
      toast({
        title: "Input Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }
    
    setIsLaunching(true);
    setLaunchProgress(0);
    
    try {
      toast({
        title: "Launching MemeCoin",
        description: "Deploying your MemeCoin with bonding curve...",
      });

      // Simulate launch process with bonding curve setup
      const steps = [
        { name: "Creating bonding curve contract", delay: 2000, progress: 20 },
        { name: "Deploying XIP-20 token", delay: 1500, progress: 40 },
        { name: "Setting up price curve", delay: 1800, progress: 60 },
        { name: "Initializing liquidity pool", delay: 1200, progress: 80 },
        { name: "Activating trading", delay: 1000, progress: 100 }
      ];

      for (const step of steps) {
        toast({
          title: step.name,
          description: "Please wait...",
        });
        
        await new Promise(resolve => setTimeout(resolve, step.delay));
        setLaunchProgress(step.progress);
      }

      // API call to backend
      const response = await fetch("/api/memecoin/launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...memeCoinInfo,
          userAddress: wallet.address,
          bondingCurve: {
            initialPrice: 0.000001,
            liquidityThreshold: 69000,
            totalSupply: 1000000000
          }
        }),
      });

      if (!response.ok) {
        throw new Error("MemeCoin launch failed");
      }

      const result = await response.json();
      
      setIsLaunching(false);
      
      toast({
        title: "MemeCoin Launched Successfully! 🚀",
        description: `${memeCoinInfo.name} (${memeCoinInfo.symbol}) is now live with bonding curve!`,
      });

      // Reset form
      setMemeCoinInfo({
        name: '',
        symbol: '',
        description: '',
        image: '',
        website: '',
        twitter: '',
        telegram: '',
        category: 'meme'
      });
      
      // Switch to explore tab to see the new coin
      setActiveTab("explore");
      
    } catch (error: any) {
      console.error("MemeCoin launch error:", error);
      
      setIsLaunching(false);
      
      toast({
        title: "MemeCoin Launch Failed",
        description: error.message || "An error occurred during launch. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculatePriceImpact = (amount: number) => {
    // Bonding curve price impact calculation
    const currentSupply = bondingCurve.totalSupply * (bondingCurve.progress / 100);
    const impact = (amount / currentSupply) * 100;
    return Math.min(impact, 50); // Cap at 50%
  };

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card backdrop-blur-lg border-border">
            <CardContent className="p-8 text-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Connect Wallet Required</h2>
                <p className="text-muted-foreground">Please connect your wallet to launch or trade MemeCoin</p>
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/10 rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">MemeCoin Launch</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Launch your MemeCoin with bonding curve mechanism on Xphere Network
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "create" | "explore")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Launch MemeCoin
            </TabsTrigger>
            <TabsTrigger value="explore" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending Coins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            {/* Fee Information */}
            <Card className="bg-card backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  MemeCoin Launch Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Base Gas</p>
                    <p className="text-lg font-semibold text-foreground">2.5 XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Launch Fee</p>
                    <p className="text-lg font-semibold text-foreground">$100</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pay with XP</p>
                    <p className="text-lg font-semibold text-foreground">6850 XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pay with XPS (50% off)</p>
                    <p className="text-lg font-semibold text-primary">50 XPS</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MemeCoin Creation Form */}
              <Card className="bg-card backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Create Your MemeCoin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Token Name *</Label>
                      <Input
                        value={memeCoinInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Pepe Moon"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Token Symbol *</Label>
                      <Input
                        value={memeCoinInfo.symbol}
                        onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                        placeholder="e.g., PEPEMOON"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-foreground">Description *</Label>
                    <Textarea
                      value={memeCoinInfo.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Tell the world about your meme coin..."
                      className="bg-background border-border text-foreground min-h-[100px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-foreground">Image/Emoji *</Label>
                    <div className="flex gap-2">
                      <Input
                        value={memeCoinInfo.image}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                        placeholder="🐸 or https://image-url.com"
                        className="bg-background border-border text-foreground flex-1"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Website</Label>
                      <Input
                        value={memeCoinInfo.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://..."
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Twitter</Label>
                      <Input
                        value={memeCoinInfo.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        placeholder="@username"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Telegram</Label>
                      <Input
                        value={memeCoinInfo.telegram}
                        onChange={(e) => handleInputChange('telegram', e.target.value)}
                        placeholder="@channel"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                  </div>
                  
                  <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                    <Flame className="h-4 w-4" />
                    <AlertDescription className="text-orange-700 dark:text-orange-400">
                      Your MemeCoin will use bonding curve pricing. When market cap reaches $69,000, liquidity will be automatically deposited to DEX for trading.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleLaunchMemeCoin}
                    disabled={isLaunching || !memeCoinInfo.name || !memeCoinInfo.symbol || !memeCoinInfo.description}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isLaunching ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4 mr-2" />
                        Launch MemeCoin 🚀
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Bonding Curve Information */}
              <Card className="bg-card backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Bonding Curve Mechanics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLaunching && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Launch Progress</span>
                        <span className="text-foreground">{launchProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={launchProgress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Supply</span>
                      <span className="text-sm font-semibold text-foreground">1,000,000,000</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Starting Price</span>
                      <span className="text-sm font-semibold text-foreground">$0.000001</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Listing Threshold</span>
                      <span className="text-sm font-semibold text-primary">$69,000</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Creator Fee</span>
                      <span className="text-sm font-semibold text-foreground">1%</span>
                    </div>
                  </div>
                  
                  <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                      <strong>How it works:</strong> Price increases with each buy following the bonding curve formula. When market cap hits $69K, all liquidity automatically migrates to DEX for unlimited trading.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="explore" className="space-y-6">
            {/* Trending Coins Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingCoins.map((coin) => (
                <Card key={coin.id} className="bg-card backdrop-blur-lg border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center text-2xl">
                          {coin.image}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{coin.name}</h3>
                          <p className="text-sm text-muted-foreground">{coin.symbol}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Market Cap</span>
                        <span className="text-foreground font-semibold">${coin.marketCap.toLocaleString()}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress to DEX</span>
                          <span className="text-foreground">{coin.progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={coin.progress} className="h-1" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{coin.replies}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Heart className="w-3 h-3" />
                          <span>{coin.hearts}K</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{coin.timeLeft} left</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Buy
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Sell
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Created by {coin.creator}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Load More Button */}
            <div className="text-center">
              <Button variant="outline" className="px-8">
                Load More Coins
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}