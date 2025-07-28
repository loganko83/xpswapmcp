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
  XCircle,
  Code,
  Cpu,
  Database,
  Lock,
  Gauge,
  Users,
  BookOpen,
  MessageCircle,
  Twitter,
  Github,
  CheckCircle2,
  Activity,
  Layers,
  Brain,
  Sparkles,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  BarChart2,
  TrendingDown,
  Briefcase,
  Landmark,
  Timer,
  Repeat,
  ChartCandlestick,
  PieChart,
  Microscope,
  Rocket,
  Phone,
  Mail,
  FileText,
  Bug
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

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

  // Why Choose XPSwap
  const whyChooseReasons = [
    {
      icon: ShieldCheck,
      title: "🔐 Maximum Security",
      description: "Audited smart contracts with MEV protection",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "⚡ Lightning Fast",
      description: "Sub-second transaction finality on Xphere network",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Globe,
      title: "🌐 Multi-Chain",
      description: "Trade across 6 major blockchain networks",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "📈 Advanced Trading",
      description: "Options, futures, and flash loans like never before",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "💎 Early Access",
      description: "Be part of the next DeFi revolution",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  // Core Features Categories
  const coreFeatures = {
    "🔄 Trading Engine": [
      { title: "Simple Swap", desc: "Instant token exchanges with minimal fees" },
      { title: "Advanced Trading", desc: "Professional interface with charts and analytics" },
      { title: "Options Trading", desc: "Call/Put options with Black-Scholes pricing" },
      { title: "Perpetual Futures", desc: "Up to 125x leverage trading" },
      { title: "Atomic Swaps", desc: "Trustless cross-chain exchanges" }
    ],
    "🏦 DeFi Services": [
      { title: "Liquidity Pools", desc: "Provide liquidity and earn trading fees" },
      { title: "Yield Farming", desc: "Stake LP tokens for high APY rewards" },
      { title: "Flash Loans", desc: "Instant uncollateralized loans" },
      { title: "Cross-Chain Bridge", desc: "Transfer assets across 6 networks" }
    ],
    "🪙 Token Services": [
      { title: "XPS Staking", desc: "Lock XPS tokens for up to 75% APY" },
      { title: "Buy XPS Token", desc: "Purchase native platform tokens" },
      { title: "XIP-20 Minting", desc: "Create your own tokens on Xphere" },
      { title: "MemeCoin Launch", desc: "Pump.fun style bonding curve launches" }
    ],
    "📊 Analytics & Tools": [
      { title: "Real-Time Analytics", desc: "Live market data and trading metrics" },
      { title: "Portfolio Manager", desc: "Track all your DeFi positions" },
      { title: "Security Dashboard", desc: "Monitor platform security status" },
      { title: "Multi-Chain Portfolio", desc: "Unified view across networks" }
    ]
  };

  // Advanced DeFi Features
  const advancedFeatures = [
    {
      icon: Target,
      title: "🎯 Options Trading",
      features: [
        "Call/Put Options: European-style options with flexible expiry",
        "Greeks Calculation: Delta, Gamma, Theta, Vega analytics",
        "Black-Scholes Pricing: Accurate fair value calculations",
        "Option Chains: Complete option series for major tokens",
        "Strategy Builder: Complex options strategies made simple"
      ],
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: Zap,
      title: "⚡ Perpetual Futures",
      features: [
        "High Leverage: Trade with up to 125x leverage",
        "Funding Rates: Dynamic funding mechanism",
        "Mark Price: Protected against manipulation",
        "Position Management: Advanced risk management tools",
        "Liquidation Engine: Fair and transparent liquidations"
      ],
      color: "from-red-500 to-pink-600"
    },
    {
      icon: DollarSign,
      title: "💰 Flash Loans",
      features: [
        "Instant Loans: Borrow without collateral",
        "Strategy Templates: Pre-built arbitrage strategies",
        "85% Success Rate: Proven profitable opportunities",
        "Code Editor: Build custom flash loan strategies",
        "Risk Analysis: Automated profitability checks"
      ],
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: Repeat,
      title: "🔄 Atomic Swaps",
      features: [
        "Trustless Trading: No intermediaries required",
        "Hash Time-locked Contracts (HTLC): Secure cross-chain swaps",
        "Multi-Network: Trade directly between different blockchains",
        "No Custody: Keep full control of your assets"
      ],
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: Flame,
      title: "🚀 MemeCoin Launch",
      features: [
        "Bonding Curve: Pump.fun style price discovery",
        "Fair Launch: No pre-sales or insider allocations",
        "Auto-Listing: Automatic DEX listing at $69K market cap",
        "Community Driven: Let the market decide value",
        "Instant Liquidity: Trade immediately after launch"
      ],
      color: "from-orange-500 to-red-600"
    }
  ];

  // Security Features
  const securityFeatures = {
    "🛡️ Smart Contract Security": [
      "OpenZeppelin Standards: Industry-leading security libraries",
      "ReentrancyGuard: Protection against reentrancy attacks",
      "SafeMath Operations: Overflow protection on all calculations",
      "Multi-Signature: Decentralized governance controls",
      "Circuit Breakers: Emergency pause mechanisms"
    ],
    "🚨 Real-Time Monitoring": [
      "24/7 Security Dashboard: Live threat detection",
      "MEV Protection: Sandwich attack prevention",
      "Price Oracle Security: TWAP-based price feeds",
      "Transaction Analysis: Automated risk scoring"
    ]
  };

  // Technology Stack
  const techStack = {
    frontend: {
      icon: Code,
      title: "🎨 Frontend",
      items: [
        { name: "React 18", desc: "+ TypeScript + Vite" },
        { name: "Tailwind CSS", desc: "+ shadcn/ui components" },
        { name: "ethers.js", desc: "for Web3 integration" },
        { name: "Recharts", desc: "for data visualization" },
        { name: "Framer Motion", desc: "for animations" }
      ]
    },
    backend: {
      icon: Cpu,
      title: "⚙️ Backend",
      items: [
        { name: "Node.js", desc: "+ Express.js" },
        { name: "SQLite", desc: "with TypeScript ORM" },
        { name: "WebSocket", desc: "for real-time data" },
        { name: "CoinMarketCap API", desc: "integration" },
        { name: "Li.Fi SDK", desc: "for cross-chain bridging" }
      ]
    },
    blockchain: {
      icon: Layers,
      title: "⛓️ Blockchain",
      items: [
        { name: "Xphere Network", desc: "(Primary)" },
        { name: "Solidity ^0.8.19", desc: "smart contracts" },
        { name: "10 Production Contracts", desc: "deployed" },
        { name: "OpenZeppelin", desc: "security libraries" },
        { name: "MEV protection", desc: "mechanisms" }
      ]
    }
  };

  // Roadmap
  const roadmap = [
    {
      phase: "✅ Completed (v1.0.0)",
      items: [
        "Core DEX functionality with AMM",
        "Advanced trading features (Options, Futures, Flash Loans)",
        "Cross-chain bridge integration",
        "Security audit and improvements",
        "Mobile-responsive UI"
      ],
      progress: 100
    },
    {
      phase: "🔄 In Progress (v1.1.0)",
      items: [
        "Enhanced analytics dashboard",
        "More trading pairs",
        "Mobile app development",
        "Additional network integrations"
      ],
      progress: 45
    },
    {
      phase: "🎯 Future Plans (v2.0.0)",
      items: [
        "Governance voting interface",
        "NFT marketplace integration",
        "Advanced portfolio management",
        "Institutional trading tools",
        "Layer 2 scaling solutions"
      ],
      progress: 10
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Enhanced Design */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            {/* Logo and Title */}
            <div className="flex items-center justify-center mx-auto mb-8">
              <img 
                src="https://rebel-orangutan-6f0.notion.site/image/attachment%3Aea1e41e5-28b3-486e-bc20-978f86c7e213%3Alogo_xps3.png?table=block&id=22fa68fd-c4b9-80a2-93a5-edbcfa276af7&spaceId=5cba68fd-c4b9-81bc-873e-0003fe11fd03&width=860&userId=&cache=v2"
                alt="XPS"
                className="w-24 h-24 object-contain animate-pulse"
              />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              XpSwap DEX
            </h1>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
              The Most Advanced Decentralized Exchange on Xphere Network
            </p>
            
            {/* Why Choose XPSwap */}
            <div className="grid md:grid-cols-5 gap-4 max-w-6xl mx-auto mb-12">
              {whyChooseReasons.map((reason, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-r ${reason.color} flex items-center justify-center`}>
                      <reason.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{reason.title}</h3>
                    <p className="text-xs text-muted-foreground">{reason.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/trading">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-lg px-8">
                  Launch App <Rocket className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/xps-staking">
                <Button size="lg" variant="outline" className="text-lg px-8 border-primary/50 hover:border-primary">
                  Earn with XPS <Star className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/analytics">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Analytics <BarChart3 className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">6+</div>
                <div className="text-sm text-muted-foreground">Supported Networks</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Live Trading</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-500 mb-2">0.3%</div>
                <div className="text-sm text-muted-foreground">Trading Fees</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Decentralized</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">⭐ Core Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need for advanced DeFi trading</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(coreFeatures).map(([category, features]) => (
              <Card key={category} className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="border-l-2 border-primary/50 pl-4">
                        <h4 className="font-semibold text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced DeFi Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">📈 Advanced DeFi Features</h2>
            <p className="text-xl text-muted-foreground">Professional-grade tools for serious traders</p>
          </div>

          <div className="space-y-8">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {feature.features.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Audits Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-red-500/5 via-orange-500/5 to-yellow-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">🔐 Security & Audits</h2>
            <p className="text-xl text-muted-foreground">Built with security as the top priority</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(securityFeatures).map(([title, features]) => (
              <Card key={title} className="bg-card/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">⚡ Technology Stack</h2>
            <p className="text-xl text-muted-foreground">Built with cutting-edge technologies</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.values(techStack).map((stack, index) => (
              <Card key={index} className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <stack.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{stack.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stack.items.map((item, idx) => (
                      <div key={idx} className="bg-background/50 rounded-lg p-3">
                        <div className="font-semibold text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
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

      {/* Roadmap Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">🗺️ Roadmap</h2>
            <p className="text-xl text-muted-foreground">Our journey to revolutionize DeFi</p>
          </div>

          <div className="space-y-6">
            {roadmap.map((phase, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{phase.phase}</CardTitle>
                    <Badge variant={phase.progress === 100 ? "default" : "secondary"}>
                      {phase.progress}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={phase.progress} className="mb-4" />
                  <div className="grid md:grid-cols-2 gap-2">
                    {phase.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${phase.progress === 100 ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Support Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">💬 Community & Support</h2>
            <p className="text-xl text-muted-foreground">Join our growing ecosystem</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Join Our Community */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">💬 Join Our Community</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <a href="https://github.com/loganko83/xpswapmcp" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  </a>
                  <a href="https://xpsproject.blogspot.com/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Blog
                    </Button>
                  </a>
                  <a href="https://t.me/xpscommunity" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Telegram
                    </Button>
                  </a>
                  <a href="https://x.com/xpsproject" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <Twitter className="w-4 h-4 mr-2" />
                      X (Twitter)
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Get Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">📞 Get Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/docs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">Documentation</div>
                      <div className="text-xs text-muted-foreground">Complete user guide</div>
                    </div>
                  </Link>
                  <Link href="/developer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <FileCode className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">Developer Guide</div>
                      <div className="text-xs text-muted-foreground">Technical documentation</div>
                    </div>
                  </Link>
                  <Link href="/api" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <Code className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">API Reference</div>
                      <div className="text-xs text-muted-foreground">API endpoints</div>
                    </div>
                  </Link>
                  <Link href="/security" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">Security Reports</div>
                      <div className="text-xs text-muted-foreground">Audit results</div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">📈 Live Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/api/health" target="_blank" className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary transition-colors">
                  <Activity className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-semibold">System Health</div>
                    <div className="text-xs text-muted-foreground">/api/health</div>
                  </div>
                </Link>
                <Link href="/analytics" className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary transition-colors">
                  <BarChart2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-semibold">Platform Analytics</div>
                    <div className="text-xs text-muted-foreground">/analytics</div>
                  </div>
                </Link>
                <Link href="/security" className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary transition-colors">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="font-semibold">Security Dashboard</div>
                    <div className="text-xs text-muted-foreground">/security</div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-t from-primary/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Ready to Experience Next-Gen DeFi?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of traders already using XpSwap for advanced DeFi trading
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/trading">
              <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-lg px-8">
                Launch App <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Read Documentation <BookOpen className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}