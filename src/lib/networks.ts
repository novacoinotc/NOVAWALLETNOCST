import { Network } from '@/types';

export const NETWORKS: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    iconColor: '#627EEA',
    decimals: 18,
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    chainId: 56,
    explorerUrl: 'https://bscscan.com',
    iconColor: '#F3BA2F',
    decimals: 18,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    explorerUrl: 'https://polygonscan.com',
    iconColor: '#8247E5',
    decimals: 18,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    explorerUrl: 'https://arbiscan.io',
    iconColor: '#28A0F0',
    decimals: 18,
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    chainId: 10,
    explorerUrl: 'https://optimistic.etherscan.io',
    iconColor: '#FF0420',
    decimals: 18,
  },
  {
    id: 'avalanche',
    name: 'Avalanche C-Chain',
    symbol: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 43114,
    explorerUrl: 'https://snowtrace.io',
    iconColor: '#E84142',
    decimals: 18,
  },
  {
    id: 'fantom',
    name: 'Fantom Opera',
    symbol: 'FTM',
    rpcUrl: 'https://rpc.ftm.tools',
    chainId: 250,
    explorerUrl: 'https://ftmscan.com',
    iconColor: '#1969FF',
    decimals: 18,
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453,
    explorerUrl: 'https://basescan.org',
    iconColor: '#0052FF',
    decimals: 18,
  },
  {
    id: 'zksync',
    name: 'zkSync Era',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.era.zksync.io',
    chainId: 324,
    explorerUrl: 'https://explorer.zksync.io',
    iconColor: '#8C8DFC',
    decimals: 18,
  },
  {
    id: 'linea',
    name: 'Linea',
    symbol: 'ETH',
    rpcUrl: 'https://rpc.linea.build',
    chainId: 59144,
    explorerUrl: 'https://lineascan.build',
    iconColor: '#121212',
    decimals: 18,
  },
  // Testnets
  {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    symbol: 'ETH',
    rpcUrl: 'https://rpc.sepolia.org',
    chainId: 11155111,
    explorerUrl: 'https://sepolia.etherscan.io',
    iconColor: '#627EEA',
    decimals: 18,
    isTestnet: true,
  },
  {
    id: 'bsc-testnet',
    name: 'BSC Testnet',
    symbol: 'tBNB',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    chainId: 97,
    explorerUrl: 'https://testnet.bscscan.com',
    iconColor: '#F3BA2F',
    decimals: 18,
    isTestnet: true,
  },
];

export const getNetworkById = (id: string): Network | undefined => {
  return NETWORKS.find(network => network.id === id);
};

export const getNetworkByChainId = (chainId: number): Network | undefined => {
  return NETWORKS.find(network => network.chainId === chainId);
};

export const getMainnets = (): Network[] => {
  return NETWORKS.filter(network => !network.isTestnet);
};

export const getTestnets = (): Network[] => {
  return NETWORKS.filter(network => network.isTestnet);
};
