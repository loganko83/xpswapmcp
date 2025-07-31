# XpSwap DEX API Reference

Version: 1.0.0  
Base URL: `https://trendy.storydot.kr/xpswap/api`

## Overview

XpSwap DEX provides a comprehensive REST API for interacting with our decentralized exchange. All API endpoints return JSON responses and follow standard HTTP response codes.

## Authentication

No authentication is required for public endpoints. All endpoints are rate-limited to 100 requests per minute per IP address.

## Endpoints

### Core Trading Endpoints

#### Get Swap Quote
```http
POST /swap-quote
```

Calculate swap amounts and route optimization.

**Request Body:**
```json
{
  "tokenIn": "XP",
  "tokenOut": "USDT",
  "amountIn": "100"
}
```

**Response:**
```json
{
  "amountOut": "98.45",
  "priceImpact": "0.15",
  "route": ["XP", "WETH", "USDT"],
  "fee": "0.3"
}
```

#### Execute Swap
```http
POST /execute-swap
```

Execute a token swap transaction.

**Request Body:**
```json
{
  "tokenIn": "XP",
  "tokenOut": "USDT",
  "amountIn": "100",
  "slippage": 0.5,
  "deadline": 1735646400
}
```

### Market Data Endpoints

#### Get Token Price
```http
GET /xp-price
```

Get current XP token price and 24h statistics.

**Response:**
```json
{
  "price": 2.45,
  "change24h": 5.23,
  "volume24h": 1234567.89,
  "marketCap": 12345678.90
}
```

#### Get Pool Information
```http
GET /pools
```

List all available liquidity pools.

**Response:**
```json
{
  "pools": [
    {
      "pair": "XP/USDT",
      "tvl": 5000000,
      "volume24h": 250000,
      "apy": 45.5
    }
  ]
}
```

### DeFi Features

#### Get Farming Positions
```http
GET /farming/:address
```

Get user's farming positions and rewards.

#### Stake Tokens
```http
POST /stake
```

Stake tokens in farming pools.

### Complete Endpoint List

1. **Core Trading** (4 endpoints)
   - POST /swap-quote
   - POST /execute-swap
   - GET /pools
   - GET /pool/:id

2. **Market Data** (4 endpoints)
   - GET /xp-price
   - GET /token-prices
   - GET /market-stats
   - GET /24h-ticker

3. **DeFi Features** (4 endpoints)
   - GET /farming/:address
   - POST /stake
   - POST /unstake
   - GET /rewards/:address

4. **Cross-Chain Bridge** (4 endpoints)
   - POST /bridge-quote
   - POST /bridge-execute
   - GET /bridge-status/:txId
   - GET /supported-networks

5. **Governance & XPS** (4 endpoints)
   - GET /xps-stats
   - POST /buy-xps
   - POST /stake-xps
   - GET /airdrop-eligibility/:address

6. **Analytics & Security** (6 endpoints)
   - GET /portfolio/:address
   - GET /security/status
   - GET /security/alerts
   - GET /risk-analysis/:address
   - GET /health
   - GET /api-status

## Error Handling

All errors follow this format:
```json
{
  "error": {
    "code": "INSUFFICIENT_LIQUIDITY",
    "message": "Not enough liquidity in pool",
    "details": {}
  }
}
```

## Rate Limiting

- 100 requests per minute per IP
- Headers included in response:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## SDK Integration

### JavaScript/TypeScript
```typescript
import { XpSwapSDK } from '@xpswap/sdk';

const sdk = new XpSwapSDK({
  apiUrl: 'https://trendy.storydot.kr/xpswap/api',
  network: 'xphere'
});
```

### Python
```python
from xpswap import XpSwapClient

client = XpSwapClient(
    api_url='https://trendy.storydot.kr/xpswap/api',
    network='xphere'
)
```

## Support

- Documentation: https://trendy.storydot.kr/xpswap/documentation
- GitHub: https://github.com/xpswap
- Discord: https://discord.gg/xpswap
- Email: support@xpswap.com
