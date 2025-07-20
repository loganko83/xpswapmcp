#!/usr/bin/env node

/**
 * 서버 routes.ts 파일의 Math.random() 완전 제거 스크립트
 */

import fs from 'fs';

const routesPath = './server/routes.ts';

try {
  let content = fs.readFileSync(routesPath, 'utf8');
  let changeCount = 0;

  // 1. 트랜잭션 해시 패턴들 교체
  const patterns = [
    // txHash: "0x" + Math.random().toString(16).substr(2, 64)
    {
      old: /"0x"\s*\+\s*Math\.random\(\)\.toString\(16\)\.substr\(2,\s*64\)/g,
      new: 'SecurityUtils.generateTxHash()'
    },
    // txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    {
      old: /`0x\$\{Math\.random\(\)\.toString\(16\)\.substr\(2,\s*64\)\}`/g,
      new: 'SecurityUtils.generateTxHash()'
    },
    // "0x" + Math.random().toString(16).substr(2)
    {
      old: /"0x"\s*\+\s*Math\.random\(\)\.toString\(16\)\.substr\(2\)/g,
      new: 'SecurityUtils.generateTxHash()'
    },
    // Math.random().toString(16).substr(2, 16) 형태의 ID들
    {
      old: /Math\.random\(\)\.toString\(16\)\.substr\(2,\s*16\)/g,
      new: 'SecurityUtils.generateSecureId(16)'
    },
    // Math.random().toString(16).substr(2, 8) 형태의 짧은 ID들
    {
      old: /Math\.random\(\)\.toString\(16\)\.substr\(2,\s*8\)/g,
      new: 'SecurityUtils.generateSecureId(8)'
    },
    // Math.random().toString(16).substr(2) 일반형
    {
      old: /Math\.random\(\)\.toString\(16\)\.substr\(2\)/g,
      new: 'SecurityUtils.generateSecureId()'
    },
    // Math.random() * 숫자 패턴들
    {
      old: /Math\.random\(\)\s*\*\s*(\d+)/g,
      new: 'SecurityUtils.getSecureRandomInt(0, $1)'
    },
    // Math.floor(Math.random() * 숫자) 패턴들
    {
      old: /Math\.floor\(Math\.random\(\)\s*\*\s*(\d+)\)/g,
      new: 'SecurityUtils.getSecureRandomInt(0, $1)'
    },
    // 단순 Math.random() > 0.5 같은 조건문
    {
      old: /Math\.random\(\)\s*([><]=?)\s*(0\.\d+)/g,
      new: 'SecurityUtils.getSecureRandomFloat() $1 $2'
    },
    // 남은 모든 Math.random()
    {
      old: /Math\.random\(\)/g,
      new: 'SecurityUtils.getSecureRandomFloat()'
    }
  ];

  patterns.forEach(pattern => {
    const beforeCount = (content.match(pattern.old) || []).length;
    content = content.replace(pattern.old, pattern.new);
    const afterCount = (content.match(pattern.old) || []).length;
    changeCount += (beforeCount - afterCount);
  });

  // 특별한 패턴들 수동 처리
  // Array.from({length: 64}, () => Math.floor(Math.random() * 16)).map(x => x.toString(16)).join('')
  const complexArrayPattern = /Array\.from\(\{length:\s*64\},\s*\(\)\s*=>\s*Math\.floor\(Math\.random\(\)\s*\*\s*16\)\)\.map\(x\s*=>\s*x\.toString\(16\)\)\.join\(''\)/g;
  if (complexArrayPattern.test(content)) {
    content = content.replace(complexArrayPattern, "SecurityUtils.generateTxHash().slice(2)");
    changeCount++;
  }

  fs.writeFileSync(routesPath, content);
  console.log(`✅ Math.random() 교체 완료: ${changeCount}개 패턴 수정`);

} catch (error) {
  console.error('❌ 수정 실패:', error);
}