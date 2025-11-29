export interface Network {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  iconColor: string;
  decimals: number;
  isTestnet?: boolean;
  isNonEvm?: boolean; // Para redes como TRON, Solana, etc.
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUsd?: number;
  iconUrl?: string;
  networkId: string;
}

export interface Wallet {
  address: string;
  name: string;
  createdAt: number;
}

export interface Account {
  index: number;
  address: string;
  name: string;
  balances: Record<string, string>;
  tronAddress?: string; // Direccion de TRON (diferente formato)
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed?: string;
  gasPrice?: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  networkId: string;
  type: 'send' | 'receive' | 'swap' | 'contract';
  tokenSymbol?: string;
}

export interface WalletState {
  isInitialized: boolean;
  isUnlocked: boolean;
  currentAccountIndex: number;
  accounts: Account[];
  selectedNetwork: string;
  transactions: Transaction[];
}

export interface EncryptedVault {
  encryptedMnemonic: string;
  salt: string;
  iv: string;
  version: number;
}
