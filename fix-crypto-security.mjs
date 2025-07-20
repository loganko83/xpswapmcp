#!/usr/bin/env node

/**
 * Math.random() 보안 취약점 자동 수정 스크립트
 * Critical 보안 이슈를 즉시 수정합니다.
 */

import fs from 'fs';
import path from 'path';

class SecurityFixer {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.fixes = 0;
    this.errors = 0;
  }

  // 프로젝트 전체 스캔 및 수정
  fixProject() {
    console.log('🔧 Math.random() 보안 취약점 자동 수정 시작...');
    
    // 클라이언트 코드 수정
    this.fixDirectory(path.join(this.projectPath, 'client', 'src'));
    
    // 서버 코드 수정 (이미 부분적으로 수정됨)
    this.fixDirectory(path.join(this.projectPath, 'server'));
    
    // 스크립트 파일 수정
    this.fixDirectory(path.join(this.projectPath, 'scripts'));
    
    console.log(`\n✅ 수정 완료: ${this.fixes}개 파일, 오류: ${this.errors}개`);
  }

  // 디렉토리 재귀적 처리
  fixDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          this.fixDirectory(fullPath);
        } else if (stat.isFile() && this.isTargetFile(file)) {
          this.fixFile(fullPath);
        }
      });
    } catch (error) {
      this.errors++;
    }
  }

  // 수정 대상 파일 확인
  isTargetFile(filename) {
    return filename.endsWith('.ts') || 
           filename.endsWith('.tsx') || 
           filename.endsWith('.js') || 
           filename.endsWith('.mjs');
  }

  // 개별 파일 수정
  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // 1. 트랜잭션 해시 생성 패턴 수정
      const txHashPattern = /"0x"\s*\+\s*Math\.random\(\)\.toString\(16\)\.substr\(2,\s*64\)/g;
      if (txHashPattern.test(content)) {
        content = content.replace(txHashPattern, 'generateSecureTxHash()');
        modified = true;
      }
      
      // 2. 일반적인 ID 생성 패턴 수정
      const idPattern = /Math\.random\(\)\.toString\(16\)\.substr\(2(?:,\s*\d+)?\)/g;
      if (idPattern.test(content)) {
        content = content.replace(idPattern, 'generateSecureId()');
        modified = true;
      }
      
      // 3. 간단한 Math.random() 패턴
      const simplePattern = /Math\.random\(\)/g;
      if (simplePattern.test(content) && !content.includes('generateSecure')) {
        // 숫자 관련 컨텍스트에서만 교체
        content = content.replace(simplePattern, 'getSecureRandom()');
        modified = true;
      }
      
      // 유틸리티 함수 추가 (한 번만)
      if (modified && !content.includes('generateSecureTxHash')) {
        const utilityFunctions = `
// 보안 강화된 난수 생성 함수들
function generateSecureTxHash(): string {
  return \`0x\${require('crypto').randomBytes(32).toString('hex')}\`;
}

function generateSecureId(length: number = 16): string {
  return require('crypto').randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function getSecureRandom(): number {
  const randomBytes = require('crypto').randomBytes(4);
  return randomBytes.readUInt32BE(0) / 0xFFFFFFFF;
}

`;
        
        // 첫 번째 import 문 이후에 추가
        const importIndex = content.indexOf('import');
        if (importIndex !== -1) {
          const nextLineIndex = content.indexOf('\n', importIndex);
          if (nextLineIndex !== -1) {
            content = content.slice(0, nextLineIndex + 1) + utilityFunctions + content.slice(nextLineIndex + 1);
          }
        } else {
          content = utilityFunctions + content;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ 수정됨: ${filePath.replace(this.projectPath, '')}`);
        this.fixes++;
      }
      
    } catch (error) {
      console.log(`❌ 오류: ${filePath} - ${error.message}`);
      this.errors++;
    }
  }
}

// 실행
const fixer = new SecurityFixer(process.cwd());
fixer.fixProject();