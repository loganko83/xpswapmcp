#!/usr/bin/env node

/**
 * 클라이언트 코드의 Math.random() 완전 제거 스크립트
 */

import fs from 'fs';
import path from 'path';

const clientPath = './client/src';

function addSecurityUtils(content) {
  if (content.includes('generateSecureId') || content.includes('getSecureRandom')) {
    return content; // 이미 추가됨
  }

  const utilityCode = `
// 보안 강화된 유틸리티 함수들
const generateSecureId = (length = 16) => {
  const array = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
};

const getSecureRandom = () => {
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  return array[0] / 255;
};

const getSecureRandomInt = (min, max) => {
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  const randomValue = array[0] / 255;
  return Math.floor(min + randomValue * (max - min + 1));
};
`;

  // import 문 이후에 추가
  const importMatch = content.match(/import.*from.*;\n/);
  if (importMatch) {
    const lastImportIndex = content.lastIndexOf(importMatch[0]) + importMatch[0].length;
    return content.slice(0, lastImportIndex) + utilityCode + content.slice(lastImportIndex);
  }
  
  return utilityCode + content;
}

function fixMathRandom(content) {
  let fixed = content;
  let changeCount = 0;

  const patterns = [
    // Math.random() * 숫자
    {
      old: /Math\.random\(\)\s*\*\s*(\d+)/g,
      new: 'getSecureRandomInt(0, $1)',
      desc: 'Math.random() * number'
    },
    // Math.floor(Math.random() * 숫자)
    {
      old: /Math\.floor\(Math\.random\(\)\s*\*\s*(\d+)\)/g,
      new: 'getSecureRandomInt(0, $1)',
      desc: 'Math.floor(Math.random() * number)'
    },
    // Math.random() + 숫자 또는 Math.random() - 숫자
    {
      old: /Math\.random\(\)\s*([+\-])\s*(\d+(?:\.\d+)?)/g,
      new: '(getSecureRandom() $1 $2)',
      desc: 'Math.random() +/- number'
    },
    // Math.random() 비교 연산
    {
      old: /Math\.random\(\)\s*([><]=?)\s*(0\.\d+)/g,
      new: 'getSecureRandom() $1 $2',
      desc: 'Math.random() comparison'
    },
    // 남은 모든 Math.random()
    {
      old: /Math\.random\(\)/g,
      new: 'getSecureRandom()',
      desc: 'remaining Math.random()'
    }
  ];

  patterns.forEach(pattern => {
    const matches = fixed.match(pattern.old);
    if (matches) {
      fixed = fixed.replace(pattern.old, pattern.new);
      changeCount += matches.length;
      console.log(`  - ${pattern.desc}: ${matches.length}개`);
    }
  });

  return { content: fixed, changed: changeCount > 0 };
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('Math.random')) {
      return;
    }

    console.log(`🔧 수정 중: ${filePath.replace(process.cwd(), '')}`);
    
    const result = fixMathRandom(content);
    if (result.changed) {
      result.content = addSecurityUtils(result.content);
      fs.writeFileSync(filePath, result.content);
      console.log(`✅ 완료\n`);
    } else {
      console.log(`⏭️ 변경사항 없음\n`);
    }
  } catch (error) {
    console.error(`❌ 오류: ${filePath} - ${error.message}`);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(fullPath);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'))) {
      processFile(fullPath);
    }
  });
}

console.log('🔍 클라이언트 Math.random() 보안 취약점 수정 시작...\n');
processDirectory(clientPath);
console.log('🎉 클라이언트 보안 수정 완료!');