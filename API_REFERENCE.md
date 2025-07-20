ume": "100",
    "accountAge": "30 days"
  },
  "claimDeadline": "2025-08-10T23:59:59Z",
  "timestamp": 1672531200
}
```

---

### 19. Claim XPS Airdrop

**Endpoint**: `POST /api/xps/airdrop/claim`

**Description**: Claim 100 XPS airdrop for eligible addresses

**Request Body**:
```json
{
  "userAddress": "0x123..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Airdrop claimed successfully!",
  "amount": 100,
  "txHash": "0xabc123...",
  "from": "0xf0C5d4889cb250956841c339b5F3798320303D5f",
  "to": "0x123...",
  "gasUsed": "65000",
  "timestamp": 1722470400,
  "confirmations": 12
}
```

**Error Responses**:
```json
{
  "error": "Airdrop already claimed",
  "code": "ALREADY_CLAIMED",
  "claimedAt": "2025-08-02T14:30:00Z"
}
```

```json
{
  "error": "Not eligible for airdrop",
  "code": "NOT_ELIGIBLE",
  "reason": "Insufficient transaction history"
}
```

---

## 🔍 Analytics & Monitoring APIs

### 20. Blockchain Balance Check

**Endpoint**: `GET /api/blockchain/balance`

**Description**: Check XP and XPS token balances for connected wallet

**Query Parameters**:
- `address` (optional): Wallet address to check (uses connected wallet if not provided)

**Response**:
```json
{
  "address": "0x123...",
  "balances": {
    "XP": {
      "balance": "1250.75",
      "balanceWei": "1250750000000000000000",
      "usdValue": "18.26"
    },
    "XPS": {
      "balance": "850.25",
      "balanceWei": "850250000000000000000",
      "usdValue": "850.25"
    }
  },
  "totalUsdValue": "868.51",
  "network": "Xphere",
  "timestamp": 1672531200
}
```

---

### 21. Fee Discount Calculation

**Endpoint**: `POST /api/xps/calculate-fee-discount`

**Description**: Calculate trading fee discount based on XPS holdings

**Request Body**:
```json
{
  "xpsBalance": "1000",
  "tradeAmount": "500"
}
```

**Response**:
```json
{
  "feeDiscountTier": "Gold",
  "discountPercentage": "50%",
  "originalFee": "1.5",
  "discountedFee": "0.75",
  "savings": "0.75",
  "nextTierRequirement": {
    "tier": "Diamond",
    "additionalXpsNeeded": "4000",
    "nextDiscount": "75%"
  },
  "tierBenefits": {
    "tradingFeeDiscount": "50%",
    "farmingBoost": "1.5x",
    "governanceWeight": "2x"
  }
}
```

---

### 22. Transaction History

**Endpoint**: `GET /api/transactions/history`

**Description**: Get transaction history for connected wallet

**Query Parameters**:
- `address` (string): Wallet address
- `limit` (number): Number of transactions to return (default: 50)
- `offset` (number): Pagination offset (default: 0)
- `type` (string): Transaction type filter (swap, liquidity, farming, staking)

**Response**:
```json
{
  "transactions": [
    {
      "id": "tx_001",
      "type": "swap",
      "hash": "0xabc123...",
      "from": "0x123...",
      "to": "0x456...",
      "tokenIn": "XP",
      "tokenOut": "USDT",
      "amountIn": "100",
      "amountOut": "1.459",
      "fee": "0.3",
      "priceImpact": "0.05%",
      "status": "completed",
      "timestamp": 1672531200,
      "blockNumber": 1234567
    },
    {
      "id": "tx_002",
      "type": "liquidity",
      "hash": "0xdef456...",
      "from": "0x123...",
      "action": "add",
      "pool": "XP/USDT",
      "tokenA": "XP",
      "tokenB": "USDT",
      "amountA": "500",
      "amountB": "7.297",
      "lpTokens": "60.25",
      "status": "completed",
      "timestamp": 1672530600,
      "blockNumber": 1234550
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 23. Portfolio Summary

**Endpoint**: `GET /api/portfolio/summary`

**Description**: Get comprehensive portfolio summary for connected wallet

**Query Parameters**:
- `address` (string): Wallet address

**Response**:
```json
{
  "address": "0x123...",
  "totalValue": "2150.75",
  "portfolioBreakdown": {
    "tokens": {
      "value": "868.51",
      "percentage": "40.4%",
      "assets": [
        {
          "symbol": "XP",
          "balance": "1250.75",
          "value": "18.26",
          "percentage": "0.8%"
        },
        {
          "symbol": "XPS", 
          "balance": "850.25",
          "value": "850.25",
          "percentage": "39.6%"
        }
      ]
    },
    "liquidityPools": {
      "value": "782.15",
      "percentage": "36.4%",
      "positions": [
        {
          "pool": "XP/USDT",
          "lpTokens": "60.25",
          "value": "456.78",
          "apy": "15.2%"
        },
        {
          "pool": "XP/XPS",
          "lpTokens": "45.12",
          "value": "325.37",
          "apy": "18.7%"
        }
      ]
    },
    "farming": {
      "value": "325.40",
      "percentage": "15.1%",
      "positions": [
        {
          "farm": "XP-USDT LP",
          "staked": "25.30",
          "value": "189.45",
          "apy": "125%",
          "rewards": "12.75"
        },
        {
          "farm": "XP-XPS LP",
          "staked": "18.90",
          "value": "135.95",
          "apy": "245%",
          "rewards": "8.20"
        }
      ]
    },
    "staking": {
      "value": "174.69",
      "percentage": "8.1%",
      "positions": [
        {
          "token": "XPS",
          "staked": "100",
          "value": "100",
          "apy": "150%",
          "lockPeriod": "90 days",
          "unlockDate": "2025-04-15",
          "rewards": "74.69"
        }
      ]
    }
  },
  "performance": {
    "totalRewards": "156.42",
    "avgApy": "89.3%",
    "riskScore": 3.2,
    "diversificationIndex": 0.78
  },
  "timestamp": 1672531200
}
```

---

### 24. Real-Time Analytics Dashboard Data

**Endpoint**: `GET /api/analytics/dashboard`

**Description**: Get real-time analytics data for dashboard

**Response**:
```json
{
  "liveMetrics": {
    "currentPrice": 0.014594,
    "priceChange24h": -6.28,
    "volume24h": 8750,
    "tvl": 32500,
    "activeTrades": 12,
    "lastUpdate": 1672531200
  },
  "tradingData": {
    "recentTrades": [
      {
        "pair": "XP/USDT",
        "type": "buy",
        "amount": "50",
        "price": "0.01459", 
        "timestamp": 1672531180
      },
      {
        "pair": "XP/XPS",
        "type": "sell",
        "amount": "25",
        "price": "60.11",
        "timestamp": 1672531150
      }
    ],
    "priceHistory": [
      {
        "timestamp": 1672531200,
        "price": 0.014594
      },
      {
        "timestamp": 1672531170,
        "price": 0.014612
      }
    ]
  },
  "liquidityFlow": {
    "inflow24h": "2450",
    "outflow24h": "1890",
    "netFlow": "560",
    "topPools": [
      {
        "name": "XP/XPS",
        "flow": "+320",
        "percentage": "57.1%"
      },
      {
        "name": "XP/USDT", 
        "flow": "+240",
        "percentage": "42.9%"
      }
    ]
  },
  "alerts": [
    {
      "type": "price",
      "message": "XP price dropped below $0.015",
      "severity": "medium",
      "timestamp": 1672531100
    },
    {
      "type": "volume",
      "message": "High volume detected in XP/XPS pair",
      "severity": "info",
      "timestamp": 1672531050
    }
  ]
}
```

---

## 🔄 Utility & Helper APIs

### 25. Token Information

**Endpoint**: `GET /api/tokens`

**Description**: Get information about all supported tokens

**Response**:
```json
{
  "tokens": [
    {
      "id": 1,
      "symbol": "XP",
      "name": "Xphere Token",
      "address": "0x0000000000000000000000000000000000000000",
      "decimals": 18,
      "isNative": true,
      "network": "Xphere",
      "iconUrl": "/tokens/xp.png",
      "totalSupply": "1000000000",
      "circulatingSupply": "610000000",
      "price": 0.014594,
      "change24h": -6.28
    },
    {
      "id": 2,
      "symbol": "XPS",
      "name": "XpSwap Token",
      "address": "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",
      "decimals": 18,
      "isNative": false,
      "network": "Xphere",
      "iconUrl": "/tokens/xps.png",
      "totalSupply": "1000000000",
      "circulatingSupply": "156780000",
      "price": 1.00,
      "change24h": 0.0
    },
    {
      "id": 3,
      "symbol": "USDT",
      "name": "Tether USD",
      "address": "0x...",
      "decimals": 6,
      "isNative": false,
      "network": "Xphere",
      "iconUrl": "/tokens/usdt.png",
      "totalSupply": "1000000000",
      "price": 1.00,
      "change24h": 0.01
    }
  ]
}
```

---

### 26. System Health Check

**Endpoint**: `GET /api/health`

**Description**: Check overall system health and status

**Response**:
```json
{
  "status": "healthy",
  "timestamp": 1672531200,
  "services": {
    "database": {
      "status": "online",
      "responseTime": "15ms"
    },
    "blockchain": {
      "status": "online",
      "latestBlock": "0xabcdef",
      "responseTime": "80ms"
    },
    "priceOracle": {
      "status": "online",
      "lastUpdate": 1672531170,
      "responseTime": "120ms"
    },
    "bridgeService": {
      "status": "online",
      "supportedNetworks": 6,
      "responseTime": "200ms"
    }
  },
  "metrics": {
    "totalRequests24h": 12547,
    "averageResponseTime": "145ms",
    "errorRate": "0.03%",
    "uptime": "99.98%"
  }
}
```

---

## ⚠️ Error Handling

### Standard Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details",
      "timestamp": 1672531200
    }
  }
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Authentication required |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server issue |
| `503` | Service Unavailable - Temporary service issue |

### Common Error Codes

| Error Code | Description |
|------------|-------------|
| `INSUFFICIENT_LIQUIDITY` | Not enough liquidity for trade |
| `INSUFFICIENT_BALANCE` | Wallet balance too low |
| `INVALID_TOKEN_PAIR` | Unsupported token combination |
| `SLIPPAGE_EXCEEDED` | Price moved beyond slippage tolerance |
| `NETWORK_ERROR` | Blockchain network connectivity issue |
| `RATE_LIMIT_EXCEEDED` | Too many requests from IP |
| `INVALID_ADDRESS` | Wallet address format invalid |
| `TRANSACTION_FAILED` | Blockchain transaction failed |
| `ALREADY_CLAIMED` | Airdrop or reward already claimed |
| `NOT_ELIGIBLE` | User not eligible for action |

### Rate Limiting

- **Global Limit**: 100 requests per minute per IP address
- **Burst Allowance**: Up to 20 requests in 10 seconds
- **Headers**: Rate limit info included in response headers
  - `X-RateLimit-Limit`: Requests per minute allowed
  - `X-RateLimit-Remaining`: Requests remaining in window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

### Retry Logic

For rate-limited requests (429 status):
1. Wait for time specified in `Retry-After` header
2. Implement exponential backoff (2s, 4s, 8s, ...)
3. Maximum of 3 retry attempts recommended

---

## 🔧 SDK & Integration Examples

### JavaScript/TypeScript SDK Usage

```typescript
// XpSwap API Client
class XpSwapAPI {
  constructor(baseUrl = 'https://xpswap.replit.app') {
    this.baseUrl = baseUrl;
  }

  async getXPPrice() {
    const response = await fetch(`${this.baseUrl}/api/xp-price`);
    return response.json();
  }

  async getSwapQuote(tokenIn: string, tokenOut: string, amountIn: string) {
    const response = await fetch(`${this.baseUrl}/api/swap-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenIn, tokenOut, amountIn })
    });
    return response.json();
  }

  async getFarmingAnalytics(poolId: number) {
    const response = await fetch(`${this.baseUrl}/api/farming-analytics/${poolId}`);
    return response.json();
  }
}

// Usage example
const xpswap = new XpSwapAPI();

// Get current XP price
const priceData = await xpswap.getXPPrice();
console.log(`XP Price: $${priceData.price}`);

// Get swap quote
const quote = await xpswap.getSwapQuote('XP', 'USDT', '100');
console.log(`100 XP = ${quote.amountOut} USDT`);
```

### Python Integration Example

```python
import requests

class XpSwapAPI:
    def __init__(self, base_url='https://xpswap.replit.app'):
        self.base_url = base_url
    
    def get_xp_price(self):
        response = requests.get(f'{self.base_url}/api/xp-price')
        return response.json()
    
    def get_swap_quote(self, token_in, token_out, amount_in):
        data = {
            'tokenIn': token_in,
            'tokenOut': token_out, 
            'amountIn': amount_in
        }
        response = requests.post(
            f'{self.base_url}/api/swap-quote',
            json=data
        )
        return response.json()

# Usage
xpswap = XpSwapAPI()
price = xpswap.get_xp_price()
quote = xpswap.get_swap_quote('XP', 'USDT', '100')
```

### React Hook Example

```typescript
// useXpSwapAPI.ts
import { useState, useEffect } from 'react';

export function useXpPrice() {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/xp-price');
        const data = await response.json();
        setPrice(data);
      } catch (error) {
        console.error('Failed to fetch XP price:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, []);

  return { price, loading };
}

// Usage in component
function PriceDisplay() {
  const { price, loading } = useXpPrice();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      XP Price: ${price?.price} ({price?.change24h}%)
    </div>
  );
}
```

---

## 🌐 WebSocket Real-Time Data

### WebSocket Connection

For real-time updates, connect to WebSocket endpoint:

```javascript
const ws = new WebSocket('wss://xpswap.replit.app/ws');

ws.onopen = () => {
  // Subscribe to price updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'prices',
    symbols: ['XP', 'XPS']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'price_update') {
    console.log(`${data.symbol}: $${data.price}`);
  }
};
```

### Available Channels

- `prices` - Real-time token price updates
- `trades` - Live trading activity
- `liquidity` - Liquidity pool changes
- `farming` - Farming rewards updates

---

## 📈 API Performance & Monitoring

### Response Times (Average)

| Endpoint Category | Average Response Time |
|-------------------|----------------------|
| Price Data | 120ms |
| Swap Quotes | 80ms |
| Market Stats | 150ms |
| Farming Analytics | 200ms |
| Bridge Quotes | 300ms |

### Uptime & Reliability

- **Target Uptime**: 99.9%
- **Monitoring**: 24/7 automated monitoring
- **Alerts**: Real-time status at status.xpswap.com
- **Backup Systems**: Automatic failover for critical services

---

## 🎯 Advanced Trading APIs

### 20. Get Options Contracts

**Endpoint**: `GET /api/options/contracts`

**Description**: Get available options contracts with pricing

**Query Parameters**:
- `underlying` (optional): Filter by underlying asset (XP, XPS)
- `expiry` (optional): Filter by expiry date

**Response**:
```json
{
  "contracts": [
    {
      "id": "XP-CALL-0.02-20250930",
      "underlying": "XP",
      "type": "call",
      "strike": 0.02,
      "expiry": "2025-09-30T08:00:00Z",
      "premium": 0.0008,
      "impliedVolatility": 0.85,
      "delta": 0.42,
      "gamma": 0.15,
      "theta": -0.0012,
      "vega": 0.0023,
      "volume24h": 1250,
      "openInterest": 15000
    }
  ]
}
```

### 21. Execute Options Trade

**Endpoint**: `POST /api/options/trade`

**Description**: Execute options buy/sell orders

**Request Body**:
```json
{
  "contractId": "XP-CALL-0.02-20250930",
  "action": "buy",
  "quantity": 10,
  "userAddress": "0x123...",
  "slippage": 0.05
}
```

**Response**:
```json
{
  "success": true,
  "txHash": "0xabc123...",
  "premium": 0.008,
  "quantity": 10,
  "totalCost": 0.08,
  "gasUsed": "125000"
}
```

### 22. Get Perpetual Futures Contracts

**Endpoint**: `GET /api/perpetuals/contracts`

**Description**: Get available perpetual futures contracts

**Response**:
```json
{
  "contracts": [
    {
      "symbol": "XP-PERP",
      "underlying": "XP",
      "markPrice": 0.014594,
      "indexPrice": 0.014601,
      "fundingRate": 0.0001,
      "maxLeverage": 125,
      "volume24h": 45000,
      "openInterest": 125000,
      "longShortRatio": 1.25
    }
  ]
}
```

### 23. Execute Futures Trade

**Endpoint**: `POST /api/perpetuals/trade`

**Description**: Open/close perpetual futures positions

**Request Body**:
```json
{
  "symbol": "XP-PERP",
  "side": "long",
  "size": 1000,
  "leverage": 10,
  "orderType": "market",
  "userAddress": "0x123..."
}
```

**Response**:
```json
{
  "success": true,
  "positionId": "pos_12345",
  "entryPrice": 0.014594,
  "size": 1000,
  "leverage": 10,
  "margin": 1.4594,
  "liquidationPrice": 0.01315
}
```

### 24. Get Flash Loan Pools

**Endpoint**: `GET /api/flashloans/pools`

**Description**: Get available flash loan pools and rates

**Response**:
```json
{
  "pools": [
    {
      "token": "XP",
      "totalLiquidity": 1000000,
      "availableLiquidity": 850000,
      "utilizationRate": 0.15,
      "feeRate": 0.0009,
      "maxLoan": 850000
    },
    {
      "token": "XPS", 
      "totalLiquidity": 500000,
      "availableLiquidity": 425000,
      "utilizationRate": 0.15,
      "feeRate": 0.0009,
      "maxLoan": 425000
    }
  ]
}
```

### 25. Execute Flash Loan

**Endpoint**: `POST /api/flashloans/execute`

**Description**: Execute flash loan with custom strategy

**Request Body**:
```json
{
  "token": "XP",
  "amount": 10000,
  "strategy": "arbitrage",
  "params": {
    "targetToken": "XPS",
    "targetDex": "PancakeSwap",
    "minProfit": 50
  },
  "userAddress": "0x123..."
}
```

**Response**:
```json
{
  "success": true,
  "txHash": "0xdef456...",
  "loanAmount": 10000,
  "repayAmount": 10009,
  "profit": 67.5,
  "gasUsed": "380000",
  "executionTime": "12.3s"
}
```

## 🪙 Token Services APIs

### 26. Deploy XIP-20 Token

**Endpoint**: `POST /api/minting/deploy`

**Description**: Deploy new XIP-20 token on Xphere network

**Request Body**:
```json
{
  "name": "My Token",
  "symbol": "MTK",
  "totalSupply": "1000000",
  "decimals": 18,
  "description": "A revolutionary token",
  "website": "https://mytoken.com",
  "userAddress": "0x123...",
  "paymentToken": "XPS"
}
```

**Response**:
```json
{
  "success": true,
  "txHash": "0x789abc...",
  "contractAddress": "0xdef123...",
  "deploymentFee": 50,
  "gasUsed": "2100000",
  "tokenId": "token_12345"
}
```

### 27. Launch MemeCoin

**Endpoint**: `POST /api/memecoin/launch`

**Description**: Launch memecoin with bonding curve mechanism

**Request Body**:
```json
{
  "name": "Doge Xphere",
  "symbol": "DOGEX",
  "description": "Much wow, such DEX",
  "imageUrl": "https://imgur.com/dogex.jpg",
  "website": "https://dogexphere.com",
  "twitter": "https://twitter.com/dogexphere",
  "telegram": "https://t.me/dogexphere",
  "userAddress": "0x123..."
}
```

**Response**:
```json
{
  "success": true,
  "tokenAddress": "0xmeme123...",
  "bondingCurveAddress": "0xcurve456...",
  "initialPrice": 0.000001,
  "marketCap": 1000,
  "liquidityThreshold": 69000,
  "createdAt": "2025-07-20T15:30:00Z"
}
```

### 28. Get Trending MemeCoins

**Endpoint**: `GET /api/memecoin/trending`

**Description**: Get trending memecoins by volume and activity

**Query Parameters**:
- `limit` (optional): Number of results (default: 10)
- `sortBy` (optional): Sort by 'volume', 'marketCap', 'holders' (default: volume)

**Response**:
```json
{
  "trending": [
    {
      "name": "PEPE XPS",
      "symbol": "PEPEXPS",
      "address": "0xpepe123...",
      "currentPrice": 0.000847,
      "marketCap": 45230,
      "progress": 0.655,
      "volume24h": 12450,
      "holders": 1247,
      "created": "2025-07-18T10:15:00Z",
      "isGraduated": false
    }
  ]
}
```

### 29. Trade MemeCoin

**Endpoint**: `POST /api/memecoin/trade`

**Description**: Buy/sell memecoins on bonding curve

**Request Body**:
```json
{
  "tokenAddress": "0xpepe123...",
  "action": "buy",
  "amount": 100,
  "slippage": 0.05,
  "userAddress": "0x123..."
}
```

**Response**:
```json
{
  "success": true,
  "txHash": "0xmeme789...",
  "tokensReceived": 118203.45,
  "averagePrice": 0.000847,
  "priceImpact": 0.023,
  "newMarketCap": 45780
}
```

## 🔄 Atomic Swaps APIs

### 30. Initiate Atomic Swap

**Endpoint**: `POST /api/atomic-swap/initiate`

**Description**: Initiate cross-chain atomic swap using HTLC

**Request Body**:
```json
{
  "fromChain": "ethereum",
  "toChain": "xphere", 
  "fromToken": "ETH",
  "toToken": "XP",
  "fromAmount": "1.0",
  "counterparty": "0xabc123...",
  "timelock": 86400,
  "userAddress": "0x123..."
}
```

**Response**:
```json
{
  "success": true,
  "swapId": "swap_12345",
  "htlcAddress": "0xhtlc456...",
  "secretHash": "0x789def...",
  "timelock": 1722556800,
  "txHash": "0xinit123..."
}
```

### 31. Complete Atomic Swap

**Endpoint**: `POST /api/atomic-swap/complete`

**Description**: Complete atomic swap by revealing secret

**Request Body**:
```json
{
  "swapId": "swap_12345",
  "secret": "0xsecret123...",
  "userAddress": "0xabc123..."
}
```

**Response**:
```json
{
  "success": true,
  "txHash": "0xcomplete456...",
  "tokensReceived": "1456.789",
  "completedAt": "2025-07-20T16:45:00Z"
}
```

---

## 🔐 Security Considerations

### API Security

- **HTTPS Only**: All endpoints secured with TLS 1.3
- **Rate Limiting**: Protection against abuse
- **Input Validation**: All parameters validated and sanitized
- **CORS Policy**: Configured for allowed origins only

### Data Privacy

- **No Sensitive Data**: No private keys or sensitive information stored
- **Wallet Addresses**: Public addresses only, properly validated
- **Transaction Data**: Only public blockchain data exposed

### Best Practices

1. **Always validate** API responses in your application
2. **Implement retry logic** for transient failures
3. **Cache responses** appropriately to reduce API calls
4. **Monitor rate limits** to avoid service interruption
5. **Use HTTPS** for all API communications

---

## 📞 Support & Resources

### Documentation
- **API Reference**: This document
- **Developer Guide**: [DEVELOPERS_GUIDE.md](./DEVELOPERS_GUIDE.md)
- **Smart Contracts**: [README-BLOCKCHAIN.md](./README-BLOCKCHAIN.md)

### Community
- **GitHub**: Report issues and contribute
- **Discord**: Real-time developer support
- **Telegram**: Community discussions

### Status & Monitoring
- **API Status**: https://status.xpswap.com
- **Network Status**: Built-in `/api/network-status` endpoint
- **Health Check**: `/api/health` endpoint

---

**API Version**: 1.0.0  
**Last Updated**: January 2025  
**Contact**: developers@xpswap.com