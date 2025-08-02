import { BlockchainService } from './server/services/realBlockchain.js';

const service = new BlockchainService();

console.log('Available methods:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(service)));

console.log('\nChecking getStakingPools:');
console.log('Type:', typeof service.getStakingPools);
console.log('Function exists:', 'getStakingPools' in service);

if (service.getStakingPools) {
  console.log('Calling getStakingPools...');
  service.getStakingPools().then(result => {
    console.log('Result:', result);
  }).catch(err => {
    console.error('Error:', err);
  });
} else {
  console.log('getStakingPools method not found!');
}
