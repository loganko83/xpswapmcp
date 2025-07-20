import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowRightLeft, 
  Droplets, 
  TrendingUp, 
  BarChart3,
  Coins,
  Zap,
  Shield,
  Target,
  Star,
  Wallet,
  Globe,
  ChevronRight,
  DollarSign,
  Percent,
  Award,
  Flame,
  Network,
  Gift,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userAddress, setUserAddress] = useState<string | null>(null);
  
  // XPS Airdrop dates (August 1-10, 2025)
  const airdropStartDate = new Date('2025-08-01T00:00:00Z');
  const airdropEndDate = new Date('2025-08-10T23:59:59Z');
  const currentDate = new Date();
  const isAirdropActive = currentDate >= airdropStartDate && currentDate <= airdropEndDate;
  const daysRemaining = Math.max(0, Math.ceil((airdropEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Check wallet connection
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setUserAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
        }
      }
    };
    checkWallet();
  }, []);
  
  // Get user XP balance
  const { data: xpBalance } = useQuery({
    queryKey: ['/api/blockchain/balance', userAddress, 'XP'],
    enabled: !!userAddress,
    refetchInterval: 5000
  });
  
  // Check if user has already claimed
  const { data: claimStatus } = useQuery({
    queryKey: ['/api/xps/airdrop/status', userAddress],
    enabled: !!userAddress
  });
  
  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!userAddress) throw new Error('Wallet not connected');
      
      const response = await fetch('/api/xps/airdrop/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to claim airdrop');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Airdrop Claimed Successfully!",
        description: `100 XPS has been sent to your wallet. Transaction: ${data.txHash}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/xps/airdrop/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
      } catch (error) {
        toast({
          title: "Wallet Connection Failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to claim the airdrop",
        variant: "destructive",
      });
    }
  };
  
  const handleClaim = () => {
    claimMutation.mutate();
  };
  
  const isEligible = userAddress && xpBalance && parseFloat(xpBalance.balance) >= 10000;
  const hasAlreadyClaimed = claimStatus?.claimed === true;
  const features = [
    {
      title: "Advanced Swap Trading",
      description: "Trade cryptocurrencies with real-time pricing from CoinMarketCap. Features include slippage protection, MEV resistance, and optimal routing for best prices.",
      icon: ArrowRightLeft,
      color: "from-blue-500 to-blue-600",
      link: "/swap",
      highlights: ["Real-time pricing", "MEV protection", "Slippage control"]
    },
    {
      title: "Chart-based Trading",
      description: "Professional trading interface with TradingView-style charts, real-time orderbook, trade history, and advanced order types for experienced traders.",
      icon: BarChart3,
      color: "from-green-500 to-green-600",
      link: "/trading",
      highlights: ["OHLC charts", "Live orderbook", "Market & limit orders"]
    },
    {
      title: "Liquidity Pools",
      description: "Provide liquidity and earn rewards through our automated market maker (AMM). Features time-locked positions with boosted APY and auto-compounding.",
      icon: Droplets,
      color: "from-purple-500 to-purple-600",
      link: "/pool",
      highlights: ["AMM protocol", "Time-locked rewards", "Auto-compounding"]
    },
    {
      title: "Yield Farming",
      description: "Maximize your returns with our advanced farming system. Stake LP tokens to earn governance tokens with multipliers up to 2.5x based on lock duration.",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      link: "/farm",
      highlights: ["2.5x multipliers", "Governance rewards", "Flexible periods"]
    },
    {
      title: "Cross-chain Bridge",
      description: "Transfer assets seamlessly across 40+ blockchains using LI.FI integration. Support for Ethereum, BSC, Polygon, Arbitrum, and more networks.",
      icon: Network,
      color: "from-cyan-500 to-cyan-600",
      link: "/bridge",
      highlights: ["40+ networks", "LI.FI integration", "Secure transfers"]
    },
    {
      title: "Token Minting",
      description: "Create custom XIP-20 tokens on Xphere Network with automated deployment, metadata management, and DEX integration for instant trading.",
      icon: Coins,
      color: "from-yellow-500 to-yellow-600",
      link: "/minting",
      highlights: ["XIP-20 standard", "Auto deployment", "Instant trading"]
    },
    {
      title: "Multi-chain Portfolio",
      description: "Track your assets across multiple blockchains in one unified dashboard. Real-time balances, transaction history, and portfolio analytics.",
      icon: Wallet,
      color: "from-pink-500 to-pink-600",
      link: "/multichain-portfolio",
      highlights: ["Multi-chain tracking", "Real-time data", "Portfolio analytics"]
    },
    {
      title: "Real-time Analytics",
      description: "Access comprehensive market data with live metrics, trading volume analysis, liquidity flows, and customizable alerts for better decision making.",
      icon: BarChart3,
      color: "from-indigo-500 to-indigo-600",
      link: "/analytics",
      highlights: ["Live metrics", "Volume analysis", "Custom alerts"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mx-auto mb-6">
              <img 
                src="https://rebel-orangutan-6f0.notion.site/image/attachment%3Aea1e41e5-28b3-486e-bc20-978f86c7e213%3Alogo_xps3.png?table=block&id=22fa68fd-c4b9-80a2-93a5-edbcfa276af7&spaceId=5cba68fd-c4b9-81bc-873e-0003fe11fd03&width=860&userId=&cache=v2"
                alt="XPS"
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Trade the Future with <span className="text-primary">XpSwap</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              🚀 Revolutionary DEX on Xphere blockchain. Experience lightning-fast trades, zero-slippage swaps, and earn rewards through advanced DeFi features. Join the next generation of decentralized trading!
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/trading">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Trading Now <ArrowRightLeft className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/xps-staking">
              <Button size="lg" variant="outline">
                Earn with XPS <Star className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">5+</div>
              <div className="text-sm text-muted-foreground">Supported Networks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">DEX Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">0.3%</div>
              <div className="text-sm text-muted-foreground">Trading Fees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Decentralized</div>
            </div>
          </div>
        </div>
      </section>

      {/* XPS Airdrop Section */}
      {isAirdropActive && (
        <section className="py-16 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-yellow-500/30">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    🎉 XPS Airdrop Event - Limited Time!
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    Get 100 XPS tokens for FREE! Hold 10,000+ XP tokens and claim your reward.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">
                      {daysRemaining} days remaining (August 1-10, 2025)
                    </span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">100 XPS</div>
                    <div className="text-sm text-muted-foreground">Free Airdrop Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">10,000+</div>
                    <div className="text-sm text-muted-foreground">XP Required to Claim</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">1 Time</div>
                    <div className="text-sm text-muted-foreground">Per Wallet Address</div>
                  </div>
                </div>
                
                <div className="text-center">
                  {!userAddress ? (
                    <Button 
                      onClick={connectWallet} 
                      size="lg" 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet to Claim
                    </Button>
                  ) : hasAlreadyClaimed ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-6 h-6" />
                      <span className="text-lg font-semibold">Already Claimed - Thank You!</span>
                    </div>
                  ) : !isEligible ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                        <XCircle className="w-6 h-6" />
                        <span className="text-lg font-semibold">
                          Need 10,000+ XP to claim (Current: {xpBalance ? parseFloat(xpBalance.balance).toLocaleString() : '0'} XP)
                        </span>
                      </div>
                      <Link href="/swap">
                        <Button variant="outline" size="lg">
                          <ArrowRightLeft className="w-5 h-5 mr-2" />
                          Get More XP
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleClaim} 
                      disabled={claimMutation.isPending}
                      size="lg" 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Gift className="w-5 h-5 mr-2" />
                      {claimMutation.isPending ? 'Claiming...' : 'Claim 100 XPS Now!'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* XPS Token Highlight */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src="https://rebel-orangutan-6f0.notion.site/image/attachment%3Aea1e41e5-28b3-486e-bc20-978f86c7e213%3Alogo_xps3.png?table=block&id=22fa68fd-c4b9-80a2-93a5-edbcfa276af7&spaceId=5cba68fd-c4b9-81bc-873e-0003fe11fd03&width=860&userId=&cache=v2"
                      alt="XPS"
                      className="w-12 h-12 object-contain"
                    />
                    <h2 className="text-3xl font-bold text-foreground">XPS Native Token</h2>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6">
                    The utility token that powers the entire XpSwap ecosystem. Get trading fee discounts, 
                    enhanced staking rewards, and governance voting rights.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Percent className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Up to 75% trading fee discounts</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Up to 50% APY staking rewards</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Governance voting power</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Deflationary burn mechanism</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link href="/xps-purchase">
                      <Button className="bg-primary hover:bg-primary/90">
                        Buy XPS (1 XPS = $1) <DollarSign className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/xps-staking">
                      <Button variant="outline">
                        Stake XPS <Award className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">1 XPS</div>
                      <div className="text-sm text-muted-foreground">= $1 USD</div>
                      <div className="text-xs text-muted-foreground mt-1">Fixed Price</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">75%</div>
                      <div className="text-sm text-muted-foreground">Max APY</div>
                      <div className="text-xs text-muted-foreground mt-1">1 Year Lock</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">75%</div>
                      <div className="text-sm text-muted-foreground">Fee Discount</div>
                      <div className="text-xs text-muted-foreground mt-1">Maximum</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">40%</div>
                      <div className="text-sm text-muted-foreground">Revenue Burn</div>
                      <div className="text-xs text-muted-foreground mt-1">Deflationary</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">🚀 All-in-One DeFi Powerhouse</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of decentralized finance. Trade, earn, bridge, and grow your crypto portfolio with cutting-edge features designed for the next generation of DeFi users.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.link}>
                <Card className="h-full bg-card hover:bg-card/80 transition-all duration-300 hover:scale-105 cursor-pointer group border-border">
                  <CardHeader>
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      {feature.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-sm text-muted-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-medium">Explore</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Built for Security & Performance</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Enterprise-grade security with cutting-edge DeFi innovations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">MEV Protection</h3>
              <p className="text-muted-foreground">
                Advanced algorithms protect against sandwich attacks and front-running, ensuring fair prices for all trades.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Optimal Routing</h3>
              <p className="text-muted-foreground">
                Smart routing algorithms find the best prices across multiple liquidity sources for maximum efficiency.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Multi-chain Ready</h3>
              <p className="text-muted-foreground">
                Connect to multiple blockchains including Ethereum, BSC, and Polygon with unified interface and cross-chain capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            🎯 Be an Early Pioneer in the Future of DeFi
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the revolutionary XpSwap ecosystem today! As an early user, you'll enjoy exclusive benefits, lower fees, and the opportunity to shape the future of decentralized trading.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/trading">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Your DeFi Journey <ArrowRightLeft className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/xps-staking">
              <Button size="lg" variant="outline">
                Earn XPS Rewards <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}