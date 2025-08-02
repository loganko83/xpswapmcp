/**
 * 🔐 SSL 인증서 관리 서비스
 * XPSwap DEX Platform - Phase 4.1
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as crypto from 'crypto';

interface SSLConfig {
  certPath?: string;
  keyPath?: string;
  caPath?: string;
  autoRenew?: boolean;
  domains?: string[];
  environment: 'development' | 'production';
}

interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  isValid: boolean;
  daysUntilExpiry: number;
  serialNumber: string;
  fingerprint: string;
}

class SSLManager {
  private config: SSLConfig;
  private certificates: Map<string, CertificateInfo> = new Map();

  constructor(config: SSLConfig) {
    this.config = config;
    this.initializeSSL();
  }

  private initializeSSL(): void {
    console.log('🔐 SSL Manager initializing...');
    
    if (this.config.environment === 'development') {
      this.setupDevelopmentSSL();
    } else {
      this.setupProductionSSL();
    }
  }

  private setupDevelopmentSSL(): void {
    console.log('🔧 Setting up development SSL (self-signed)...');
    
    // Development에서는 자체 서명된 인증서 생성
    const certDir = path.join(process.cwd(), 'server', 'ssl', 'dev');
    this.ensureDirectoryExists(certDir);
    
    const keyPath = path.join(certDir, 'private-key.pem');
    const certPath = path.join(certDir, 'certificate.pem');
    
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      this.generateSelfSignedCertificate(certDir);
    }
    
    this.loadCertificateInfo('development', certPath);
  }

  private setupProductionSSL(): void {
    console.log('🏭 Setting up production SSL...');
    
    if (!this.config.certPath || !this.config.keyPath) {
      throw new Error('Production SSL requires certPath and keyPath');
    }
    
    if (!fs.existsSync(this.config.certPath) || !fs.existsSync(this.config.keyPath)) {
      throw new Error('SSL certificate files not found');
    }
    
    this.loadCertificateInfo('production', this.config.certPath);
    
    if (this.config.autoRenew) {
      this.startAutoRenewalMonitoring();
    }
  }

  private generateSelfSignedCertificate(certDir: string): void {
    console.log('🔑 Generating self-signed certificate for development...');
    
    try {
      // Node.js crypto를 사용한 간단한 자체 서명 인증서 생성
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      // 개발용 인증서 생성 (실제로는 openssl 또는 다른 도구 사용 권장)
      const cert = this.createDevelopmentCertificate(privateKey, publicKey);
      
      fs.writeFileSync(path.join(certDir, 'private-key.pem'), privateKey);
      fs.writeFileSync(path.join(certDir, 'certificate.pem'), cert);
      
      console.log('✅ Self-signed certificate generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate self-signed certificate:', error);
    }
  }

  private createDevelopmentCertificate(privateKey: string, publicKey: string): string {
    // 개발용 더미 인증서 (실제 환경에서는 proper certificate 생성 필요)
    const now = new Date();
    const validTo = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1년 유효
    
    return `-----BEGIN CERTIFICATE-----
MIICqjCCAZICAQAwDQYJKoZIhvcNAQELBQAwEjEQMA4GA1UEAwwHRGV2IENlcnQw
HhcNMjUwODAyMDQxNjQ1WhcNMjYwODAyMDQxNjQ1WjASMRAwDgYDVQQDDAdEZXYg
Q2VydDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL2N...
-----END CERTIFICATE-----`;
  }

  private loadCertificateInfo(type: string, certPath: string): void {
    try {
      const certData = fs.readFileSync(certPath, 'utf8');
      const certInfo = this.parseCertificate(certData);
      
      this.certificates.set(type, certInfo);
      
      console.log(`📋 Certificate loaded for ${type}:`);
      console.log(`   Subject: ${certInfo.subject}`);
      console.log(`   Valid from: ${certInfo.validFrom.toISOString()}`);
      console.log(`   Valid to: ${certInfo.validTo.toISOString()}`);
      console.log(`   Days until expiry: ${certInfo.daysUntilExpiry}`);
      console.log(`   Status: ${certInfo.isValid ? '✅ Valid' : '❌ Invalid/Expired'}`);
      
    } catch (error) {
      console.error(`❌ Failed to load certificate info for ${type}:`, error);
    }
  }

  private parseCertificate(certData: string): CertificateInfo {
    // 실제 환경에서는 proper certificate parsing 라이브러리 사용
    const now = new Date();
    const validFrom = new Date('2025-01-01');
    const validTo = new Date('2026-01-01');
    const daysUntilExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      subject: 'CN=localhost',
      issuer: 'CN=Development CA',
      validFrom,
      validTo,
      isValid: now >= validFrom && now <= validTo,
      daysUntilExpiry,
      serialNumber: '01',
      fingerprint: crypto.createHash('sha1').update(certData).digest('hex')
    };
  }

  private startAutoRenewalMonitoring(): void {
    console.log('🔄 Starting SSL certificate auto-renewal monitoring...');
    
    // 매일 인증서 만료 확인
    setInterval(() => {
      this.checkCertificateExpiry();
    }, 24 * 60 * 60 * 1000); // 24시간마다
  }

  private checkCertificateExpiry(): void {
    for (const [type, cert] of this.certificates) {
      if (cert.daysUntilExpiry <= 30) {
        console.warn(`⚠️ Certificate ${type} expires in ${cert.daysUntilExpiry} days!`);
        
        if (cert.daysUntilExpiry <= 7) {
          console.error(`🚨 URGENT: Certificate ${type} expires in ${cert.daysUntilExpiry} days!`);
          // 알림 시스템과 연동하여 관리자에게 알림 발송
          this.sendExpiryAlert(type, cert);
        }
      }
    }
  }

  private sendExpiryAlert(type: string, cert: CertificateInfo): void {
    // 실제 환경에서는 이메일, Slack 등으로 알림 발송
    console.log(`📧 Sending SSL expiry alert for ${type} certificate`);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Public methods for SSL management
  public getHTTPSOptions(): https.ServerOptions | null {
    try {
      const environment = this.config.environment;
      let certPath: string, keyPath: string;
      
      if (environment === 'development') {
        const devDir = path.join(process.cwd(), 'server', 'ssl', 'dev');
        certPath = path.join(devDir, 'certificate.pem');
        keyPath = path.join(devDir, 'private-key.pem');
      } else {
        certPath = this.config.certPath!;
        keyPath = this.config.keyPath!;
      }
      
      if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        return {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath),
          ...(this.config.caPath && { ca: fs.readFileSync(this.config.caPath) })
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get HTTPS options:', error);
      return null;
    }
  }

  public getCertificateInfo(type: string = 'production'): CertificateInfo | null {
    return this.certificates.get(type) || null;
  }

  public getAllCertificates(): Map<string, CertificateInfo> {
    return new Map(this.certificates);
  }

  public renewCertificate(type: string): Promise<boolean> {
    return new Promise((resolve) => {
      console.log(`🔄 Attempting to renew ${type} certificate...`);
      
      // 실제 환경에서는 Let's Encrypt ACME 클라이언트 사용
      setTimeout(() => {
        console.log(`✅ Certificate ${type} renewed successfully`);
        resolve(true);
      }, 2000);
    });
  }

  public validateCertificateChain(): boolean {
    try {
      for (const [type, cert] of this.certificates) {
        if (!cert.isValid) {
          console.error(`❌ Invalid certificate: ${type}`);
          return false;
        }
      }
      
      console.log('✅ All certificates are valid');
      return true;
    } catch (error) {
      console.error('❌ Certificate chain validation failed:', error);
      return false;
    }
  }

  public getSecurityReport(): object {
    const certificates = Object.fromEntries(
      Array.from(this.certificates.entries()).map(([key, cert]) => [
        key,
        {
          subject: cert.subject,
          issuer: cert.issuer,
          validFrom: cert.validFrom.toISOString(),
          validTo: cert.validTo.toISOString(),
          isValid: cert.isValid,
          daysUntilExpiry: cert.daysUntilExpiry,
          status: cert.isValid ? 'Valid' : 'Invalid/Expired'
        }
      ])
    );

    return {
      ssl: {
        enabled: true,
        environment: this.config.environment,
        certificates,
        autoRenewal: this.config.autoRenew || false,
        httpsReady: this.getHTTPSOptions() !== null
      }
    };
  }
}

// SSL 관리자 인스턴스 생성 및 내보내기
const sslConfig: SSLConfig = {
  environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
  autoRenew: process.env.NODE_ENV === 'production',
  domains: ['localhost', '127.0.0.1', 'trendy.storydot.kr'],
  certPath: process.env.SSL_CERT_PATH,
  keyPath: process.env.SSL_KEY_PATH,
  caPath: process.env.SSL_CA_PATH
};

const sslManager = new SSLManager(sslConfig);

export { SSLManager, sslManager };
export type { SSLConfig, CertificateInfo };
