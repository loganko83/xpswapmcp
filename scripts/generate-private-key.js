import { ethers } from 'ethers';

// 배포 지갑 정보
const MNEMONIC = "comfort cup rude humor flat dose cargo little cheese digital prosper private";

async function generatePrivateKey() {
  try {
    // 니모닉에서 HDNode 생성
    const hdNode = ethers.HDNodeWallet.fromPhrase(MNEMONIC);
    
    console.log('=== XPSwap 배포 지갑 정보 ===');
    console.log('주소:', hdNode.address);
    console.log('Private Key:', hdNode.privateKey);
    console.log('니모닉:', MNEMONIC);
    console.log('=============================');
    
    return {
      address: hdNode.address,
      privateKey: hdNode.privateKey,
      mnemonic: MNEMONIC
    };
  } catch (error) {
    console.error('Error generating private key:', error);
  }
}

// 실행
generatePrivateKey();
