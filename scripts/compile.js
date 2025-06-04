import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple Solidity compiler using solc-js
async function compileContracts() {
  console.log('📋 Compiling XpSwap smart contracts...');
  
  try {
    // Install solc if not present
    try {
      require('solc');
    } catch (e) {
      console.log('Installing Solidity compiler...');
      execSync('npm install solc@0.8.19', { stdio: 'inherit' });
    }
    
    const solc = await import('solc');
    
    // Read contract source
    const contractPath = path.join(__dirname, '../contracts/XpSwapDEX.sol');
    const source = fs.readFileSync(contractPath, 'utf8');
    
    const input = {
      language: 'Solidity',
      sources: {
        'XpSwapDEX.sol': {
          content: source
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode']
          }
        }
      }
    };
    
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
      output.errors.forEach(error => {
        if (error.severity === 'error') {
          console.error('❌ Compilation error:', error.formattedMessage);
        } else {
          console.warn('⚠️ Warning:', error.formattedMessage);
        }
      });
      
      if (output.errors.some(error => error.severity === 'error')) {
        throw new Error('Compilation failed');
      }
    }
    
    const contract = output.contracts['XpSwapDEX.sol']['XpSwapDEX'];
    
    // Save compiled artifacts
    const artifactsDir = path.join(__dirname, '../deployments/artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }
    
    const artifact = {
      contractName: 'XpSwapDEX',
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object,
      deployedBytecode: contract.evm.bytecode.object,
      compiledAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(artifactsDir, 'XpSwapDEX.json'),
      JSON.stringify(artifact, null, 2)
    );
    
    console.log('✅ Contract compiled successfully');
    console.log(`📄 Artifacts saved to: ${artifactsDir}`);
    
    return artifact;
    
  } catch (error) {
    console.error('❌ Compilation failed:', error.message);
    throw error;
  }
}

// Run compilation if called directly
if (require.main === module) {
  compileContracts()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { compileContracts };