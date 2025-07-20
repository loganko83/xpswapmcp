// Flash Loans Security Module
// Code validation and safety checks for flash loan operations

export interface FlashLoanSecurityCheck {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedGas: number;
  profitability: number;
  riskScore: number;
}

// Security thresholds
const MAX_GAS_LIMIT = 8000000; // 8M gas
const MIN_PROFIT_THRESHOLD = 10; // $10 minimum profit
const MAX_CALLBACK_COMPLEXITY = 10; // Max nested calls
const SUSPICIOUS_PATTERNS = [
  'selfdestruct',
  'delegatecall',
  'create2',
  '.transfer(',
  'tx.origin',
  'assembly',
  'blockhash'
];

// Allowed flash loan strategies
const ALLOWED_STRATEGIES = [
  'arbitrage',
  'liquidation',
  'collateral_swap',
  'debt_refinancing'
];

export function validateFlashLoanCode(
  code: string,
  strategy: string,
  loanAmount: number,
  expectedProfit: number
): FlashLoanSecurityCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  let riskScore = 0;
  
  // Strategy validation
  if (!ALLOWED_STRATEGIES.includes(strategy)) {
    errors.push(`Invalid strategy: ${strategy}`);
  }
  
  // Code analysis
  const codeAnalysis = analyzeCode(code);
  
  // Check for suspicious patterns
  codeAnalysis.suspiciousPatterns.forEach(pattern => {
    warnings.push(`Suspicious pattern detected: ${pattern}`);
    riskScore += 20;
  });
  
  // Complexity check
  if (codeAnalysis.complexity > MAX_CALLBACK_COMPLEXITY) {
    errors.push(`Code too complex: ${codeAnalysis.complexity} nested calls`);
  }
  
  // Gas estimation
  const estimatedGas = estimateGasUsage(code, loanAmount);
  if (estimatedGas > MAX_GAS_LIMIT) {
    errors.push(`Estimated gas too high: ${estimatedGas}`);
  }
  
  // Profitability check
  const profitAfterFees = calculateNetProfit(expectedProfit, loanAmount, estimatedGas);
  if (profitAfterFees < MIN_PROFIT_THRESHOLD) {
    warnings.push(`Low profitability: $${profitAfterFees.toFixed(2)}`);
    riskScore += 15;
  }
  
  // Reentrancy check
  if (hasReentrancyRisk(code)) {
    errors.push('Potential reentrancy vulnerability detected');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    estimatedGas,
    profitability: profitAfterFees,
    riskScore: Math.min(riskScore, 100)
  };
}

function analyzeCode(code: string): {
  suspiciousPatterns: string[];
  complexity: number;
  externalCalls: number;
} {
  const suspiciousPatterns: string[] = [];
  let complexity = 0;
  let externalCalls = 0;
  
  // Check for suspicious patterns
  SUSPICIOUS_PATTERNS.forEach(pattern => {
    if (code.includes(pattern)) {
      suspiciousPatterns.push(pattern);
    }
  });
  
  // Count external calls and loops
  const callMatches = code.match(/\.(call|send|transfer)\(/g) || [];
  externalCalls = callMatches.length;
  
  const loopMatches = code.match(/(for|while)\s*\(/g) || [];
  complexity = externalCalls + loopMatches.length * 2;
  
  // Check nested structures
  const braceDepth = calculateMaxBraceDepth(code);
  complexity += braceDepth;
  
  return { suspiciousPatterns, complexity, externalCalls };
}

function calculateMaxBraceDepth(code: string): number {
  let maxDepth = 0;
  let currentDepth = 0;
  
  for (const char of code) {
    if (char === '{') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === '}') {
      currentDepth--;
    }
  }
  
  return maxDepth;
}

function estimateGasUsage(code: string, loanAmount: number): number {
  // Base gas for flash loan
  let gasEstimate = 100000;
  
  // Add gas for each external call
  const externalCalls = (code.match(/\.(call|send|transfer)\(/g) || []).length;
  gasEstimate += externalCalls * 50000;
  
  // Add gas for storage operations
  const storageOps = (code.match(/\s(=|storage)/g) || []).length;
  gasEstimate += storageOps * 20000;
  
  // Add gas for loops
  const loops = (code.match(/(for|while)\s*\(/g) || []).length;
  gasEstimate += loops * 30000;
  
  // Scale by loan amount (larger loans may need more operations)
  const scaleFactor = Math.log10(loanAmount / 1000) / 2;
  gasEstimate *= (1 + scaleFactor);
  
  return Math.floor(gasEstimate);
}

function calculateNetProfit(
  expectedProfit: number,
  loanAmount: number,
  gasEstimate: number
): number {
  const flashLoanFee = loanAmount * 0.0009; // 0.09% fee
  const gasPrice = 30; // gwei
  const gasCost = (gasEstimate * gasPrice * 1e-9) * 2000; // Assume $2000 ETH
  
  return expectedProfit - flashLoanFee - gasCost;
}

function hasReentrancyRisk(code: string): boolean {
  // Check for state changes after external calls
  const lines = code.split('\n');
  let hasExternalCall = false;
  
  for (const line of lines) {
    if (line.match(/\.(call|send|transfer)\(/)) {
      hasExternalCall = true;
    } else if (hasExternalCall && line.match(/\s(=|storage|state)/)) {
      return true; // State change after external call
    }
  }
  
  return false;
}

export function validateFlashLoanTarget(
  targetContract: string,
  targetFunction: string
): { isValid: boolean; reason?: string } {
  // Basic address validation
  if (!targetContract.match(/^0x[a-fA-F0-9]{40}$/)) {
    return { isValid: false, reason: 'Invalid contract address' };
  }
  
  // Check against blacklist
  const blacklistedContracts = [
    '0x0000000000000000000000000000000000000000', // Zero address
    // Add known malicious contracts
  ];
  
  if (blacklistedContracts.includes(targetContract.toLowerCase())) {
    return { isValid: false, reason: 'Blacklisted contract' };
  }
  
  // Validate function selector
  if (!targetFunction.match(/^0x[a-fA-F0-9]{8}$/)) {
    return { isValid: false, reason: 'Invalid function selector' };
  }
  
  return { isValid: true };
}

export function generateSafeFlashLoanCode(
  strategy: string,
  params: any
): string {
  const templates: Record<string, (params: any) => string> = {
    arbitrage: generateArbitrageCode,
    liquidation: generateLiquidationCode,
    collateral_swap: generateCollateralSwapCode,
  };
  
  const generator = templates[strategy];
  if (!generator) {
    throw new Error(`Unknown strategy: ${strategy}`);
  }
  
  return generator(params);
}

function generateArbitrageCode(params: {
  tokenA: string;
  tokenB: string;
  amountIn: number;
  dexA: string;
  dexB: string;
}): string {
  return `
// Safe arbitrage template
contract FlashLoanArbitrage {
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        // 1. Swap on DEX A
        IERC20(${params.tokenA}).approve(${params.dexA}, amount);
        uint256 amountOut = IDex(${params.dexA}).swap(
            ${params.tokenA},
            ${params.tokenB},
            amount
        );
        
        // 2. Swap back on DEX B
        IERC20(${params.tokenB}).approve(${params.dexB}, amountOut);
        uint256 finalAmount = IDex(${params.dexB}).swap(
            ${params.tokenB},
            ${params.tokenA},
            amountOut
        );
        
        // 3. Repay flash loan
        uint256 totalDebt = amount + premium;
        require(finalAmount >= totalDebt, "Unprofitable");
        
        IERC20(asset).approve(msg.sender, totalDebt);
        return true;
    }
}`;
}

function generateLiquidationCode(params: any): string {
  // Template for liquidation
  return `// Liquidation template`;
}

function generateCollateralSwapCode(params: any): string {
  // Template for collateral swap
  return `// Collateral swap template`;
}
