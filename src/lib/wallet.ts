import * as bip39 from 'bip39';
import { HDKey } from '@scure/bip32';
import { ethers } from 'ethers';
import { getNetworkById, NETWORKS } from './networks';
import { Network } from '@/types';

// BIP44 path: m / purpose' / coin_type' / account' / change / address_index
// Ethereum and EVM chains use coin_type 60
const ETH_DERIVATION_PATH = "m/44'/60'/0'/0";

export function generateMnemonic(strength: 128 | 256 = 128): string {
  return bip39.generateMnemonic(strength);
}

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

export function mnemonicToSeed(mnemonic: string): Buffer {
  return bip39.mnemonicToSeedSync(mnemonic);
}

export function getPrivateKeyFromMnemonic(mnemonic: string, accountIndex: number = 0): string {
  const seed = mnemonicToSeed(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  const derivedKey = hdKey.derive(`${ETH_DERIVATION_PATH}/${accountIndex}`);

  if (!derivedKey.privateKey) {
    throw new Error('Failed to derive private key');
  }

  return Buffer.from(derivedKey.privateKey).toString('hex');
}

export function getAddressFromPrivateKey(privateKey: string): string {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}

export function getAddressFromMnemonic(mnemonic: string, accountIndex: number = 0): string {
  const privateKey = getPrivateKeyFromMnemonic(mnemonic, accountIndex);
  return getAddressFromPrivateKey(privateKey);
}

export function createWalletFromMnemonic(mnemonic: string, accountIndex: number = 0): {
  address: string;
  privateKey: string;
} {
  const privateKey = getPrivateKeyFromMnemonic(mnemonic, accountIndex);
  const address = getAddressFromPrivateKey(privateKey);

  return { address, privateKey };
}

export function getProvider(networkId: string): ethers.JsonRpcProvider {
  const network = getNetworkById(networkId);
  if (!network) {
    throw new Error(`Network ${networkId} not found`);
  }
  return new ethers.JsonRpcProvider(network.rpcUrl, {
    chainId: network.chainId,
    name: network.name,
  });
}

export async function getBalance(address: string, networkId: string): Promise<string> {
  try {
    const provider = getProvider(networkId);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`Error getting balance for ${networkId}:`, error);
    return '0';
  }
}

export async function getAllBalances(
  address: string,
  networkIds?: string[]
): Promise<Record<string, string>> {
  const networks = networkIds
    ? NETWORKS.filter(n => networkIds.includes(n.id))
    : NETWORKS.filter(n => !n.isTestnet);

  const balancePromises = networks.map(async (network) => {
    const balance = await getBalance(address, network.id);
    return [network.id, balance] as [string, string];
  });

  const results = await Promise.all(balancePromises);
  return Object.fromEntries(results);
}

export async function sendTransaction(
  privateKey: string,
  to: string,
  amount: string,
  networkId: string
): Promise<ethers.TransactionResponse> {
  const provider = getProvider(networkId);
  const wallet = new ethers.Wallet(privateKey, provider);

  const tx = await wallet.sendTransaction({
    to,
    value: ethers.parseEther(amount),
  });

  return tx;
}

export async function estimateGas(
  from: string,
  to: string,
  amount: string,
  networkId: string
): Promise<{ gasLimit: bigint; gasPrice: bigint; totalCost: string }> {
  const provider = getProvider(networkId);

  const [gasLimit, feeData] = await Promise.all([
    provider.estimateGas({
      from,
      to,
      value: ethers.parseEther(amount),
    }),
    provider.getFeeData(),
  ]);

  const gasPrice = feeData.gasPrice || BigInt(0);
  const totalCost = ethers.formatEther(gasLimit * gasPrice);

  return { gasLimit, gasPrice, totalCost };
}

export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function formatAddress(address: string, chars: number = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatBalance(balance: string, decimals: number = 4): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';
  if (num === 0) return '0';
  if (num < 0.0001) return '<0.0001';
  return num.toFixed(decimals);
}

export async function getTransactionHistory(
  address: string,
  network: Network
): Promise<ethers.TransactionResponse[]> {
  // Note: For production, you'd want to use an indexer API like Etherscan, Alchemy, etc.
  // This is a simplified version that only gets recent transactions
  const provider = getProvider(network.id);

  try {
    const blockNumber = await provider.getBlockNumber();
    const transactions: ethers.TransactionResponse[] = [];

    // Only check last 100 blocks for demo purposes
    for (let i = 0; i < 100 && transactions.length < 10; i++) {
      const block = await provider.getBlock(blockNumber - i, true);
      if (block && block.transactions) {
        for (const tx of block.transactions) {
          if (typeof tx !== 'string') {
            if (tx.from?.toLowerCase() === address.toLowerCase() ||
                tx.to?.toLowerCase() === address.toLowerCase()) {
              transactions.push(tx);
            }
          }
        }
      }
    }

    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}
