import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, ShoppingCart, DollarSign, Info, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { web3Service } from '@/lib/web3';
import { useQuery } from '@tanstack/react-query';

interface XPPrice {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export default function XPSPurchase() {
  const { toast } = useToast();
  const [xpAmount, setXpAmount] = useState('');
  const [xpsAmount, setXpsAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [xpBalance, setXpBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  // Fetch XP price data
  const { data: xpPriceData } = useQuery<XPPrice>({
    queryKey: ['/api/xp-price'],
    refetchInterval: 5000,
  });

  const XPS_PRICE_USD = 1.0; // 1 XPS = 1 USD
  const xpPriceUSD = xpPriceData?.price || 0.016641808997191483;
  const xpPerXps = XPS_PRICE_USD / xpPriceUSD;

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const connected = await web3Service.isConnected();
      setIsConnected(connected);
      if (connected) {
        const address = await web3Service.getWalletAddress();
        const balance = await web3Service.getXPBalance();
        setWalletAddress(address);
        setXpBalance(balance);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      const address = await web3Service.connectWallet();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
        
        // Load XP balance with fallback
        try {
          const balance = await web3Service.getXPBalance();
          setXpBalance(balance);
        } catch (error) {
          console.error('Failed to load XP balance:', error);
          setXpBalance('0');
        }
        
        toast({
          title: "지갑 연결 성공",
          description: "메타마스크 지갑이 성공적으로 연결되었습니다.",
        });
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast({
        title: "Wallet Connection Failed",
        description: "Failed to connect to MetaMask wallet.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleXPAmountChange = (value: string) => {
    setXpAmount(value);
    const xpNum = parseFloat(value) || 0;
    const xpsNum = xpNum / xpPerXps;
    const usdNum = xpsNum * XPS_PRICE_USD;
    setXpsAmount(xpsNum.toFixed(6));
    setUsdAmount(usdNum.toFixed(2));
  };

  const handleXPSAmountChange = (value: string) => {
    setXpsAmount(value);
    const xpsNum = parseFloat(value) || 0;
    const xpNum = xpsNum * xpPerXps;
    const usdNum = xpsNum * XPS_PRICE_USD;
    setXpAmount(xpNum.toFixed(6));
    setUsdAmount(usdNum.toFixed(2));
  };

  const handleUSDAmountChange = (value: string) => {
    setUsdAmount(value);
    const usdNum = parseFloat(value) || 0;
    const xpsNum = usdNum / XPS_PRICE_USD;
    const xpNum = xpsNum * xpPerXps;
    setXpsAmount(xpsNum.toFixed(6));
    setXpAmount(xpNum.toFixed(6));
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet first to purchase XPS tokens.",
        variant: "destructive",
      });
      return;
    }

    const xpNum = parseFloat(xpAmount);
    const xpBalanceNum = parseFloat(xpBalance);

    if (xpNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter the amount of XPS tokens to purchase.",
        variant: "destructive",
      });
      return;
    }

    if (xpNum > xpBalanceNum) {
      toast({
        title: "Insufficient Balance",
        description: "Your XP token balance is insufficient.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      toast({
        title: "Purchase in Progress",
        description: "XPS token purchase is in progress. Please confirm the transaction in MetaMask.",
      });

      // Purchase XPS through smart contract
      const purchaseResult = await web3Service.purchaseXPS(xpAmount, xpsAmount);
      
      if (purchaseResult.success) {
        // Save purchase record to backend
        const response = await fetch('/api/xps/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress,
            xpAmount,
            xpsAmount,
            transactionHash: purchaseResult.transactionHash
          })
        });

        if (response.ok) {
          const data = await response.json();
          toast({
            title: "Purchase Complete!",
            description: `${parseFloat(xpsAmount).toFixed(6)} XPS tokens have been successfully purchased. XPS tokens have been sent to your wallet.`,
          });
          
          // Update balance
          await checkWalletConnection();
          
          // Reset form
          setXpAmount('');
          setXpsAmount('');
          setUsdAmount('');
        } else {
          throw new Error('Backend purchase record failed');
        }
      } else {
        throw new Error('Smart contract purchase failed');
      }
      
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: "XPS token purchase failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Buy XPS Tokens</h1>
        <p className="text-muted-foreground">Purchase utility tokens for the XpSwap ecosystem</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Purchase Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Buy XPS Tokens
            </CardTitle>
            <CardDescription>
              Purchase XPS tokens with XP tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="text-center py-8">
                <Button onClick={connectWallet} className="w-full" disabled={loading}>
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Wallet Address:</span>
                    <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>XP Balance:</span>
                    <span className="font-semibold">{parseFloat(xpBalance).toFixed(6)} XP</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xp-amount">XP Amount to Pay</Label>
                  <Input
                    id="xp-amount"
                    type="number"
                    placeholder="0.000000"
                    value={xpAmount}
                    onChange={(e) => handleXPAmountChange(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-center py-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xps-amount">XPS Amount to Receive</Label>
                  <Input
                    id="xps-amount"
                    type="number"
                    placeholder="0.000000"
                    value={xpsAmount}
                    onChange={(e) => handleXPSAmountChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usd-amount">USD Value</Label>
                  <Input
                    id="usd-amount"
                    type="number"
                    placeholder="0.00"
                    value={usdAmount}
                    onChange={(e) => handleUSDAmountChange(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handlePurchase} 
                  className="w-full"
                  disabled={loading || !xpAmount || parseFloat(xpAmount) <= 0}
                >
                  {loading ? "Purchasing..." : "Buy XPS Tokens"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Price Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">$1.00</div>
                <div className="text-sm text-muted-foreground">XPS Price</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${xpPriceUSD.toFixed(6)}
                </div>
                <div className="text-sm text-muted-foreground">XP Price</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Exchange Rate:</span>
                <span className="font-semibold">{xpPerXps.toFixed(2)} XP = 1 XPS</span>
              </div>
              <div className="flex justify-between">
                <span>24h Change:</span>
                <Badge variant={xpPriceData?.change24h >= 0 ? "default" : "destructive"}>
                  {xpPriceData?.change24h >= 0 ? '+' : ''}{xpPriceData?.change24h.toFixed(2)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>XP Market Cap:</span>
                <span className="font-semibold">${xpPriceData?.marketCap.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>24h Volume:</span>
                <span className="font-semibold">${xpPriceData?.volume24h.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* XPS Benefits */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            XPS Token Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">Fee Discounts</h3>
              <p className="text-sm text-muted-foreground">Up to 75% trading fee discount</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold mb-1">Staking Rewards</h3>
              <p className="text-sm text-muted-foreground">Up to 400% APY staking rewards</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">Governance</h3>
              <p className="text-sm text-muted-foreground">Participate in platform decisions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> XPS token price is fixed at 1 XPS = 1 USD. 
          Based on current XP price, approximately {xpPerXps.toFixed(2)} XP equals 1 XPS.
          <br />
          <strong>Purchase Method:</strong> XP is sent to the seller address (0xf0C5...303D5f), 
          and the seller transfers XPS tokens to the buyer.
        </AlertDescription>
      </Alert>
    </div>
  );
}