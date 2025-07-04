import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useMultiChainBalance } from '@/hooks/useMultiChainBalance';
import { getTokenIcon } from '@/lib/tokenUtils';
import { ArrowUpRight, ArrowDownRight, ExternalLink, RefreshCw, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
}

function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps) {
  const networks = [
    { id: 'all', name: 'All Networks', color: 'from-blue-500 to-purple-500' },
    { id: 'ethereum', name: 'Ethereum', color: 'from-blue-400 to-blue-600' },
    { id: 'bsc', name: 'BSC', color: 'from-yellow-400 to-orange-500' },
    { id: 'xphere', name: 'Xphere', color: 'from-green-400 to-blue-500' },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {networks.map((network) => (
        <Button
          key={network.id}
          variant={selectedNetwork === network.id ? "default" : "outline"}
          size="sm"
          onClick={() => onNetworkChange(network.id)}
          className={selectedNetwork === network.id ? `bg-gradient-to-r ${network.color}` : ''}
        >
          {network.name}
        </Button>
      ))}
    </div>
  );
}

interface TokenDetailsDialogProps {
  token: any;
  isOpen: boolean;
  onClose: () => void;
}

function TokenDetailsDialog({ token, isOpen, onClose }: TokenDetailsDialogProps) {
  if (!token) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img 
              src={getTokenIcon(token.symbol || '')} 
              alt={token.symbol || ''} 
              className="w-6 h-6" 
            />
            {token.symbol || 'Token'} Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-lg font-semibold">{parseFloat(token.balance || '0').toFixed(4)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">USD Value</p>
              <p className="text-lg font-semibold">${(token.usdValue || 0).toFixed(2)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Network</p>
              <Badge variant="outline" className="capitalize">{token.network || 'unknown'}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Token Name</p>
              <p className="text-sm">{token.name || token.symbol || 'Unknown Token'}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              className="w-full" 
              onClick={() => window.open(`https://coinmarketcap.com/currencies/${token.symbol?.toLowerCase() || ''}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on CoinMarketCap
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MultiChainPortfolio() {
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { 
    balances, 
    totalValue, 
    networkTotals, 
    topTokens, 
    transactions, 
    isLoadingBalances,
    isLoadingTransactions,
    error 
  } = useMultiChainBalance();

  const filteredTokens = selectedNetwork === 'all' 
    ? topTokens 
    : balances[selectedNetwork] || [];

  const filteredTransactions = selectedNetwork === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.network === selectedNetwork);

  const handleTokenClick = (token: any) => {
    setSelectedToken(token);
    setIsDetailsOpen(true);
  };

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Failed to load multi-chain portfolio data</p>
        <p className="text-sm text-muted-foreground mt-2">Please check your connection and try again</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Multi-Chain Portfolio</h2>
          <p className="text-muted-foreground">
            Track your assets across Ethereum, BSC, and Xphere networks
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={isLoadingBalances}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingBalances ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Network Selector */}
      <NetworkSelector 
        selectedNetwork={selectedNetwork} 
        onNetworkChange={setSelectedNetwork} 
      />

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoadingBalances ? '...' : totalValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +2.5% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Networks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(networkTotals).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Networks with balances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topTokens.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique tokens held
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Network Distribution */}
      {selectedNetwork === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle>Network Distribution</CardTitle>
            <CardDescription>Portfolio allocation across networks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(networkTotals).map(([network, value]) => {
                const percentage = (value / totalValue) * 100;
                return (
                  <div key={network} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{network}</span>
                      <span>${value.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Holdings</CardTitle>
              <CardDescription>
                {selectedNetwork === 'all' ? 'All tokens' : `${selectedNetwork} tokens`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBalances ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredTokens.map((token, index) => (
                      <div 
                        key={`${token.network}-${token.symbol}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleTokenClick(token)}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={getTokenIcon(token.symbol)} 
                            alt={token.symbol} 
                            className="w-8 h-8" 
                          />
                          <div>
                            <p className="font-medium">{token.symbol}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {token.network}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">${token.usdValue.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {parseFloat(token.balance).toFixed(4)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest activity across all networks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredTransactions.map((tx) => (
                      <div key={tx.hash} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            tx.type === 'send' ? 'bg-red-100 text-red-600' :
                            tx.type === 'receive' ? 'bg-green-100 text-green-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {tx.type === 'send' ? <ArrowUpRight className="w-4 h-4" /> :
                             tx.type === 'receive' ? <ArrowDownRight className="w-4 h-4" /> :
                             <RefreshCw className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{tx.type} {tx.token}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {tx.network} • {new Date(tx.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">${tx.usdValue.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.amount} {tx.token}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Token Details Dialog */}
      <TokenDetailsDialog 
        token={selectedToken}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
}