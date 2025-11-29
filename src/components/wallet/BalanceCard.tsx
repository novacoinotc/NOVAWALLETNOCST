'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, RefreshCw, Copy, Check, Send, QrCode } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useWalletStore } from '@/store/walletStore';
import { getNetworkById } from '@/lib/networks';
import { formatBalance, formatAddress } from '@/lib/wallet';

interface BalanceCardProps {
  onSend?: () => void;
  onReceive?: () => void;
}

export default function BalanceCard({ onSend, onReceive }: BalanceCardProps) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { accounts, currentAccountIndex, selectedNetwork, refreshBalance } =
    useWalletStore();
  const account = accounts[currentAccountIndex];
  const network = getNetworkById(selectedNetwork);

  const balance = account?.balances[selectedNetwork] || '0';

  const handleCopyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (!account) return null;

  return (
    <Card variant="neon" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Account info */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted mb-1">{account.name}</p>
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
            >
              {formatAddress(account.address)}
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold neon-text"
            >
              {isBalanceHidden ? '****' : formatBalance(balance)}
            </motion.p>
            <span className="text-xl text-muted">{network?.symbol}</span>
            <button
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
              className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {isBalanceHidden ? (
                <EyeOff className="w-4 h-4 text-muted" />
              ) : (
                <Eye className="w-4 h-4 text-muted" />
              )}
            </button>
          </div>
          <p className="text-sm text-muted mt-1">
            en {network?.name}
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onSend}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-primary/20 hover:bg-primary/30 rounded-xl border border-primary/30 transition-colors"
          >
            <Send className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">Enviar</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onReceive}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-secondary hover:bg-secondary/80 rounded-xl border border-border transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span className="font-medium">Recibir</span>
          </motion.button>
        </div>
      </div>
    </Card>
  );
}
