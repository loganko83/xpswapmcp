import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Zap,
  Eye,
  Copy,
  ExternalLink,
  RefreshCw,
  Filter,
  Globe
} from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getTokenIcon } from "@/lib/tokenUtils";

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
}

function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps) {
  const networks = [
    { id: 'all', name: 'All Networks', logo: '🌐' },
    { id: 'ethereum', name: 'Ethereum', logo: '⟠' },
    { id: 'bsc', name: 'BSC', logo: '🟡' },
    { id: 'polygon', name: 'Polygon', logo: '🟣' },
    { id: 'arbitrum', name: 'Arbitrum', logo: '🔵' },
    { id: 'optimism', name: 'Optimism', logo: '🔴' },
    { id: 'xphere', name: 'Xphere', logo: '⚡' }
  ];

  return (
    <Select value={selectedNetwork} onValueChange={onNetworkChange}>
      <SelectTrigger className="w-48 bg-black/20 border-white/10 text-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {networks.map((network) => (
          <SelectItem key={network.id} value={network.id}>
            <div className="flex items-center gap-2">
              <span>{network.logo}</span>
              {network.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface TokenDetailsDialogProps {
  token: any;
  isOpen: boolean;
  onClose: () => void;
}

function TokenDetailsDialog({ token, isOpen, onClose }: TokenDetailsDialogProps) {
  const { toast } = useToast();

  const copyAddress = () => {
    navigator.clipboard.writeText(token.address);
    toast({
      title: "Address Copied",
      description: "Token address copied to clipboard"
    });
  };

  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src={getTokenIcon(token.symbol)} alt={token.symbol} className="w-6 h-6" />
            {token.name} ({token.symbol})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Token Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="font-medium">{parseFloat(token.balance).toFixed(6)}</div>
            </div>
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="text-sm text-muted-foreground">USD Value</div>
              <div className="font-medium">${token.usdValue?.toFixed(2) || '0.00'}</div>
            </div>
          </div>

          {/* Token Address */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Contract Address</label>
            <div className="flex items-center gap-2 p-2 bg-black/20 rounded border">
              <span className="flex-1 text-sm font-mono">{token.address}</span>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Price Info */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Price</span>
              <span className="font-medium">${token.price?.toFixed(6) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">24h Change</span>
              <span className={`font-medium ${(token.priceChange24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {(token.priceChange24h || 0) >= 0 ? '+' : ''}{(token.priceChange24h || 0).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => window.open(`https://etherscan.io/token/${token.address}`, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Explorer
            </Button>
            <Button variant="outline" className="flex-1">
              <BarChart3 className="w-4 h-4 mr-2" />
              Chart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MultiChainPortfolio() {
  const { wallet, connectWallet } = useWeb3();
  const { toast } = useToast();
  
  const [selectedNetwork, setSelectedNetwork] = useState("all");
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [tokenDetailsOpen, setTokenDetailsOpen] = useState(false);
  const [sortBy, setSortBy] = useState("value"); // value, balance, change

  // Fetch multi-chain balances
  const { data: portfolioData, isLoading, refetch } = useQuery({
    queryKey: ["/api/multichain/balances", wallet.address],
    enabled: !!wallet.address,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch token prices for portfolio tokens
  const tokenSymbols = portfolioData?.reduce((acc: string[], chain: any) => {
    const symbols = chain.tokens.map((token: any) => token.symbol);
    return [...acc, ...symbols, chain.symbol]; // Include native token
  }, []) || [];

  const { data: tokenPrices } = useTokenPrices(tokenSymbols);

  // Calculate portfolio statistics
  const portfolioStats = {
    totalValue: 0,
    totalChange24h: 0,
    totalTokens: 0,
    totalNetworks: 0
  };

  if (portfolioData && tokenPrices) {
    portfolioData.forEach((chain: any) => {
      portfolioStats.totalNetworks++;
      
      // Native token value
      const nativePrice = tokenPrices[chain.symbol]?.price || 0;
      const nativeValue = parseFloat(chain.nativeBalance) * nativePrice;
      portfolioStats.totalValue += nativeValue;
      
      // Token values
      chain.tokens.forEach((token: any) => {
        portfolioStats.totalTokens++;
        const tokenPrice = tokenPrices[token.symbol]?.price || 0;
        const tokenValue = parseFloat(token.balance) * tokenPrice;
        portfolioStats.totalValue += tokenValue;
        
        // Update token with USD value and price
        token.price = tokenPrice;
        token.usdValue = tokenValue;
        token.priceChange24h = tokenPrices[token.symbol]?.change24h || 0;
      });
    });
  }

  // Filter and sort tokens
  const getFilteredTokens = () => {
    if (!portfolioData || !tokenPrices) return [];
    
    let allTokens: any[] = [];
    
    portfolioData.forEach((chain: any) => {
      // Add native token
      const nativePrice = tokenPrices[chain.symbol]?.price || 0;
      const nativeValue = parseFloat(chain.nativeBalance) * nativePrice;
      
      if (nativeValue > 0 && (selectedNetwork === 'all' || selectedNetwork === chain.chainName.toLowerCase())) {
        allTokens.push({
          symbol: chain.symbol,
          name: `${chain.chainName} Native`,
          balance: chain.nativeBalance,
          price: nativePrice,
          usdValue: nativeValue,
          priceChange24h: tokenPrices[chain.symbol]?.change24h || 0,
          network: chain.chainName,
          chainId: chain.chainId,
          address: 'native'
        });
      }
      
      // Add ERC20 tokens
      chain.tokens.forEach((token: any) => {
        const tokenPrice = tokenPrices[token.symbol]?.price || 0;
        const tokenValue = parseFloat(token.balance) * tokenPrice;
        
        if (tokenValue > 0 && (selectedNetwork === 'all' || selectedNetwork === chain.chainName.toLowerCase())) {
          allTokens.push({
            ...token,
            price: tokenPrice,
            usdValue: tokenValue,
            priceChange24h: tokenPrices[token.symbol]?.change24h || 0,
            network: chain.chainName,
            chainId: chain.chainId
          });
        }
      });
    });
    
    // Sort tokens
    allTokens.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b.usdValue || 0) - (a.usdValue || 0);
        case 'balance':
          return parseFloat(b.balance) - parseFloat(a.balance);
        case 'change':
          return (b.priceChange24h || 0) - (a.priceChange24h || 0);
        default:
          return 0;
      }
    });
    
    return allTokens;
  };

  const filteredTokens = getFilteredTokens();

  // Calculate network distribution for pie chart
  const networkDistribution = portfolioData?.map((chain: any) => {
    const nativePrice = tokenPrices?.[chain.symbol]?.price || 0;
    const nativeValue = parseFloat(chain.nativeBalance) * nativePrice;
    
    const tokensValue = chain.tokens.reduce((sum: number, token: any) => {
      const tokenPrice = tokenPrices?.[token.symbol]?.price || 0;
      return sum + (parseFloat(token.balance) * tokenPrice);
    }, 0);
    
    const totalValue = nativeValue + tokensValue;
    const percentage = portfolioStats.totalValue > 0 ? (totalValue / portfolioStats.totalValue) * 100 : 0;
    
    return {
      name: chain.chainName,
      value: totalValue,
      percentage: percentage
    };
  }) || [];

  const openTokenDetails = (token: any) => {
    setSelectedToken(token);
    setTokenDetailsOpen(true);
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
                <p className="text-gray-300">Connect your wallet to view your multi-chain portfolio</p>
              </div>
              <Button onClick={connectWallet} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Multi-Chain Portfolio</h1>
            <p className="text-gray-300">Track your assets across multiple blockchain networks</p>
          </div>
          <div className="flex items-center gap-4">
            <NetworkSelector 
              selectedNetwork={selectedNetwork} 
              onNetworkChange={setSelectedNetwork} 
            />
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="bg-black/20 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${portfolioStats.totalValue.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">24h Change</p>
                  <p className={`text-2xl font-bold ${portfolioStats.totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {portfolioStats.totalChange24h >= 0 ? '+' : ''}{portfolioStats.totalChange24h.toFixed(2)}%
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${portfolioStats.totalChange24h >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {portfolioStats.totalChange24h >= 0 ? 
                    <TrendingUp className="w-6 h-6 text-green-400" /> : 
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Tokens</p>
                  <p className="text-2xl font-bold text-white">{portfolioStats.totalTokens}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Networks</p>
                  <p className="text-2xl font-bold text-white">{portfolioStats.totalNetworks}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Token List */}
          <div className="lg:col-span-2">
            <Card className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Portfolio Holdings
                  </CardTitle>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32 bg-black/20 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="value">By Value</SelectItem>
                      <SelectItem value="balance">By Balance</SelectItem>
                      <SelectItem value="change">By Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-400">
                      Loading portfolio...
                    </div>
                  ) : filteredTokens.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No tokens found
                    </div>
                  ) : (
                    filteredTokens.map((token, index) => (
                      <div
                        key={`${token.chainId}-${token.symbol}-${index}`}
                        className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                        onClick={() => openTokenDetails(token)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={getTokenIcon(token.symbol)} 
                              alt={token.symbol} 
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{token.symbol}</span>
                                <Badge variant="secondary" className="bg-white/10 text-white text-xs">
                                  {token.network}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">{token.name}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium text-white">
                              {parseFloat(token.balance).toFixed(6)} {token.symbol}
                            </div>
                            <div className="text-sm text-gray-400">
                              ${token.usdValue?.toFixed(2) || '0.00'}
                            </div>
                            <div className={`text-xs ${(token.priceChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {(token.priceChange24h || 0) >= 0 ? '+' : ''}{(token.priceChange24h || 0).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network Distribution */}
          <div>
            <Card className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Network Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {networkDistribution.map((network, index) => (
                  <div key={network.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{network.name}</span>
                      <div className="text-right">
                        <div className="text-white font-medium">${network.value.toFixed(2)}</div>
                        <div className="text-gray-400">{network.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <Progress 
                      value={network.percentage} 
                      className="h-2 bg-black/20"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-black/20 backdrop-blur-lg border-white/10 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Eye className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full bg-black/20 border-white/10 text-white hover:bg-white/10">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" className="w-full bg-black/20 border-white/10 text-white hover:bg-white/10">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Rebalance
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Token Details Dialog */}
      <TokenDetailsDialog
        token={selectedToken}
        isOpen={tokenDetailsOpen}
        onClose={() => setTokenDetailsOpen(false)}
      />
    </div>
  );
}