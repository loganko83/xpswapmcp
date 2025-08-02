#!/usr/bin/env node

/**
 * XPSwap 보안 환경변수 설정 도구
 * Phase 1.2: 환경변수 및 비밀 관리 강화
 * 
 * 사용법:
 * node scripts/setup-secure-env.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

class SecureEnvSetup {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.envFiles = [
      { file: '.env', description: 'Development Environment' },
      { file: '.env.production', description: 'Production Environment' }
    ];
  }

  /**
   * 안전한 랜덤 키 생성
   */
  generateSecureKey(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * 강력한 세션 시크릿 생성
   */
  generateSessionSecret() {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * API 키 형식 검증
   */
  validateApiKey(type, value) {
    switch (type) {
      case 'COINMARKETCAP_API_KEY':
        return /^[a-zA-Z0-9-]{20,}$/.test(value);
      case 'DEPLOYER_PRIVATE_KEY':
        return /^0x[a-fA-F0-9]{64}$/.test(value);
      case 'VITE_ALCHEMY_API_URL':
      case 'VITE_INFURA_API_URL':
        return value.startsWith('https://') && value.includes('alchemyapi.io' || 'infura.io');
      default:
        return value.length > 10;
    }
  }

  /**
   * 사용자 입력 받기
   */
  async getUserInput(question, validator = null) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      const askQuestion = () => {
        rl.question(question, (answer) => {
          if (validator && !validator(answer)) {
            console.log('❌ Invalid input format. Please try again.');
            askQuestion();
          } else {
            rl.close();
            resolve(answer);
          }
        });
      };
      askQuestion();
    });
  }

  /**
   * 환경변수 템플릿 생성
   */
  generateEnvTemplate(isProduction = false) {
    const template = {
      // 데이터베이스
      DATABASE_URL: './test.db',
      
      // 서버 설정
      PORT: '5000',
      NODE_ENV: isProduction ? 'production' : 'development',
      BASE_PATH: '/xpswap',
      
      // 보안 설정
      SESSION_SECRET: this.generateSessionSecret(),
      
      // 블록체인 설정
      XPHERE_RPC_URL: 'https://www.ankr.com/rpc/xphere/',
      
      // API 키들 (사용자 입력 필요)
      COINMARKETCAP_API_KEY: '',
      DEPLOYER_PRIVATE_KEY: '',
      VITE_ALCHEMY_API_URL: '',
      VITE_INFURA_API_URL: '',
      VITE_LIFI_API_KEY: '',
      
      // 개발 전용 설정
      ...(isProduction ? {} : {
        ENABLE_CORS: 'true',
        LOG_LEVEL: 'debug'
      })
    };

    // 프로덕션에서는 추가 보안 설정
    if (isProduction) {
      template.RATE_LIMIT_ENABLED = 'true';
      template.HTTPS_ONLY = 'true';
      template.SECURE_COOKIES = 'true';
    }

    return template;
  }

  /**
   * .env 파일 생성
   */
  async createEnvFile(envPath, template, interactive = true) {
    console.log(`\n📝 Creating ${envPath}...`);
    
    let envContent = '';
    
    for (const [key, defaultValue] of Object.entries(template)) {
      let value = defaultValue;
      
      // API 키들은 사용자 입력 받기
      if (interactive && ['COINMARKETCAP_API_KEY', 'DEPLOYER_PRIVATE_KEY', 'VITE_ALCHEMY_API_URL', 'VITE_INFURA_API_URL', 'VITE_LIFI_API_KEY'].includes(key)) {
        console.log(`\n🔑 ${key}:`);
        console.log(`   Current: ${defaultValue || '(empty)'}`);
        
        const input = await this.getUserInput(
          `   Enter new value (or press Enter to skip): `,
          (val) => !val || this.validateApiKey(key, val)
        );
        
        if (input.trim()) {
          value = input.trim();
        }
      }
      
      envContent += `${key}=${value}\n`;
    }
    
    // 백업 생성
    if (fs.existsSync(envPath)) {
      const backupPath = `${envPath}.backup.${Date.now()}`;
      fs.copyFileSync(envPath, backupPath);
      console.log(`📦 Backup created: ${path.basename(backupPath)}`);
    }
    
    // 새 파일 저장
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ ${envPath} created successfully!`);
  }

  /**
   * 보안 검증 실행
   */
  async validateSecuritySettings() {
    console.log('\n🔍 Running security validation...');
    
    for (const { file } of this.envFiles) {
      const envPath = path.join(this.rootDir, file);
      if (!fs.existsSync(envPath)) continue;
      
      console.log(`\n📋 Checking ${file}:`);
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });
      
      // 플레이스홀더 검사
      const placeholders = [];
      Object.entries(envVars).forEach(([key, value]) => {
        if (value.includes('your_actual_') || value.includes('placeholder') || value === 'your_key_here') {
          placeholders.push(key);
        }
      });
      
      if (placeholders.length > 0) {
        console.log(`⚠️  Placeholder values found: ${placeholders.join(', ')}`);
      } else {
        console.log('✅ No placeholder values found');
      }
      
      // 세션 시크릿 강도 검사
      if (envVars.SESSION_SECRET && envVars.SESSION_SECRET.length < 32) {
        console.log('⚠️  SESSION_SECRET should be at least 32 characters');
      } else if (envVars.SESSION_SECRET) {
        console.log('✅ SESSION_SECRET strength OK');
      }
    }
  }

  /**
   * 메인 실행 함수
   */
  async run() {
    console.log('🔒 XPSwap 보안 환경변수 설정 도구');
    console.log('=====================================\n');
    
    const action = await this.getUserInput(
      'Select action:\n1. Create/Update environment files\n2. Validate current settings\n3. Generate secure keys only\nEnter choice (1-3): ',
      (val) => ['1', '2', '3'].includes(val)
    );
    
    switch (action) {
      case '1':
        // 환경변수 파일 생성/업데이트
        for (const { file, description } of this.envFiles) {
          const envPath = path.join(this.rootDir, file);
          const isProduction = file.includes('production');
          const template = this.generateEnvTemplate(isProduction);
          
          console.log(`\n📄 ${description} (${file})`);
          const proceed = await this.getUserInput(`Create/update this file? (y/n): `, val => ['y', 'n'].includes(val.toLowerCase()));
          
          if (proceed.toLowerCase() === 'y') {
            await this.createEnvFile(envPath, template, true);
          }
        }
        break;
        
      case '2':
        // 현재 설정 검증
        await this.validateSecuritySettings();
        break;
        
      case '3':
        // 보안 키만 생성
        console.log('\n🔑 Generated secure keys:');
        console.log(`SESSION_SECRET=${this.generateSessionSecret()}`);
        console.log(`RANDOM_KEY_1=${this.generateSecureKey(32)}`);
        console.log(`RANDOM_KEY_2=${this.generateSecureKey(64)}`);
        break;
    }
    
    console.log('\n✅ Setup complete!');
    console.log('💡 Remember to restart your server after updating environment variables.');
  }
}

// 스크립트 실행
if (require.main === module) {
  const setup = new SecureEnvSetup();
  setup.run().catch(console.error);
}

module.exports = SecureEnvSetup;
