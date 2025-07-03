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
                    <CardTitle>수익률 파밍</CardTitle>
                    <CardDescription>최대 2.5배 부스팅이 가능한 고급 파밍 시스템</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">부스팅 시스템</h4>
                      <CodeBlock
                        id="boost-formula"
                        language="javascript"
                        code={`// 부스팅 계산 공식
function calculateBoost(lpStaked, govTokenStaked, lockDuration) {
  const timeMultiplier = Math.min(lockDuration / 365, 1.0); // 최대 1년
  const govMultiplier = Math.min(govTokenStaked / lpStaked, 1.5); // 최대 1.5배
  const baseBoost = 1.0;
  
  return baseBoost + (timeMultiplier * govMultiplier);
}

// 실제 APY 계산
function calculateAPY(baseReward, boost, totalStaked) {
  const boostedReward = baseReward * boost;
  return (boostedReward / totalStaked) * 365 * 100; // 연율
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">파밍 전략</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>기본 파밍:</strong> LP 토큰 스테이킹으로 기본 수익</li>
                        <li>• <strong>거버넌스 부스팅:</strong> XPS 토큰 스테이킹으로 최대 1.5배</li>
                        <li>• <strong>시간 잠금:</strong> 장기 잠금으로 추가 부스팅</li>
                        <li>• <strong>자동 복리:</strong> 수익 자동 재투자</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="governance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>거버넌스 시스템</CardTitle>
                    <CardDescription>위임 투표와 시간 가중 투표권을 가진 DAO</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">투표권 계산</h4>
                      <CodeBlock
                        id="voting-power"
                        language="javascript"
                        code={`// 투표권 계산
function calculateVotingPower(tokenBalance, lockDuration, delegatedPower) {
  const basePower = tokenBalance;
  const timeWeight = Math.sqrt(lockDuration / 365); // 제곱근 시간 가중
  const totalPower = basePower * (1 + timeWeight) + delegatedPower;
  
  return totalPower;
}

// 제안 통과 조건
function checkProposalPassed(votesFor, votesAgainst, totalSupply) {
  const quorum = totalSupply * 0.04; // 4% 쿼럼
  const majority = votesFor > votesAgainst;
  const quorumMet = (votesFor + votesAgainst) >= quorum;
  
  return majority && quorumMet;
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">제안 유형</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>매개변수 변경:</strong> 수수료, 보상률 등 조정</li>
                        <li>• <strong>프로토콜 업그레이드:</strong> 스마트 컨트랙트 개선</li>
                        <li>• <strong>재무 관리:</strong> 커뮤니티 자금 사용</li>
                        <li>• <strong>파트너십:</strong> 다른 프로토콜과의 통합</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bridge" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>크로스체인 브릿지</CardTitle>
                    <CardDescription>5개 메인넷을 연결하는 안전한 자산 전송</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">지원 네트워크</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted p-2 rounded">Ethereum</div>
                        <div className="bg-muted p-2 rounded">Binance Smart Chain</div>
                        <div className="bg-muted p-2 rounded">Polygon</div>
                        <div className="bg-muted p-2 rounded">Arbitrum</div>
                        <div className="bg-muted p-2 rounded">Xphere</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">브릿지 과정</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>소스 체인에서 토큰 잠금 (Lock)</li>
                        <li>다중 서명 검증자들이 트랜잭션 확인</li>
                        <li>머클 증명 생성 및 검증</li>
                        <li>대상 체인에서 토큰 발행 (Mint)</li>
                        <li>사용자에게 토큰 전송</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">보안 기능</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• 다중 서명 검증 (3/5 임계값)</li>
                        <li>• 일일 전송 한도</li>
                        <li>• 응급 일시 정지 메커니즘</li>
                        <li>• 타임락 지연</li>
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
                XpSwap을 다른 프로젝트에 통합하는 방법
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
                    <CardTitle>Frontend 통합</CardTitle>
                    <CardDescription>React/Vue/Angular 앱에 XpSwap 위젯 통합</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">설치</h4>
                      <CodeBlock
                        id="npm-install"
                        language="bash"
                        code={`npm install @xpswap/widget ethers`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">기본 사용법</h4>
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
                    <CardTitle>Backend API 통합</CardTitle>
                    <CardDescription>서버 사이드에서 XpSwap API 사용</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Node.js 예제</h4>
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

// 사용 예제
const xpswap = new XpSwapAPI();

async function example() {
  // XP 토큰 가격 조회
  const xpPrice = await xpswap.getPrice('XP');
  console.log('XP Price:', xpPrice);

  // 스왑 견적 요청
  const quote = await xpswap.getSwapQuote('XP', 'USDT', '100');
  console.log('Swap Quote:', quote);

  // 파밍 정보 조회
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
                    <CardTitle>Smart Contract 통합</CardTitle>
                    <CardDescription>다른 컨트랙트에서 XpSwap 호출</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Solidity 인터페이스</h4>
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
    IXpSwapAMM constant xpswap = IXpSwapAMM(0x...); // XpSwap 주소

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
                XpSwap 커뮤니티에 참여하고 최신 정보를 받아보세요
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    소셜 미디어
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Discord 커뮤니티
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Telegram 채널
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Twitter 팔로우
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    개발자 리소스
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
                <CardTitle>기여하기</CardTitle>
                <CardDescription>XpSwap 프로토콜 개선에 참여하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">개발 참여</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 스마트 컨트랙트 보안 감사</li>
                    <li>• 프론트엔드 UI/UX 개선</li>
                    <li>• 새로운 DeFi 기능 제안</li>
                    <li>• 문서화 및 튜토리얼 작성</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">거버넌스 참여</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• XPS 토큰으로 투표 참여</li>
                    <li>• 프로토콜 개선 제안 작성</li>
                    <li>• 커뮤니티 토론 참여</li>
                    <li>• 대사(Ambassador) 프로그램 참여</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>지원 및 도움말</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">자주 묻는 질문</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• <strong>Q:</strong> XpSwap의 수수료는 얼마인가요?</li>
                    <li>• <strong>A:</strong> 기본 스왑 수수료는 0.3%이며, 변동성에 따라 동적으로 조정됩니다.</li>
                    <li>• <strong>Q:</strong> 파밍 보상은 언제 받을 수 있나요?</li>
                    <li>• <strong>A:</strong> 보상은 실시간으로 누적되며 언제든지 청구할 수 있습니다.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">기술 지원</h4>
                  <p className="text-sm">
                    기술적인 문제나 질문이 있으시면 Discord의 #support 채널을 이용해주세요.
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