'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { NETWORKS, getNetworkById } from '@/lib/networks';
import { useWalletStore } from '@/store/walletStore';

interface NetworkSelectorProps {
  showTestnets?: boolean;
}

export default function NetworkSelector({
  showTestnets = false,
}: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedNetwork, selectNetwork } = useWalletStore();
  const currentNetwork = getNetworkById(selectedNetwork);

  const networks = showTestnets
    ? NETWORKS
    : NETWORKS.filter((n) => !n.isTestnet);

  const handleSelect = async (networkId: string) => {
    await selectNetwork(networkId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-xl border border-border hover:border-primary transition-colors"
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentNetwork?.iconColor || '#666' }}
        >
          <Globe className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium">{currentNetwork?.name}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2 max-h-80 overflow-y-auto">
                {networks.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => handleSelect(network.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-colors
                      ${
                        selectedNetwork === network.id
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-secondary'
                      }
                    `}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: network.iconColor }}
                    >
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{network.name}</p>
                      <p className="text-xs text-muted">{network.symbol}</p>
                    </div>
                    {selectedNetwork === network.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
