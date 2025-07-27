import { ethers } from 'ethers';

const mnemonic = "comfort cup rude humor flat dose cargo little cheese digital prosper private";
const wallet = ethers.Wallet.fromPhrase(mnemonic);

console.log("Deployment Wallet Information:");
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("Mnemonic:", mnemonic);
