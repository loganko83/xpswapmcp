#!/usr/bin/env node

/**
 * 포괄적 보안 취약점 수정 스크립트
 * 2025년 7월 30일 - 모든 (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) 및 보안 이슈 해결
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveSecurityFixer {
  constructor() {
    this.projectPath = path.resolve(__dirname, '..');
    this.fixes = 0;
    this.errors = 0;
    this.filesProcessed = 0;
  }

  async fixAllSecurityIssues() {
    console.log('🔒 포괄적 보안 취약점 수정 시작...');
    console.log(`📁 프로젝트 경로: ${this.projectPath}`);
    
    // 1. (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) 제거
    await this.fixMathRandom();
    
    // 2. 하드코딩된 API URL 수정
    await this.fixHardcodedUrls();
    
    // 3. eval() 사용 제거
    await this.removeEvalUsage();
    
    // 4. 빈 파일 및 백업 파일 제거
    await this.cleanupFiles();
    
    console.log(`\n✅ 보안 수정 완료:`);
    console.log(`  - 처리된 파일: ${this.filesProcessed}개`);
    console.log(`  - 수정된 파일: ${this.fixes}개`);
    console.log(`  - 오류: ${this.errors}개`);
  }

  // 1. (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) 보안 취약점 수정
  async fixMathRandom() {
    console.log('\n🔧 (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) 취약점 수정 중...');
    
    const targets = [
      'client/src',
      'server',
      'scripts',
      'tests'
    ];

    for (const target of targets) {
      const targetPath = path.join(this.projectPath, target);
      if (fs.existsSync(targetPath)) {
        await this.processDirectory(targetPath, this.fixMathRandomInFile.bind(this));
      }
    }
  }

  // (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) 파일별 수정
  fixMathRandomInFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      const originalContent = content;

      // crypto 모듈 import 추가 확인
      const needsCrypto = content.includes('(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF)');
      let hasImport = content.includes("import") || content.includes("require");
      
      if (needsCrypto && !content.includes('crypto')) {
        // TypeScript/JavaScript에 따라 적절한 import 추가
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
          if (content.includes('import')) {
            const lastImportIndex = content.lastIndexOf('import');
            const nextLineIndex = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, nextLineIndex + 1) + 
                     "import crypto from 'crypto';\n" + 
                     content.slice(nextLineIndex + 1);
          } else {
            content = "import crypto from 'crypto';\n\n" + content;
          }
        } else {
          if (content.includes('require')) {
            const firstRequireIndex = content.indexOf('require');
            const lineStart = content.lastIndexOf('\n', firstRequireIndex) + 1;
            content = content.slice(0, lineStart) + 
                     "const crypto = require('crypto');\n" + 
                     content.slice(lineStart);
          } else {
            content = "const crypto = require('crypto');\n\n" + content;
          }
        }
        modified = true;
      }

      // 다양한 (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) 패턴 수정
      const patterns = [
        // 트랜잭션 해시 생성
        {
          pattern: /"0x"\s*\+\s*Math\.random\(\)\.toString\(16\)\.substr\(2,?\s*64?\)/g,
          replacement: '`0x${crypto.randomBytes(32).toString("hex")}`'
        },
        // ID 생성 패턴
        {
          pattern: /Math\.random\(\)\.toString\(16\)\.substr\(2,?\s*(\d+)?\)/g,
          replacement: 'crypto.randomBytes(8).toString("hex")'
        },
        // 0-1 사이 랜덤 값
        {
          pattern: /Math\.random\(\)/g,
          replacement: '(crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF)'
        },
        // 정수 범위 랜덤
        {
          pattern: /Math\.floor\(Math\.random\(\)\s*\*\s*(\d+)\)/g,
          replacement: 'crypto.randomInt($1)'
        }
      ];

      patterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
        }
      });

      if (modified && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ (crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF) 수정: ${path.relative(this.projectPath, filePath)}`);
        this.fixes++;
      }

    } catch (error) {
      console.log(`  ❌ 오류: ${path.relative(this.projectPath, filePath)} - ${error.message}`);
      this.errors++;
    }
  }

  // 2. 하드코딩된 API URL 수정
  async fixHardcodedUrls() {
    console.log('\n🔧 하드코딩된 API URL 수정 중...');
    
    const clientPath = path.join(this.projectPath, 'client/src');
    if (fs.existsSync(clientPath)) {
      await this.processDirectory(clientPath, this.fixApiUrlsInFile.bind(this));
    }
  }

  fixApiUrlsInFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // getApiUrl import 확인
      if (content.includes('fetch(') && !content.includes('getApiUrl')) {
        // getApiUrl import 추가
        if (content.includes('import')) {
          const lastImportIndex = content.lastIndexOf('import');
          const nextLineIndex = content.indexOf('\n', lastImportIndex);
          content = content.slice(0, nextLineIndex + 1) + 
                   "import { getApiUrl } from '../utils/config';\n" + 
                   content.slice(nextLineIndex + 1);
          modified = true;
        }
      }

      // 하드코딩된 API 경로 패턴 수정
      const apiPatterns = [
        {
          pattern: /fetch\(['"`](\/api\/[^'"`]+)['"`]\)/g,
          replacement: 'fetch(getApiUrl("$1"))'
        },
        {
          pattern: /fetch\(['"`](\/api\/[^'"`]+)['"`],/g,
          replacement: 'fetch(getApiUrl("$1"),'
        }
      ];

      apiPatterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ API URL 수정: ${path.relative(this.projectPath, filePath)}`);
        this.fixes++;
      }

    } catch (error) {
      console.log(`  ❌ 오류: ${path.relative(this.projectPath, filePath)} - ${error.message}`);
      this.errors++;
    }
  }

  // 3. eval() 사용 제거
  async removeEvalUsage() {
    console.log('\n🔧 eval() 사용 제거 중...');
    
    const targets = ['client/src', 'server'];
    for (const target of targets) {
      const targetPath = path.join(this.projectPath, target);
      if (fs.existsSync(targetPath)) {
        await this.processDirectory(targetPath, this.removeEvalInFile.bind(this));
      }
    }
  }

  removeEvalInFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('eval(')) {
        console.log(`  ⚠️  eval() 발견: ${path.relative(this.projectPath, filePath)}`);
        // eval() 사용을 로깅만 하고 수동 검토 필요
      }

    } catch (error) {
      this.errors++;
    }
  }

  // 4. 빈 파일 및 백업 파일 정리
  async cleanupFiles() {
    console.log('\n🧹 불필요한 파일 정리 중...');
    
    const patterns = [
      '**/*.backup',
      '**/*_OLD.*',
      '**/*.bak'
    ];

    const clientPath = path.join(this.projectPath, 'client/src');
    if (fs.existsSync(clientPath)) {
      await this.processDirectory(clientPath, this.cleanupFile.bind(this));
    }
  }

  cleanupFile(filePath) {
    try {
      const fileName = path.basename(filePath);
      
      // 백업 파일 확인
      if (fileName.includes('.backup') || fileName.includes('_OLD') || fileName.includes('.bak')) {
        console.log(`  🗑️  백업 파일 발견: ${path.relative(this.projectPath, filePath)}`);
        // 실제 삭제는 수동 검토 후 진행
        return;
      }

      // 빈 파일 확인
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.trim().length === 0) {
        console.log(`  📝 빈 파일 발견: ${path.relative(this.projectPath, filePath)}`);
        // 실제 삭제는 수동 검토 후 진행
      }

    } catch (error) {
      this.errors++;
    }
  }

  // 디렉토리 재귀 처리
  async processDirectory(dirPath, processor) {
    if (!fs.existsSync(dirPath)) return;

    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && 
            !file.startsWith('.') && 
            file !== 'node_modules' && 
            file !== 'dist') {
          await this.processDirectory(fullPath, processor);
        } else if (stat.isFile() && this.isTargetFile(file)) {
          this.filesProcessed++;
          processor(fullPath);
        }
      }
    } catch (error) {
      console.log(`❌ 디렉토리 처리 오류: ${dirPath} - ${error.message}`);
      this.errors++;
    }
  }

  isTargetFile(filename) {
    return filename.endsWith('.ts') || 
           filename.endsWith('.tsx') || 
           filename.endsWith('.js') || 
           filename.endsWith('.mjs') ||
           filename.endsWith('.jsx');
  }
}

// 실행
const fixer = new ComprehensiveSecurityFixer();
fixer.fixAllSecurityIssues()
  .then(() => {
    console.log('\n🎉 보안 수정 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 수정 중 오류 발생:', error);
    process.exit(1);
  });
