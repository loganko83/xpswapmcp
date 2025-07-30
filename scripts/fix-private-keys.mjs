#!/usr/bin/env node

/**
 * 하드코딩된 프라이빗 키 제거 스크립트
 * 2025년 7월 30일 - 치명적 보안 취약점 수정
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PrivateKeySecurityFixer {
  constructor() {
    this.projectPath = path.resolve(__dirname, '..');
    this.fixes = 0;
    this.errors = 0;
    this.filesProcessed = 0;
  }

  async fixHardcodedPrivateKeys() {
    console.log('🔐 하드코딩된 프라이빗 키 제거 시작...');
    console.log(`📁 프로젝트 경로: ${this.projectPath}`);
    
    // 스크립트 폴더에서 하드코딩된 키 수정
    const scriptsPath = path.join(this.projectPath, 'scripts');
    if (fs.existsSync(scriptsPath)) {
      await this.processDirectory(scriptsPath);
    }

    // 서버 폴더에서 하드코딩된 키 수정
    const serverPath = path.join(this.projectPath, 'server');
    if (fs.existsSync(serverPath)) {
      await this.processDirectory(serverPath);
    }

    // 기타 파일들 수정
    const rootFiles = [
      'contract-deployer.js',
      'hardhat.config.cjs'
    ];

    for (const file of rootFiles) {
      const filePath = path.join(this.projectPath, file);
      if (fs.existsSync(filePath)) {
        this.fixPrivateKeyInFile(filePath);
      }
    }

    console.log(`\n✅ 프라이빗 키 보안 수정 완료:`);
    console.log(`  - 처리된 파일: ${this.filesProcessed}개`);
    console.log(`  - 수정된 파일: ${this.fixes}개`);
    console.log(`  - 오류: ${this.errors}개`);
  }

  async processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && 
            !file.startsWith('.') && 
            file !== 'node_modules') {
          await this.processDirectory(fullPath);
        } else if (stat.isFile() && this.isTargetFile(file)) {
          this.filesProcessed++;
          this.fixPrivateKeyInFile(fullPath);
        }
      }
    } catch (error) {
      console.log(`❌ 디렉토리 처리 오류: ${dirPath} - ${error.message}`);
      this.errors++;
    }
  }

  fixPrivateKeyInFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      const originalContent = content;

      // 1. 하드코딩된 16진수 프라이빗 키 패턴 제거
      const hardcodedKeyPattern = /const\s+privateKey\s*=\s*['"]0x[a-fA-F0-9]{64}['"];?/g;
      if (hardcodedKeyPattern.test(content)) {
        content = content.replace(
          hardcodedKeyPattern, 
          'const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;'
        );
        modified = true;
      }

      // 2. 다른 형태의 하드코딩된 키 패턴
      const varKeyPattern = /const\s+PRIVATE_KEY\s*=\s*['"]0x[a-fA-F0-9]{64}['"];?/g;
      if (varKeyPattern.test(content)) {
        content = content.replace(
          varKeyPattern,
          'const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;'
        );
        modified = true;
      }

      // 3. 프라이빗 키 직접 할당 패턴
      const directAssignPattern = /privateKey\s*=\s*['"]0x[a-fA-F0-9]{64}['"];?/g;
      if (directAssignPattern.test(content)) {
        content = content.replace(
          directAssignPattern,
          'privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;'
        );
        modified = true;
      }

      // 4. 환경변수 체크 코드 추가
      if (modified && !content.includes('dotenv')) {
        // dotenv import 추가
        if (content.includes('require(')) {
          const requireIndex = content.indexOf('require(');
          const lineStart = content.lastIndexOf('\n', requireIndex) + 1;
          content = content.slice(0, lineStart) + 
                   "require('dotenv').config();\n" + 
                   content.slice(lineStart);
        } else if (content.includes('import')) {
          const importIndex = content.indexOf('import');
          const lineStart = content.lastIndexOf('\n', importIndex) + 1;
          content = content.slice(0, lineStart) + 
                   "import dotenv from 'dotenv';\ndotenv.config();\n" + 
                   content.slice(lineStart);
        } else {
          content = "require('dotenv').config();\n\n" + content;
        }
      }

      // 5. 환경변수 검증 코드 추가
      if (modified && !content.includes('DEPLOYER_PRIVATE_KEY')) {
        const privateKeyLine = content.indexOf('privateKey = process.env');
        if (privateKeyLine !== -1) {
          const lineEnd = content.indexOf('\n', privateKeyLine);
          const validation = `
if (!privateKey) {
    console.error('❌ DEPLOYER_PRIVATE_KEY 환경변수가 설정되지 않았습니다.');
    console.error('   .env 파일에 DEPLOYER_PRIVATE_KEY=your_private_key_here 를 추가하세요.');
    process.exit(1);
}
`;
          content = content.slice(0, lineEnd + 1) + validation + content.slice(lineEnd + 1);
        }
      }

      if (modified && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ 프라이빗 키 수정: ${path.relative(this.projectPath, filePath)}`);
        this.fixes++;
      }

    } catch (error) {
      console.log(`  ❌ 오류: ${path.relative(this.projectPath, filePath)} - ${error.message}`);
      this.errors++;
    }
  }

  isTargetFile(filename) {
    return filename.endsWith('.js') || 
           filename.endsWith('.mjs') ||
           filename.endsWith('.ts') ||
           filename.endsWith('.cjs');
  }
}

// 실행
const fixer = new PrivateKeySecurityFixer();
fixer.fixHardcodedPrivateKeys()
  .then(() => {
    console.log('\n🎉 프라이빗 키 보안 수정 완료!');
    console.log('\n⚠️  중요 안내:');
    console.log('   1. .env 파일에 DEPLOYER_PRIVATE_KEY=your_actual_private_key 를 추가하세요');
    console.log('   2. .env 파일은 절대 Git에 커밋하지 마세요');
    console.log('   3. .env.example 파일로 템플릿을 만들어 공유하세요');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 수정 중 오류 발생:', error);
    process.exit(1);
  });
