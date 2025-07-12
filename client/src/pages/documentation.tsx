import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Code, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react";

const navigationItems = [
  { id: "overview", title: "Overview", icon: BookOpen },
  { id: "getting-started", title: "Getting Started", icon: Zap },
  { id: "multi-network", title: "Multi-Network Trading", icon: Globe },
  { id: "smart-contracts", title: "Smart Contracts", icon: Shield },
  { id: "xps-whitepaper", title: "XPS Whitepaper", icon: TrendingUp },
  { id: "api-reference", title: "API Reference", icon: Code },
  { id: "defi-features", title: "DeFi Features", icon: TrendingUp },
  { id: "integration", title: "Integration Guide", icon: Globe },
  { id: "community", title: "Community", icon: Users },
];

const apiEndpoints = [
  {
    method: "GET",
    path: "/api/xp-price",
    description: "Get real-time XP token price data",
    response: `{
  "price": 0.022072,
  "change24h": -6.28,
  "volume24h": 1234567,
  "marketCap": 8901234
}`
  },
  {
    method: "POST",
    path: "/api/swap-quote",
    description: "Calculate swap quote using real AMM algorithms",
    body: `{
  "tokenIn": "XP",
  "tokenOut": "USDT",
  "amountIn": "100"
}`,
    response: `{
  "amountOut": "2.207",
  "priceImpact": "0.05",
  "fee": "0.3",
  "route": ["XP", "USDT"]
}`
  },
  {
    method: "POST",
    path: "/api/advanced-swap-quote",
    description: "Advanced swap quote with MEV protection",
    body: `{
  "poolId": 1,
  "tokenIn": "XP",
  "amountIn": "1000",
  "slippage": "0.5"
}`,
    response: `{
  "amountOut": "22.05",
  "mevRisk": "low",
  "protectionFee": "0.01",
  "estimatedGas": "120000"
}`
  },
  {
    method: "GET",
    path: "/api/farming-analytics/:poolId",
    description: "Real-time farming pool analytics",
    response: `{
  "poolId": 1,
  "apr": "125.5",
  "tvl": "1500000",
  "totalStaked": "750000",
  "rewardRate": "1000",
  "boostMultiplier": "2.5"
}`
  },
  {
    method: "POST",
    path: "/api/bridge-quote",
    description: "Get cross-chain bridge quotes via LI.FI integration",
    body: `{
  "fromChain": 1,
  "toChain": 56,
  "fromToken": "ETH",
  "toToken": "BNB",
  "amount": "1000000000000000000"
}`,
    response: `{
  "estimate": {
    "fromAmount": "1.0",
    "toAmount": "0.98",
    "gasCosts": [{"amount": "21000", "token": "ETH"}],
    "executionDuration": 300
  },
  "routes": [{
    "fromChainId": 1,
    "toChainId": 56,
    "steps": [{"tool": "lifi"}]
  }]
}`
  },
  {
    method: "POST",
    path: "/api/network-status",
    description: "Check real-time network connectivity status",
    body: `{
  "networks": ["ethereum", "bsc", "polygon"]
}`,
    response: `{
  "status": {
    "ethereum": {"connected": true, "blockNumber": "0x12345"},
    "bsc": {"connected": true, "blockNumber": "0x67890"},
    "polygon": {"connected": false, "error": "RPC timeout"}
  },
  "timestamp": 1672531200
}`
  },
  {
    method: "GET",
    path: "/api/xps/info",
    description: "Get XPS token information and market data",
    response: `{
  "name": "XpSwap Token",
  "symbol": "XPS",
  "decimals": 18,
  "totalSupply": "1000000000",
  "price": "1.00",
  "contract": "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",
  "marketData": {
    "volume24h": "150000",
    "holders": "1250",
    "totalBurned": "5000000"
  }
}`
  },
  {
    method: "GET",
    path: "/api/xps/staking-tiers",
    description: "Get XPS staking tiers and APY information",
    response: `{
  "stakingTiers": [
    {
      "period": "30 days",
      "apy": "100%",
      "minAmount": "10",
      "lockPeriod": 2592000
    },
    {
      "period": "90 days", 
      "apy": "150%",
      "minAmount": "50",
      "lockPeriod": 7776000
    },
    {
      "period": "180 days",
      "apy": "250%", 
      "minAmount": "100",
      "lockPeriod": 15552000
    },
    {
      "period": "365 days",
      "apy": "400%",
      "minAmount": "500",
      "lockPeriod": 31536000
    }
  ]
}`
  },
  {
    method: "POST",
    path: "/api/xps/purchase",
    description: "Purchase XPS tokens with XP",
    body: `{
  "walletAddress": "0x...",
  "xpAmount": "60.11",
  "xpsAmount": "1.0",
  "transactionHash": "0x..."
}`,
    response: `{
  "success": true,
  "transactionHash": "0x...",
  "xpsAmount": "1.0",
  "exchangeRate": "60.11",
  "timestamp": 1672531200
}`
  },
  {
    method: "POST",
    path: "/api/xps/stake",
    description: "Stake XPS tokens for rewards",
    body: `{
  "walletAddress": "0x...",
  "amount": "100",
  "lockPeriod": 7776000
}`,
    response: `{
  "success": true,
  "stakingId": "stake_123",
  "amount": "100",
  "apy": "150%",
  "unlockTime": 1680307200,
  "transactionHash": "0x..."
}`
  },
  {
    method: "POST",
    path: "/api/xps/calculate-fee-discount",
    description: "Calculate fee discount based on XPS holdings",
    body: `{
  "xpsBalance": "1000",
  "tradeAmount": "500"
}`,
    response: `{
  "feeDiscountTier": "Silver",
  "discountPercentage": "25%",
  "originalFee": "1.5",
  "discountedFee": "1.125",
  "savings": "0.375"
}`
  },
  {
    method: "POST",
    path: "/api/add-liquidity",
    description: "Add liquidity to pools with XPS rewards",
    body: `{
  "tokenA": "XP",
  "tokenB": "USDT",
  "amountA": "1000",
  "amountB": "16.58",
  "userAddress": "0x..."
}`,
    response: `{
  "success": true,
  "liquidityPool": {
    "id": 1,
    "totalLiquidity": "1016.58",
    "baseAPR": "15.2%",
    "xpsBonus": "12.8%",
    "totalAPR": "28.0%"
  },
  "transactionHash": "0x..."
}`
  }
];

const smartContracts = [
  {
    name: "XpSwapToken (XPS)",
    address: "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",
    description: "Native XPS token with fee discount tiers and deflationary mechanisms",
    functions: [
      "transfer",
      "approve",
      "burn",
      "getFeeDiscountTier",
      "updateFeeDiscountTier"
    ]
  },
  {
    name: "XpSwapDEX",
    address: "0x5b0bcfa1490d",
    description: "Main DEX router with real AMM algorithms (x * y = k)",
    functions: [
      "swapExactTokensForTokens",
      "addLiquidity",
      "removeLiquidity",
      "getAmountOut",
      "getAmountIn"
    ]
  },
  {
    name: "XpSwapAdvancedAMM",
    address: "0x123c1d407d04a",
    description: "Advanced automated market maker with MEV protection",
    functions: [
      "swapExactTokensForTokens",
      "addLiquidity",
      "removeLiquidity",
      "getAmountOut",
      "calculateMevRisk"
    ]
  },
  {
    name: "XpSwapLiquidityPool",
    address: "0xe909098d05c06",
    description: "Time-locked liquidity and auto-compounding system",
    functions: [
      "stake",
      "unstake",
      "claimRewards",
      "compound",
      "getPoolInfo"
    ]
  },
  {
    name: "XpSwapStaking",
    address: "0xdcbe5c4f166a3",
    description: "XPS staking rewards with APY up to 400%",
    functions: [
      "stakeXPS",
      "unstakeXPS",
      "claimRewards",
      "getStakingInfo",
      "calculateRewards"
    ]
  },
  {
    name: "XpSwapFarmingRewards",
    address: "0xb99484ee2d452",
    description: "Yield farming with governance token boosting",
    functions: [
      "stakeLPTokens",
      "claimRewards",
      "boostRewards",
      "getRewardRate",
      "getUserFarmInfo"
    ]
  },
  {
    name: "XpSwapGovernanceToken",
    address: "0xa62a2b8601833",
    description: "Governance with delegated voting and vesting schedules",
    functions: [
      "delegate",
      "propose",
      "vote",
      "execute",
      "getVotingPower"
    ]
  },
  {
    name: "XpSwapRevenueManager",
    address: "0xb3cde158e6838",
    description: "Revenue distribution and XPS token burning mechanism",
    functions: [
      "distributeRevenue",
      "burnXPS",
      "updateBurnRate",
      "getRevenueStats"
    ]
  },
  {
    name: "XpSwapCrosschainBridge",
    address: "0x1301bc0dccf81",
    description: "Multi-network asset transfer bridge",
    functions: [
      "lockTokens",
      "unlockTokens",
      "verifyProof",
      "emergencyPause",
      "getBridgeInfo"
    ]
  }
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("overview");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // URL 해시를 통한 섹션 이동 처리
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && navigationItems.some(item => item.id === hash)) {
      setActiveSection(hash);
    }
    
    // Footer API 링크에서 오는 이벤트 리스너
    const handleNavigateToApi = () => {
      setActiveSection('api-reference');
    };
    
    window.addEventListener('navigate-to-api', handleNavigateToApi);
    
    return () => {
      window.removeEventListener('navigate-to-api', handleNavigateToApi);
    };
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = "json", id }: { code: string; language?: string; id: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">XpSwap DEX Documentation</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Enterprise-grade decentralized exchange built on Xphere blockchain
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">Real AMM Engine</Badge>
                <Badge variant="secondary">MEV Protection</Badge>
                <Badge variant="secondary">5 Smart Contracts</Badge>
                <Badge variant="secondary">Real-time Price Data</Badge>
                <Badge variant="secondary">Cross-chain Bridge</Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Core Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Real constant product formula (x * y = k) AMM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>MEV protection and sandwich attack prevention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Up to 2.5x yield boosting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Multi-network cross-chain bridge</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Tech Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Xphere Blockchain (Chain ID: 20250217)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Solidity + OpenZeppelin libraries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>React + TypeScript + ethers.js</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>CoinMarketCap real-time API</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Architecture Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  id="architecture"
                  language="text"
                  code={`XpSwap DEX Architecture

┌─ Frontend (React + TypeScript)
│  ├─ Real-time price data (CoinMarketCap API)
│  ├─ MetaMask wallet integration
│  ├─ Advanced swap interface
│  └─ Analytics dashboard

├─ Backend (Node.js + Express)
│  ├─ Real AMM calculation engine
│  ├─ MEV protection algorithms
│  ├─ Farming analytics API
│  └─ PostgreSQL database

└─ Smart Contracts (Solidity)
   ├─ XpSwapAdvancedAMM.sol
   ├─ XpSwapLiquidityPool.sol
   ├─ XpSwapGovernanceToken.sol
   ├─ XpSwapFarmingRewards.sol
   └─ XpSwapCrosschainBridge.sol`}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "getting-started":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Step-by-step guide to using XpSwap DEX
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>1. Connect Wallet</CardTitle>
                <CardDescription>Connect to Xphere network using MetaMask</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Network Information</h4>
                  <CodeBlock
                    id="network-config"
                    language="json"
                    code={`{
  "chainId": "0x1350829",
  "chainName": "Xphere Blockchain",
  "nativeCurrency": {
    "name": "XP",
    "symbol": "XP",
    "decimals": 18
  },
  "rpcUrls": ["https://en-bkk.x-phere.com"],
  "blockExplorerUrls": ["https://explorer.x-phere.com"]
}`}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Connection Steps</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Click "Connect Wallet" button at the top</li>
                    <li>Approve connection in MetaMask</li>
                    <li>Auto-switch to Xphere network (if needed)</li>
                    <li>Verify wallet balance</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Token Swapping</CardTitle>
                <CardDescription>Exchange tokens with real-time pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Swap Process</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Select token pair to exchange</li>
                    <li>Enter amount to exchange</li>
                    <li>Set slippage tolerance (0.1% ~ 5.0%)</li>
                    <li>Review swap quote (real AMM calculation)</li>
                    <li>Verify MEV protection options</li>
                    <li>Execute transaction</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Note:</strong> All swaps are calculated using the real constant product formula (x * y = k), 
                    with MEV protection automatically applied.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Liquidity Provision</CardTitle>
                <CardDescription>Participate in liquidity pools to earn fee rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Liquidity Provision Steps</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Navigate to Pool page</li>
                    <li>Select liquidity pool to participate in</li>
                    <li>Enter token pair and amounts (optimal ratio auto-calculated)</li>
                    <li>Choose time-lock option (30 days ~ 365 days)</li>
                    <li>Review expected APR</li>
                    <li>Execute liquidity provision</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "multi-network":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Multi-Network Trading</h1>
              <p className="text-xl text-muted-foreground mb-6">
                XpSwap supports seamless trading across 40+ blockchain networks via LI.FI integration
              </p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Supported Networks
                  </CardTitle>
                  <CardDescription>
                    Trade assets across major blockchain networks with real-time RPC connectivity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-900">Ethereum</div>
                      <div className="text-sm text-blue-700">Chain ID: 1</div>
                      <div className="text-xs text-blue-600">RPC: eth.llamarpc.com</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="font-semibold text-yellow-900">Binance Smart Chain</div>
                      <div className="text-sm text-yellow-700">Chain ID: 56</div>
                      <div className="text-xs text-yellow-600">RPC: bsc-dataseed1.defibit.io</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-semibold text-purple-900">Polygon</div>
                      <div className="text-sm text-purple-700">Chain ID: 137</div>
                      <div className="text-xs text-purple-600">RPC: polygon-rpc.com</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-900">Arbitrum</div>
                      <div className="text-sm text-blue-700">Chain ID: 42161</div>
                      <div className="text-xs text-blue-600">RPC: arb1.arbitrum.io</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="font-semibold text-red-900">Optimism</div>
                      <div className="text-sm text-red-700">Chain ID: 10</div>
                      <div className="text-xs text-red-600">RPC: mainnet.optimism.io</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-900">Xphere</div>
                      <div className="text-sm text-green-700">Chain ID: 20250217</div>
                      <div className="text-xs text-green-600">RPC: en-bkk.x-phere.com</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">🌐 Real-time Network Status</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Live RPC connectivity monitoring</li>
                        <li>• Network health indicators</li>
                        <li>• Automatic failover to backup RPCs</li>
                        <li>• Visual network status dashboard</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">⚡ One-click Network Addition</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Auto-add networks to MetaMask</li>
                        <li>• Pre-configured RPC endpoints</li>
                        <li>• Automatic network switching</li>
                        <li>• Built-in network detection</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">🔗 Cross-chain Bridge</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• LI.FI SDK integration</li>
                        <li>• 40+ blockchain support</li>
                        <li>• Real-time bridge quotes</li>
                        <li>• Multi-route optimization</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">💧 High Availability</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Multiple fallback RPC URLs</li>
                        <li>• Load balancing across providers</li>
                        <li>• 99.9% uptime guarantee</li>
                        <li>• Redundant infrastructure</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How to Use Multi-Network Trading</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Access Multi-Network Interface</h4>
                      <p className="text-sm text-muted-foreground">
                        Navigate to the Swap page and scroll to the "Multi-Network Trading" section
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">2. Check Network Status</h4>
                      <p className="text-sm text-muted-foreground">
                        View real-time network connectivity in the "Network Status" panel
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">3. Add Networks to MetaMask</h4>
                      <p className="text-sm text-muted-foreground">
                        Click the "+" button next to any network to add it to your MetaMask wallet
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">4. Select Source and Target Networks</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose your source network (where you have tokens) and target network (where you want tokens)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">5. Get Real-time Quotes</h4>
                      <p className="text-sm text-muted-foreground">
                        Enter amount and receive instant quotes from multiple bridge providers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technical Implementation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">RPC Configuration</h4>
                      <CodeBlock
                        id="rpc-config"
                        language="typescript"
                        code={`// Multiple fallback RPC endpoints for high availability
const SUPPORTED_NETWORKS = {
  ETHEREUM: {
    chainId: 1,
    name: "Ethereum",
    rpcUrls: [
      "https://eth.llamarpc.com",
      "https://rpc.ankr.com/eth",
      "https://ethereum.publicnode.com"
    ]
  },
  BSC: {
    chainId: 56,
    name: "Binance Smart Chain",
    rpcUrls: [
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed.binance.org"
    ]
  }
};`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Network Status Monitoring</h4>
                      <CodeBlock
                        id="network-monitor"
                        language="typescript"
                        code={`// Real-time network connectivity testing
export async function checkNetworkStatus(rpcUrl: string): Promise<boolean> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "smart-contracts":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Smart Contracts</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Detailed information about XpSwap's 9 deployed smart contracts on Xphere Network
              </p>
            </div>

            <div className="grid gap-6">
              {smartContracts.map((contract, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {contract.name}
                      </CardTitle>
                      <Badge variant="outline">Verified</Badge>
                    </div>
                    <CardDescription>{contract.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Contract Address</h4>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {contract.address}
                      </code>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Key Functions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {contract.functions.map((func, i) => (
                          <code key={i} className="bg-muted px-2 py-1 rounded text-sm">
                            {func}()
                          </code>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Network</h4>
                    <p>Xphere Blockchain (Chain ID: 20250217)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Compiler Version</h4>
                    <p>Solidity ^0.8.19</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Libraries</h4>
                    <p>OpenZeppelin Contracts v4.9.0</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Deployment Status</h4>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ <strong>Successfully Deployed</strong> - All 9 smart contracts have been deployed to Xphere Network with 20 XP tokens funding
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        Deployment Date: January 12, 2025
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Deployment Scripts</h4>
                    <CodeBlock
                      id="deploy-script"
                      language="bash"
                      code={`# Compile smart contracts
node scripts/compile.js

# Deploy to Xphere network
node scripts/deployAdvancedContracts.js

# Verify deployment
node scripts/deployAdvancedContracts.js verify`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "api-reference":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">API Reference</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Detailed information for all XpSwap DEX API endpoints
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Base URL</h4>
                    <code className="bg-muted px-2 py-1 rounded">
                      https://your-domain.replit.app
                    </code>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Content-Type</h4>
                    <code className="bg-muted px-2 py-1 rounded">application/json</code>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rate Limiting</h4>
                    <p>100 requests per minute per IP</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {apiEndpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge 
                        variant={endpoint.method === "GET" ? "secondary" : "default"}
                        className="font-mono"
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-lg">{endpoint.path}</code>
                    </CardTitle>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {endpoint.body && (
                      <div>
                        <h4 className="font-semibold mb-2">Request Body</h4>
                        <CodeBlock
                          id={`request-${index}`}
                          code={endpoint.body}
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <CodeBlock
                        id={`response-${index}`}
                        code={endpoint.response}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Error Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Error Format</h4>
                    <CodeBlock
                      id="error-format"
                      code={`{
  "error": {
    "code": "INSUFFICIENT_LIQUIDITY",
    "message": "Insufficient liquidity for this trading pair",
    "details": {
      "requested": "1000",
      "available": "500"
    }
  }
}`}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">HTTP Status Codes</h4>
                    <ul className="space-y-1 text-sm">
                      <li><code>200</code> - Success</li>
                      <li><code>400</code> - Bad Request</li>
                      <li><code>401</code> - Unauthorized</li>
                      <li><code>429</code> - Rate Limit Exceeded</li>
                      <li><code>500</code> - Internal Server Error</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "defi-features":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">DeFi Features</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Detailed guide to XpSwap's advanced DeFi features
              </p>
            </div>

            <Tabs defaultValue="amm" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="amm">AMM Engine</TabsTrigger>
                <TabsTrigger value="farming">Yield Farming</TabsTrigger>
                <TabsTrigger value="governance">Governance</TabsTrigger>
                <TabsTrigger value="bridge">Cross-Chain</TabsTrigger>
              </TabsList>

              <TabsContent value="amm" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Real AMM Engine</CardTitle>
                    <CardDescription>Automated market maker based on constant product formula (x * y = k)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Core Formula</h4>
                      <CodeBlock
                        id="amm-formula"
                        language="javascript"
                        code={`// Constant product formula (x * y = k)
function getAmountOut(amountIn, reserveIn, reserveOut) {
  const amountInWithFee = amountIn * 997; // Apply 0.3% fee
  const numerator = amountInWithFee * reserveOut;
  const denominator = (reserveIn * 1000) + amountInWithFee;
  return numerator / denominator;
}

// Calculate price impact
function calculatePriceImpact(amountIn, reserveIn, reserveOut) {
  const amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
  const currentPrice = reserveOut / reserveIn;
  const executionPrice = amountOut / amountIn;
  return Math.abs((executionPrice - currentPrice) / currentPrice) * 100;
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">MEV Protection</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Sandwich attack detection and blocking</li>
                        <li>• Dynamic fee adjustment (volatility-based)</li>
                        <li>• Maximum slippage protection</li>
                        <li>• Timestamp-based verification</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="farming" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Yield Farming</CardTitle>
                    <CardDescription>Advanced farming system with up to 2.5x boosting capability</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Boosting System</h4>
                      <CodeBlock
                        id="boost-formula"
                        language="javascript"
                        code={`// Boost calculation formula
function calculateBoost(lpStaked, govTokenStaked, lockDuration) {
  const timeMultiplier = Math.min(lockDuration / 365, 1.0); // Max 1 year
  const govMultiplier = Math.min(govTokenStaked / lpStaked, 1.5); // Max 1.5x
  const baseBoost = 1.0;
  
  return baseBoost + (timeMultiplier * govMultiplier);
}

// Real APY calculation
function calculateAPY(baseReward, boost, totalStaked) {
  const boostedReward = baseReward * boost;
  return (boostedReward / totalStaked) * 365 * 100; // Annual rate
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Farming Strategies</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>Basic Farming:</strong> Base rewards from LP token staking</li>
                        <li>• <strong>Governance Boosting:</strong> Up to 1.5x with XPS token staking</li>
                        <li>• <strong>Time Locking:</strong> Additional boosting from long-term locks</li>
                        <li>• <strong>Auto-compounding:</strong> Automatic reward reinvestment</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="governance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Governance System</CardTitle>
                    <CardDescription>DAO with delegated voting and time-weighted voting power</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Voting Power Calculation</h4>
                      <CodeBlock
                        id="voting-power"
                        language="javascript"
                        code={`// Voting power calculation
function calculateVotingPower(tokenBalance, lockDuration, delegatedPower) {
  const basePower = tokenBalance;
  const timeWeight = Math.sqrt(lockDuration / 365); // Square root time weighting
  const totalPower = basePower * (1 + timeWeight) + delegatedPower;
  
  return totalPower;
}

// Proposal passing criteria
function checkProposalPassed(votesFor, votesAgainst, totalSupply) {
  const quorum = totalSupply * 0.04; // 4% quorum
  const majority = votesFor > votesAgainst;
  const quorumMet = (votesFor + votesAgainst) >= quorum;
  
  return majority && quorumMet;
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Proposal Types</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>Parameter Changes:</strong> Adjust fees, reward rates, etc.</li>
                        <li>• <strong>Protocol Upgrades:</strong> Smart contract improvements</li>
                        <li>• <strong>Treasury Management:</strong> Community fund usage</li>
                        <li>• <strong>Partnerships:</strong> Integration with other protocols</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bridge" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cross-chain Bridge</CardTitle>
                    <CardDescription>Secure asset transfer connecting 5 mainnets</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Supported Networks</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted p-2 rounded">Ethereum</div>
                        <div className="bg-muted p-2 rounded">Binance Smart Chain</div>
                        <div className="bg-muted p-2 rounded">Polygon</div>
                        <div className="bg-muted p-2 rounded">Arbitrum</div>
                        <div className="bg-muted p-2 rounded">Xphere</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Bridge Process</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Lock tokens on source chain</li>
                        <li>Multi-sig validators confirm transaction</li>
                        <li>Generate and verify Merkle proof</li>
                        <li>Mint tokens on destination chain</li>
                        <li>Transfer tokens to user</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Security Features</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Multi-signature validation (3/5 threshold)</li>
                        <li>• Daily transfer limits</li>
                        <li>• Emergency pause mechanism</li>
                        <li>• Timelock delays</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      case "xps-whitepaper":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">XPS Token Whitepaper</h1>
              <p className="text-xl text-muted-foreground mb-6">
                The native utility and governance token of XpSwap DEX
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">Deflationary</Badge>
                <Badge variant="secondary">Governance</Badge>
                <Badge variant="secondary">Fee Discounts</Badge>
                <Badge variant="secondary">Staking Rewards</Badge>
                <Badge variant="secondary">LP Mining</Badge>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Token Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-2xl">1,000,000,000</h3>
                    <p className="text-sm text-muted-foreground">Max Supply</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-2xl">XPS</h3>
                    <p className="text-sm text-muted-foreground">Token Symbol</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-2xl">ERC-20</h3>
                    <p className="text-sm text-muted-foreground">Token Standard</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• <strong>Deflationary Mechanism:</strong> Regular token burns from protocol revenue</li>
                    <li>• <strong>Fee Discounts:</strong> Up to 75% trading fee reduction for XPS holders</li>
                    <li>• <strong>Staking Rewards:</strong> Earn up to 400% APY through staking tiers</li>
                    <li>• <strong>Governance Rights:</strong> Vote on protocol improvements and parameter changes</li>
                    <li>• <strong>LP Mining Boost:</strong> Enhanced rewards for liquidity providers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">XPS Token Purchase System</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>✨ New Feature:</strong> XPS tokens can now be purchased directly with XP tokens through our integrated purchase system.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Purchase Details</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>Fixed Price:</strong> 1 XPS = 1 USD</li>
                        <li>• <strong>Payment:</strong> XP tokens at current market rate</li>
                        <li>• <strong>Current Rate:</strong> ~60 XP = 1 XPS</li>
                        <li>• <strong>Instant Transfer:</strong> Real MetaMask integration</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">How It Works</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Connect MetaMask wallet</li>
                        <li>• Enter desired XPS amount</li>
                        <li>• System calculates required XP</li>
                        <li>• XP sent to seller address</li>
                        <li>• XPS tokens transferred to buyer</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Allocation Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Liquidity Mining</span>
                        <span className="font-medium">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Staking Rewards</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Team & Development</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reserve Fund</span>
                        <span className="font-medium">8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marketing</span>
                        <span className="font-medium">5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bug Bounty</span>
                        <span className="font-medium">2%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Vesting Schedule</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Team Allocation:</strong> 4-year linear vesting with 1-year cliff
                      </div>
                      <div>
                        <strong>Development Fund:</strong> Released based on milestone completion
                      </div>
                      <div>
                        <strong>Liquidity Mining:</strong> Distributed over 4 years with declining rates
                      </div>
                      <div>
                        <strong>Staking Rewards:</strong> Continuous distribution based on staking participation
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deflationary Mechanisms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Revenue-Based Burning</h4>
                  <p className="text-sm mb-3">
                    40% of all protocol revenue is used to buy back and burn XPS tokens from the market, 
                    creating continuous deflationary pressure.
                  </p>
                  <CodeBlock
                    id="burn-mechanism"
                    language="javascript"
                    code={`// Automatic burning from protocol revenue
function distributeRevenue(uint256 amount) {
    uint256 burnAmount = (amount * 4000) / 10000; // 40%
    xpsToken.burnFromRevenue(burnAmount, "Protocol revenue burn");
    
    // Distribute remaining to team, development, marketing, etc.
    // ...
}`}
                  />
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Emergency Withdrawal Penalties</h4>
                  <p className="text-sm">
                    25% penalty on emergency withdrawals from staking is permanently burned, 
                    further reducing circulating supply.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Burn Rate Targets</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• <strong>Year 1:</strong> Target 5% of max supply burned (50M XPS)</li>
                    <li>• <strong>Year 2:</strong> Target additional 3% burned (30M XPS)</li>
                    <li>• <strong>Long-term:</strong> Maintain steady deflation through revenue burns</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utility & Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="fee-discounts" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="fee-discounts">Fee Discounts</TabsTrigger>
                    <TabsTrigger value="staking">Staking</TabsTrigger>
                    <TabsTrigger value="governance">Governance</TabsTrigger>
                    <TabsTrigger value="rewards">Rewards</TabsTrigger>
                  </TabsList>

                  <TabsContent value="fee-discounts" className="space-y-4">
                    <h4 className="font-semibold">Trading Fee Discounts</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-muted">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-muted p-2 text-left">XPS Balance</th>
                            <th className="border border-muted p-2 text-left">Discount</th>
                            <th className="border border-muted p-2 text-left">Effective Fee</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-muted p-2">1,000 XPS</td>
                            <td className="border border-muted p-2">10%</td>
                            <td className="border border-muted p-2">0.27%</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-2">5,000 XPS</td>
                            <td className="border border-muted p-2">20%</td>
                            <td className="border border-muted p-2">0.24%</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-2">10,000 XPS</td>
                            <td className="border border-muted p-2">30%</td>
                            <td className="border border-muted p-2">0.21%</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-2">50,000 XPS</td>
                            <td className="border border-muted p-2">50%</td>
                            <td className="border border-muted p-2">0.15%</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-2">100,000 XPS</td>
                            <td className="border border-muted p-2">75%</td>
                            <td className="border border-muted p-2">0.075%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="staking" className="space-y-4">
                    <h4 className="font-semibold">Staking Tiers & Rewards</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-muted">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-muted p-2 text-left">Lock Period</th>
                            <th className="border border-muted p-2 text-left">APY</th>
                            <th className="border border-muted p-2 text-left">LP Boost</th>
                            <th className="border border-muted p-2 text-left">Min Stake</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-muted p-2">30 days</td>
                            <td className="border border-muted p-2">100%</td>
                            <td className="border border-muted p-2">1.2x</td>
                            <td className="border border-muted p-2">10 XPS</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-2">90 days</td>
                            <td className="border border-muted p-2">150%</td>
                            <td className="border border-muted p-2">1.5x</td>
                            <td className="border border-muted p-2">50 XPS</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-2">180 days</td>
                            <td className="border border-muted p-2">250%</td>
                            <td className="border border-muted p-2">2.0x</td>
                            <td className="border border-muted p-2">100 XPS</td>
                          </tr>
                          <tr>
                            <td className="border border-muted p-2">365 days</td>
                            <td className="border border-muted p-2">400%</td>
                            <td className="border border-muted p-2">2.5x</td>
                            <td className="border border-muted p-2">500 XPS</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="governance" className="space-y-4">
                    <h4 className="font-semibold">Governance Participation</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium">Voting Power Calculation</h5>
                        <p className="text-sm text-muted-foreground">
                          Voting power = Base tokens × (1 + √(lock_duration/365)) + Delegated power
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium">Proposal Types</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• Protocol parameter changes (fees, rewards, etc.)</li>
                          <li>• Smart contract upgrades and improvements</li>
                          <li>• Treasury fund allocation and spending</li>
                          <li>• Partnership and integration proposals</li>
                          <li>• Emergency actions and protocol governance</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium">Voting Requirements</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• <strong>Quorum:</strong> 4% of total supply participation</li>
                          <li>• <strong>Majority:</strong> {'>'} 50% of votes cast</li>
                          <li>• <strong>Timelock:</strong> 48-hour delay for execution</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="rewards" className="space-y-4">
                    <h4 className="font-semibold">Reward Systems</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Liquidity Mining</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• Base rewards for all LP providers</li>
                          <li>• Boost multipliers for XPS stakers</li>
                          <li>• Higher rewards for key trading pairs</li>
                          <li>• Dynamic allocation based on TVL and volume</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Special Programs</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• <strong>Bug Bounty:</strong> Up to 100,000 XPS rewards</li>
                          <li>• <strong>Marketing:</strong> Community campaign rewards</li>
                          <li>• <strong>Referral:</strong> Earn XPS for bringing new users</li>
                          <li>• <strong>Developer:</strong> Grants for ecosystem building</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Economic Model & Price Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Value Accrual Mechanisms</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Revenue Sharing:</strong> 40% of protocol revenue used for token buybacks and burns
                    </li>
                    <li>
                      <strong>Utility Demand:</strong> Fee discounts create consistent buying pressure
                    </li>
                    <li>
                      <strong>Staking Lock-up:</strong> Long-term staking reduces circulating supply
                    </li>
                    <li>
                      <strong>Governance Premium:</strong> Voting rights add intrinsic value
                    </li>
                    <li>
                      <strong>LP Boost Requirement:</strong> Staking needed for maximum farming rewards
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Deflationary Schedule</h4>
                  <CodeBlock
                    id="deflation-schedule"
                    language="javascript"
                    code={`// Projected token burn over time
Year 1: 50,000,000 XPS burned (5% of max supply)
Year 2: 30,000,000 XPS burned (3% of max supply)  
Year 3: 20,000,000 XPS burned (2% of max supply)
Year 4+: Revenue-based burns continue indefinitely

// Factors affecting burn rate:
- Trading volume (higher volume = more fees = more burns)
- Protocol adoption (more users = more utility demand)
- Market conditions (bear markets may reduce burns)
- Governance decisions (burn rate can be adjusted)`}
                  />
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Price Support Mechanisms</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium">Automatic Stabilizers</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Revenue-based buybacks increase during high volume</li>
                        <li>• Staking rewards adjust based on participation</li>
                        <li>• Emergency burn fund for market protection</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium">Manual Interventions</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Emergency burns from treasury</li>
                        <li>• Governance-approved buyback programs</li>
                        <li>• Strategic partnership announcements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Roadmap & Future Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Q1 2025</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• XPS token launch</li>
                      <li>• Staking system deployment</li>
                      <li>• Fee discount implementation</li>
                      <li>• Initial liquidity mining</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Q2 2025</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Governance system activation</li>
                      <li>• Cross-chain bridge expansion</li>
                      <li>• Advanced farming features</li>
                      <li>• Mobile app integration</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Q3-Q4 2025</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Multi-chain token deployment</li>
                      <li>• Institutional staking products</li>
                      <li>• DeFi ecosystem partnerships</li>
                      <li>• Layer 2 integrations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Factors & Disclaimers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Important Notice</h4>
                  <p className="text-sm">
                    XPS tokens are utility tokens designed for use within the XpSwap ecosystem. 
                    This document is for informational purposes only and does not constitute 
                    investment advice. Token values may fluctuate and past performance does not 
                    guarantee future results.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Key Risks</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Smart contract risks and potential vulnerabilities</li>
                    <li>• Market volatility and liquidity risks</li>
                    <li>• Regulatory changes affecting DeFi protocols</li>
                    <li>• Technology risks and blockchain network issues</li>
                    <li>• Competition from other DEX platforms</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "integration":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Integration Guide</h1>
              <p className="text-xl text-muted-foreground mb-6">
                How to integrate XpSwap into other projects
              </p>
            </div>

            <Tabs defaultValue="frontend" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="frontend">Frontend SDK</TabsTrigger>
                <TabsTrigger value="backend">Backend API</TabsTrigger>
                <TabsTrigger value="smart-contract">Smart Contract</TabsTrigger>
              </TabsList>

              <TabsContent value="frontend" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Frontend Integration</CardTitle>
                    <CardDescription>Integrate XpSwap widget into React/Vue/Angular apps</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Installation</h4>
                      <CodeBlock
                        id="npm-install"
                        language="bash"
                        code={`npm install @xpswap/widget ethers`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Basic Usage</h4>
                      <CodeBlock
                        id="basic-usage"
                        language="javascript"
                        code={`import { XpSwapWidget } from '@xpswap/widget';

function App() {
  const config = {
    apiUrl: 'https://your-domain.replit.app',
    network: {
      chainId: 20250217,
      rpcUrl: 'https://en-bkk.x-phere.com'
    },
    theme: 'dark', // 'light' | 'dark' | 'auto'
    defaultTokens: ['XP', 'USDT'],
    slippageTolerance: 0.5
  };

  return (
    <XpSwapWidget
      config={config}
      onSwapComplete={(txHash) => console.log('Swap completed:', txHash)}
      onError={(error) => console.error('Swap error:', error)}
    />
  );
}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="backend" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Backend API Integration</CardTitle>
                    <CardDescription>Using XpSwap API on server side</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Node.js Example</h4>
                      <CodeBlock
                        id="nodejs-example"
                        language="javascript"
                        code={`const axios = require('axios');

class XpSwapAPI {
  constructor(baseURL = 'https://your-domain.replit.app') {
    this.baseURL = baseURL;
  }

  async getPrice(tokenSymbol) {
    const response = await axios.get(\`\${this.baseURL}/api/token-prices\`);
    return response.data[tokenSymbol];
  }

  async getSwapQuote(tokenIn, tokenOut, amountIn) {
    const response = await axios.post(\`\${this.baseURL}/api/swap-quote\`, {
      tokenIn,
      tokenOut,
      amountIn
    });
    return response.data;
  }

  async getFarmingInfo(poolId) {
    const response = await axios.get(\`\${this.baseURL}/api/farming-analytics/\${poolId}\`);
    return response.data;
  }
}

// Usage example
const xpswap = new XpSwapAPI();

async function example() {
  // Get XP token price
  const xpPrice = await xpswap.getPrice('XP');
  console.log('XP Price:', xpPrice);

  // Request swap quote
  const quote = await xpswap.getSwapQuote('XP', 'USDT', '100');
  console.log('Swap Quote:', quote);

  // Get farming information
  const farmInfo = await xpswap.getFarmingInfo(1);
  console.log('Farm Info:', farmInfo);
}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="smart-contract" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Smart Contract Integration</CardTitle>
                    <CardDescription>Calling XpSwap from other contracts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Solidity Interface</h4>
                      <CodeBlock
                        id="solidity-interface"
                        language="solidity"
                        code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IXpSwapAMM {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) external pure returns (uint amountOut);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
}

contract MyContract {
    IXpSwapAMM constant xpswap = IXpSwapAMM(0x...); // XpSwap address

    function performSwap(
        address tokenIn,
        address tokenOut,
        uint amountIn,
        uint minAmountOut
    ) external {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        xpswap.swapExactTokensForTokens(
            amountIn,
            minAmountOut,
            path,
            msg.sender,
            block.timestamp + 300
        );
    }
}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      case "community":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Community</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Join the XpSwap community and stay up to date with the latest news
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Social Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Discord Community
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Telegram Channel
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Follow on Twitter
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Developer Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      GitHub Repository
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Bug Reports
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Feature Requests
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contributing</CardTitle>
                <CardDescription>Participate in improving the XpSwap protocol</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Development Participation</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Smart contract security audits</li>
                    <li>• Frontend UI/UX improvements</li>
                    <li>• New DeFi feature proposals</li>
                    <li>• Documentation and tutorial writing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Governance Participation</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Vote with XPS tokens</li>
                    <li>• Create protocol improvement proposals</li>
                    <li>• Participate in community discussions</li>
                    <li>• Join Ambassador program</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support & Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Frequently Asked Questions</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• <strong>Q:</strong> What are XpSwap's fees?</li>
                    <li>• <strong>A:</strong> Base swap fee is 0.3%, dynamically adjusted based on volatility.</li>
                    <li>• <strong>Q:</strong> When can I claim farming rewards?</li>
                    <li>• <strong>A:</strong> Rewards accumulate in real-time and can be claimed anytime.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Technical Support</h4>
                  <p className="text-sm">
                    For technical issues or questions, please use the #support channel on Discord.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <nav className="space-y-1 p-4">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant={activeSection === item.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setActiveSection(item.id)}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {item.title}
                        </Button>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardContent className="p-8">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}