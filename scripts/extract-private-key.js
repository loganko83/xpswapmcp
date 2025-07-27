const { ethers } = require('ethers');

// Mnemonic from generated wallet
const mnemonic = 'comfort cup rude humor flat dose cargo little cheese digital prosper private';

// Create HD Node from mnemonic
const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);

// Get the first account (index 0) 
const wallet = hdNode.derivePath("m/44'/60'/0'/0/0");

console.log('🔑 Wallet Address:', wallet.address);
console.log('🔐 Private Key:', wallet.privateKey);
console.log('📝 Mnemonic:', mnemonic);
