import { useState } from "react";
import { Layout } from "@/components/Layout";
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
    description: "실시간 XP 토큰 가격 조회",
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
    description: "스왑 견적 계산 (실제 AMM 알고리즘)",
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
    description: "MEV 보호 포함 고급 스왑 견적",
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
    description: "실시간 파밍 풀 분석",
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
    description: "MEV 보호가 포함된 고급 자동화 마켓 메이커",
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
    description: "시간 잠금 유동성 및 자동 복리 시스템",
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
    description: "위임 투표와 베스팅 스케줄이 포함된 거버넌스",
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
    description: "거버넌스 토큰 부스팅이 가능한 수익률 파밍",
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
    description: "다중 네트워크 자산 전송 브릿지",
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
                Xphere 블록체인 기반의 엔터프라이즈급 탈중앙화 거래소
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">실제 AMM 엔진</Badge>
                <Badge variant="secondary">MEV 보호</Badge>
                <Badge variant="secondary">5개 스마트 컨트랙트</Badge>
                <Badge variant="secondary">실시간 가격 데이터</Badge>
                <Badge variant="secondary">크로스체인 브릿지</Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    핵심 기능
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>실제 상수곱 공식 (x * y = k) AMM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>MEV 보호 및 샌드위치 공격 방지</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>최대 2.5배 수익률 부스팅</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>다중 네트워크 크로스체인 브릿지</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    기술 스택
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Xphere Blockchain (Chain ID: 20250217)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>Solidity + OpenZeppelin 라이브러리</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>React + TypeScript + ethers.js</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" />
                    <span>CoinMarketCap 실시간 API</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>아키텍처 개요</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  id="architecture"
                  language="text"
                  code={`XpSwap DEX 아키텍처

┌─ Frontend (React + TypeScript)
│  ├─ 실시간 가격 데이터 (CoinMarketCap API)
│  ├─ MetaMask 지갑 통합
│  ├─ 고급 스왑 인터페이스
│  └─ 분석 대시보드

├─ Backend (Node.js + Express)
│  ├─ 실제 AMM 계산 엔진
│  ├─ MEV 보호 알고리즘
│  ├─ 파밍 분석 API
│  └─ PostgreSQL 데이터베이스

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
              <h1 className="text-4xl font-bold mb-4">시작하기</h1>
              <p className="text-xl text-muted-foreground mb-6">
                XpSwap DEX를 사용하기 위한 단계별 가이드
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>1. 지갑 연결</CardTitle>
                <CardDescription>MetaMask를 사용하여 Xphere 네트워크에 연결</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">네트워크 정보</h4>
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
                  <h4 className="font-semibold">연결 단계</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>상단의 "Connect Wallet" 버튼 클릭</li>
                    <li>MetaMask에서 연결 승인</li>
                    <li>Xphere 네트워크 자동 전환 (필요시)</li>
                    <li>지갑 잔고 확인</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. 토큰 스왑</CardTitle>
                <CardDescription>실시간 가격으로 토큰 교환</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">스왑 프로세스</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>교환할 토큰 쌍 선택</li>
                    <li>교환할 수량 입력</li>
                    <li>슬리피지 허용치 설정 (0.1% ~ 5.0%)</li>
                    <li>스왑 견적 확인 (실제 AMM 계산)</li>
                    <li>MEV 보호 옵션 확인</li>
                    <li>트랜잭션 실행</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>주의:</strong> 모든 스왑은 실제 상수곱 공식 (x * y = k)을 사용하여 계산되며, 
                    MEV 보호 기능이 자동으로 적용됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. 유동성 공급</CardTitle>
                <CardDescription>유동성 풀에 참여하여 수수료 수익 획득</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">유동성 공급 단계</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Pool 페이지로 이동</li>
                    <li>참여할 유동성 풀 선택</li>
                    <li>토큰 쌍 및 수량 입력 (최적 비율 자동 계산)</li>
                    <li>시간 잠금 옵션 선택 (30일~365일)</li>
                    <li>예상 APR 확인</li>
                    <li>유동성 공급 실행</li>
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
              <h1 className="text-4xl font-bold mb-4">스마트 컨트랙트</h1>
              <p className="text-xl text-muted-foreground mb-6">
                XpSwap의 5개 핵심 스마트 컨트랙트 상세 정보
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
                      <h4 className="font-semibold mb-2">주요 함수</h4>
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
                <CardTitle>배포 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">네트워크</h4>
                    <p>Xphere Blockchain (Chain ID: 20250217)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">컴파일러 버전</h4>
                    <p>Solidity ^0.8.19</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">라이브러리</h4>
                    <p>OpenZeppelin Contracts v4.9.0</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">배포 스크립트</h4>
                    <CodeBlock
                      id="deploy-script"
                      language="bash"
                      code={`# 스마트 컨트랙트 컴파일
node scripts/compile.js

# Xphere 네트워크에 배포
node scripts/deployAdvancedContracts.js

# 배포 검증
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
                XpSwap DEX의 모든 API 엔드포인트 상세 정보
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
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
                XpSwap의 고급 DeFi 기능 상세 가이드
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
                    <CardTitle>실제 AMM 엔진</CardTitle>
                    <CardDescription>상수곱 공식 (x * y = k) 기반 자동화 마켓 메이커</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">핵심 공식</h4>
                      <CodeBlock
                        id="amm-formula"
                        language="javascript"
                        code={`// 상수곱 공식 (x * y = k)
function getAmountOut(amountIn, reserveIn, reserveOut) {
  const amountInWithFee = amountIn * 997; // 0.3% 수수료 적용
  const numerator = amountInWithFee * reserveOut;
  const denominator = (reserveIn * 1000) + amountInWithFee;
  return numerator / denominator;
}

// 가격 영향도 계산
function calculatePriceImpact(amountIn, reserveIn, reserveOut) {
  const amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
  const currentPrice = reserveOut / reserveIn;
  const executionPrice = amountOut / amountIn;
  return Math.abs((executionPrice - currentPrice) / currentPrice) * 100;
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">MEV 보호</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• 샌드위치 공격 감지 및 차단</li>
                        <li>• 동적 수수료 조정 (변동성 기반)</li>
                        <li>• 최대 슬리피지 보호</li>
                        <li>• 타임스탬프 기반 검증</li>
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
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
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
      </div>
    </Layout>
  );
}