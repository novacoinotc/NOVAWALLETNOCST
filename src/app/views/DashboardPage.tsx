'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/wallet/Header';
import BalanceCard from '@/components/wallet/BalanceCard';
import TransactionList from '@/components/wallet/TransactionList';
import SendModal from '@/components/wallet/SendModal';
import ReceiveModal from '@/components/wallet/ReceiveModal';
import SettingsModal from '@/components/wallet/SettingsModal';
import Toast from '@/components/ui/Toast';
import { useWalletStore } from '@/store/walletStore';

export default function DashboardPage() {
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false });

  const { error, clearError, refreshBalance } = useWalletStore();

  // Show error toast
  useEffect(() => {
    if (error) {
      setToast({ type: 'error', message: error, visible: true });
      clearError();
    }
  }, [error, clearError]);

  // Refresh balance periodically
  useEffect(() => {
    refreshBalance();
    const interval = setInterval(refreshBalance, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [refreshBalance]);

  return (
    <div className="min-h-screen pb-20">
      <Header onSettings={() => setSettingsModalOpen(true)} />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BalanceCard
            onSend={() => setSendModalOpen(true)}
            onReceive={() => setReceiveModalOpen(true)}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3"
        >
          {[
            { label: 'Comprar', icon: '💳', coming: true },
            { label: 'Swap', icon: '🔄', coming: true },
            { label: 'Bridge', icon: '🌉', coming: true },
            { label: 'NFTs', icon: '🖼️', coming: true },
          ].map((action) => (
            <button
              key={action.label}
              className="relative flex flex-col items-center gap-2 p-3 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
              onClick={() =>
                setToast({
                  type: 'info',
                  message: 'Proximamente disponible',
                  visible: true,
                })
              }
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs text-muted">{action.label}</span>
              {action.coming && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] bg-primary/20 text-primary rounded-full">
                  Soon
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TransactionList />
        </motion.div>
      </div>

      {/* Modals */}
      <SendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
      />
      <ReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
      />
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* Toast notifications */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
