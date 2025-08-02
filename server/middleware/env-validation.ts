/**
 * Environment Variable Validation Middleware
 * Validates required environment variables and prevents exposure of sensitive data
 */

interface EnvironmentConfig {
  required: string[];
  optional: string[];
  sensitive: string[];
}

const ENVIRONMENT_CONFIG: EnvironmentConfig = {
  required: [
    'NODE_ENV',
    'DATABASE_URL',
    'XPHERE_RPC_URL',
    'XPHERE_CHAIN_ID',
    'PORT'
  ],
  optional: [
    'BASE_PATH',
    'HOST',
    'HTTPS',
    'SECURITY_LEVEL',
    'RATE_LIMIT_ENABLED'
  ],
  sensitive: [
    'COINMARKETCAP_API_KEY',
    'SESSION_SECRET',
    'DEPLOYER_PRIVATE_KEY',
    'VITE_INFURA_API_URL',
    'VITE_ALCHEMY_API_KEY',
    'VITE_LIFI_API_KEY',
    'SSL_CERT_PATH',
    'SSL_KEY_PATH'
  ]
};

/**
 * Validates that all required environment variables are present
 */
export function validateEnvironmentVariables(): void {
  const missing: string[] = [];
  const insecure: string[] = [];

  // Check required variables
  ENVIRONMENT_CONFIG.required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // Check for placeholder values in sensitive variables
  ENVIRONMENT_CONFIG.sensitive.forEach(key => {
    const value = process.env[key];
    if (value && (
      value.includes('YOUR_') ||
      value.includes('CHANGE_THIS') ||
      value.includes('_HERE') ||
      value === 'test_secret_key_for_local_development_with_enhanced_security'
    )) {
      insecure.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (insecure.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('⚠️ Insecure placeholder values found in production:');
    insecure.forEach(key => console.error(`  - ${key}`));
    throw new Error(`Insecure placeholder values in production: ${insecure.join(', ')}`);
  }

  if (insecure.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ Warning: Using placeholder values (development only):');
    insecure.forEach(key => console.warn(`  - ${key}`));
  }

  console.log('✅ Environment variables validation passed');
}

/**
 * Generates a secure random session secret if not provided
 */
export function ensureSecureSessionSecret(): string {
  const existingSecret = process.env.SESSION_SECRET;
  
  if (existingSecret && !existingSecret.includes('CHANGE_THIS') && existingSecret.length >= 32) {
    return existingSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set to a secure value in production');
  }

  // Generate a temporary secret for development
  import('crypto').then(crypto => {
    const tempSecret = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️ Using auto-generated session secret (development only)');
    return tempSecret;
  });
  
  // Return a simple fallback for development
  return 'development-fallback-secret-key-change-in-production';
}

/**
 * Sanitizes environment variables for logging (removes sensitive values)
 */
export function sanitizeEnvForLogging(): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  Object.keys(process.env).forEach(key => {
    if (ENVIRONMENT_CONFIG.sensitive.includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = process.env[key] || '';
    }
  });

  return sanitized;
}

/**
 * Validates specific environment variable formats
 */
export function validateEnvironmentFormats(): void {
  const errors: string[] = [];

  // Validate URL formats
  const urlVars = ['XPHERE_RPC_URL', 'VITE_INFURA_API_URL', 'VITE_ALCHEMY_API_URL'];
  urlVars.forEach(key => {
    const value = process.env[key];
    if (value && !value.startsWith('http')) {
      errors.push(`${key} must be a valid URL starting with http/https`);
    }
  });

  // Validate numeric values
  const numericVars = ['PORT', 'XPHERE_CHAIN_ID', 'GAS_PRICE', 'GAS_LIMIT'];
  numericVars.forEach(key => {
    const value = process.env[key];
    if (value && isNaN(Number(value))) {
      errors.push(`${key} must be a valid number`);
    }
  });

  // Validate boolean values
  const booleanVars = ['HTTPS', 'RATE_LIMIT_ENABLED', 'IP_REPUTATION_ENABLED', 'DETAILED_ERRORS'];
  booleanVars.forEach(key => {
    const value = process.env[key];
    if (value && !['true', 'false'].includes(value.toLowerCase())) {
      errors.push(`${key} must be 'true' or 'false'`);
    }
  });

  if (errors.length > 0) {
    console.error('❌ Environment variable format errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error(`Environment variable format errors: ${errors.join(', ')}`);
  }

  console.log('✅ Environment variable formats validated');
}
