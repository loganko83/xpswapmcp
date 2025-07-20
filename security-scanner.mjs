import fs from 'fs';
import path from 'path';

/**
 * XPSwap DEX 자동 보안 스캐너
 */
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
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
            this.scanDirectory(fullPath, extensions);
          } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
            this.scanFile(fullPath);
          }
        } catch (err) {
          // Skip files that can't be accessed
        }
      });
    } catch (err) {
      console.log(`Directory access error: ${dirPath}`);
    }
  }

  // 개별 파일 스캔
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        this.checkSecurityPatterns(line, filePath, index + 1);
      });

      // 전체 컨텐츠 패턴 검사
      this.checkFlashLoanSecurity(content, filePath);
      this.checkOptionsTrading(content, filePath);
      
    } catch (error) {
      // Skip files that can't be read
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
        description: '암호학적으로 안전하지 않은 난수로 해시 생성',
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
        pattern: /private.*key|privateKey.*=/,
        severity: 'high',
        description: '개인키 하드코딩 의심',
        cwe: 'CWE-798'
      },
      {
        pattern: /Math\.random\(\).*substr\(2/,
        severity: 'high',
        description: '암호학적으로 안전하지 않은 난수로 ID 생성',
        cwe: 'CWE-338'
      },
      
      // Medium vulnerabilities
      {
        pattern: /console\.log.*password|console\.log.*secret|console\.log.*private/i,
        severity: 'medium',
        description: '민감한 정보 로깅',
        cwe: 'CWE-532'
      },
      {
        pattern: /http:\/\/(?!localhost)/,
        severity: 'medium',
        description: 'HTTP 사용 - HTTPS 권장 (localhost 제외)',
        cwe: 'CWE-319'
      },
      {
        pattern: /\.toString\(16\)\.substr\(2/,
        severity: 'medium',
        description: '예측 가능한 토큰/ID 생성',
        cwe: 'CWE-330'
      },
      
      // Low vulnerabilities
      {
        pattern: /parseInt\(.*\)|parseFloat\(.*\)/,
        severity: 'low',
        description: '입력 검증 없는 파싱',
        cwe: 'CWE-20'
      },
      {
        pattern: /setTimeout\(.*string/,
        severity: 'low',
        description: 'setTimeout에 문자열 전달',
        cwe: 'CWE-95'
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
      }
    ];

    patterns.forEach(pattern => {
      if (pattern.pattern.test(line)) {
        this.findings[pattern.severity].push({
          file: filePath.replace(this.projectPath, ''),
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
    if (!filePath.includes('flash') && !filePath.includes('Flash')) return;

    const flashLoanPatterns = [
      {
        pattern: /success.*=.*Math\.random\(\).*>/,
        severity: 'critical',
        description: 'Flash loan 성공률이 랜덤으로 결정됨 - 실제 환경에서 위험'
      },
      {
        pattern: /flashLoan.*amount.*fee/,
        severity: 'medium',
        description: 'Flash loan 수수료 계산 로직 확인 필요'
      },
      {
        pattern: /executeFlashLoan/,
        severity: 'info',
        description: 'Flash loan 실행 함수 발견 - 보안 검토 필요'
      }
    ];

    flashLoanPatterns.forEach(pattern => {
      if (pattern.pattern.test(content)) {
        this.findings[pattern.severity].push({
          file: filePath.replace(this.projectPath, ''),
          line: 'Pattern',
          code: 'Flash loan pattern detected',
          description: pattern.description,
          severity: pattern.severity
        });
      }
    });
  }

  // 옵션 거래 보안 검사
  checkOptionsTrading(content, filePath) {
    if (!filePath.includes('option') && !filePath.includes('Option')) return;

    const optionsPatterns = [
      {
        pattern: /calculateOptionPrice.*currentPrice/,
        severity: 'medium',
        description: 'Options 가격 계산 - 외부 가격 의존성 확인 필요'
      },
      {
        pattern: /impliedVolatility.*Math/,
        severity: 'medium',
        description: '내재 변동성 계산 - 조작 가능성 확인'
      }
    ];

    optionsPatterns.forEach(pattern => {
      if (pattern.pattern.test(content)) {
        this.findings[pattern.severity].push({
          file: filePath.replace(this.projectPath, ''),
          line: 'Pattern',
          code: 'Options pattern',
          description: pattern.description,
          severity: pattern.severity
        });
      }
    });
  }

  // 보고서 생성
  generateReport() {
    const total = Object.values(this.findings).reduce((sum, findings) => sum + findings.length, 0);
    
    let report = `# XPSwap DEX 자동 보안 스캔 결과

## 📊 스캔 요약
- **스캔 일시**: ${new Date().toLocaleString()}
- **총 발견 이슈**: ${total}개
- **Critical**: ${this.findings.critical.length}개 🔴
- **High**: ${this.findings.high.length}개 🟡  
- **Medium**: ${this.findings.medium.length}개 🟠
- **Low**: ${this.findings.low.length}개 🟢
- **Info**: ${this.findings.info.length}개 ℹ️

## 🚨 Critical 이슈 (${this.findings.critical.length}개)
`;

    if (this.findings.critical.length === 0) {
      report += `✅ Critical 이슈가 발견되지 않았습니다.\n`;
    } else {
      this.findings.critical.forEach((finding, index) => {
        report += `
### ${index + 1}. ${finding.description}
- **파일**: ${finding.file}
- **라인**: ${finding.line}
- **코드**: \`${finding.code.substring(0, 100)}${finding.code.length > 100 ? '...' : ''}\`
- **CWE**: ${finding.cwe || 'N/A'}
`;
      });
    }

    report += `
## 🔴 High 이슈 (${this.findings.high.length}개)
`;

    if (this.findings.high.length === 0) {
      report += `✅ High 이슈가 발견되지 않았습니다.\n`;
    } else {
      this.findings.high.slice(0, 5).forEach((finding, index) => {
        report += `
### ${index + 1}. ${finding.description}
- **파일**: ${finding.file}
- **라인**: ${finding.line}
- **CWE**: ${finding.cwe || 'N/A'}
`;
      });

      if (this.findings.high.length > 5) {
        report += `\n... 그리고 ${this.findings.high.length - 5}개 더\n`;
      }
    }

    report += `
## 🟠 Medium 이슈 (${this.findings.medium.length}개)
`;

    if (this.findings.medium.length === 0) {
      report += `✅ Medium 이슈가 최소화되었습니다.\n`;
    } else {
      this.findings.medium.slice(0, 3).forEach((finding, index) => {
        report += `
### ${index + 1}. ${finding.description}
- **파일**: ${finding.file}
- **CWE**: ${finding.cwe || 'N/A'}
`;
      });

      if (this.findings.medium.length > 3) {
        report += `\n... 그리고 ${this.findings.medium.length - 3}개 더\n`;
      }
    }

    // 보안 점수 계산
    const securityScore = Math.max(0, 10 - (
      this.findings.critical.length * 3 +
      this.findings.high.length * 2 +
      this.findings.medium.length * 1 +
      this.findings.low.length * 0.5
    ));

    report += `
## 📊 보안 점수: ${securityScore.toFixed(1)}/10

${securityScore >= 9 ? '🟢 **우수한 보안 상태**' : 
  securityScore >= 7 ? '🟡 **양호한 보안 상태**' : 
  securityScore >= 5 ? '🟠 **보통 보안 상태 - 개선 필요**' : 
  '🔴 **취약한 보안 상태 - 즉시 개선 필요**'}

## 💡 주요 권장사항

### 즉시 수정 필요
${this.findings.critical.length > 0 ? 
  '🚨 Critical 이슈들을 최우선으로 수정하세요' : 
  '✅ Critical 이슈가 발견되지 않았습니다'}

${this.findings.high.length > 0 ? 
  '⚠️ High 이슈들을 빠른 시일 내에 수정하세요' : 
  '✅ High 이슈가 잘 관리되고 있습니다'}

### 일반적인 보안 개선사항
- 🔐 암호학적으로 안전한 난수 생성기 사용 (crypto.randomBytes)
- 🛡️ 입력 검증 및 출력 인코딩 강화
- 📝 민감한 정보 로깅 방지
- 🔒 HTTPS 사용 강화
- 🧪 보안 테스트 및 코드 리뷰 정기 실시

### DeFi 특화 권장사항
- ⛓️ Reentrancy 가드 적용
- 📊 가격 오라클 조작 방지
- 💰 Flash loan 보안 강화
- 🎯 MEV 공격 방지 메커니즘

---
*자동 보안 스캔 도구 v1.0 - XPSwap DEX Security Team*
`;

    return report;
  }

  // 실행
  run() {
    console.log('🔍 XPSwap DEX 보안 스캔 시작...');
    
    // 프로젝트 디렉토리 스캔
    this.scanDirectory(this.projectPath);
    
    console.log(`📊 스캔 완료: ${Object.values(this.findings).reduce((sum, findings) => sum + findings.length, 0)}개 이슈 발견`);
    console.log(`   - Critical: ${this.findings.critical.length}`);
    console.log(`   - High: ${this.findings.high.length}`);
    console.log(`   - Medium: ${this.findings.medium.length}`);
    console.log(`   - Low: ${this.findings.low.length}`);
    console.log(`   - Info: ${this.findings.info.length}`);
    
    return this.generateReport();
  }
}

// 스캐너 실행
const scanner = new SecurityScanner(process.cwd());
const report = scanner.run();

// 보고서 파일로 저장
fs.writeFileSync('AUTOMATED_SECURITY_SCAN.md', report);
console.log('\n📝 보고서가 AUTOMATED_SECURITY_SCAN.md 파일로 저장되었습니다.');
console.log('🔍 상세한 결과를 확인하세요.');