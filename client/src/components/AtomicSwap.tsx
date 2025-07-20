import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUpDown, 
  Clock, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Copy,
  ExternalLink,
  RefreshCw,
  Lock,
  Unlock,
  Hash
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/useWeb3";

interface AtomicSwapContract {
  id: string;
  initiator: string;
  participant: string;
  amount: number;
  token: string;
  hashedSecret: string;
  lockTime: number;
  status: 'pending' | 'locked' | 'redeemed' | 'refunded' | 'expired';
  network: string;
  counterpartyNetwork: string;
  createdAt: number;
  expiresAt: number;
}

interface Token {
  symbol: string;
  name: string;
  network: string;
  icon: string;
  balance: number;
}

const SUPPORTED_TOKENS: Token[] = [
  { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', icon: '₿', balance: 0.125 },
  { symbol: 'ETH', name: 'Ethereum', network: 'Ethereum', icon: 'Ξ', balance: 2.45 },
  { symbol: 'XP', name: 'Xphere', network: 'Xphere', icon: '⚡', balance: 1250.0 },
  { symbol: 'BNB', name: 'BNB Chain', network: 'BSC', icon: '💎', balance: 5.8 },
  { symbol: 'MATIC', name: 'Polygon', network: 'Polygon', icon: '🔷', balance: 850.5 },
  { symbol: 'AVAX', name: 'Avalanche', network: 'Avalanche', icon: '🔺', balance: 12.3 }
];

const MOCK_CONTRACTS: AtomicSwapContract[] = [
  {
    id: "0x123...abc",
    initiator: "0x742d35Cc6e68B4aB8b7C8b8A8Bb7e8Cc9c3D2E1F",
    participant: "0x456d35Cc6e68B4aB8b7C8b8A8Bb7e8Cc9c3D2E1F",
    amount: 1.5,
    token: "ETH",
    hashedSecret: "0x7b227b502c9b86a4b6e8b7c8d9e0f1a2b3c4d5e6",
    lockTime: 24,
    status: "locked",
    network: "Ethereum",
    counterpartyNetwork: "Bitcoin",
    createdAt: Date.now() - 3600000,
    expiresAt: Date.now() + 82800000
  },
  {
    id: "0x789...def",
    initiator: "0x742d35Cc6e68B4aB8b7C8b8A8Bb7e8Cc9c3D2E1F",
    participant: "0x987d35Cc6e68B4aB8b7C8b8A8Bb7e8Cc9c3D2E1F",
    amount: 0.025,
    token: "BTC",
    hashedSecret: "0x8c338c612d9c86a4b6e8b7c8d9e0f1a2b3c4d5e6",
    lockTime: 48,
    status: "pending",
    network: "Bitcoin",
    counterpartyNetwork: "Xphere",
    createdAt: Date.now() - 1800000,
    expiresAt: Date.now() + 169200000
  }
];

export function AtomicSwap() {
  const [activeTab, setActiveTab] = useState("create");
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState("");
  const [counterpartyAddress, setCounterpartyAddress] = useState("");
  const [lockTime, setLockTime] = useState("24");
  const [secret, setSecret] = useState("");
  const [hashedSecret, setHashedSecret] = useState("");
  const [contracts, setContracts] = useState<AtomicSwapContract[]>(MOCK_CONTRACTS);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedContract, setSelectedContract] = useState<AtomicSwapContract | null>(null);

  const { toast } = useToast();
  const { wallet } = useWeb3();

  // Generate random secret
  const generateSecret = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const secret = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    setSecret(secret);
    
    // Generate hash (simplified - would use actual crypto functions)
    const hash = "0x" + Array.from(secret).map(c => c.charCodeAt(0).toString(16)).join('').slice(0, 64);
    setHashedSecret(hash);
  };

  const createAtomicSwap = async () => {
    if (!fromToken || !toToken || !amount || !counterpartyAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Simulate contract creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newContract: AtomicSwapContract = {
        id: "0x" + getSecureRandom().toString(16).slice(2, 10) + "...abc",
        initiator: wallet?.address || "0x742d35Cc6e68B4aB8b7C8b8A8Bb7e8Cc9c3D2E1F",
        participant: counterpartyAddress,
        amount: parseFloat(amount),
        token: fromToken.symbol,
        hashedSecret,
        lockTime: parseInt(lockTime),
        status: "pending",
        network: fromToken.network,
        counterpartyNetwork: toToken.network,
        createdAt: Date.now(),
        expiresAt: Date.now() + (parseInt(lockTime) * 3600000)
      };

      setContracts(prev => [newContract, ...prev]);
      
      toast({
        title: "Atomic Swap Created",
        description: `Contract ${newContract.id} created successfully`,
      });

      // Reset form
      setAmount("");
      setCounterpartyAddress("");
      setSecret("");
      setHashedSecret("");
      setActiveTab("manage");
      
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create atomic swap contract",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const redeemContract = async (contractId: string) => {
    setContracts(prev => prev.map(contract => 
      contract.id === contractId 
        ? { ...contract, status: 'redeemed' as const }
        : contract
    ));
    
    toast({
      title: "Contract Redeemed",
      description: `Successfully redeemed contract ${contractId}`,
    });
  };

  const refundContract = async (contractId: string) => {
    setContracts(prev => prev.map(contract => 
      contract.id === contractId 
        ? { ...contract, status: 'refunded' as const }
        : contract
    ));
    
    toast({
      title: "Contract Refunded",
      description: `Successfully refunded contract ${contractId}`,
    });
  };

  const getStatusBadge = (status: AtomicSwapContract['status']) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", icon: Clock, label: "Pending" },
      locked: { color: "bg-blue-500", icon: Lock, label: "Locked" },
      redeemed: { color: "bg-green-500", icon: CheckCircle, label: "Redeemed" },
      refunded: { color: "bg-orange-500", icon: RefreshCw, label: "Refunded" },
      expired: { color: "bg-red-500", icon: XCircle, label: "Expired" }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Text copied successfully",
    });
  };

  const getTimeRemaining = (expiresAt: number) => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Atomic Swaps</h1>
        <p className="text-muted-foreground">
          Trustless cross-chain token exchanges using Hash Time-Locked Contracts (HTLCs)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Swaps</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">98.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Avg. Time</p>
                <p className="text-2xl font-bold">12m</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Volume 24h</p>
                <p className="text-2xl font-bold">$2.1M</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Swap</TabsTrigger>
          <TabsTrigger value="manage">My Contracts</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        {/* Create Swap Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Atomic Swap</CardTitle>
              <CardDescription>
                Create a trustless cross-chain swap contract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>From Token</Label>
                  <Select onValueChange={(value) => setFromToken(SUPPORTED_TOKENS.find(t => t.symbol === value) || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token to send" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_TOKENS.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center space-x-2">
                            <span>{token.icon}</span>
                            <span>{token.symbol}</span>
                            <span className="text-xs text-muted-foreground">({token.network})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fromToken && (
                    <p className="text-xs text-muted-foreground">
                      Balance: {fromToken.balance} {fromToken.symbol}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>To Token</Label>
                  <Select onValueChange={(value) => setToToken(SUPPORTED_TOKENS.find(t => t.symbol === value) || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token to receive" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_TOKENS.filter(t => t.symbol !== fromToken?.symbol).map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center space-x-2">
                            <span>{token.icon}</span>
                            <span>{token.symbol}</span>
                            <span className="text-xs text-muted-foreground">({token.network})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amount and Counterparty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lock Time (hours)</Label>
                  <Select value={lockTime} onValueChange={setLockTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="72">72 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Counterparty Address</Label>
                <Input
                  placeholder="0x742d35Cc6e68B4aB8b7C8b8A8Bb7e8Cc9c3D2E1F"
                  value={counterpartyAddress}
                  onChange={(e) => setCounterpartyAddress(e.target.value)}
                />
              </div>

              {/* Secret Generation */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <Label>Secret & Hash</Label>
                  <Button variant="outline" size="sm" onClick={generateSecret}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
                
                {secret && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Secret (Keep Private)</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          value={secret} 
                          readOnly 
                          type="password"
                          className="font-mono text-xs"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(secret)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs">Hash (Public)</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          value={hashedSecret} 
                          readOnly 
                          className="font-mono text-xs"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(hashedSecret)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={createAtomicSwap} 
                disabled={isCreating || !fromToken || !toToken || !amount || !counterpartyAddress || !secret}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating Contract...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Create Atomic Swap
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Contracts Tab */}
        <TabsContent value="manage" className="space-y-6">
          <div className="space-y-4">
            {contracts.map((contract) => (
              <Card key={contract.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-mono">{contract.id}</div>
                      {getStatusBadge(contract.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getTimeRemaining(contract.expiresAt)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount & Token</p>
                      <p className="font-medium">{contract.amount} {contract.token}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Networks</p>
                      <p className="font-medium">{contract.network} → {contract.counterpartyNetwork}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Counterparty</p>
                      <p className="font-mono text-xs">{contract.participant.slice(0, 10)}...</p>
                    </div>
                  </div>
                  
                  {contract.status === 'locked' && (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => redeemContract(contract.id)}>
                        <Unlock className="w-4 h-4 mr-2" />
                        Redeem
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => refundContract(contract.id)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refund
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Public Swap Requests</CardTitle>
              <CardDescription>
                Browse available swap requests from other users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <ArrowUpDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No public swap requests available</p>
                <p className="text-sm">Check back later for new opportunities</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}