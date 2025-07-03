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
  { id: "smart-contracts", title: "Smart Contracts", icon: Shield },
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
  }
];

const smartContracts = [
  {
    name: "XpSwapAdvancedAMM",
    address: "0x...",
    description: "Advanced automated market maker with MEV protection",
    functions: [
      "swapExactTokensForTokens",
      "addLiquidity",
      "removeLiquidity",
      "getAmountOut"
    ]
  },
  {
    name: "XpSwapLiquidityPool",
    address: "0x...",
    description: "Time-locked liquidity and auto-compounding system",
    functions: [
      "stake",
      "unstake",
      "claimRewards",
      "compound"
    ]
  },
  {
    name: "XpSwapGovernanceToken",
    address: "0x...",
    description: "Governance with delegated voting and vesting schedules",
    functions: [
      "delegate",
      "propose",
      "vote",
      "execute"
    ]
  },
  {
    name: "XpSwapFarmingRewards",
    address: "0x...",
    description: "Yield farming with governance token boosting",
    functions: [
      "stakeLPTokens",
      "claimRewards",
      "boostRewards",
      "getRewardRate"
    ]
  },
  {
    name: "XpSwapCrosschainBridge",
    address: "0x...",
    description: "Multi-network asset transfer bridge",
    functions: [
      "lockTokens",
      "unlockTokens",
      "verifyProof",
      "emergencyPause"
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

      case "smart-contracts":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Smart Contracts</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Detailed information about XpSwap's 5 core smart contracts
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
                        {contract.address}Coming Soon
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