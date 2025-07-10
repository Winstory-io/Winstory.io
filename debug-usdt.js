// Debug script for USDT contract
const { ethers } = require('ethers');

const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const TEST_WALLET = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

// ERC20 ABI
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
];

async function debugUSDT() {
  console.log('🔍 Debugging USDT contract...');
  
  const provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
  const contract = new ethers.Contract(USDT_CONTRACT, ERC20_ABI, provider);
  
  try {
    console.log('\n📋 Testing individual calls:');
    
    // Test name()
    try {
      const name = await contract.name();
      console.log('✅ name():', name);
    } catch (error) {
      console.log('❌ name() failed:', error.message);
    }
    
    // Test symbol()
    try {
      const symbol = await contract.symbol();
      console.log('✅ symbol():', symbol);
    } catch (error) {
      console.log('❌ symbol() failed:', error.message);
    }
    
    // Test decimals()
    try {
      const decimals = await contract.decimals();
      console.log('✅ decimals():', decimals);
    } catch (error) {
      console.log('❌ decimals() failed:', error.message);
    }
    
    // Test totalSupply()
    try {
      const totalSupply = await contract.totalSupply();
      console.log('✅ totalSupply():', totalSupply.toString());
    } catch (error) {
      console.log('❌ totalSupply() failed:', error.message);
    }
    
    // Test balanceOf()
    try {
      const balance = await contract.balanceOf(TEST_WALLET);
      console.log('✅ balanceOf():', ethers.utils.formatUnits(balance, 6));
    } catch (error) {
      console.log('❌ balanceOf() failed:', error.message);
    }
    
    console.log('\n🔄 Testing Promise.all:');
    try {
      const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
        contract.name().catch(() => 'Unknown Token'),
        contract.symbol().catch(() => 'UNKNOWN'),
        contract.decimals().catch(() => 18),
        contract.totalSupply().catch(() => ethers.BigNumber.from('0')),
        contract.balanceOf(TEST_WALLET).catch(() => ethers.BigNumber.from('0')),
      ]);
      
      console.log('✅ Promise.all results:');
      console.log('  name:', name);
      console.log('  symbol:', symbol);
      console.log('  decimals:', decimals);
      console.log('  totalSupply:', totalSupply.toString());
      console.log('  balance:', ethers.utils.formatUnits(balance, decimals));
      
    } catch (error) {
      console.log('❌ Promise.all failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugUSDT(); 