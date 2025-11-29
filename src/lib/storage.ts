import { EncryptedVault, Transaction } from '@/types';

const STORAGE_KEYS = {
  VAULT: 'nova_vault',
  ACCOUNTS: 'nova_accounts',
  SELECTED_NETWORK: 'nova_selected_network',
  TRANSACTIONS: 'nova_transactions',
  SETTINGS: 'nova_settings',
  INITIALIZED: 'nova_initialized',
};

class StorageService {
  private isCapacitor(): boolean {
    return typeof window !== 'undefined' && 'Capacitor' in window;
  }

  async set(key: string, value: unknown): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  // Vault operations
  async saveVault(vault: EncryptedVault): Promise<void> {
    await this.set(STORAGE_KEYS.VAULT, vault);
  }

  async getVault(): Promise<EncryptedVault | null> {
    return this.get<EncryptedVault>(STORAGE_KEYS.VAULT);
  }

  async hasVault(): Promise<boolean> {
    const vault = await this.getVault();
    return vault !== null;
  }

  // Network operations
  async saveSelectedNetwork(networkId: string): Promise<void> {
    await this.set(STORAGE_KEYS.SELECTED_NETWORK, networkId);
  }

  async getSelectedNetwork(): Promise<string> {
    const network = await this.get<string>(STORAGE_KEYS.SELECTED_NETWORK);
    return network || 'ethereum';
  }

  // Transaction operations
  async saveTransaction(tx: Transaction): Promise<void> {
    const transactions = await this.getTransactions();
    transactions.unshift(tx);
    // Keep only last 100 transactions
    const trimmed = transactions.slice(0, 100);
    await this.set(STORAGE_KEYS.TRANSACTIONS, trimmed);
  }

  async getTransactions(): Promise<Transaction[]> {
    const txs = await this.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
    return txs || [];
  }

  // Settings
  async saveSettings(settings: Record<string, unknown>): Promise<void> {
    await this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  async getSettings(): Promise<Record<string, unknown>> {
    const settings = await this.get<Record<string, unknown>>(STORAGE_KEYS.SETTINGS);
    return settings || {};
  }

  // Initialization check
  async isInitialized(): Promise<boolean> {
    const initialized = await this.get<boolean>(STORAGE_KEYS.INITIALIZED);
    return initialized === true;
  }

  async setInitialized(value: boolean): Promise<void> {
    await this.set(STORAGE_KEYS.INITIALIZED, value);
  }
}

export const storage = new StorageService();
export { STORAGE_KEYS };
