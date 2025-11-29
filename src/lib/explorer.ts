import axios from 'axios';
import { Transaction } from '@/types';
import { getNetworkById } from './networks';

// API endpoints para diferentes redes
const EXPLORER_APIS: Record<string, { url: string; apiKey?: string; type: 'etherscan' | 'blockscout' }> = {
  ethereum: {
    url: 'https://api.etherscan.io/api',
    apiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
    type: 'etherscan',
  },
  bsc: {
    url: 'https://api.bscscan.com/api',
    apiKey: process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || '',
    type: 'etherscan',
  },
  polygon: {
    url: 'https://api.polygonscan.com/api',
    apiKey: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY || '',
    type: 'etherscan',
  },
  arbitrum: {
    url: 'https://api.arbiscan.io/api',
    apiKey: process.env.NEXT_PUBLIC_ARBISCAN_API_KEY || '',
    type: 'etherscan',
  },
  optimism: {
    url: 'https://api-optimistic.etherscan.io/api',
    apiKey: process.env.NEXT_PUBLIC_OPTIMISM_API_KEY || '',
    type: 'etherscan',
  },
  avalanche: {
    url: 'https://api.snowtrace.io/api',
    apiKey: process.env.NEXT_PUBLIC_SNOWTRACE_API_KEY || '',
    type: 'etherscan',
  },
  fantom: {
    url: 'https://api.ftmscan.com/api',
    apiKey: process.env.NEXT_PUBLIC_FTMSCAN_API_KEY || '',
    type: 'etherscan',
  },
  base: {
    url: 'https://api.basescan.org/api',
    apiKey: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '',
    type: 'etherscan',
  },
  linea: {
    url: 'https://api.lineascan.build/api',
    apiKey: process.env.NEXT_PUBLIC_LINEASCAN_API_KEY || '',
    type: 'etherscan',
  },
  sepolia: {
    url: 'https://api-sepolia.etherscan.io/api',
    apiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
    type: 'etherscan',
  },
};

// Obtener transacciones de APIs tipo Etherscan
async function fetchEtherscanTransactions(
  address: string,
  networkId: string,
  page: number = 1,
  limit: number = 50
): Promise<Transaction[]> {
  const apiConfig = EXPLORER_APIS[networkId];
  if (!apiConfig) {
    console.log(`No API configured for network: ${networkId}`);
    return [];
  }

  const network = getNetworkById(networkId);
  if (!network) return [];

  try {
    const params: Record<string, string> = {
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: '0',
      endblock: '99999999',
      page: page.toString(),
      offset: limit.toString(),
      sort: 'desc',
    };

    if (apiConfig.apiKey) {
      params.apikey = apiConfig.apiKey;
    }

    const response = await axios.get(apiConfig.url, { params });

    if (response.data.status === '1' && Array.isArray(response.data.result)) {
      return response.data.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: (parseFloat(tx.value) / 1e18).toString(),
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        timestamp: parseInt(tx.timeStamp) * 1000,
        status: tx.txreceipt_status === '1' ? 'confirmed' : tx.txreceipt_status === '0' ? 'failed' : 'pending',
        networkId: networkId,
        type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
      }));
    }

    return [];
  } catch (error) {
    console.error(`Error fetching transactions for ${networkId}:`, error);
    return [];
  }
}

// Obtener transacciones de TRON
async function fetchTronTransactions(
  address: string,
  limit: number = 50
): Promise<Transaction[]> {
  try {
    const response = await axios.get(
      `https://api.trongrid.io/v1/accounts/${address}/transactions`,
      {
        params: {
          limit,
          only_confirmed: true,
        },
        headers: {
          'TRON-PRO-API-KEY': process.env.NEXT_PUBLIC_TRONGRID_API_KEY || '',
        },
      }
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data.map((tx: any) => {
        const isSend = tx.raw_data?.contract?.[0]?.parameter?.value?.owner_address === address;
        const value = tx.raw_data?.contract?.[0]?.parameter?.value?.amount || 0;

        return {
          hash: tx.txID,
          from: tx.raw_data?.contract?.[0]?.parameter?.value?.owner_address || '',
          to: tx.raw_data?.contract?.[0]?.parameter?.value?.to_address || '',
          value: (value / 1e6).toString(), // TRX has 6 decimals
          timestamp: tx.block_timestamp || Date.now(),
          status: tx.ret?.[0]?.contractRet === 'SUCCESS' ? 'confirmed' : 'failed',
          networkId: 'tron',
          type: isSend ? 'send' : 'receive',
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Error fetching TRON transactions:', error);
    return [];
  }
}

// Funcion principal para obtener transacciones
export async function fetchTransactions(
  address: string,
  networkId: string,
  tronAddress?: string
): Promise<Transaction[]> {
  if (networkId === 'tron' && tronAddress) {
    return fetchTronTransactions(tronAddress);
  }

  return fetchEtherscanTransactions(address, networkId);
}

// Obtener transacciones de todas las redes
export async function fetchAllTransactions(
  evmAddress: string,
  tronAddress?: string,
  networkIds?: string[]
): Promise<Transaction[]> {
  const networks = networkIds || Object.keys(EXPLORER_APIS);

  const promises = networks.map(async (networkId) => {
    if (networkId === 'tron' && tronAddress) {
      return fetchTronTransactions(tronAddress);
    }
    return fetchEtherscanTransactions(evmAddress, networkId);
  });

  const results = await Promise.all(promises);
  const allTxs = results.flat();

  // Ordenar por timestamp descendente
  return allTxs.sort((a, b) => b.timestamp - a.timestamp);
}

// Obtener balance de TRON
export async function fetchTronBalance(address: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://api.trongrid.io/v1/accounts/${address}`,
      {
        headers: {
          'TRON-PRO-API-KEY': process.env.NEXT_PUBLIC_TRONGRID_API_KEY || '',
        },
      }
    );

    if (response.data.success && response.data.data?.[0]) {
      const balance = response.data.data[0].balance || 0;
      return (balance / 1e6).toString(); // TRX has 6 decimals
    }

    return '0';
  } catch (error) {
    console.error('Error fetching TRON balance:', error);
    return '0';
  }
}
