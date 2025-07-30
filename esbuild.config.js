import { build } from 'esbuild';

await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  external: [
    // Node.js built-in modules
    'crypto',
    'fs',
    'path',
    'http',
    'https',
    'os',
    'util',
    'stream',
    'events',
    'buffer',
    'url',
    'querystring',
    'zlib',
    
    // NPM packages that should remain external
    'express',
    'dotenv',
    'better-sqlite3',
    'ethers',
    'helmet',
    'cors',
    'express-rate-limit',
    'express-validator',
    'ws'
  ],
  loader: {
    '.ts': 'ts',
    '.js': 'js'
  },
  sourcemap: false,
  minify: process.env.NODE_ENV === 'production',
  keepNames: true,
  banner: {
    js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`
  }
});

console.log('✅ Server build completed');
