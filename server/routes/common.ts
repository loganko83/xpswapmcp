import crypto from "crypto";
import { ethers } from "ethers";
import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

// 보안 강화된 유틸리티 함수들
export const SecurityUtils = {
  // 암호학적으로 안전한 트랜잭션 해시 생성
  generateTxHash(): string {
    return `0x${crypto.randomBytes(32).toString('hex')}`;
  },
  
  // 암호학적으로 안전한 ID 생성
  generateSecureId(length: number = 16): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  },
  
  // 암호학적으로 안전한 주소 생성 (테스트/시뮬레이션용)
  generateMockAddress(): string {
    return `0x${crypto.randomBytes(20).toString('hex')}`;
  },
  
  // 안전한 랜덤 숫자 생성
  getSecureRandomFloat(min: number = 0, max: number = 1): number {
    const randomBytes = crypto.randomBytes(4);
    const randomValue = randomBytes.readUInt32BE(0) / 0xFFFFFFFF;
    return min + (randomValue * (max - min));
  },
  
  // 안전한 랜덤 정수 생성
  getSecureRandomInt(min: number, max: number): number {
    const range = max - min + 1;
    const randomBytes = crypto.randomBytes(4);
    const randomValue = randomBytes.readUInt32BE(0);
    return min + (randomValue % range);
  }
};

// Server-side Web3 helper class
export class ServerWeb3Service {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    // Xphere 네트워크 RPC
    this.provider = new ethers.JsonRpcProvider("https://xphere-rpc.example.com");
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error getting balance:", error);
      return "0";
    }
  }

  async deployToken(tokenData: any): Promise<any> {
    // XIP-20 토큰 배포 로직 (시뮬레이션)
    const contractAddress = SecurityUtils.generateMockAddress();
    const txHash = SecurityUtils.generateTxHash();
    
    return {
      success: true,
      contractAddress,
      transactionHash: txHash,
      gasUsed: SecurityUtils.getSecureRandomInt(500000, 1000000),
      gasPrice: "20",
      blockNumber: SecurityUtils.getSecureRandomInt(1000000, 2000000)
    };
  }

  generateSecurePrivateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async estimateGas(transaction: any): Promise<bigint> {
    // 가스 추정 시뮬레이션
    return BigInt(SecurityUtils.getSecureRandomInt(21000, 500000));
  }
}

// In-memory storage for staking records
export const stakingRecords: any[] = [];

// In-memory storage for farm staking records
export const farmStakingRecords: any[] = [];

// Shared Web3 service instance
export const web3Service = new ServerWeb3Service();

// Rate limiting middleware
export const checkRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
      code: "RATE_LIMIT_EXCEEDED", 
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
export const handleError = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("API Error:", error);
  
  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: "Validation failed",
      details: error.message,
      code: "VALIDATION_ERROR",
      timestamp: new Date().toISOString()
    });
  }
  
  // Database errors
  if (error.code === 'SQLITE_ERROR') {
    return res.status(500).json({
      error: "Database error occurred",
      code: "DATABASE_ERROR",
      timestamp: new Date().toISOString()
    });
  }
  
  // Network/RPC errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'CALL_EXCEPTION') {
    return res.status(503).json({
      error: "Network error - please try again",
      code: "NETWORK_ERROR",
      timestamp: new Date().toISOString()
    });
  }
  
  // Default error response
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
    timestamp: new Date().toISOString()
  });
};

// Input validation middleware
export const validateInput = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
        code: "VALIDATION_ERROR",
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};
