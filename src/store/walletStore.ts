'use client';

import { create } from 'zustand';
import { Account, Transaction, EncryptedVault } from '@/types';
import { storage } from '@/lib/storage';
import { encryptMnemonic, decryptMnemonic } from '@/lib/crypto';
import {
  generateMnemonic,
  validateMnemonic,
  createWalletFromMnemonic,
  getBalance,
  sendTransaction as sendTx,
} from '@/lib/wallet';

interface WalletStore {
  // State
  isInitialized: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  mnemonic: string | null;
  accounts: Account[];
  currentAccountIndex: number;
  selectedNetwork: string;
  transactions: Transaction[];
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  createWallet: (password: string) => Promise<string>;
  importWallet: (mnemonic: string, password: string) => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  addAccount: () => void;
  selectAccount: (index: number) => void;
  selectNetwork: (networkId: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<string>;
  resetWallet: () => Promise<void>;
  clearError: () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  isInitialized: false,
  isUnlocked: false,
  isLoading: true,
  mnemonic: null,
  accounts: [],
  currentAccountIndex: 0,
  selectedNetwork: 'ethereum',
  transactions: [],
  error: null,

  // Initialize - check if wallet exists
  initialize: async () => {
    try {
      const hasVault = await storage.hasVault();
      const network = await storage.getSelectedNetwork();
      const transactions = await storage.getTransactions();

      set({
        isInitialized: hasVault,
        selectedNetwork: network,
        transactions,
        isLoading: false,
      });
    } catch (error) {
      console.error('Initialize error:', error);
      set({ isLoading: false, error: 'Error al inicializar la wallet' });
    }
  },

  // Create new wallet
  createWallet: async (password: string) => {
    try {
      set({ isLoading: true, error: null });

      const mnemonic = generateMnemonic();
      const vault = encryptMnemonic(mnemonic, password);
      await storage.saveVault(vault);
      await storage.setInitialized(true);

      const { address } = createWalletFromMnemonic(mnemonic, 0);

      const account: Account = {
        index: 0,
        address,
        name: 'Cuenta 1',
        balances: {},
      };

      set({
        isInitialized: true,
        isUnlocked: true,
        mnemonic,
        accounts: [account],
        currentAccountIndex: 0,
        isLoading: false,
      });

      // Fetch initial balance
      get().refreshBalance();

      return mnemonic;
    } catch (error) {
      console.error('Create wallet error:', error);
      set({ isLoading: false, error: 'Error al crear la wallet' });
      throw error;
    }
  },

  // Import existing wallet
  importWallet: async (mnemonic: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!validateMnemonic(mnemonic)) {
        throw new Error('Frase semilla invalida');
      }

      const vault = encryptMnemonic(mnemonic, password);
      await storage.saveVault(vault);
      await storage.setInitialized(true);

      const { address } = createWalletFromMnemonic(mnemonic, 0);

      const account: Account = {
        index: 0,
        address,
        name: 'Cuenta 1',
        balances: {},
      };

      set({
        isInitialized: true,
        isUnlocked: true,
        mnemonic,
        accounts: [account],
        currentAccountIndex: 0,
        isLoading: false,
      });

      get().refreshBalance();
    } catch (error) {
      console.error('Import wallet error:', error);
      const message = error instanceof Error ? error.message : 'Error al importar la wallet';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Unlock wallet
  unlock: async (password: string) => {
    try {
      set({ isLoading: true, error: null });

      const vault = await storage.getVault();
      if (!vault) {
        throw new Error('No se encontro la wallet');
      }

      const mnemonic = decryptMnemonic(vault, password);
      if (!mnemonic) {
        set({ isLoading: false, error: 'Contrasena incorrecta' });
        return false;
      }

      // Derive accounts (for now just one, but could store account count)
      const { address } = createWalletFromMnemonic(mnemonic, 0);

      const account: Account = {
        index: 0,
        address,
        name: 'Cuenta 1',
        balances: {},
      };

      set({
        isUnlocked: true,
        mnemonic,
        accounts: [account],
        isLoading: false,
      });

      get().refreshBalance();
      return true;
    } catch (error) {
      console.error('Unlock error:', error);
      set({ isLoading: false, error: 'Error al desbloquear la wallet' });
      return false;
    }
  },

  // Lock wallet
  lock: () => {
    set({
      isUnlocked: false,
      mnemonic: null,
    });
  },

  // Add new account
  addAccount: () => {
    const { mnemonic, accounts } = get();
    if (!mnemonic) return;

    const newIndex = accounts.length;
    const { address } = createWalletFromMnemonic(mnemonic, newIndex);

    const newAccount: Account = {
      index: newIndex,
      address,
      name: `Cuenta ${newIndex + 1}`,
      balances: {},
    };

    set({ accounts: [...accounts, newAccount] });
    get().refreshBalance();
  },

  // Select account
  selectAccount: (index: number) => {
    set({ currentAccountIndex: index });
    get().refreshBalance();
  },

  // Select network
  selectNetwork: async (networkId: string) => {
    await storage.saveSelectedNetwork(networkId);
    set({ selectedNetwork: networkId });
    get().refreshBalance();
  },

  // Refresh balance
  refreshBalance: async () => {
    const { accounts, currentAccountIndex, selectedNetwork } = get();
    const account = accounts[currentAccountIndex];
    if (!account) return;

    try {
      const balance = await getBalance(account.address, selectedNetwork);

      const updatedAccounts = [...accounts];
      updatedAccounts[currentAccountIndex] = {
        ...account,
        balances: {
          ...account.balances,
          [selectedNetwork]: balance,
        },
      };

      set({ accounts: updatedAccounts });
    } catch (error) {
      console.error('Refresh balance error:', error);
    }
  },

  // Send transaction
  sendTransaction: async (to: string, amount: string) => {
    const { mnemonic, currentAccountIndex, selectedNetwork, accounts } = get();
    if (!mnemonic) throw new Error('Wallet no desbloqueada');

    try {
      set({ isLoading: true, error: null });

      const { privateKey } = createWalletFromMnemonic(mnemonic, currentAccountIndex);
      const tx = await sendTx(privateKey, to, amount, selectedNetwork);

      const transaction: Transaction = {
        hash: tx.hash,
        from: accounts[currentAccountIndex].address,
        to,
        value: amount,
        timestamp: Date.now(),
        status: 'pending',
        networkId: selectedNetwork,
        type: 'send',
      };

      await storage.saveTransaction(transaction);
      set({
        transactions: [transaction, ...get().transactions],
        isLoading: false,
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      if (receipt) {
        const updatedTx: Transaction = {
          ...transaction,
          status: receipt.status === 1 ? 'confirmed' : 'failed',
          gasUsed: receipt.gasUsed.toString(),
        };

        const txs = get().transactions.map(t =>
          t.hash === tx.hash ? updatedTx : t
        );
        set({ transactions: txs });
      }

      get().refreshBalance();
      return tx.hash;
    } catch (error) {
      console.error('Send transaction error:', error);
      const message = error instanceof Error ? error.message : 'Error al enviar transaccion';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Reset wallet
  resetWallet: async () => {
    await storage.clear();
    set({
      isInitialized: false,
      isUnlocked: false,
      mnemonic: null,
      accounts: [],
      currentAccountIndex: 0,
      transactions: [],
      error: null,
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
