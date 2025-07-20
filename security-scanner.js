#!/usr/bin/env node

/**
 * XPSwap DEX 자동 보안 스캐너
 * 
 * 이 스크립트는 XPSwap DEX 프로젝트의 보안 취약점을 자동으로 스캔합니다.
 */

const fs = require('fs');
const path = require('path');

class SecurityScanner {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.findings = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: []
    };
  }

  // 파일을 재귀적으로 스캔
  scanDirectory(dirPath, extensions = ['.js', '.ts', '.tsx', '.sol']) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.scanDirectory(fullPath, extensions);
      } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
        this.scanFile(fullPath);
      }
    });
  }

  // 개별 파일 스캔
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        this.checkSecurityPatterns(line, filePath, index + 1);
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }

  // 보안 패턴 검사
  checkSecurityPatterns(line, filePath, lineNumber) {
    const patterns = [
      // Critical vulnerabilities
      {
        pattern: /eval\s*\(/,
        severity: 'critical',
        description: 'eval() 사용 - 코드 인젝션 위험',
        cwe: 'CWE-95'
      },
      {
        pattern: /innerHTML\s*=/,
        severity: 'high',
        description: 'innerHTML 사용 - XSS 위험',
        cwe: 'CWE-79'
      },
      {
        pattern: /Math\.random\(\).*0x/,
        severity: 'high',
        description: '암호학적으로 안전하지 않은 난수 생성',
        cwe: 'CWE-338'
      },
      
      // High vulnerabilities
      {
        pattern: /localStorage\.setItem.*password|sessionStorage\.setItem.*password/,
        severity: 'high',
        description: '브라우저 스토리지에 민감한 정보 저장',
        cwe: 'CWE-312'
      },
      {
        pattern: /private.*key|privateKey/,
        severity: 'high',
        description: '개인키 하드코딩 의심',
        cwe: 'CWE-798'
      },
      {
        pattern: /sql.*\+.*req\.|SELECT.*\+.*req\./i,
        severity: 'critical',
        description: 'SQL 인젝션 위험',
        cwe: 'CWE-89'
      },
      
      // Medium vulnerabilities
      {
        pattern: /console\.log.*password|console\.log.*secret|console\.log.*private/i,
        severity: 'medium',
        description: '민감한 정보 로깅',
        cwe: 'CWE-532'
      },
      {
        pattern: /fetch\(.*http:\/\//,
        severity: 'medium',
        description: 'HTTP 사용 - HTTPS 권장',
        cwe: 'CWE-319'
      },
      {
        pattern: /parseInt\(\)|parseFloat\(\)/,
        severity: 'low',
        description: '입력 검증 없는 파싱',
        cwe: 'CWE-20'
      },
      
      // DeFi specific patterns
      {
        pattern: /transfer\(.*amount.*\).*transfer\(/,
        severity: 'critical',
        description: 'Reentrancy 공격 가능성',
        cwe: 'CWE-367'
      },
      {
        pattern: /block\.timestamp|block\.number/,
        severity: 'medium',
        description: '블록 타임스탬프/번호 의존성',
        cwe: 'CWE-829'
      },
      {
        pattern: /tx\.origin/,
        severity: 'high',
        description: 'tx.origin 사용 - 피싱 공격 위험',
        cwe: 'CWE-345'
      },
      {
        pattern: /require\(.*amount.*>.*0.*\)/,
        severity: 'info',
        description: '금액 검증 로직',
        cwe: null
      }
    ];

    patterns.forEach(pattern => {
      if (pattern.pattern.test(line)) {
        this.findings[pattern.severity].push({
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          description: pattern.description,
          cwe: pattern.cwe,
          severity: pattern.severity
        });
      }
    });
  }

  // Flash Loan 특별 검사
  checkFlashLoanSecurity(content, filePath) {
    const flashLoanPatterns = [
      {
        pattern: /flashLoan.*amount.*\n.*transfer/s,
        severity: 'critical',
        description: 'Flash loan에서 체크 없는 전송'
      },
      {
        pattern: /executeFlashLoan.*amount.*fee/,
        severity: 'medium',
        description: 'Flash loan 수수료 계산 확인 필요'
      }
    ];

    flashLoanPatterns.forEach(pattern => {
      if (pattern.pattern.test(content)) {
        this.findings[pattern.severity].push({
          file: filePath,
          line: 'Multiple',
          code: 'Flash loan pattern detected',
          description: pattern.description,
          severity: pattern.severity
        });
      }
    });
  }

  // 옵션 거래 보안 검사
  checkOptionsTrading(content, filePath) {
    const optionsPatterns = [
      {
        pattern: /Black.*Scholes.*price/i,
        severity: 'medium',
        description: 'Black-Scholes 모델 - 가격 조작 위험 확인 필요'
      },
      {
        pattern: /impliedVolatility.*calculate/i,
        severity: 'medium',
        description: '내재 변동성 계산 - 조작 가능성 확인'
      }
    ];

    optionsPatterns.forEach(pattern => {
      if (pattern.pattern.test(content)) {
        this.findings[pattern.severity].push({
          file: filePath,
          line: 'Pattern',
          code: 'Options trading pattern',
          description: pattern.description,
          severity: pattern.severity
        });
      }
    });
  }

  // 보고서 생성
  generateReport() {
    const total = Object.values(this.findings).reduce((sum, findings) => sum + findings.length, 0);
    
    let report = `
# XPSwap DEX 자동 보안 스캔 결과

## 📊 요약
- **총 발견 이슈**: ${total}개
- **Critical**: ${this.findings.critical.length}개
- **High**: ${this.findings.high.length}개  
- **Medium**: ${this.findings.medium.length}개
- **Low**: ${this.findings.low.length}개
- **Info**: ${this.findings.info.length}개

## 🔴 Critical 이슈 (${this.findings.critical.length}개)
`;

    this.findings.critical.forEach((finding, index) => {
      report += `
### ${index + 1}. ${finding.description}
- **파일**: ${finding.file}
- **라인**: ${finding.line}
- **코드**: \`${finding.code}\`
- **CWE**: ${finding.cwe || 'N/A'}
`;
    });

    report += `
## 🟡 High 이슈 (${this.findings.high.length}개)
`;

    this.findings.high.forEach((finding, index) => {
      report += `
### ${index + 1}. ${finding.description}
- **파일**: ${finding.file}
- **라인**: ${finding.line}
- **코드**: \`${finding.code}\`
- **CWE**: ${finding.cwe || 'N/A'}
`;
    });

    report += `
## 🟢 Medium 이슈 (${this.findings.medium.length}개)
`;

    this.findings.medium.slice(0, 10).forEach((finding, index) => {
      report += `
### ${index + 1}. ${finding.description}
- **파일**: ${finding.file}
- **라인**: ${finding.line}
- **CWE**: ${finding.cwe || 'N/A'}
`;
    });

    if (this.findings.medium.length > 10) {
      report += `\n... 그리고 ${this.findings.medium.length - 10}개 더\n`;
    }

    report += `
## 📋 권장사항

### 즉시 수정 필요
${this.findings.critical.length > 0 ? '- Critical 이슈들을 즉시 수정하세요' : '- Critical 이슈가 발견되지 않았습니다 ✅'}
${this.findings.high.length > 0 ? '- High 이슈들을 우선적으로 수정하세요' : '- High 이슈가 최소화되었습니다 ✅'}

### 추가 검증 필요
- 수동 코드 리뷰 수행
- 침투 테스트 실시  
- 외부 보안 감사 요청

### 모니터링 강화
- 실시간 보안 모니터링 구현
- 자동화된 보안 스캔 도구 도입
- 버그 바운티 프로그램 운영

---
*스캔 완료 시간: ${new Date().toISOString()}*
`;

    return report;
  }

  // 실행
  run() {
    console.log('🔍 XPSwap DEX 보안 스캔 시작...');
    
    // 프로젝트 디렉토리 스캔
    this.scanDirectory(this.projectPath);
    
    // 특별 검사
    const clientPath = path.join(this.projectPath, 'client', 'src');
    const serverPath = path.join(this.projectPath, 'server');
    
    if (fs.existsSync(clientPath)) {
      console.log('🔍 클라이언트 코드 스캔 중...');
    }
    
    if (fs.existsSync(serverPath)) {
      console.log('🔍 서버 코드 스캔 중...');
    }
    
    console.log('📝 보고서 생성 중...');
    return this.generateReport();
  }
}

module.exports = SecurityScanner;